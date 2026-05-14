<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Jobs\AppointmentConfirmationJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * GET /appointments
     * Returns all appointments for the calendar view,
     * plus patient/provider lists for the new-appointment modal.
     */
    public function index(Request $request)
    {
        // Load appointments with patient + provider eager-loaded.
        // For the calendar we load the full month window ± a little buffer.
        $appointments = Appointment::with(['patient:id,first_name,last_name,email,dob', 'provider:id,name,provider_type'])
            ->when($request->provider_id, fn($q, $pid) => $q->where('provider_id', $pid))
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn($a) => [
                'id'               => $a->id,
                'patient_id'       => $a->patient_id,
                'provider_id'      => $a->provider_id,
                'scheduled_at'     => $a->scheduled_at->toIso8601String(),
                'duration_minutes' => $a->duration_minutes,
                'modality'         => $a->modality,
                'status'           => $a->status,
                'notes'            => $a->notes,
                'patient'          => $a->patient ? [
                    'id'         => $a->patient->id,
                    'first_name' => $a->patient->first_name,
                    'last_name'  => $a->patient->last_name,
                    'email'      => $a->patient->email,
                    'dob'        => $a->patient->dob?->toDateString(),
                ] : null,
                'provider'         => $a->provider ? [
                    'id'            => $a->provider->id,
                    'name'          => $a->provider->name,
                    'provider_type' => $a->provider->provider_type,
                ] : null,
            ]);

        $patients = Patient::select('id', 'first_name', 'last_name', 'email')
            ->where('status', 'active')
            ->orderBy('last_name')
            ->get();

        $providers = User::select('id', 'name', 'provider_type')
            ->whereIn('role', ['clinician', 'admin'])
            ->whereNotNull('provider_type')
            ->orderBy('name')
            ->get();

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'patients'     => $patients,
            'providers'    => $providers,
        ]);
    }

    /**
     * POST /appointments
     * Create a new appointment and fire the confirmation job.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'       => 'required|exists:patients,id',
            'provider_id'      => 'required|exists:users,id',
            'scheduled_at'     => 'required|date',
            'duration_minutes' => 'required|integer|in:30,45,50,60,90',
            'modality'         => 'required|in:video,audio,in_person',
            'notes'            => 'nullable|string|max:1000',
        ]);

        $appointment = Appointment::create([
            ...$validated,
            'status' => 'pending',
        ]);

        AppointmentConfirmationJob::dispatch($appointment);

        return redirect()->route('appointments.index')
            ->with('success', 'Appointment booked successfully.');
    }

    /**
     * PATCH /appointments/{appointment}
     * Update status only (called from the slide-over status buttons).
     */
    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show',
        ]);

        $appointment->update($validated);

        return back()->with('success', 'Appointment status updated.');
    }

    /**
     * DELETE /appointments/{appointment}
     */
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('success', 'Appointment removed.');
    }
}