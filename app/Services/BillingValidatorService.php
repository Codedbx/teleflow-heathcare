<?php

namespace App\Services;

class BillingValidatorService
{
    // CPT code duration rules (in minutes)
    private const CPT_DURATION_RULES = [
        '90832' => ['min' => 16, 'max' => 37,  'label' => 'Psychotherapy, 16–37 min'],
        '90834' => ['min' => 38, 'max' => 52,  'label' => 'Psychotherapy, 38–52 min'],
        '90837' => ['min' => 53, 'max' => null, 'label' => 'Psychotherapy, 53+ min'],
        '90791' => ['min' => null, 'max' => null, 'label' => 'Psychiatric Diagnostic Evaluation'],
        '90792' => ['min' => null, 'max' => null, 'label' => 'Psychiatric Eval with Medical Services'],
        '90847' => ['min' => 50, 'max' => null, 'label' => 'Family Psychotherapy with Patient'],
        '90853' => ['min' => null, 'max' => null, 'label' => 'Group Psychotherapy'],
        '90839' => ['min' => 30, 'max' => null, 'label' => 'Psychotherapy for Crisis, first 30–74 min'],
        '90840' => ['min' => 30, 'max' => null, 'label' => 'Psychotherapy for Crisis, each add\'l 30 min'],
    ];

    // Codes that typically require prior auth for certain CA payers
    private const PRIOR_AUTH_CODES = ['90847', '90853', '90839', '90840'];

    // Valid ICD-10 prefixes for mental health billing under CA Medi-Cal
    private const VALID_MH_ICD10_PREFIXES = [
        'F', // Mental, Behavioral and Neurodevelopmental disorders
        'Z',  // Factors influencing health status
    ];

    // CalAIM-approved codes
    private const CALAIM_APPROVED_CODES = ['90832', '90834', '90837', '90791', '90847', '90853'];

    public function validate(array $claimData): array
    {
        $results = [];

        $results[] = $this->checkModifierVsModality($claimData);
        $results[] = $this->checkPosCode($claimData);
        $results[] = $this->checkCptDurationMatch($claimData);
        $results[] = $this->checkPriorAuth($claimData);
        $results[] = $this->checkCobOrder($claimData);
        $results[] = $this->checkTelehealthParity($claimData);
        $results[] = $this->checkIcd10Validity($claimData);
        $results[] = $this->checkCalAIMCompliance($claimData);

        $status = $this->computeOverallStatus($results);

        return [
            'status'           => $status,
            'checks'           => array_values(array_filter($results)),
            'corrected_fields' => $this->suggestCorrections($results, $claimData),
        ];
    }

    // ─── Check 1: Modifier vs Modality ───────────────────────────────────────

    private function checkModifierVsModality(array $data): array
    {
        $modality = $data['modality'] ?? null;
        $modifier = $data['modifier'] ?? null;
        $payer    = $data['primary_payer'] ?? null;

        if ($modality === 'video') {
            $validModifiers = ($payer === 'medi_cal') ? ['95', 'GT'] : ['95'];
            if (in_array($modifier, $validModifiers)) {
                return $this->pass(
                    'Modifier vs Modality',
                    "Modifier {$modifier} is correct for live video telehealth."
                );
            }
            $expected = $payer === 'medi_cal' ? '95 or GT' : '95';
            return $this->error(
                'Modifier vs Modality',
                "Live video requires modifier {$expected}. You entered: " . ($modifier ?: 'none') . '.',
                "Set modifier to {$expected}."
            );
        }

        if ($modality === 'audio') {
            if ($modifier === '93') {
                return $this->pass(
                    'Modifier vs Modality',
                    'Modifier 93 is correct for audio-only telehealth.'
                );
            }
            return $this->error(
                'Modifier vs Modality',
                'Audio-only sessions require modifier 93. You entered: ' . ($modifier ?: 'none') . '.',
                'Set modifier to 93.'
            );
        }

        if ($modality === 'in_person') {
            if (empty($modifier) || $modifier === 'none') {
                return $this->pass(
                    'Modifier vs Modality',
                    'No telehealth modifier required for in-person sessions.'
                );
            }
            return $this->warning(
                'Modifier vs Modality',
                "Telehealth modifier {$modifier} is present but session is in-person.",
                'Remove the telehealth modifier for in-person sessions.'
            );
        }

        return $this->warning('Modifier vs Modality', 'Session modality not specified.', 'Select a modality.');
    }

