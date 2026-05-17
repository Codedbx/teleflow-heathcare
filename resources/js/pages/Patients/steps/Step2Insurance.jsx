import { ShieldCheck, AlertTriangle } from 'lucide-react';

const CA_PAYERS = [
  'Anthem Blue Cross',
  'Blue Shield of California',
  'Aetna',
  'Cigna',
  'Kaiser Permanente',
  'United Healthcare',
  'Health Net',
  'Molina Healthcare',
  'LA Care Health Plan',
  'CalViva Health',
  'Partnership HealthPlan of California',
  'Inland Empire Health Plan',
  'CalOptima',
  'Gold Coast Health Plan',
  'Magellan Health',
  'Beacon Health Options',
  'Other',
];

const CA_COUNTIES = [
  'Alameda', 'Contra Costa', 'Fresno', 'Kern', 'Kings',
  'Los Angeles', 'Madera', 'Marin', 'Merced', 'Monterey',
  'Napa', 'Orange', 'Placer', 'Riverside', 'Sacramento',
  'San Bernardino', 'San Diego', 'San Francisco', 'San Joaquin',
  'San Luis Obispo', 'San Mateo', 'Santa Barbara', 'Santa Clara',
  'Santa Cruz', 'Shasta', 'Solano', 'Sonoma', 'Stanislaus',
  'Tulare', 'Ventura', 'Yolo',
];

const INSURANCE_TYPES = [
  {
    value: 'medi_cal',
    label: 'Medi-Cal',
    desc: 'California Medicaid',
    color: 'border-[#0AB5A0] bg-[#E6F9F7]',
    check: 'bg-[#0AB5A0]',
  },
  {
    value: 'commercial',
    label: 'Commercial / Private',
    desc: 'Employer or private insurance',
    color: 'border-[#6366F1] bg-[#EEF2FF]',
    check: 'bg-[#6366F1]',
  },
  {
    value: 'both',
    label: 'Both (Dual Payer)',
    desc: 'Medi-Cal + Commercial',
    color: 'border-[#F59E0B] bg-[#FEF3C7]',
    check: 'bg-[#F59E0B]',
  },
  {
    value: 'self_pay',
    label: 'Self-Pay',
    desc: 'No insurance / out-of-pocket',
    color: 'border-[#6B7280] bg-[#F9FAFB]',
    check: 'bg-[#6B7280]',
  },
];

