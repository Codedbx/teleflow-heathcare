<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\BillingClaim;
use App\Models\ClinicalNote;
use App\Models\Consent;
use App\Models\IntakeToken;
use App\Models\Message;
use App\Models\Patient;
use App\Models\PatientInsurance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Users ──────────────────────────────────────────────────────
        $admin = User::create([
            'name'          => 'Alex Rivera',
            'email'         => 'admin@teleflow.demo',
            'password'      => Hash::make('password'),
            'role'          => 'admin',
            'provider_type' => null,
            'npi_number'    => '1234567890',
        ]);

        $chen = User::create([
            'name'          => 'Dr. Sarah Chen',
            'email'         => 'dr.chen@teleflow.demo',
            'password'      => Hash::make('password'),
            'role'          => 'clinician',
            'provider_type' => 'LCSW',
            'npi_number'    => '9876543210',
        ]);

        $patel = User::create([
            'name'          => 'Dr. Ravi Patel',
            'email'         => 'dr.patel@teleflow.demo',
            'password'      => Hash::make('password'),
            'role'          => 'clinician',
            'provider_type' => 'Psychologist',
            'npi_number'    => '1122334455',
        ]);

        $biller = User::create([
            'name'          => 'Jordan Mills',
            'email'         => 'billing@teleflow.demo',
            'password'      => Hash::make('password'),
            'role'          => 'biller',
            'provider_type' => null,
            'npi_number'    => null,
        ]);

        // ── 2. Patients ───────────────────────────────────────────────────
        // Per build doc: 8 patients, mix of Medi-Cal, commercial, dual-payer

        $maria = Patient::create([
            'first_name'          => 'Maria',
            'last_name'           => 'Gonzalez',
            'dob'                 => '1990-03-15',
            'gender'              => 'female',
            'phone'               => '(310) 555-0101',
            'email'               => 'maria.gonzalez@example.com',
            'address'             => '4521 Maple Ave',
            'city'                => 'Los Angeles',
            'state'               => 'CA',
            'zip'                 => '90032',
            'assigned_provider_id'=> $chen->id,
            'presenting_concerns' => ['Anxiety', 'Depression'],
            'modality_preference' => 'video',
            'status'              => 'active',
            'intake_completed_at' => now()->subDays(45),
        ]);

        $james = Patient::create([
            'first_name'          => 'James',
            'last_name'           => 'Thornton',
            'dob'                 => '1985-07-22',
            'gender'              => 'male',
            'phone'               => '(415) 555-0142',
            'email'               => 'james.thornton@example.com',
            'address'             => '891 Ocean Drive',
            'city'                => 'San Francisco',
            'state'               => 'CA',
            'zip'                 => '94107',
            'assigned_provider_id'=> $patel->id,
            'presenting_concerns' => ['PTSD'],
            'modality_preference' => 'video',
            'status'              => 'active',
            'intake_completed_at' => now()->subDays(30),
        ]);

        $aisha = Patient::create([
            'first_name'          => 'Aisha',
            'last_name'           => 'Williams',
            'dob'                 => '1998-11-04',
            'gender'              => 'female',
            'phone'               => '(213) 555-0178',
            'email'               => 'aisha.williams@example.com',
            'address'             => '220 S Central Ave',
            'city'                => 'Los Angeles',
            'state'               => 'CA',
            'zip'                 => '90011',
            'assigned_provider_id'=> $chen->id,
            'presenting_concerns' => ['Depression'],
            'modality_preference' => 'audio',
            'status'              => 'active',
            'intake_completed_at' => now()->subDays(60),
        ]);

        $david = Patient::create([
            'first_name'          => 'David',
            'last_name'           => 'Park',
            'dob'                 => '1979-05-30',
            'gender'              => 'male',
            'phone'               => '(619) 555-0199',
            'email'               => 'david.park@example.com',
            'address'             => '3300 El Cajon Blvd',
            'city'                => 'San Diego',
            'state'               => 'CA',
            'zip'                 => '92104',
            'assigned_provider_id'=> $patel->id,
            'presenting_concerns' => ['Relationship Issues'],
            'modality_preference' => 'video',
            'status'              => 'active',
            'intake_completed_at' => now()->subDays(20),
        ]);

        $sofia = Patient::create([
            'first_name'          => 'Sofia',
            'last_name'           => 'Reyes',
            'dob'                 => '1994-09-18',
            'gender'              => 'female',
            'phone'               => '(323) 555-0211',
            'email'               => 'sofia.reyes@example.com',
            'address'             => '710 N Figueroa St',
            'city'                => 'Los Angeles',
            'state'               => 'CA',
            'zip'                 => '90012',
            'assigned_provider_id'=> $chen->id,
            'presenting_concerns' => ['Bipolar Disorder'],
            'modality_preference' => 'video',
            'status'              => 'active',
            'intake_completed_at' => now()->subDays(90),
        ]);

        $kevin = Patient::create([
            'first_name'          => 'Kevin',
            'last_name'           => 'Okafor',
            'dob'                 => '2001-02-14',
            'gender'              => 'male',
            'phone'               => '(510) 555-0304',
            'email'               => 'kevin.okafor@example.com',
            'address'             => '1450 Broadway',
            'city'                => 'Oakland',
            'state'               => 'CA',
            'zip'                 => '94612',
            'assigned_provider_id'=> $patel->id,
            'presenting_concerns' => ['Anxiety'],
            'modality_preference' => 'video',
            'status'              => 'active',
            'intake_completed_at' => now()->subDays(10),
        ]);

        $linda = Patient::create([
            'first_name'          => 'Linda',
            'last_name'           => 'Fischer',
            'dob'                 => '1967-12-01',
            'gender'              => 'female',
            'phone'               => '(760) 555-0381',
            'email'               => 'linda.fischer@example.com',
            'address'             => '52 Desert Rose Way',
            'city'                => 'Palm Springs',
            'state'               => 'CA',
            'zip'                 => '92262',
            'assigned_provider_id'=> $chen->id,
            'presenting_concerns' => ['Depression', 'Anxiety'],
            'modality_preference' => 'in_person',
            'status'              => 'active',
            'intake_completed_at' => now()->subDays(15),
        ]);

        $marco = Patient::create([
            'first_name'          => 'Marco',
            'last_name'           => 'Delgado',
            'dob'                 => '1988-06-25',
            'gender'              => 'male',
            'phone'               => '(714) 555-0449',
            'email'               => 'marco.delgado@example.com',
            'address'             => '88 Harbor Blvd',
            'city'                => 'Anaheim',
            'state'               => 'CA',
            'zip'                 => '92805',
            'assigned_provider_id'=> $patel->id,
            'presenting_concerns' => ['Substance Use', 'Anxiety'],
            'modality_preference' => 'video',
            'status'              => 'pending_intake',
            'intake_completed_at' => null,
        ]);

        // ── 3. Patient Insurance ──────────────────────────────────────────

        // Maria — dual payer (Medi-Cal + Aetna)
        PatientInsurance::create([
            'patient_id'          => $maria->id,
            'insurance_type'      => 'both',
            'medi_cal_id'         => 'MC-78234901',
            'county_mhp'          => 'Los Angeles County',
            'commercial_payer'    => 'Aetna',
            'member_id'           => 'AE-9921043',
            'group_number'        => 'GRP-44512',
            'subscriber_name'     => 'Maria Gonzalez',
            'subscriber_dob'      => '1990-03-15',
            'cob_order'           => 'commercial_primary',
            'prior_auth_required' => false,
        ]);

        // James — Commercial (Aetna only)
        PatientInsurance::create([
            'patient_id'          => $james->id,
            'insurance_type'      => 'commercial',
            'commercial_payer'    => 'Aetna',
            'member_id'           => 'AE-5512987',
            'group_number'        => 'GRP-88201',
            'subscriber_name'     => 'James Thornton',
            'subscriber_dob'      => '1985-07-22',
            'cob_order'           => 'commercial_primary',
            'prior_auth_required' => true,
            'prior_auth_number'   => 'AUTH-2024-00881',
            'prior_auth_expiry'   => now()->addDays(60)->toDateString(),
        ]);

        // Aisha — Medi-Cal only
        PatientInsurance::create([
            'patient_id'     => $aisha->id,
            'insurance_type' => 'medi_cal',
            'medi_cal_id'    => 'MC-44218876',
            'county_mhp'     => 'Los Angeles County',
        ]);

        // David — Self-pay
        PatientInsurance::create([
            'patient_id'     => $david->id,
            'insurance_type' => 'self_pay',
        ]);

        // Sofia — Medi-Cal only
        PatientInsurance::create([
            'patient_id'          => $sofia->id,
            'insurance_type'      => 'medi_cal',
            'medi_cal_id'         => 'MC-10029874',
            'county_mhp'          => 'Los Angeles County',
            'prior_auth_required' => true,
            'prior_auth_number'   => 'AUTH-2024-00443',
            'prior_auth_expiry'   => now()->addDays(30)->toDateString(),
        ]);

        // Kevin — Commercial (Blue Shield)
        PatientInsurance::create([
            'patient_id'       => $kevin->id,
            'insurance_type'   => 'commercial',
            'commercial_payer' => 'Blue Shield of California',
            'member_id'        => 'BSC-7741209',
            'group_number'     => 'GRP-22099',
            'subscriber_name'  => 'Kevin Okafor',
            'subscriber_dob'   => '2001-02-14',
            'cob_order'        => 'commercial_primary',
        ]);

        // Linda — dual payer (Medi-Cal + Medicare)
        PatientInsurance::create([
            'patient_id'       => $linda->id,
            'insurance_type'   => 'both',
            'medi_cal_id'      => 'MC-58899234',
            'county_mhp'       => 'Riverside County',
            'commercial_payer' => 'Medicare',
            'member_id'        => 'MED-1LF-233890',
            'cob_order'        => 'commercial_primary',
        ]);

        // Marco — Medi-Cal (pending intake — no insurance yet)
        PatientInsurance::create([
            'patient_id'     => $marco->id,
            'insurance_type' => 'medi_cal',
            'medi_cal_id'    => 'MC-PENDING',
            'county_mhp'     => 'Orange County',
        ]);

        // ── 4. Consents ───────────────────────────────────────────────────

        $consentPatients = [$maria, $james, $aisha, $david, $sofia, $kevin, $linda];
        foreach ($consentPatients as $patient) {
            foreach (['telehealth', 'hipaa', 'financial'] as $type) {
                Consent::create([
                    'patient_id'     => $patient->id,
                    'type'           => $type,
                    'agreed_at'      => $patient->intake_completed_at ?? now()->subDays(rand(5, 90)),
                    'signature_text' => "{$patient->first_name} {$patient->last_name}",
                    'ip_address'     => '127.0.0.1',
                ]);
            }
        }

        // ── 5. Appointments — 12 total ────────────────────────────────────
        // Mix: today, upcoming, past, various statuses

        $today = now()->startOfDay();

        $appointments = [
            // Today
            ['patient' => $maria,  'provider' => $chen,  'at' => $today->copy()->setTime(9, 0),  'duration' => 53, 'modality' => 'video',     'status' => 'confirmed'],
            ['patient' => $james,  'provider' => $patel, 'at' => $today->copy()->setTime(10, 30), 'duration' => 50, 'modality' => 'video',     'status' => 'confirmed'],
            ['patient' => $aisha,  'provider' => $chen,  'at' => $today->copy()->setTime(14, 0),  'duration' => 45, 'modality' => 'audio',     'status' => 'pending'],
            ['patient' => $sofia,  'provider' => $chen,  'at' => $today->copy()->setTime(16, 0),  'duration' => 60, 'modality' => 'video',     'status' => 'confirmed'],

            // Upcoming
            ['patient' => $david,  'provider' => $patel, 'at' => now()->addDays(1)->setTime(11, 0),  'duration' => 50, 'modality' => 'video', 'status' => 'confirmed'],
            ['patient' => $kevin,  'provider' => $patel, 'at' => now()->addDays(2)->setTime(9, 30),  'duration' => 45, 'modality' => 'video', 'status' => 'pending'],
            ['patient' => $linda,  'provider' => $chen,  'at' => now()->addDays(3)->setTime(13, 0),  'duration' => 50, 'modality' => 'in_person', 'status' => 'confirmed'],
            ['patient' => $maria,  'provider' => $chen,  'at' => now()->addDays(7)->setTime(9, 0),   'duration' => 53, 'modality' => 'video', 'status' => 'pending'],

            // Past (completed + no-show)
            ['patient' => $james,  'provider' => $patel, 'at' => now()->subDays(7)->setTime(10, 0),  'duration' => 53, 'modality' => 'video', 'status' => 'completed'],
            ['patient' => $aisha,  'provider' => $chen,  'at' => now()->subDays(14)->setTime(14, 0), 'duration' => 45, 'modality' => 'audio', 'status' => 'completed'],
            ['patient' => $sofia,  'provider' => $chen,  'at' => now()->subDays(14)->setTime(15, 0), 'duration' => 60, 'modality' => 'video', 'status' => 'completed'],
            ['patient' => $david,  'provider' => $patel, 'at' => now()->subDays(3)->setTime(11, 0),  'duration' => 50, 'modality' => 'video', 'status' => 'no_show'],
        ];

        $createdAppointments = [];
        foreach ($appointments as $apt) {
            $createdAppointments[] = Appointment::create([
                'patient_id'       => $apt['patient']->id,
                'provider_id'      => $apt['provider']->id,
                'scheduled_at'     => $apt['at'],
                'duration_minutes' => $apt['duration'],
                'modality'         => $apt['modality'],
                'status'           => $apt['status'],
            ]);
        }

        // ── 6. Clinical Notes — 5 total ───────────────────────────────────
        // Mix: AI-generated and manual

        $note1 = ClinicalNote::create([
            'patient_id'              => $maria->id,
            'provider_id'             => $chen->id,
            'appointment_id'          => $createdAppointments[8]->id, // past completed
            'session_date'            => now()->subDays(7)->toDateString(),
            'session_duration_minutes'=> 53,
            'modality'                => 'video',
            'raw_notes'               => 'Patient presented visibly anxious. Discussed triggers around work stress and financial worry. PHQ-9 score 14 (moderate depression). Reviewed CBT thought-challenging techniques. Patient reports improved sleep since last session. Assigned journaling homework. Follow-up in 2 weeks.',
            'soap_subjective'         => 'Patient reports ongoing work-related anxiety and financial concerns. Sleep has improved since last session. PHQ-9 score of 14 indicates moderate depression. Patient is engaged and motivated with assigned homework.',
            'soap_objective'          => 'Patient presented with visible signs of anxiety (fidgeting, tense posture). Affect appropriate, thought process organised and logical. PHQ-9: 14/27 (moderate). Eye contact maintained throughout session.',
            'soap_assessment'         => 'Generalised Anxiety Disorder (F41.1) with comorbid Major Depressive Disorder, moderate (F32.1). Patient responding to CBT intervention. Work and financial stressors remain primary triggers.',
            'soap_plan'               => 'Continue weekly video sessions. CBT cognitive restructuring focus. Journaling homework assigned. Referral to financial counselling discussed. Follow-up PHQ-9 in 4 weeks. Next session: 2 weeks.',
            'generated_by_ai'         => true,
            'ai_prompt_tokens'        => 312,
            'ai_completion_tokens'    => 481,
        ]);

        $note2 = ClinicalNote::create([
            'patient_id'              => $james->id,
            'provider_id'             => $patel->id,
            'appointment_id'          => $createdAppointments[8]->id,
            'session_date'            => now()->subDays(7)->toDateString(),
            'session_duration_minutes'=> 53,
            'modality'                => 'video',
            'raw_notes'               => 'PTSD session. Patient reports intrusive memories related to service. Sleep disruption continues — 3-4 hours per night. Hypervigilance in public spaces noted. PCL-5 score 42. Introduced EMDR phase 2 preparation. Patient expressing willingness to engage in trauma processing.',
            'soap_subjective'         => 'Patient reports frequent intrusive memories and nightmares related to military service. Sleep remains significantly disrupted at 3–4 hours per night. Describes hypervigilance in crowded settings. PCL-5 score of 42 (moderate-severe PTSD). Expresses readiness to begin trauma processing work.',
            'soap_objective'          => 'Patient appeared guarded initially, relaxed over session. Affect restricted but appropriate. No suicidal ideation reported. PCL-5: 42/80. Engaged productively in psychoeducation around EMDR.',
            'soap_assessment'         => 'Post-Traumatic Stress Disorder (F43.10), chronic. Moderate-severe symptom presentation. Good prognostic indicator: patient motivation and insight are high. Prior auth active and sufficient for continued sessions.',
            'soap_plan'               => 'Begin EMDR Phase 3 (assessment) next session. Continue weekly. Sleep hygiene psychoeducation reinforced. Coordinate with VA for medication management consult. PCL-5 administered monthly.',
            'generated_by_ai'         => true,
            'ai_prompt_tokens'        => 298,
            'ai_completion_tokens'    => 455,
        ]);

        $note3 = ClinicalNote::create([
            'patient_id'              => $aisha->id,
            'provider_id'             => $chen->id,
            'appointment_id'          => $createdAppointments[9]->id,
            'session_date'            => now()->subDays(14)->toDateString(),
            'session_duration_minutes'=> 45,
            'modality'                => 'audio',
            'raw_notes'               => 'Patient called in for audio session. Reports feeling "just okay." Low energy, reduced appetite. Denies SI/HI. Working on behavioural activation homework from last session. Went for 2 short walks this week — positive. Discussed barriers to social engagement.',
            'soap_subjective'         => 'Patient reports low mood and fatigue. Appetite reduced but stable. Denies suicidal or homicidal ideation. Reports partial completion of behavioural activation homework — completed 2 walks.',
            'soap_objective'          => 'Patient engaged via audio modality. Voice tone flat but responsive. No psychotic features. No safety concerns identified. Homework compliance improving.',
            'soap_assessment'         => 'Major Depressive Disorder, moderate (F32.1). Slow but consistent progress with behavioural activation. Social isolation remains a key treatment target.',
            'soap_plan'               => 'Continue behavioural activation. Increase walk goal to 3x/week. Explore one social activity before next session. Schedule in-person session if audio engagement continues to limit assessment quality.',
            'generated_by_ai'         => false,
            'ai_prompt_tokens'        => null,
            'ai_completion_tokens'    => null,
        ]);

        $note4 = ClinicalNote::create([
            'patient_id'              => $sofia->id,
            'provider_id'             => $chen->id,
            'appointment_id'          => $createdAppointments[10]->id,
            'session_date'            => now()->subDays(14)->toDateString(),
            'session_duration_minutes'=> 60,
            'modality'                => 'video',
            'raw_notes'               => 'Bipolar I maintenance session. Patient in euthymic phase. Mood stable for 6 weeks. Sleep regulated at 7-8 hours. Taking medication as prescribed. No hypomanic symptoms. Discussed early warning signs plan. Patient feels confident managing triggers.',
            'soap_subjective'         => 'Patient reports stable mood for approximately 6 weeks. Sleep regulated. Medication adherence confirmed. Denies hypomanic symptoms, pressured speech, or decreased need for sleep. Feels confident with relapse prevention plan.',
            'soap_objective'          => 'Affect euthymic and appropriate. Speech rate and volume normal. No grandiosity or pressured speech. Judgment and insight intact. PHQ-9: 4 (minimal). MDQ negative for current episode.',
            'soap_assessment'         => 'Bipolar I Disorder, current episode unspecified (F31.9), in remission. Treatment response excellent on current medication regimen. Psychoeducation reinforced.',
            'soap_plan'               => 'Maintain monthly sessions. Continue mood tracking via app. Reinforce early warning signs plan. Coordinate with prescribing psychiatrist for med review in 60 days.',
            'generated_by_ai'         => true,
            'ai_prompt_tokens'        => 276,
            'ai_completion_tokens'    => 422,
        ]);

        $note5 = ClinicalNote::create([
            'patient_id'              => $linda->id,
            'provider_id'             => $chen->id,
            'appointment_id'          => null,
            'session_date'            => now()->subDays(5)->toDateString(),
            'session_duration_minutes'=> 50,
            'modality'                => 'in_person',
            'raw_notes'               => 'New patient intake session. Linda presented well-groomed and cooperative. Shared history of depressive episodes beginning in her 40s. Currently on SSRI (Escitalopram 10mg). Widowed 2 years ago — reports grief as primary trigger. Functional at work. GAD-7 score 8, PHQ-9 score 12.',
            'soap_subjective'         => 'New patient presenting with depressive symptoms linked to bereavement following loss of spouse 2 years ago. Reports reduced motivation, anhedonia, and intermittent tearfulness. Functional at work. Currently prescribed Escitalopram 10mg by PCP. Seeking therapy for grief processing and mood support.',
            'soap_objective'          => 'Patient presented cooperative and well-groomed. Affect dysthymic but reactive. No psychomotor retardation. PHQ-9: 12/27 (moderate depression). GAD-7: 8/21 (mild anxiety). No SI/HI. Insight and judgment intact.',
            'soap_assessment'         => 'Major Depressive Disorder, moderate (F32.1) with Persistent Complex Bereavement Disorder (F43.21). Good prognosis given support network and work stability. Co-occurring mild anxiety (F41.1).',
            'soap_plan'               => 'Weekly individual therapy. Focus on grief processing using Continuing Bonds model. Liaise with PCP re: medication. Safety plan reviewed and signed. Next session in 1 week.',
            'generated_by_ai'         => false,
            'ai_prompt_tokens'        => null,
            'ai_completion_tokens'    => null,
        ]);

        // ── 7. Billing Claims — 6 total ───────────────────────────────────
        // 2 clean, 2 warnings, 2 errors (perfect for demo)

        // CLEAN — Maria, 90837, 53min, video, modifier 95, POS 10, Aetna primary
        BillingClaim::create([
            'patient_id'               => $maria->id,
            'provider_id'              => $chen->id,
            'clinical_note_id'         => $note1->id,
            'service_date'             => now()->subDays(7)->toDateString(),
            'cpt_code'                 => '90837',
            'modifier'                 => '95',
            'pos_code'                 => '10',
            'icd10_primary'            => 'F41.1',
            'icd10_secondary'          => 'F32.1',
            'primary_payer'            => 'commercial',
            'secondary_payer'          => 'medi_cal',
            'cob_order'                => 'commercial_primary',
            'session_duration_minutes' => 53,
            'amount'                   => 220.00,
            'validation_status'        => 'clean',
            'validation_results'       => [
                'status' => 'clean',
                'checks' => [
                    ['check' => 'Modifier vs Modality',  'status' => 'pass', 'detail' => 'Modifier 95 correct for live video'],
                    ['check' => 'POS Code',              'status' => 'pass', 'detail' => 'POS 10 correct for patient at home'],
                    ['check' => 'CPT + Duration',        'status' => 'pass', 'detail' => '90837 requires ≥53 min — entered 53 min'],
                    ['check' => 'COB Order',             'status' => 'pass', 'detail' => 'Commercial billed primary. Correct.'],
                    ['check' => 'Telehealth Parity',     'status' => 'pass', 'detail' => 'CA permanent parity applies'],
                    ['check' => 'ICD-10 Validity',       'status' => 'pass', 'detail' => 'F41.1 valid and billable'],
                ],
            ],
            'claim_status' => 'validated',
        ]);

        // CLEAN — Aisha, 90834, 45min, audio, modifier 93, POS 10, Medi-Cal
        BillingClaim::create([
            'patient_id'               => $aisha->id,
            'provider_id'              => $chen->id,
            'clinical_note_id'         => $note3->id,
            'service_date'             => now()->subDays(14)->toDateString(),
            'cpt_code'                 => '90834',
            'modifier'                 => '93',
            'pos_code'                 => '10',
            'icd10_primary'            => 'F32.1',
            'primary_payer'            => 'medi_cal',
            'session_duration_minutes' => 45,
            'amount'                   => 145.00,
            'validation_status'        => 'clean',
            'validation_results'       => [
                'status' => 'clean',
                'checks' => [
                    ['check' => 'Modifier vs Modality', 'status' => 'pass', 'detail' => 'Modifier 93 correct for audio-only'],
                    ['check' => 'POS Code',             'status' => 'pass', 'detail' => 'POS 10 correct for patient at home'],
                    ['check' => 'CPT + Duration',       'status' => 'pass', 'detail' => '90834 requires 38–52 min — entered 45 min'],
                    ['check' => 'Telehealth Parity',    'status' => 'pass', 'detail' => 'CA audio-only parity applies for Medi-Cal'],
                    ['check' => 'ICD-10 Validity',      'status' => 'pass', 'detail' => 'F32.1 valid and billable under Medi-Cal'],
                ],
            ],
            'claim_status' => 'submitted',
        ]);

        // WARNING — James, 90837 but only 45 min entered (should be 90834)
        BillingClaim::create([
            'patient_id'               => $james->id,
            'provider_id'              => $patel->id,
            'clinical_note_id'         => $note2->id,
            'service_date'             => now()->subDays(7)->toDateString(),
            'cpt_code'                 => '90837',
            'modifier'                 => '95',
            'pos_code'                 => '10',
            'icd10_primary'            => 'F43.10',
            'primary_payer'            => 'commercial',
            'session_duration_minutes' => 45,
            'prior_auth_number'        => 'AUTH-2024-00881',
            'amount'                   => 220.00,
            'validation_status'        => 'warning',
            'validation_results'       => [
                'status' => 'warning',
                'checks' => [
                    ['check' => 'CPT + Duration',    'status' => 'warning', 'detail' => '90837 requires ≥53 min. You entered 45 min.', 'fix' => 'Use 90834 (38–52 min) instead'],
                    ['check' => 'Modifier vs Modality', 'status' => 'pass', 'detail' => 'Modifier 95 correct for live video'],
                    ['check' => 'Prior Auth',        'status' => 'pass',    'detail' => 'Auth AUTH-2024-00881 on file'],
                    ['check' => 'ICD-10 Validity',   'status' => 'pass',    'detail' => 'F43.10 valid'],
                ],
            ],
            'claim_status' => 'draft',
        ]);

        // WARNING — Sofia, no prior auth number on file for 90837
        BillingClaim::create([
            'patient_id'               => $sofia->id,
            'provider_id'              => $chen->id,
            'clinical_note_id'         => $note4->id,
            'service_date'             => now()->subDays(14)->toDateString(),
            'cpt_code'                 => '90837',
            'modifier'                 => '95',
            'pos_code'                 => '10',
            'icd10_primary'            => 'F31.9',
            'primary_payer'            => 'medi_cal',
            'session_duration_minutes' => 60,
            'amount'                   => 160.00,
            'validation_status'        => 'warning',
            'validation_results'       => [
                'status' => 'warning',
                'checks' => [
                    ['check' => 'Prior Auth',        'status' => 'warning', 'detail' => 'No prior auth number on record. Medi-Cal may require auth for 90837.', 'fix' => 'Verify with LA County MHP or add auth number'],
                    ['check' => 'CPT + Duration',    'status' => 'pass',    'detail' => '90837 requires ≥53 min — entered 60 min'],
                    ['check' => 'Modifier vs Modality', 'status' => 'pass', 'detail' => 'Modifier 95 correct for live video'],
                    ['check' => 'ICD-10 Validity',   'status' => 'pass',    'detail' => 'F31.9 valid under Medi-Cal'],
                ],
            ],
            'claim_status' => 'draft',
        ]);

        // ERROR — Wrong modifier for modality (in-person claim with modifier 95)
        BillingClaim::create([
            'patient_id'               => $linda->id,
            'provider_id'              => $chen->id,
            'clinical_note_id'         => $note5->id,
            'service_date'             => now()->subDays(5)->toDateString(),
            'cpt_code'                 => '90834',
            'modifier'                 => '95',    // ERROR: in-person should have no telehealth modifier
            'pos_code'                 => '11',
            'icd10_primary'            => 'F32.1',
            'primary_payer'            => 'commercial',
            'secondary_payer'          => 'medi_cal',
            'cob_order'                => 'commercial_primary',
            'session_duration_minutes' => 50,
            'amount'                   => 175.00,
            'validation_status'        => 'error',
            'validation_results'       => [
                'status' => 'error',
                'checks' => [
                    ['check' => 'Modifier vs Modality', 'status' => 'error', 'detail' => 'Modifier 95 (telehealth) used on in-person session (POS 11). This will cause denial.', 'fix' => 'Remove modifier 95 for in-person sessions'],
                    ['check' => 'CPT + Duration',       'status' => 'pass',  'detail' => '90834 requires 38–52 min — entered 50 min'],
                    ['check' => 'POS Code',             'status' => 'pass',  'detail' => 'POS 11 correct for in-person clinic'],
                    ['check' => 'ICD-10 Validity',      'status' => 'pass',  'detail' => 'F32.1 valid'],
                ],
            ],
            'claim_status' => 'draft',
        ]);

        // ERROR — Invalid CPT code for duration + wrong POS for audio-only
        BillingClaim::create([
            'patient_id'               => $kevin->id,
            'provider_id'              => $patel->id,
            'clinical_note_id'         => null,
            'service_date'             => now()->subDays(2)->toDateString(),
            'cpt_code'                 => '90837',
            'modifier'                 => '93',
            'pos_code'                 => '11',   // ERROR: audio-only should be POS 02 or 10
            'icd10_primary'            => 'F41.1',
            'primary_payer'            => 'commercial',
            'session_duration_minutes' => 30,     // ERROR: 90837 requires 53+ min
            'amount'                   => 220.00,
            'validation_status'        => 'error',
            'validation_results'       => [
                'status' => 'error',
                'checks' => [
                    ['check' => 'CPT + Duration',    'status' => 'error',   'detail' => '90837 requires ≥53 min. You entered 30 min.', 'fix' => 'Use 90832 (16–37 min) instead'],
                    ['check' => 'POS Code',          'status' => 'error',   'detail' => 'POS 11 (clinic) used for audio-only telehealth. Use POS 02 or 10.', 'fix' => 'Change POS to 10 (patient home)'],
                    ['check' => 'Modifier vs Modality', 'status' => 'pass', 'detail' => 'Modifier 93 correct for audio-only'],
                    ['check' => 'ICD-10 Validity',   'status' => 'pass',    'detail' => 'F41.1 valid'],
                ],
            ],
            'claim_status' => 'draft',
        ]);

        // ── 8. Messages — 10 across 3 threads ────────────────────────────

        $now = now();

        // Thread 1: Maria ↔ Dr. Chen (4 messages)
        Message::create(['patient_id' => $maria->id, 'sender_id' => $chen->id,  'sender_type' => 'provider', 'subject' => 'Session follow-up',     'body' => 'Hi Maria, great session today. Remember to complete the thought journal before our next meeting. Let me know if you have any questions.', 'is_read' => true,  'created_at' => $now->copy()->subDays(6)->subHours(3)]);
        Message::create(['patient_id' => $maria->id, 'sender_id' => null,       'sender_type' => 'patient',  'subject' => null,                    'body' => 'Thank you Dr. Chen! I started the journal last night. I have a question — is it okay to write about work stress even if it feels repetitive?',  'is_read' => true,  'created_at' => $now->copy()->subDays(5)->subHours(10)]);
        Message::create(['patient_id' => $maria->id, 'sender_id' => $chen->id,  'sender_type' => 'provider', 'subject' => null,                    'body' => 'Absolutely, Maria. Repetition in the journal is actually useful — it helps us identify patterns. Write freely and we\'ll review it together.',      'is_read' => true,  'created_at' => $now->copy()->subDays(5)->subHours(8)]);
        Message::create(['patient_id' => $maria->id, 'sender_id' => null,       'sender_type' => 'patient',  'subject' => null,                    'body' => 'That makes sense, thank you! See you next week.',                                                                                                                                                                    'is_read' => false, 'created_at' => $now->copy()->subHours(2)]);

        // Thread 2: James ↔ Dr. Patel (3 messages)
        Message::create(['patient_id' => $james->id, 'sender_id' => $patel->id, 'sender_type' => 'provider', 'subject' => 'EMDR preparation materials', 'body' => 'Hi James, I\'ve attached some reading on EMDR to help you understand what to expect in our next phase. Please review before Thursday.',         'is_read' => true,  'created_at' => $now->copy()->subDays(3)->subHours(5)]);
        Message::create(['patient_id' => $james->id, 'sender_id' => null,       'sender_type' => 'patient',  'subject' => null,                         'body' => 'I read through it. Honestly feeling a bit anxious about starting but I trust the process. Is it normal to feel nervous?',                        'is_read' => true,  'created_at' => $now->copy()->subDays(2)->subHours(14)]);
        Message::create(['patient_id' => $james->id, 'sender_id' => $patel->id, 'sender_type' => 'provider', 'subject' => null,                         'body' => 'Completely normal, James. We go at your pace — there\'s no pressure. We\'ll spend as much time in the preparation phase as you need. See you Thursday.',  'is_read' => true,  'created_at' => $now->copy()->subDays(2)->subHours(12)]);

        // Thread 3: Sofia ↔ Dr. Chen (3 messages)
        Message::create(['patient_id' => $sofia->id, 'sender_id' => $chen->id,  'sender_type' => 'provider', 'subject' => 'Mood tracking reminder', 'body' => 'Hi Sofia, just a reminder to log your mood daily in the app this week. Your consistency over the past month has been excellent — keep it up!', 'is_read' => true,  'created_at' => $now->copy()->subDays(1)->subHours(9)]);
        Message::create(['patient_id' => $sofia->id, 'sender_id' => null,       'sender_type' => 'patient',  'subject' => null,                     'body' => 'Will do! Mood has been stable, feeling good. My sleep has been great this week.',                                                                  'is_read' => true,  'created_at' => $now->copy()->subHours(6)]);
        Message::create(['patient_id' => $sofia->id, 'sender_id' => null,       'sender_type' => 'patient',  'subject' => null,                     'body' => 'Also — quick question, is it okay to reschedule next month\'s session? I have a family event.',                                                     'is_read' => false, 'created_at' => $now->copy()->subHours(1)]);

        // ── 9. Intake Token (for public intake URL demo) ──────────────────
        IntakeToken::create([
            'token'      => Str::uuid()->toString(),
            'created_by' => $admin->id,
            'used'       => false,
            'used_at'    => null,
            'expires_at' => now()->addDays(30),
        ]);

        // ── 10. Activity Logs ─────────────────────────────────────────────
        $logs = [
            ['user_id' => $admin->id,  'action' => 'patient_created',        'model_type' => Patient::class,      'model_id' => $maria->id,  'metadata' => ['name' => 'Maria Gonzalez']],
            ['user_id' => $chen->id,   'action' => 'note_generated_by_ai',   'model_type' => ClinicalNote::class, 'model_id' => $note1->id,  'metadata' => ['patient' => 'Maria Gonzalez', 'cpt' => '90837']],
            ['user_id' => $patel->id,  'action' => 'note_generated_by_ai',   'model_type' => ClinicalNote::class, 'model_id' => $note2->id,  'metadata' => ['patient' => 'James Thornton', 'cpt' => '90837']],
            ['user_id' => $biller->id, 'action' => 'billing_validated',      'model_type' => BillingClaim::class, 'model_id' => 1,           'metadata' => ['status' => 'clean']],
            ['user_id' => $biller->id, 'action' => 'billing_error_flagged',  'model_type' => BillingClaim::class, 'model_id' => 5,           'metadata' => ['status' => 'error', 'cpt' => '90834']],
            ['user_id' => $admin->id,  'action' => 'appointment_created',    'model_type' => Appointment::class,  'model_id' => 1,           'metadata' => ['patient' => 'Maria Gonzalez']],
        ];

        foreach ($logs as $log) {
            ActivityLog::create($log);
        }
    }
}