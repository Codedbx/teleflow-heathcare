<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Patient Assigned</title>
    <style>
        body       { margin: 0; padding: 0; background: #F7F8FA; font-family: Arial, sans-serif; }
        .wrapper   { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .header    { background: #0F1A2E; padding: 32px 40px; }
        .header h1 { color: #ffffff; font-size: 20px; margin: 0; }
        .header p  { color: #8FA3C0; font-size: 13px; margin: 6px 0 0; }
        .body      { padding: 36px 40px; }
        .body p    { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
        .info-grid { background: #F7F8FA; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
        .info-row  { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
        .info-row:last-child { border-bottom: none; }
        .info-label{ color: #6B7280; }
        .info-value{ color: #111827; font-weight: 600; text-align: right; }
        .badge     { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
        .badge-teal{ background: #E6F9F7; color: #0AB5A0; }
        .badge-amber{background: #FEF3C7; color: #D97706; }
        .btn       { display: inline-block; background: #0AB5A0; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
        .footer    { background: #F7F8FA; padding: 20px 40px; text-align: center; }
        .footer p  { color: #9CA3AF; font-size: 12px; margin: 0; line-height: 1.6; }
    </style>
</head>
<body>
<div class="wrapper">

    <div class="header">
        <h1>⚡ New Patient Assigned</h1>
        <p>{{ $practiceName }} — Clinical Team Notification</p>
    </div>

    <div class="body">
        <p>Hi {{ $providerName }},</p>

        <p>A new patient has completed their intake and has been assigned to your caseload. Their information is summarised below.</p>

        <div class="info-grid">
            <div class="info-row">
                <span class="info-label">Patient Name</span>
                <span class="info-value">{{ $patient->first_name }} {{ $patient->last_name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($patient->dob)->format('M j, Y') }} (age {{ $patientAge }})</span>
            </div>
            <div class="info-row">
                <span class="info-label">Contact</span>
                <span class="info-value">{{ $patient->email }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ $patient->phone }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Insurance</span>
                <span class="info-value">
                    @php
                        $insuranceLabels = [
                            'medi_cal'   => 'Medi-Cal',
                            'commercial' => 'Commercial/Private',
                            'both'       => 'Dual Payer (Medi-Cal + Commercial)',
                            'self_pay'   => 'Self-Pay',
                        ];
                    @endphp
                    {{ $insuranceLabels[$insuranceType] ?? $insuranceType }}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Preferred Modality</span>
                <span class="info-value">
                    @php
                        $modalityLabels = ['video' => 'Live Video', 'audio' => 'Audio-Only', 'in_person' => 'In-Person'];
                    @endphp
                    {{ $modalityLabels[$modality] ?? $modality }}
                </span>
            </div>
            @if (count($presentingConcerns) > 0)
            <div class="info-row">
                <span class="info-label">Presenting Concerns</span>
                <span class="info-value">{{ implode(', ', $presentingConcerns) }}</span>
            </div>
            @endif
        </div>

        <p>Please review their full profile and schedule an initial intake session at your earliest availability.</p>

        <a href="{{ $patientProfileUrl }}" class="btn">View Patient Profile →</a>

        <p style="color: #6B7280; font-size: 13px;">
            This notification was generated automatically by {{ $practiceName }} when the patient completed their intake form.
            Patient information is confidential and must be handled in accordance with HIPAA and California CMIA requirements.
        </p>
    </div>

    <div class="footer">
        <p>
            {{ $practiceName }} &nbsp;·&nbsp; Internal Clinical Notification<br/>
            &copy; {{ date('Y') }} {{ $practiceName }}. All rights reserved.
        </p>
    </div>

</div>
</body>
</html>