<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to {{ $practiceName }}</title>
    <style>
        body      { margin: 0; padding: 0; background: #F7F8FA; font-family: 'DM Sans', Arial, sans-serif; }
        .wrapper  { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .header   { background: #0F1A2E; padding: 32px 40px; text-align: center; }
        .header h1{ color: #ffffff; font-size: 22px; margin: 0; letter-spacing: -0.3px; }
        .header p { color: #0AB5A0; font-size: 13px; margin: 6px 0 0; }
        .body     { padding: 36px 40px; }
        .body p   { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
        .highlight{ background: #E6F9F7; border-left: 3px solid #0AB5A0; padding: 14px 18px; border-radius: 6px; margin: 24px 0; }
        .highlight p { margin: 0; color: #111827; font-size: 14px; }
        .btn      { display: inline-block; background: #0AB5A0; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
        .footer   { background: #F7F8FA; padding: 20px 40px; text-align: center; }
        .footer p { color: #9CA3AF; font-size: 12px; margin: 0; line-height: 1.6; }
    </style>
</head>
<body>
<div class="wrapper">

    <div class="header">
        <h1>⚡ {{ $practiceName }}</h1>
        <p>Clinical operations, automated.</p>
    </div>

    <div class="body">
        <p>Hi {{ $patientName }},</p>

        <p>Your intake form has been received and is complete. Welcome to {{ $practiceName }} — we're glad you're here.</p>

        @if ($providerName !== 'our clinical team')
        <div class="highlight">
            <p><strong>Your assigned provider:</strong> {{ $providerName }}{{ $providerType ? ', ' . $providerType : '' }}</p>
            <p style="margin-top: 8px;">Our scheduling team will reach out within 1–2 business days to confirm your first appointment.</p>
        </div>
        @else
        <div class="highlight">
            <p>Our scheduling team will review your preferences and be in touch within 1–2 business days to confirm your provider and first appointment.</p>
        </div>
        @endif

        <p>Here's what happens next:</p>
        <p>
            ✅ &nbsp;Your consents and intake information are on file<br/>
            📅 &nbsp;A scheduling coordinator will contact you shortly<br/>
            💬 &nbsp;You'll receive a secure link to message your provider
        </p>

        <p>If you have any questions before your first session, reply to this email or call us directly.</p>

        <a href="{{ $appUrl }}" class="btn">Visit Patient Portal</a>

        <p style="color: #6B7280; font-size: 13px;">
            All of your information is stored securely. Your privacy is our top priority.
            This practice operates under California mental health confidentiality laws (CMIA, Welfare & Institutions Code §5328).
        </p>
    </div>

    <div class="footer">
        <p>
            {{ $practiceName }} &nbsp;·&nbsp; California Telehealth Mental Health Practice<br/>
            You received this because you completed a patient intake form.<br/>
            &copy; {{ date('Y') }} {{ $practiceName }}. All rights reserved.
        </p>
    </div>

</div>
</body>
</html>