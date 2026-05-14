<?php

namespace App\Mail;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class ProviderNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Patient $patient,
        public readonly User    $provider,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Patient Assigned — '
                . $this->patient->first_name . ' '
                . $this->patient->last_name,
        );
    }

    public function content(): Content
    {
        $insurance    = $this->patient->insurance;
        $concerns     = json_decode($this->patient->presenting_concerns ?? '[]', true);
        $patientAge   = Carbon::parse($this->patient->dob)->age;

        return new Content(
            view: 'mail.provider_notification',
            with: [
                'providerName'      => $this->provider->name,
                'practiceName'      => config('app.name'),
                'appUrl'            => config('app.url'),
                'patient'           => $this->patient,
                'patientAge'        => $patientAge,
                'insuranceType'     => $insurance?->insurance_type ?? 'unknown',
                'presentingConcerns'=> $concerns,
                'modality'          => $this->patient->modality_preference,
                'patientProfileUrl' => config('app.url') . '/patients/' . $this->patient->id,
            ],
        );
    }
}