<?php

namespace App\Http\Controllers;

use App\Jobs\MessageNotificationJob;
use App\Models\Message;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    /* ─────────────────────────────────────────────────────────────────────
     | GET /messages
     | Thread list — one row per patient, latest message shown.
     ┗──────────────────────────────────────────────────────────────────── */
    public function index()
    {
        [$threads, $patients] = $this->threadData();

        return Inertia::render('Messages/Index', [
            'threads'         => $threads,
            'patients'        => $patients,
            'active_patient'  => null,
            'active_messages' => [],
        ]);
    }

    /* ─────────────────────────────────────────────────────────────────────
     | GET /messages/{patient}
     | Full message thread for one patient + marks unread as read.
     ┗──────────────────────────────────────────────────────────────────── */
    public function thread(Patient $patient)
    {
        // Mark unread patient-sent messages as read
        $patient->messages()
            ->where('is_read', false)
            ->where('sender_type', 'patient')
            ->update(['is_read' => true]);

        $messages = $patient->messages()
            ->with('sender:id,name,role')
            ->whereNull('parent_id')
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => [
                'id'          => $m->id,
                'body'        => $m->body,
                'subject'     => $m->subject,
                'sender_type' => $m->sender_type,
                'sender_name' => $m->sender?->name ?? ($m->sender_type === 'patient' ? $patient->first_name : 'Provider'),
                'is_read'     => $m->is_read,
                'created_at'  => $m->created_at->toIso8601String(),
            ]);

        [$threads, $patients] = $this->threadData();

        return Inertia::render('Messages/Index', [
            'threads'        => $threads,
            'patients'       => $patients,
            'active_patient' => [
                'id'         => $patient->id,
                'first_name' => $patient->first_name,
                'last_name'  => $patient->last_name,
                'email'      => $patient->email,
                'provider'   => $patient->provider?->name,
            ],
            'active_messages' => $messages,
        ]);
    }

    /* ─────────────────────────────────────────────────────────────────────
     | POST /messages
     | Send a message and fire notification job.
     ┗──────────────────────────────────────────────────────────────────── */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'body'       => 'required|string|max:5000',
            'subject'    => 'nullable|string|max:255',
        ]);

        $message = Message::create([
            'patient_id'  => $validated['patient_id'],
            'sender_id'   => Auth::id(),
            'sender_type' => 'provider',
            'body'        => $validated['body'],
            'subject'     => $validated['subject'] ?? null,
            'is_read'     => false,
            'created_at'  => now(),
        ]);

        $message->load(['patient', 'sender']);
        MessageNotificationJob::dispatch($message);

        if ($request->wantsJson()) {
            return response()->json([
                'success'    => true,
                'message'    => [
                    'id'          => $message->id,
                    'body'        => $message->body,
                    'subject'     => $message->subject,
                    'sender_type' => 'provider',
                    'sender_name' => Auth::user()->name,
                    'is_read'     => false,
                    'created_at'  => $message->created_at->toIso8601String(),
                ],
            ]);
        }

        return redirect()->route('messages.thread', $validated['patient_id'])
            ->with('success', 'Message sent.');
    }

    /* ─────────────────────────────────────────────────────────────────────
     | Shared helper — build thread list + patient dropdown
     ┗──────────────────────────────────────────────────────────────────── */
    private function threadData(): array
    {
        $threads = Patient::whereHas('messages')
            ->with(['messages' => fn($q) => $q->latest('created_at')->limit(1)])
            ->get()
            ->map(fn($p) => [
                'patient_id'   => $p->id,
                'patient_name' => "{$p->first_name} {$p->last_name}",
                'preview'      => $p->messages->first()?->body,
                'last_at'      => $p->messages->first()?->created_at?->toIso8601String(),
                'unread_count' => $p->messages()
                    ->where('is_read', false)
                    ->where('sender_type', 'patient')
                    ->count(),
            ])
            ->sortByDesc('last_at')
            ->values();

        $patients = Patient::select('id', 'first_name', 'last_name', 'email')
            ->where('status', 'active')
            ->orderBy('last_name')
            ->get();

        return [$threads, $patients];
    }
}