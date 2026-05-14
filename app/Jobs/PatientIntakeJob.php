<?php

namespace App\Jobs;

use App\Mail\ProviderNotificationMail;
use App\Mail\WelcomeMail;
use App\Models\ActivityLog;
use App\Models\Patient;
use App\Services\PatientOnboardingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PatientIntakeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Retry up to 3 times with 60-second delay between attempts.
     */
    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Job timeout — give mail delivery room to breathe.
     */
    public int $timeout = 120;

    public function __construct(
        private readonly array $intakeData,
        private readonly string $ipAddress,
    ) {}

    /**
     * Execute the job.
     *
     * Order of operations:
     *   1. Create patient record
     *   2. Create insurance record
     *   3. Store consents (all 3 types)
     *   4. Assign provider by preference + load balancing
     *   5. Mark intake complete on patient
     *   6. Send welcome email to patient
     *   7. Send new-patient notification to provider
     *   8. Write audit log entry
     *
     * Wrapped in a DB transaction so any failure rolls back the patient record
     * and prevents orphaned data — the job will retry cleanly.
     */
    public function handle(PatientOnboardingService $onboardingService): void
    {
        DB::transaction(function () use ($onboardingService) {

            // ── 1. Create Patient ───────────────────────────────────────────
            $patient = $onboardingService->createPatient($this->intakeData);
            Log::info("PatientIntakeJob: created patient #{$patient->id} ({$patient->email})");

            // ── 2. Insurance Record ─────────────────────────────────────────
            $onboardingService->createInsurance($patient, $this->intakeData);

            // ── 3. Consents ─────────────────────────────────────────────────
            $onboardingService->storeConsents($patient, $this->intakeData, $this->ipAddress);

            // ── 4. Provider Assignment ──────────────────────────────────────
            $provider = $onboardingService->assignProvider($patient, $this->intakeData);

            if ($provider) {
                Log::info("PatientIntakeJob: assigned provider {$provider->name} to patient #{$patient->id}");
            } else {
                Log::warning("PatientIntakeJob: no matching provider found for patient #{$patient->id} — will assign manually");
            }

            // ── 5. Finalise Patient Record ──────────────────────────────────
            $patient->update([
                'assigned_provider_id' => $provider?->id,
                'status'               => 'active',
                'intake_completed_at'  => now(),
            ]);

            // ── 6. Welcome Email → Patient ──────────────────────────────────
            Mail::to($patient->email)
                ->send(new WelcomeMail($patient, $provider));

            // ── 7. Notification → Provider ──────────────────────────────────
            if ($provider) {
                Mail::to($provider->email)
                    ->send(new ProviderNotificationMail($patient, $provider));
            }

            // ── 8. Audit Log ────────────────────────────────────────────────
            ActivityLog::create([
                'user_id'    => null, // system-initiated
                'action'     => 'patient.intake.completed',
                'model_type' => Patient::class,
                'model_id'   => $patient->id,
                'metadata'   => [
                    'ip_address'        => $this->ipAddress,
                    'insurance_type'    => $this->intakeData['insurance_type'],
                    'modality'          => $this->intakeData['modality_preference'],
                    'presenting_concerns' => $this->intakeData['presenting_concerns'],
                    'assigned_provider' => $provider?->name,
                    'provider_type'     => $provider?->provider_type,
                ],
            ]);

            Log::info("PatientIntakeJob: completed successfully for patient #{$patient->id}");
        });
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('PatientIntakeJob: failed after all retries', [
            'email'     => $this->intakeData['email'] ?? 'unknown',
            'ip'        => $this->ipAddress,
            'exception' => $exception->getMessage(),
            'trace'     => $exception->getTraceAsString(),
        ]);

        // In production: notify admin via Slack/email here
    }
}