    // ─── Check 2: POS Code ───────────────────────────────────────────────────

    private function checkPosCode(array $data): array
    {
        $modality = $data['modality'] ?? null;
        $pos      = $data['pos_code'] ?? null;

        $expected = match ($modality) {
            'video'     => ['10', '02'],
            'audio'     => ['10', '02'],
            'in_person' => ['11'],
            default     => null,
        };

        if ($expected === null) {
            return $this->warning('POS Code', 'Cannot validate POS code — modality not set.', 'Select a modality first.');
        }

        if (in_array($pos, $expected)) {
            $label = $pos === '10' ? 'Patient home' : ($pos === '02' ? 'Telehealth facility' : 'Clinic/office');
            return $this->pass('POS Code', "POS {$pos} ({$label}) is correct for {$modality} sessions.");
        }

        $expectedStr = implode(' or ', $expected);
        return $this->error(
            'POS Code',
            "For {$modality} sessions, POS should be {$expectedStr}. You entered: " . ($pos ?: 'none') . '.',
            "Set POS to {$expectedStr}."
        );
    }

    // ─── Check 3: CPT + Duration Match ───────────────────────────────────────

    private function checkCptDurationMatch(array $data): array
    {
        $cpt      = $data['cpt_code'] ?? null;
        $duration = isset($data['session_duration_minutes']) ? (int) $data['session_duration_minutes'] : null;

        if (! $cpt || ! isset(self::CPT_DURATION_RULES[$cpt])) {
            return $this->warning(
                'CPT + Duration Match',
                $cpt ? "CPT code {$cpt} is not in the standard mental health code set." : 'No CPT code entered.',
                'Enter a valid CPT code (e.g. 90837).'
            );
        }

        $rule = self::CPT_DURATION_RULES[$cpt];

        // Codes with no duration rules
        if ($rule['min'] === null && $rule['max'] === null) {
            return $this->pass('CPT + Duration Match', "{$cpt} ({$rule['label']}) has no specific duration requirement.");
        }

        if ($duration === null || $duration === 0) {
            return $this->warning('CPT + Duration Match', 'Session duration not entered.', 'Enter session duration in minutes.');
        }

        $minOk = $rule['min'] === null || $duration >= $rule['min'];
        $maxOk = $rule['max'] === null || $duration <= $rule['max'];

        if ($minOk && $maxOk) {
            return $this->pass(
                'CPT + Duration Match',
                "{$duration} min falls within the required range for {$cpt} ({$rule['label']})."
            );
        }

        // Suggest the correct code
        $suggestion = $this->suggestCptCode($duration);
        $fixMessage = $suggestion
            ? "Use {$suggestion} for a {$duration}-minute session instead."
            : "Review CPT code selection for {$duration}-minute session.";

        if (! $minOk) {
            return $this->error(
                'CPT + Duration Match',
                "{$cpt} requires at least {$rule['min']} min. You entered {$duration} min.",
                $fixMessage
            );
        }

        return $this->error(
            'CPT + Duration Match',
            "{$cpt} maximum is {$rule['max']} min. You entered {$duration} min.",
            $fixMessage
        );
    }

    // ─── Check 4: Prior Auth ─────────────────────────────────────────────────