export default function Step2Insurance({ data, onChange, errors }) {
  const field = (key, value) => onChange({ ...data, [key]: value });
  const type = data.insurance_type;
  const showMediCal  = type === 'medi_cal'  || type === 'both';
  const showCommercial = type === 'commercial' || type === 'both';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827] font-['Sora']">Insurance Information</h2>
        <p className="text-sm text-[#6B7280] mt-1">Used for billing and claim submission. Dual-payer (COB) supported.</p>
      </div>

      {/* Insurance Type Selector */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">Coverage Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INSURANCE_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => field('insurance_type', opt.value)}
              className={`
                flex items-start gap-3 p-3.5 rounded-[10px] border-2 text-left transition-all
                ${type === opt.value ? opt.color + ' shadow-sm' : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'}
              `}
            >
              <div className={`
                mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                ${type === opt.value ? 'border-current' : 'border-[#D1D5DB]'}
              `}>
                {type === opt.value && <div className={`w-2 h-2 rounded-full ${opt.check}`} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{opt.label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
        {errors?.insurance_type && <p className="mt-1 text-xs text-[#EF4444]">{errors.insurance_type}</p>}
      </div>

      {/* Medi-Cal Fields */}
      {showMediCal && (
        <div className="rounded-[10px] border border-[#E5E7EB] p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={15} className="text-[#0AB5A0]" />
            <span className="text-sm font-semibold text-[#0AB5A0]">Medi-Cal Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Medi-Cal ID" error={errors?.medi_cal_id} required={type === 'medi_cal'}>
              <input
                type="text"
                value={data.medi_cal_id || ''}
                onChange={(e) => field('medi_cal_id', e.target.value)}
                placeholder="e.g. 12345678A"
                className={inputCls(errors?.medi_cal_id)}
              />
            </Field>
            <Field label="County Mental Health Plan (MHP)" error={errors?.county_mhp}>
              <select
                value={data.county_mhp || ''}
                onChange={(e) => field('county_mhp', e.target.value)}
                className={inputCls(errors?.county_mhp)}
              >
                <option value="">Select county</option>
                {CA_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c} County MHP</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* Commercial Fields */}
      {showCommercial && (
        <div className="rounded-[10px] border border-[#E5E7EB] p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={15} className="text-[#6366F1]" />
            <span className="text-sm font-semibold text-[#6366F1]">Commercial Insurance Details</span>
          </div>

          <Field label="Insurance Company" error={errors?.commercial_payer} required>
            <select
              value={data.commercial_payer || ''}
              onChange={(e) => field('commercial_payer', e.target.value)}
              className={inputCls(errors?.commercial_payer)}
            >
              <option value="">Select payer</option>
              {CA_PAYERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Member ID" error={errors?.member_id} required>
              <input
                type="text"
                value={data.member_id || ''}
                onChange={(e) => field('member_id', e.target.value)}
                placeholder="e.g. W123456789"
                className={inputCls(errors?.member_id)}
              />
            </Field>
            <Field label="Group Number" error={errors?.group_number}>
              <input
                type="text"
                value={data.group_number || ''}
                onChange={(e) => field('group_number', e.target.value)}
                placeholder="e.g. 98765"
                className={inputCls(errors?.group_number)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Subscriber Name" error={errors?.subscriber_name}>
              <input
                type="text"
                value={data.subscriber_name || ''}
                onChange={(e) => field('subscriber_name', e.target.value)}
                placeholder="If different from patient"
                className={inputCls(errors?.subscriber_name)}
              />
            </Field>
            <Field label="Subscriber Date of Birth" error={errors?.subscriber_dob}>
              <input
                type="date"
                value={data.subscriber_dob || ''}
                onChange={(e) => field('subscriber_dob', e.target.value)}
                className={inputCls(errors?.subscriber_dob)}
              />
            </Field>
          </div>
        </div>
      )}

      {/* COB Order — dual payer only */}
      {type === 'both' && (
        <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#D97706]" />
            <span className="text-sm font-semibold text-[#D97706]">Coordination of Benefits (COB) Order</span>
          </div>
          <p className="text-xs text-[#92400E]">
            California AB 72 requires correct COB sequencing for dual-payer billing.
            Select which payer is billed first.
          </p>
          <div className="flex gap-4">
            {[
              { value: 'medi_cal_primary',   label: 'Medi-Cal Primary' },
              { value: 'commercial_primary', label: 'Commercial Primary' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cob_order"
                  value={opt.value}
                  checked={data.cob_order === opt.value}
                  onChange={() => field('cob_order', opt.value)}
                  className="accent-[#0AB5A0]"
                />
                <span className="text-sm text-[#374151]">{opt.label}</span>
              </label>
            ))}
          </div>
          {errors?.cob_order && <p className="text-xs text-[#EF4444]">{errors.cob_order}</p>}
        </div>
      )}

      {/* Prior Authorization */}
      {type !== 'self_pay' && (
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!data.prior_auth_required}
              onChange={(e) => field('prior_auth_required', e.target.checked)}
              className="w-4 h-4 rounded accent-[#0AB5A0]"
            />
            <span className="text-sm font-medium text-[#374151]">
              Prior authorization required
            </span>
          </label>

          {data.prior_auth_required && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
              <Field label="Prior Auth Number" error={errors?.prior_auth_number} required>
                <input
                  type="text"
                  value={data.prior_auth_number || ''}
                  onChange={(e) => field('prior_auth_number', e.target.value)}
                  placeholder="e.g. PA-2024-08123"
                  className={inputCls(errors?.prior_auth_number)}
                />
              </Field>
              <Field label="Auth Expiration Date" error={errors?.prior_auth_expiry} required>
                <input
                  type="date"
                  value={data.prior_auth_expiry || ''}
                  onChange={(e) => field('prior_auth_expiry', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls(errors?.prior_auth_expiry)}
                />
              </Field>
            </div>
          )}
        </div>
      )}

      {type === 'self_pay' && (
        <div className="rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-sm text-[#6B7280]">
          Self-pay patients are billed directly. A fee schedule will be provided at your first session.
          Financial assistance options may be available — ask your coordinator.
        </div>
      )}
    </div>
  );
}

function Field({ label, children, error, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#374151] mb-1.5">
        {label}
        {required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  const base =
    'w-full h-10 px-3 rounded-[6px] border text-sm text-[#111827] bg-white ' +
    'focus:outline-none focus:ring-[3px] transition-all placeholder:text-[#9CA3AF]';
  return error
    ? `${base} border-[#EF4444] focus:ring-red-100`
    : `${base} border-[#E5E7EB] focus:border-[#0AB5A0] focus:ring-[rgba(10,181,160,0.25)]`;
}