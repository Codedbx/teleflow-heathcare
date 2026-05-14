<?php

namespace App\Mail;

use App\Models\BillingClaim;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BillingAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public BillingClaim $claim,
        public User $recipient
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Billing Alert — {$this->claim->validation_status} claim for patient #{$this->claim->patient_id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $claim      = $this->claim;
        $recipient  = $this->recipient;
        $statusColor = match($claim->validation_status) {
            'error'   => '#EF4444',
            'warning' => '#F59E0B',
            default   => '#10B981',
        };
        $statusLabel = match($claim->validation_status) {
            'error'   => 'ERROR — Cannot Submit',
            'warning' => 'WARNING — Review Required',
            default   => 'CLEAN',
        };

        $patientName = $claim->patient
            ? "{$claim->patient->first_name} {$claim->patient->last_name}"
            : "Patient #{$claim->patient_id}";

        return <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F7F8FA; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #0F1A2E; padding: 24px 32px;">
      <div style="color: #0AB5A0; font-size: 22px; font-weight: 700;">⚡ TeleFlow</div>
    </div>
    <div style="padding: 32px;">
      <div style="display: inline-block; padding: 6px 14px; border-radius: 99px; background: {$statusColor}1A; color: {$statusColor}; font-size: 12px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">
        {$statusLabel}
      </div>
      <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Billing Validation Alert</h1>
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px;">Hi {$recipient->name}, a claim requires your attention.</p>
      <div style="background: #F9FAFB; border-radius: 10px; border: 1px solid #E5E7EB; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color: #6B7280; font-size: 13px; padding-bottom: 10px;">Patient</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; padding-bottom: 10px;">{$patientName}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; padding: 10px 0; border-top: 1px solid #F3F4F6;">CPT Code</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px; font-family: monospace;">{$claim->cpt_code}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; padding: 10px 0; border-top: 1px solid #F3F4F6;">Service Date</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px;">{$claim->service_date}</td></tr>
          <tr><td style="color: #6B7280; font-size: 13px; padding-top: 10px; border-top: 1px solid #F3F4F6;">Payer</td><td style="color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid #F3F4F6; padding-top: 10px; text-transform: capitalize;">{$claim->primary_payer}</td></tr>
        </table>
      </div>
      <p style="color: #6B7280; font-size: 13px; margin: 0;">Log in to TeleFlow to review and correct this claim before submission.</p>
    </div>
    <div style="background: #F9FAFB; padding: 20px 32px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">TeleFlow · Clinical operations, automated.</p>
    </div>
  </div>
</body>
</html>
HTML;
    }
}