<?php

namespace App\Http\Controllers;

use App\Models\BillingClaim;
use App\Models\Patient;
use App\Models\User;
use App\Services\BillingValidatorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function __construct(private BillingValidatorService $validator) {}

    // ─── GET /billing/validator ───────────────────────────────────────────────

    public function validator(Request $request)
    {
        $patients  = Patient::with('insurance')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn($p) => [
                'id'   => $p->id,
                'name' => $p->first_name . ' ' . $p->last_name,
                'insurance_type' => $p->insurance?->insurance_type,
                'county_mhp'     => $p->insurance?->county_mhp,
                'cob_order'      => $p->insurance?->cob_order,
            ]);

        $providers = User::where('role', 'clinician')
            ->orderBy('name')
            ->get(['id', 'name', 'provider_type']);

        // Pre-fill from a claim if passed (e.g. from "Fix" on dashboard)
        $prefill = null;
        if ($request->has('claim_id')) {
            $claim   = BillingClaim::find($request->claim_id);
            $prefill = $claim ? $this->claimToFormData($claim) : null;
        }

        return Inertia::render('Billing/Validator', [
            'patients'  => $patients,
            'providers' => $providers,
            'prefill'   => $prefill,
        ]);
    }

    // ─── POST /billing/validate ───────────────────────────────────────────────

    public function validate(Request $request)
    {
        $validated = $request->validate([
            'patient_id'               => 'nullable|exists:patients,id',
            'service_date'             => 'required|date',
            'provider_type'            => 'nullable|string',
            'cpt_code'                 => 'required|string|max:10',
            'session_duration_minutes' => 'nullable|integer|min:1|max:240',
            'session_count'            => 'nullable|integer|min:1',
            'modality'                 => 'required|in:video,audio,in_person',
            'pos_code'                 => 'nullable|string|max:5',
            'modifier'                 => 'nullable|string|max:5',
            'primary_payer'            => 'required|in:medi_cal,commercial,both,self_pay',
            'secondary_payer'          => 'nullable|string',
            'cob_order'                => 'nullable|string',
            'prior_auth_number'        => 'nullable|string|max:50',
            'prior_auth_expiry'        => 'nullable|date',
            'icd10_primary'            => 'nullable|string|max:10',
            'county_mhp'               => 'nullable|string',
        ]);

        // Enrich with patient insurance data if patient selected
        if (! empty($validated['patient_id'])) {
            $patient = Patient::with('insurance')->find($validated['patient_id']);
            if ($patient?->insurance) {
                $ins = $patient->insurance;
                $validated['county_mhp'] = $validated['county_mhp'] ?? $ins->county_mhp;
                if (empty($validated['cob_order'])) {
                    $validated['cob_order'] = $ins->cob_order;
                }
            }
        }

        $result = $this->validator->validate($validated);

        return response()->json($result);
    }

    // ─── GET /billing/claims ──────────────────────────────────────────────────

    public function claims(Request $request)
    {
        $query = BillingClaim::with(['patient', 'provider'])
            ->latest('service_date');

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        if ($request->filled('provider_id')) {
            $query->where('provider_id', $request->provider_id);
        }
        if ($request->filled('status')) {
            $query->where('claim_status', $request->status);
        }
        if ($request->filled('validation_status')) {
            $query->where('validation_status', $request->validation_status);
        }
        if ($request->filled('cpt_code')) {
            $query->where('cpt_code', $request->cpt_code);
        }
        if ($request->filled('payer')) {
            $query->where('primary_payer', $request->payer);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('service_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('service_date', '<=', $request->date_to);
        }

        $claims = $query->paginate(20)->withQueryString();

        $patients  = Patient::orderBy('last_name')->get(['id', 'first_name', 'last_name'])
            ->map(fn($p) => ['id' => $p->id, 'name' => $p->first_name . ' ' . $p->last_name]);

        $providers = User::where('role', 'clinician')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Billing/Claims', [
            'claims'    => $claims,
            'patients'  => $patients,
            'providers' => $providers,
            'filters'   => $request->only([
                'patient_id', 'provider_id', 'status', 'validation_status',
                'cpt_code', 'payer', 'date_from', 'date_to',
            ]),
        ]);
    }

    // ─── POST /billing/claims ─────────────────────────────────────────────────

    public function saveClaim(Request $request)
    {
        $validated = $request->validate([
            'patient_id'               => 'required|exists:patients,id',
            'provider_id'              => 'required|exists:users,id',
            'clinical_note_id'         => 'nullable|exists:clinical_notes,id',
            'service_date'             => 'required|date',
            'cpt_code'                 => 'required|string|max:10',
            'modifier'                 => 'nullable|string|max:5',
            'pos_code'                 => 'nullable|string|max:5',
            'icd10_primary'            => 'nullable|string|max:10',
            'icd10_secondary'          => 'nullable|string|max:10',
            'primary_payer'            => 'required|in:medi_cal,commercial,both,self_pay',
            'secondary_payer'          => 'nullable|string',
            'cob_order'                => 'nullable|string',
            'prior_auth_number'        => 'nullable|string|max:50',
            'prior_auth_expiry'        => 'nullable|date',
            'session_duration_minutes' => 'nullable|integer',
            'amount'                   => 'nullable|numeric',
            'validation_status'        => 'nullable|in:not_checked,clean,warning,error',
            'validation_results'       => 'nullable|array',
            'claim_status'             => 'nullable|in:draft,validated,submitted,paid,denied,appealing',
        ]);

        $claim = BillingClaim::create($validated);

        // Dispatch billing alert job if errors
        if (in_array($validated['validation_status'] ?? '', ['error', 'warning'])) {
            \App\Jobs\BillingAlertJob::dispatch($claim);
        }

        return response()->json([
            'success' => true,
            'claim'   => $claim->load(['patient', 'provider']),
        ]);
    }

    // ─── POST /billing/claims/batch-validate ─────────────────────────────────

    public function batchValidate(Request $request)
    {
        $request->validate([
            'claim_ids'   => 'required|array',
            'claim_ids.*' => 'exists:billing_claims,id',
        ]);

        $results = [];

        foreach ($request->claim_ids as $claimId) {
            $claim      = BillingClaim::with(['patient.insurance'])->find($claimId);
            $claimData  = $this->claimToFormData($claim);
            $result     = $this->validator->validate($claimData);

            $claim->update([
                'validation_status'  => $result['status'],
                'validation_results' => $result,
            ]);

            $results[$claimId] = $result;
        }

        return response()->json(['results' => $results]);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function claimToFormData(BillingClaim $claim): array
    {
        return [
            'patient_id'               => $claim->patient_id,
            'service_date'             => $claim->service_date?->format('Y-m-d'),
            'cpt_code'                 => $claim->cpt_code,
            'session_duration_minutes' => $claim->session_duration_minutes,
            'modality'                 => $this->posToModality($claim->pos_code, $claim->modifier),
            'pos_code'                 => $claim->pos_code,
            'modifier'                 => $claim->modifier,
            'primary_payer'            => $claim->primary_payer,
            'secondary_payer'          => $claim->secondary_payer,
            'cob_order'                => $claim->cob_order,
            'prior_auth_number'        => $claim->prior_auth_number,
            'prior_auth_expiry'        => $claim->prior_auth_expiry?->format('Y-m-d'),
            'icd10_primary'            => $claim->icd10_primary,
            'county_mhp'               => $claim->patient?->insurance?->county_mhp,
        ];
    }

    private function posToModality(?string $pos, ?string $modifier): string
    {
        if ($modifier === '93') return 'audio';
        if (in_array($pos, ['10', '02'])) return 'video';
        return 'in_person';
    }
}