<?php

namespace App\Http\Controllers;

use App\Models\ClinicalNote;
use App\Models\Patient;
use App\Services\ClaudeNoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function __construct(
        private readonly ClaudeNoteService $claudeService,
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // Pages
    // ─────────────────────────────────────────────────────────────────────────

    public function assistant(Request $request): Response
    {
        $patients = Patient::where('status', 'active')
            ->select('id', 'first_name', 'last_name', 'dob', 'presenting_concerns', 'modality_preference')
            ->orderBy('last_name')
            ->get()
            ->map(fn ($p) => [
                'id'                  => $p->id,
                'name'                => $p->first_name . ' ' . $p->last_name,
                'age'                 => Carbon::parse($p->dob)->age,
                'presenting_concerns' => $p->presenting_concerns ?? [],  // already cast to array by model
                'modality_preference' => $p->modality_preference,
            ]);

        // Query params from appointment "Start Note" button: ?patient=1&appointment=1
        $preselectedPatientId     = $request->query('patient');
        $preselectedAppointmentId = $request->query('appointment');

        return Inertia::render('Notes/Assistant', [
            'patients'    => $patients,
            'currentUser' => [
                'id'            => auth()->id(),
                'name'          => auth()->user()->name,
                'provider_type' => auth()->user()->provider_type ?? 'LCSW',
            ],
            'preselected' => [
                'patient_id'     => $preselectedPatientId     ? (int) $preselectedPatientId     : null,
                'appointment_id' => $preselectedAppointmentId ? (int) $preselectedAppointmentId : null,
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $notes = ClinicalNote::with(['patient:id,first_name,last_name', 'provider:id,name'])
            ->when($request->patient_id,  fn ($q) => $q->where('patient_id',  $request->patient_id))
            ->when($request->provider_id, fn ($q) => $q->where('provider_id', $request->provider_id))
            ->orderByDesc('session_date')
            ->paginate(20)
            ->through(fn ($note) => [
                'id'                 => $note->id,
                'patient'            => $note->patient,
                'provider'           => $note->provider,
                'session_date'       => $note->session_date,
                'duration_minutes'   => $note->session_duration_minutes,
                'modality'           => $note->modality,
                'generated_by_ai'    => $note->generated_by_ai,
                'subjective_preview' => \Str::limit($note->soap_subjective, 100),
            ]);

        return Inertia::render('Notes/Index', compact('notes'));
    }

    public function show(ClinicalNote $note): Response
    {
        $note->load(['patient', 'provider', 'appointment']);
        return Inertia::render('Notes/Show', compact('note'));
    }

    public function destroy(ClinicalNote $note): JsonResponse
    {
        if (auth()->id() !== $note->provider_id && auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorised.'], 403);
        }

        $note->delete();
        return response()->json(['success' => true]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API
    // ─────────────────────────────────────────────────────────────────────────

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id'   => ['required', 'exists:patients,id'],
            'session_date' => ['required', 'date'],
            'duration'     => ['required', 'integer', 'min:5', 'max:240'],
            'modality'     => ['required', 'in:video,audio,in_person'],
            'raw_notes'    => ['required', 'string', 'min:20', 'max:10000'],
            'note_format'  => ['nullable', 'in:SOAP,DAP,BIRP'],
        ], [
            'raw_notes.min' => 'Notes must be at least 20 characters.',
            'duration.min'  => 'Session duration must be at least 5 minutes.',
        ]);

        $patient = Patient::findOrFail($validated['patient_id']);

        $serviceData = [
            'patient_name'        => $patient->first_name . ' ' . $patient->last_name,
            'patient_age'         => Carbon::parse($patient->dob)->age,
            'presenting_concerns' => $patient->presenting_concerns ?? [],  // already array
            'session_date'        => Carbon::parse($validated['session_date'])->format('F j, Y'),
            'duration'            => (int) $validated['duration'],
            'modality'            => $validated['modality'],
            'provider_type'       => auth()->user()->provider_type ?? 'LCSW',
            'raw_notes'           => trim($validated['raw_notes']),
            'note_format'         => $validated['note_format'] ?? 'SOAP',
        ];

        try {
            $result       = $this->claudeService->generateSoapNote($serviceData);
            $suggestedCpt = $this->claudeService->suggestCptCode(
                (int) $validated['duration'],
                $validated['modality']
            );

            return response()->json([
                'success'       => true,
                'note'          => $result,
                'suggested_cpt' => $suggestedCpt,
            ]);

        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 422);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id'               => ['required', 'exists:patients,id'],
            'appointment_id'           => ['nullable', 'exists:appointments,id'],
            'session_date'             => ['required', 'date'],
            'session_duration_minutes' => ['required', 'integer', 'min:1', 'max:240'],
            'modality'                 => ['required', 'in:video,audio,in_person'],
            'raw_notes'                => ['nullable', 'string', 'max:10000'],
            'soap_subjective'          => ['required', 'string'],
            'soap_objective'           => ['required', 'string'],
            'soap_assessment'          => ['required', 'string'],
            'soap_plan'                => ['required', 'string'],
            'generated_by_ai'          => ['boolean'],
            'ai_prompt_tokens'         => ['nullable', 'integer'],
            'ai_completion_tokens'     => ['nullable', 'integer'],
        ]);

        $note = ClinicalNote::create([
            ...$validated,
            'provider_id'          => auth()->id(),
            'generated_by_ai'      => (bool) ($validated['generated_by_ai'] ?? false),
            'ai_prompt_tokens'     => $validated['ai_prompt_tokens']     ?? null,
            'ai_completion_tokens' => $validated['ai_completion_tokens'] ?? null,
        ]);

        return response()->json([
            'success'  => true,
            'note_id'  => $note->id,
            'message'  => 'Note saved to patient record.',
            'view_url' => route('notes.show', $note->id),
        ], 201);
    }
}