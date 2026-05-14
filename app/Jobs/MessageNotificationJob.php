<?php

namespace App\Jobs;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class MessageNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(public Message $message) {}

    public function handle(): void
    {
        $message  = $this->message;
        $patient  = $message->patient;
        $provider = $message->sender;

        if (! $patient || ! $provider) {
            return;
        }

        $preview = mb_strlen($message->body) > 200
            ? mb_substr($message->body, 0, 200) . '…'
            : $message->body;

        Mail::html(
            $this->buildEmail($patient, $provider, $preview),
            function ($mail) use ($patient, $provider) {
                $mail->to($patient->email, "{$patient->first_name} {$patient->last_name}")
                     ->subject("New message from {$provider->name} — TeleFlow");
            }
        );
    }

    private function buildEmail($patient, $provider, string $preview): string
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
      <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">New Message</h1>
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px;">
        Hi {$patient->first_name}, you have a new message from <strong>{$provider->name}</strong>.
      </p>
      <div style="background: #F9FAFB; border-radius: 10px; border: 1px solid #E5E7EB; padding: 20px; margin-bottom: 24px;">
        <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.6; font-style: italic;">{$preview}</p>
      </div>
      <p style="color: #6B7280; font-size: 13px; margin: 0;">
        Please log in to your patient portal to read the full message and reply.
      </p>
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