<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\BillingClaim;
use App\Models\ClinicalNote;
use App\Models\Patient;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today         = Carbon::today();
        $yesterday     = Carbon::yesterday();
        $weekStart     = Carbon::now()->startOfWeek();
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
        $lastWeekEnd   = Carbon::now()->subWeek()->endOfWeek();

        return Inertia::render('Dashboard/Index', [
            'stats'          => $this->buildStats($today, $yesterday, $weekStart, $lastWeekStart, $lastWeekEnd),
            'todaySchedule'  => $this->getTodaySchedule($today),
            'billingAlerts'  => $this->getBillingAlerts(),
            'recentPatients' => $this->getRecentPatients(),
            'todayDate'      => $today->format('l, F j, Y'),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stats
    // ─────────────────────────────────────────────────────────────────────────

    private function buildStats(
        Carbon $today,
        Carbon $yesterday,
        Carbon $weekStart,
        Carbon $lastWeekStart,
        Carbon $lastWeekEnd,
    ): array {
        $todayAppts     = Appointment::whereDate('scheduled_at', $today)->count();
        $yesterdayAppts = Appointment::whereDate('scheduled_at', $yesterday)->count();

        $pendingClaims   = BillingClaim::whereIn('validation_status', ['error', 'warning'])
            ->whereIn('claim_status', ['draft', 'validated'])->count();
        $lastWeekPending = BillingClaim::whereIn('validation_status', ['error', 'warning'])
            ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->count();

        $newIntakes      = Patient::where('intake_completed_at', '>=', $weekStart)->count();
        $lastWeekIntakes = Patient::whereBetween('intake_completed_at', [$lastWeekStart, $lastWeekEnd])->count();

        $aiNotes         = ClinicalNote::where('generated_by_ai', true)
            ->where('created_at', '>=', $weekStart)->count();
        $lastWeekAiNotes = ClinicalNote::where('generated_by_ai', true)
            ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->count();

        return [
            'today_appointments' => [
                'value'            => $todayAppts,
                'trend'            => $todayAppts - $yesterdayAppts,
                'trend_label'      => 'vs yesterday',
                'positive_is_good' => true,
            ],
            'pending_claims' => [
                'value'            => $pendingClaims,
                'trend'            => $pendingClaims - $lastWeekPending,
                'trend_label'      => 'vs last week',
                'positive_is_good' => false,
            ],
            'new_intakes' => [
                'value'            => $newIntakes,
                'trend'            => $newIntakes - $lastWeekIntakes,
                'trend_label'      => 'vs last week',
                'positive_is_good' => true,
            ],
            'ai_notes' => [
                'value'            => $aiNotes,
                'trend'            => $aiNotes - $lastWeekAiNotes,
                'trend_label'      => 'vs last week',
                'positive_is_good' => true,
            ],
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Today's Schedule
    // ─────────────────────────────────────────────────────────────────────────

    private function getTodaySchedule(Carbon $today): array
    {
        return Appointment::with([
            'patient:id,first_name,last_name',
            'provider:id,name,provider_type',
        ])
        ->whereDate('scheduled_at', $today)
        ->orderBy('scheduled_at')
        ->get()
        ->map(fn ($appt) => [
            'id'       => $appt->id,
            'time'     => Carbon::parse($appt->scheduled_at)->format('g:i A'),
            'duration' => $appt->duration_minutes,
            'patient'  => [
                'id'       => $appt->patient->id,
                'name'     => $appt->patient->first_name . ' ' . $appt->patient->last_name,
                'initials' => strtoupper(
                    substr($appt->patient->first_name, 0, 1) .
                    substr($appt->patient->last_name,  0, 1)
                ),
            ],
            'provider' => $appt->provider?->name ?? '—',
            'modality' => $appt->modality,
            'status'   => $appt->status,
        ])
        ->toArray();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Billing Alerts
    // ─────────────────────────────────────────────────────────────────────────

    private function getBillingAlerts(): array
    {
        return BillingClaim::with(['patient:id,first_name,last_name'])
            ->whereIn('validation_status', ['error', 'warning'])
            ->orderByRaw("FIELD(validation_status, 'error', 'warning')")
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($claim) => [
                'id'                => $claim->id,
                'patient_id'        => $claim->patient_id,
                'patient_name'      => $claim->patient->first_name . ' ' . $claim->patient->last_name,
                'cpt_code'          => $claim->cpt_code,
                'modifier'          => $claim->modifier,
                'validation_status' => $claim->validation_status,
                'error_summary'     => $this->extractErrorSummary($claim->validation_results),
            ])
            ->toArray();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Recent Patient Activity
    // ─────────────────────────────────────────────────────────────────────────

    private function getRecentPatients(): array
    {
        $patients = Patient::with(['provider:id,name'])   // ← fixed: was assignedProvider
            ->where('status', 'active')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get();

        $patientIds = $patients->pluck('id');

        $lastSessions = Appointment::whereIn('patient_id', $patientIds)
            ->where('scheduled_at', '<', now())
            ->orderByDesc('scheduled_at')
            ->get()
            ->unique('patient_id')
            ->keyBy('patient_id');

        $nextSessions = Appointment::whereIn('patient_id', $patientIds)
            ->where('scheduled_at', '>=', now())
            ->whereIn('status', ['confirmed', 'pending'])
            ->orderBy('scheduled_at')
            ->get()
            ->unique('patient_id')
            ->keyBy('patient_id');

        return $patients->map(function ($patient) use ($lastSessions, $nextSessions) {
            $last = $lastSessions->get($patient->id);
            $next = $nextSessions->get($patient->id);

            return [
                'id'           => $patient->id,
                'name'         => $patient->first_name . ' ' . $patient->last_name,
                'initials'     => strtoupper(
                    substr($patient->first_name, 0, 1) .
                    substr($patient->last_name,  0, 1)
                ),
                'provider'     => $patient->provider?->name ?? '—',   // ← fixed
                'status'       => $patient->status,
                'last_session' => $last
                    ? Carbon::parse($last->scheduled_at)->format('M j')
                    : '—',
                'next_session' => $next
                    ? Carbon::parse($next->scheduled_at)->format('M j, g:i A')
                    : '—',
            ];
        })->toArray();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function extractErrorSummary(mixed $validationResults): string
    {
        $results = is_string($validationResults)
            ? json_decode($validationResults, true)
            : $validationResults;

        if (! is_array($results)) {
            return 'Validation error';
        }

        $checks = $results['checks'] ?? $results;

        foreach ($checks as $check) {
            if (isset($check['status']) && in_array($check['status'], ['error', 'warning'])) {
                return $check['detail'] ?? $check['message'] ?? 'Validation error';
            }
        }

        return 'Validation error';
    }
}