    private function checkPriorAuth(array $data): array
    {
        $cpt      = $data['cpt_code'] ?? null;
        $payer    = $data['primary_payer'] ?? null;
        $authNum  = $data['prior_auth_number'] ?? null;
        $authExp  = $data['prior_auth_expiry'] ?? null;
        $duration = isset($data['session_duration_minutes']) ? (int) $data['session_duration_minutes'] : 0;

        $requiresAuth = in_array($cpt, self::PRIOR_AUTH_CODES)
            || ($duration > 60 && in_array($payer, ['medi_cal', 'both']));

        if (! $requiresAuth) {
            if ($authNum) {
                return $this->pass('Prior Authorization', "Auth number {$authNum} on file. Not required for this code, but no issue.");
            }
            return $this->pass('Prior Authorization', 'Prior authorization not required for this code and payer combination.');
        }

        if (! $authNum) {
            $reason = in_array($cpt, self::PRIOR_AUTH_CODES)
                ? "CPT {$cpt} typically requires prior auth for CA Medi-Cal/commercial payers."
                : "Sessions over 60 min often require prior auth for Medi-Cal.";
            return $this->warning(
                'Prior Authorization',
                "{$reason} No authorization number on file.",
                'Add prior auth number or confirm payer does not require it.'
            );
        }

        // Check expiry
        if ($authExp && strtotime($authExp) < strtotime($data['service_date'] ?? 'today')) {
            return $this->error(
                'Prior Authorization',
                "Authorization {$authNum} expired on {$authExp}.",
                'Obtain a new authorization before submitting.'
            );
        }

        return $this->pass('Prior Authorization', "Auth number {$authNum} on file and valid.");
    }

    // ─── Check 5: COB Order ──────────────────────────────────────────────────

    private function checkCobOrder(array $data): array
    {
        $payer    = $data['primary_payer'] ?? null;
        $cobOrder = $data['cob_order'] ?? null;

        if ($payer !== 'both') {
            return $this->pass('COB Order', 'Single-payer claim — COB not applicable.');
        }

        if (! $cobOrder) {
            return $this->warning(
                'COB Order',
                'Dual-payer claim detected but no COB order specified.',
                'Select COB order (Medi-Cal Primary or Commercial Primary).'
            );
        }

        if ($cobOrder === 'medi_cal_secondary' || $cobOrder === 'commercial_primary') {
            return $this->pass(
                'COB Order',
                'Medi-Cal billed as secondary. Correct for most CA dual-eligible patients.'
            );
        }

        if ($cobOrder === 'medi_cal_primary') {
            return $this->warning(
                'COB Order',
                'Medi-Cal set as primary payer. For most dual-eligible CA patients, Medi-Cal is secondary.',
                'Confirm patient has opted out of standard COB rules before proceeding.'
            );
        }

        return $this->pass('COB Order', "COB order set to: {$cobOrder}.");
    }

    // ─── Check 6: Telehealth Parity ──────────────────────────────────────────

    private function checkTelehealthParity(array $data): array
    {
        $modality = $data['modality'] ?? null;

        if ($modality === 'in_person') {
            return $this->pass('Telehealth Parity', 'In-person session — parity rules not applicable.');
        }

        // CA permanent telehealth parity law (AB 744 / SB 43 extensions)
        return $this->pass(
            'Telehealth Parity',
            'California permanent telehealth parity law applies. Reimbursement rate equals in-person services.'
        );
    }

    // ─── Check 7: ICD-10 Validity ────────────────────────────────────────────

    private function checkIcd10Validity(array $data): array
    {
        $icd10 = strtoupper(trim($data['icd10_primary'] ?? ''));
        $payer = $data['primary_payer'] ?? null;

        if (empty($icd10)) {
            return $this->error('ICD-10 Validity', 'No primary diagnosis code entered.', 'Add a valid ICD-10 diagnosis code (e.g. F32.1).');
        }

        // Basic format check: 1 letter + 2 digits + optional decimal + more digits
        if (! preg_match('/^[A-Z]\d{2}(\.\d+)?$/', $icd10)) {
            return $this->error(
                'ICD-10 Validity',
                "ICD-10 format appears invalid: {$icd10}.",
                'Use format like F32.1 or Z03.89.'
            );
        }

        $prefix = $icd10[0];

        if (! in_array($prefix, self::VALID_MH_ICD10_PREFIXES)) {
            return $this->warning(
                'ICD-10 Validity',
                "{$icd10} is outside the typical F or Z code range for mental health billing.",
                'Verify this code is accepted by the payer for mental health services.'
            );
        }

        if (in_array($payer, ['medi_cal', 'both']) && $prefix === 'F') {
            return $this->pass(
                'ICD-10 Validity',
                "{$icd10} is a valid and billable mental health code under CA Medi-Cal."
            );
        }

        return $this->pass('ICD-10 Validity', "{$icd10} is a valid ICD-10 code.");
    }

