<?php

namespace App\Services;

use App\Models\Consent;
use App\Models\Patient;
use App\Models\PatientInsurance;
use App\Models\User;
use Illuminate\Support\Carbon;

class PatientOnboardingService
{
    /**
     * Create the core patient record.
     */
    public function createPatient(array $data): Patient
    {
        return Patient::create([
            'first_name'          => trim($data['first_name']),
            'last_name'           => trim($data['last_name']),
            'dob'                 => $data['dob'],
            'gender'              => $data['gender'],
            'phone'               => preg_replace('/\D/', '', $data['phone']), // strip non-digits for storage
            'email'               => strtolower(trim($data['email'])),
            'address'             => trim($data['address']),
            'city'                => trim($data['city']),
            'state'               => strtoupper($data['state'] ?? 'CA'),
            'zip'                 => trim($data['zip']),
            'presenting_concerns' => json_encode($data['presenting_concerns'] ?? []),
            'modality_preference' => $data['modality_preference'],
            'status'              => 'pending_intake',
        ]);
    }

    /**
     * Create the patient_insurance record.
     * Handles Medi-Cal, commercial, dual-payer (both), and self-pay.
     */
    public function createInsurance(Patient $patient, array $data): PatientInsurance
    {
        $insuranceType = $data['insurance_type'];

        return PatientInsurance::create([
            'patient_id'          => $patient->id,
            'insurance_type'      => $insuranceType,

            // Medi-Cal fields (present for medi_cal and both)
            'medi_cal_id'         => in_array($insuranceType, ['medi_cal', 'both'])
                                        ? $data['medi_cal_id'] ?? null
                                        : null,
            'county_mhp'          => in_array($insuranceType, ['medi_cal', 'both'])
                                        ? $data['county_mhp'] ?? null
                                        : null,

            // Commercial fields (present for commercial and both)
            'commercial_payer'    => in_array($insuranceType, ['commercial', 'both'])
                                        ? $data['commercial_payer'] ?? null
                                        : null,
            'member_id'           => in_array($insuranceType, ['commercial', 'both'])
                                        ? $data['member_id'] ?? null
                                        : null,
            'group_number'        => in_array($insuranceType, ['commercial', 'both'])
                                        ? $data['group_number'] ?? null
                                        : null,
            'subscriber_name'     => in_array($insuranceType, ['commercial', 'both'])
                                        ? $data['subscriber_name'] ?? null
                                        : null,
            'subscriber_dob'      => in_array($insuranceType, ['commercial', 'both'])
                                        ? $data['subscriber_dob'] ?? null
                                        : null,

            // COB only relevant for dual-payer
            'cob_order'           => $insuranceType === 'both'
                                        ? ($data['cob_order'] ?? 'medi_cal_primary')
                                        : null,

            // Prior auth — any payer type can require it
            'prior_auth_required' => (bool) ($data['prior_auth_required'] ?? false),
            'prior_auth_number'   => !empty($data['prior_auth_required'])
                                        ? $data['prior_auth_number'] ?? null
                                        : null,
            'prior_auth_expiry'   => !empty($data['prior_auth_required'])
                                        ? $data['prior_auth_expiry'] ?? null
                                        : null,
        ]);
    }

    /**
     * Store all three consent records.
     * Each consent captures: type, agreed timestamp, typed signature, IP address.
     */
    public function storeConsents(Patient $patient, array $data, string $ipAddress): void
    {
        $consentTypes = ['telehealth', 'hipaa', 'financial'];
        $agreedAt     = now();

        foreach ($consentTypes as $type) {
            Consent::create([
                'patient_id'     => $patient->id,
                'type'           => $type,
                'agreed_at'      => $agreedAt,
                'signature_text' => trim($data['signature_text']),
                'ip_address'     => $ipAddress,
            ]);
        }
    }

    /**
     * Assign the best available provider to the patient.
     *
     * Strategy:
     *   1. Find clinician matching preferred_provider_type with fewest active patients.
     *   2. Fallback: any clinician with fewest active patients.
     *   3. Fallback: null (admin will assign manually).
     */
    public function assignProvider(Patient $patient, array $data): ?User
    {
        $preferredType = $data['preferred_provider_type'] ?? null;
        $preferredDays = $data['preferred_days'] ?? [];
        $preferredSlots = $data['preferred_time_slots'] ?? [];

        // Primary: match on provider type, fewest active patients (load balance)
        if ($preferredType) {
            $provider = User::where('role', 'clinician')
                ->where('provider_type', $preferredType)
                ->withCount([
                    'patients as active_patient_count' => function ($query) {
                        $query->where('status', 'active');
                    },
                ])
                ->orderBy('active_patient_count')
                ->first();

            if ($provider) {
                return $provider;
            }
        }

        // Secondary fallback: any clinician, lowest caseload
        $fallback = User::where('role', 'clinician')
            ->withCount([
                'patients as active_patient_count' => function ($query) {
                    $query->where('status', 'active');
                },
            ])
            ->orderBy('active_patient_count')
            ->first();

        return $fallback; // may be null if no clinicians exist
    }

    /**
     * Calculate patient age from DOB string.
     */
    public function calculateAge(string $dob): int
    {
        return Carbon::parse($dob)->age;
    }
}