<?php

namespace App\Jobs;

use App\Models\BillingClaim;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class BillingAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public BillingClaim $claim) {}

    public function handle(): void
    {
        // Notify all billers and admins about the validation error
        $recipients = User::whereIn('role', ['biller', 'admin'])->get();

        foreach ($recipients as $user) {
            Mail::to($user->email)->send(
                new \App\Mail\BillingAlertMail($this->claim, $user)
            );
        }

        // Log to activity log
        \App\Models\ActivityLog::create([
            'user_id'    => null,
            'action'     => 'billing_alert',
            'model_type' => BillingClaim::class,
            'model_id'   => $this->claim->id,
            'metadata'   => [
                'status'    => $this->claim->validation_status,
                'cpt_code'  => $this->claim->cpt_code,
                'patient_id'=> $this->claim->patient_id,
            ],
        ]);
    }
}