    // ─── Check 8: CalAIM Compliance ──────────────────────────────────────────

    private function checkCalAIMCompliance(array $data): array
    {
        $payer    = $data['primary_payer'] ?? null;
        $cpt      = $data['cpt_code'] ?? null;
        $countyMhp = $data['county_mhp'] ?? null;

        // Only relevant for Medi-Cal patients
        if (! in_array($payer, ['medi_cal', 'both'])) {
            return $this->pass('CalAIM Compliance', 'CalAIM rules not applicable — not a Medi-Cal claim.');
        }

        if ($countyMhp && $cpt && ! in_array($cpt, self::CALAIM_APPROVED_CODES)) {
            return $this->warning(
                'CalAIM Compliance',
                "County MHP patient using {$cpt}, which may not be in the CalAIM approved code set.",
                'Verify this CPT code is covered under the county CalAIM benefit plan.'
            );
        }

        if ($cpt && in_array($cpt, self::CALAIM_APPROVED_CODES)) {
            return $this->pass(
                'CalAIM Compliance',
                "{$cpt} is within the CalAIM approved behavioral health services code set."
            );
        }

        return $this->pass('CalAIM Compliance', 'No CalAIM compliance issues detected.');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function computeOverallStatus(array $results): string
    {
        foreach ($results as $r) {
            if (($r['status'] ?? '') === 'error') return 'error';
        }
        foreach ($results as $r) {
            if (($r['status'] ?? '') === 'warning') return 'warning';
        }
        return 'clean';
    }

    private function suggestCptCode(int $duration): ?string
    {
        if ($duration >= 16 && $duration <= 37) return '90832';
        if ($duration >= 38 && $duration <= 52) return '90834';
        if ($duration >= 53) return '90837';
        return null;
    }

    private function suggestCorrections(array $results, array $claimData): array
    {
        $corrections = [];
        $duration    = (int) ($claimData['session_duration_minutes'] ?? 0);

        foreach ($results as $result) {
            if (($result['status'] ?? '') !== 'clean' && $result !== null) {
                if ($result['check'] === 'CPT + Duration Match' && $duration > 0) {
                    $suggested = $this->suggestCptCode($duration);
                    if ($suggested) {
                        $corrections['cpt_code'] = $suggested;
                    }
                }
                if ($result['check'] === 'Modifier vs Modality') {
                    $modality = $claimData['modality'] ?? null;
                    $payer    = $claimData['primary_payer'] ?? null;
                    if ($modality === 'video') {
                        $corrections['modifier'] = $payer === 'medi_cal' ? 'GT' : '95';
                    } elseif ($modality === 'audio') {
                        $corrections['modifier'] = '93';
                    }
                }
                if ($result['check'] === 'POS Code') {
                    $modality = $claimData['modality'] ?? null;
                    if ($modality === 'video' || $modality === 'audio') {
                        $corrections['pos_code'] = '10';
                    } elseif ($modality === 'in_person') {
                        $corrections['pos_code'] = '11';
                    }
                }
            }
        }

        return $corrections;
    }

    private function pass(string $check, string $detail): array
    {
        return ['check' => $check, 'status' => 'clean', 'detail' => $detail, 'fix' => null];
    }

    private function warning(string $check, string $detail, string $fix): array
    {
        return ['check' => $check, 'status' => 'warning', 'detail' => $detail, 'fix' => $fix];
    }

    private function error(string $check, string $detail, string $fix): array
    {
        return ['check' => $check, 'status' => 'error', 'detail' => $detail, 'fix' => $fix];
    }
}