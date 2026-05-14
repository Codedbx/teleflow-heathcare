<?php

namespace App\Http\Controllers;

use App\Jobs\PatientIntakeJob;
use App\Models\IntakeToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntakeController extends Controller
{
    /**
     * Admin creates intake on behalf of patient.
     * Route: GET /patients/new  (via PatientController@create → redirects here, or direct)
     */
    public function create(): Response
    {
        return Inertia::render('Patients/New', [
            'isPublic'     => false,
            'token'        => null,
            'practiceName' => config('app.name'),
        ]);
    }

    /**
     * Public patient self-service form accessed via unique token.
     * Route: GET /intake/{token}
     */
    public function show(string $token): Response
    {
        // Validate the token exists, hasn't been used, and hasn't expired
        IntakeToken::where('token', $token)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->firstOrFail();

        return Inertia::render('Patients/New', [
            'isPublic'     => true,
            'token'        => $token,
            'practiceName' => config('app.name'),
        ]);
    }

    /**
     * Admin submits intake form.
     * Route: POST /api/patients/intake
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateIntake($request);

        PatientIntakeJob::dispatch($validated, $request->ip());

        return response()->json([
            'message' => 'Patient intake submitted successfully. Welcome email will be sent shortly.',
        ]);
    }

    /**
     * Patient submits their own intake via public token form.
     * Route: POST /intake/{token}
     */
    public function submit(Request $request, string $token): JsonResponse
    {
        $intakeToken = IntakeToken::where('token', $token)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $validated = $this->validateIntake($request);

        PatientIntakeJob::dispatch($validated, $request->ip());

        // Mark token as used so it cannot be resubmitted
        $intakeToken->update([
            'used'    => true,
            'used_at' => now(),
        ]);

        return response()->json([
            'message' => 'Thank you! Your intake is complete. You will receive a welcome email shortly.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function validateIntake(Request $request): array
    {
        return $request->validate([
            // Step 1 — Personal Information
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'dob'        => ['required', 'date', 'before:today'],
            'gender'     => ['required', 'in:male,female,non_binary,prefer_not_to_say,other'],
            'phone'      => ['required', 'string', 'max:20'],
            'email'      => ['required', 'email', 'unique:patients,email'],
            'address'    => ['required', 'string', 'max:255'],
            'city'       => ['required', 'string', 'max:100'],
            'state'      => ['required', 'string', 'size:2'],
            'zip'        => ['required', 'string', 'max:10'],

            // Step 2 — Insurance
            'insurance_type'       => ['required', 'in:medi_cal,commercial,both,self_pay'],
            'medi_cal_id'          => ['nullable', 'string', 'max:50'],
            'county_mhp'           => ['nullable', 'string', 'max:100'],
            'commercial_payer'     => ['nullable', 'string', 'max:100'],
            'member_id'            => ['nullable', 'string', 'max:50'],
            'group_number'         => ['nullable', 'string', 'max:50'],
            'subscriber_name'      => ['nullable', 'string', 'max:100'],
            'subscriber_dob'       => ['nullable', 'date'],
            'cob_order'            => ['nullable', 'in:medi_cal_primary,commercial_primary'],
            'prior_auth_required'  => ['boolean'],
            'prior_auth_number'    => ['nullable', 'string', 'max:50'],
            'prior_auth_expiry'    => ['nullable', 'date'],

            // Step 3 — Clinical Preferences
            'preferred_provider_type' => ['required', 'in:LCSW,LMFT,LPCC,Psychologist,Psychiatrist'],
            'modality_preference'     => ['required', 'in:video,audio,in_person'],
            'presenting_concerns'     => ['required', 'array', 'min:1'],
            'presenting_concerns.*'   => ['string'],
            'preferred_days'          => ['nullable', 'array'],
            'preferred_days.*'        => ['in:Mon,Tue,Wed,Thu,Fri,Sat,Sun'],
            'preferred_time_slots'    => ['nullable', 'array'],
            'preferred_time_slots.*'  => ['in:morning,afternoon,evening'],

            // Step 4 — Consents (must be accepted = true/"1"/"on" etc.)
            'consent_telehealth' => ['accepted'],
            'consent_hipaa'      => ['accepted'],
            'consent_financial'  => ['accepted'],
            'signature_text'     => ['required', 'string', 'min:2', 'max:200'],
        ], [
            // Custom messages for consent fields
            'consent_telehealth.accepted' => 'You must read and agree to the Telehealth Informed Consent.',
            'consent_hipaa.accepted'      => 'You must read and agree to the HIPAA Notice of Privacy Practices.',
            'consent_financial.accepted'  => 'You must read and agree to the Financial Agreement.',
            'email.unique'                => 'A patient with this email address already exists in the system.',
            'dob.before'                  => 'Date of birth must be in the past.',
        ]);
    }
}