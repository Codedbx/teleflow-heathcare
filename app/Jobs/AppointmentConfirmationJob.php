<?php

namespace App\Jobs;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class AppointmentConfirmationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Appointment $appointment)
    {
        $this->appointment->load(['patient', 'provider']);
    }

    public function handle(): void
    {
        $appt    = $this->appointment;
        $patient = $appt->patient;
        $provider = $appt->provider;

        if (!$patient || !$provider) return;

        $dateFormatted = $appt->scheduled_at->format('l, F j, Y \a\t g:i A');
        $modalityLabel = match($appt->modality) {
            'video'     => 'Live Video',
            'audio'     => 'Audio-Only',
            'in_person' => 'In-Person',
            default     => ucfirst($appt->modality),
        };

        // ── Patient confirmation email ──────────────────────────────────
        Mail::html(
            $this->buildPatientEmail($patient, $provider, $dateFormatted, $modalityLabel, $appt->duration_minutes),
            function ($message) use ($patient) {
                $message->to($patient->email, "{$patient->first_name} {$patient->last_name}")
                        ->subject('Your TeleFlow Appointment is Confirmed');
            }
        );

        // ── Provider notification email ─────────────────────────────────
        Mail::html(
            $this->buildProviderEmail($patient, $provider, $dateFormatted, $modalityLabel, $appt->duration_minutes),
            function ($message) use ($provider) {
                $message->to($provider->email, $provider->name)
                        ->subject("New Appointment: {$this->appointment->patient->first_name} {$this->appointment->patient->last_name}");
            }
        );
    }

    private function buildPatientEmail($patient, $provider, $date, $modality, $duration): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family: 'DM Sans', Arial, sans-serif; background: #F7F8FA; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #0F1A2E; padding: 24px 32px; display: flex; align-items: center; gap: 10;">
      <div style="color: #0AB5A0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">⚡ TeleFlow</div>
    </div>
    <div style="padding: 32px;">
      <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px;">Appointment Confirmed</h1>
      <p style="color: #6B7280; font-size: 15px; margin: 0 0 24px;">Hi {$patient->first_name}, your appointment has been booked.</p>

      <div style="background: #F9FAFB; border-radius: 10px; border: 1px solid #E5E7EB; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color: #6B7280; font-size: 13px; padding-bottom: 10px;">Date &amp; Time</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; padding-bottom: 10px;">{$date}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; padding-bottom: 10px; border-top: 1px solid #F3F4F6; padding-top: 10px;">Provider</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px;">{$provider->name}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; padding-bottom: 10px; border-top: 1px solid #F3F4F6; padding-top: 10px;">Modality</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px;">{$modality}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; border-top: 1px solid #F3F4F6; padding-top: 10px;">Duration</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px;">{$duration} minutes</td></tr>
        </table>
      </div>

      <p style="color: #6B7280; font-size: 13px; margin: 0;">If you need to reschedule or cancel, please contact your practice.</p>
    </div>
    <div style="background: #F9FAFB; padding: 20px 32px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">TeleFlow · Clinical operations, automated.</p>
    </div>
  </div>
</body>
</html>
HTML;
    }

    private function buildProviderEmail($patient, $provider, $date, $modality, $duration): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F7F8FA; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #0F1A2E; padding: 24px 32px;">
      <div style="color: #0AB5A0; font-size: 22px; font-weight: 700;">⚡ TeleFlow</div>
    </div>
    <div style="padding: 32px;">
      <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">New Appointment Scheduled</h1>
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px;">Hi {$provider->name}, a new appointment has been booked with you.</p>
      <div style="background: #F9FAFB; border-radius: 10px; border: 1px solid #E5E7EB; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color: #6B7280; font-size: 13px; padding-bottom: 10px;">Patient</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; padding-bottom: 10px;">{$patient->first_name} {$patient->last_name}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; padding-bottom: 10px; border-top: 1px solid #F3F4F6; padding-top: 10px;">Date &amp; Time</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px;">{$date}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; border-top: 1px solid #F3F4F6; padding-top: 10px;">Modality</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px;">{$modality} · {$duration} min</td></tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
HTML;
    }
}