<?php

namespace App\Http\Controllers;

use App\Models\IntakeToken;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /**
     * GET /patients
     * Patient list with search + filter. Wired in Block 8.
     */
    public function index(Request $request): Response
    {
        $query = Patient::with([
            'provider:id,name,provider_type',
            'insurance:id,patient_id,insurance_type,commercial_payer',
        ]);

        // Search by name or email
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name',  'like', "%{$search}%")
                  ->orWhere('email',      'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->status) {
            $query->where('status', $status);
        }

        $patients = $query->orderBy('last_name')
            ->paginate(20)
            ->through(fn ($p) => [
                'id'               => $p->id,
                'name'             => $p->first_name . ' ' . $p->last_name,
                'first_name'       => $p->first_name,
                'last_name'        => $p->last_name,
                'dob'              => $p->dob,
                'email'            => $p->email,
                'phone'            => $p->phone,
                'status'           => $p->status,
                'provider'         => $p->provider,
                'insurance_type'   => $p->insurance?->insurance_type,
                'insurance_payer'  => $p->insurance?->commercial_payer,
                'intake_completed' => $p->intake_completed_at,
            ]);

        $stats = [
            'total'   => Patient::count(),
            'active'  => Patient::where('status', 'active')->count(),
            'pending' => Patient::where('status', 'pending_intake')->count(),
            'inactive'=> Patient::where('status', 'inactive')->count(),
        ];

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters'  => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'sort'   => $request->input('sort', 'created_at'),
                'dir'    => $request->input('dir', 'desc'),
            ],
            'stats'    => $stats,
        ]);
    }

    /**
     * GET /patients/new
     * Redirect to IntakeController — keeps routing clean.
     */
    public function create(): Response
    {
        return app(IntakeController::class)->create();
    }

    /**
     * GET /patients/{patient}
     * Full patient profile with all related data.
     */
    public function show(Patient $patient): Response
    {
        $patient->load([
            'provider:id,name,provider_type,email',
            'insurance',
            'consents',
            'appointments.provider:id,name',
            'clinicalNotes.provider:id,name',
            'billingClaims',
            'messages.sender:id,name',
        ]);

        return Inertia::render('Patients/Show', [
            'patient'     => $patient,
            'currentUser' => auth()->user(),
        ]);
    }



    public function edit(Patient $patient): Response
    {
        $patient->load(['provider:id,name', 'insurance']);

        $providers = User::whereIn('role', ['clinician', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'provider_type']);

        return Inertia::render('Patients/Edit', [
            'patient'   => $patient,
            'providers' => $providers,
        ]);
    }

    /**
     * PUT /patients/{patient}
     * Update basic patient demographics or status.
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'first_name'           => ['sometimes', 'string', 'max:100'],
            'last_name'            => ['sometimes', 'string', 'max:100'],
            'phone'                => ['sometimes', 'string', 'max:20'],
            'email'                => ['sometimes', 'email', "unique:patients,email,{$patient->id}"],
            'status'               => ['sometimes', 'in:pending_intake,active,inactive'],
            'assigned_provider_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'modality_preference'  => ['sometimes', 'in:video,audio,in_person'],
        ]);

        $patient->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Patient record updated.',
        ]);
    }

    /**
     * DELETE /patients/{patient}
     * Deactivates patient (admin only — no hard deletes on patient records).
     */
    public function destroy(Patient $patient): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorised.'], 403);
        }

        $patient->update(['status' => 'inactive']);

        return response()->json(['success' => true, 'message' => 'Patient deactivated.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Intake Token
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /patients/intake-token
     *
     * Generates a unique single-use intake link to send to a prospective patient.
     * Stamped with the admin who created it for full auditability.
     * Valid for 7 days, one-time use only.
     */
    public function generateIntakeToken(): JsonResponse
    {
        $token = IntakeToken::create([
            'token'      => Str::uuid()->toString(),
            'created_by' => Auth::id(),
            'expires_at' => now()->addDays(7),
            'used'       => false,
        ]);

        $publicUrl = route('intake.show', ['token' => $token->token]);

        return response()->json([
            'success'    => true,
            'token'      => $token->token,
            'url'        => $publicUrl,
            'expires_at' => $token->expires_at->toFormattedDateString(),
            'created_by' => Auth::user()->name,
            'message'    => 'Intake link generated. Share this URL with the patient — it expires in 7 days.',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function formatPatientDetail(Patient $patient): array
    {
        return [
            'id'                  => $patient->id,
            'first_name'          => $patient->first_name,
            'last_name'           => $patient->last_name,
            'full_name'           => $patient->first_name . ' ' . $patient->last_name,
            'dob'                 => $patient->dob,
            'age'                 => \Carbon\Carbon::parse($patient->dob)->age,
            'gender'              => $patient->gender,
            'phone'               => $patient->phone,
            'email'               => $patient->email,
            'address'             => $patient->address,
            'city'                => $patient->city,
            'state'               => $patient->state,
            'zip'                 => $patient->zip,
            'status'              => $patient->status,
            'modality_preference' => $patient->modality_preference,
            'presenting_concerns' => $patient->presenting_concerns ?? [],
            'intake_completed_at' => $patient->intake_completed_at,
            'provider'            => $patient->provider,
            'insurance'           => $patient->insurance,
            'consents'            => $patient->consents,
            'appointments'        => $patient->appointments,
            'notes'               => $patient->clinicalNotes,
            'claims'              => $patient->billingClaims,
            'messages'            => $patient->messages,
        ];
    }
}