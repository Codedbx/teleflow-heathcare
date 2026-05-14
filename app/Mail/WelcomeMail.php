<?php

namespace App\Mail;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Patient $patient,
        public readonly ?User   $provider,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to ' . config('app.name') . ' — Your Intake is Complete',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.welcome',
            with: [
                'patientName'  => $this->patient->first_name,
                'providerName' => $this->provider?->name ?? 'our clinical team',
                'providerType' => $this->provider?->provider_type,
                'practiceName' => config('app.name'),
                'appUrl'       => config('app.url'),
            ],
        );
    }
}