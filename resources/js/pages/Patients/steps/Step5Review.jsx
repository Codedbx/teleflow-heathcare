import { useState } from 'react';
import { ChevronDown, ChevronUp, User, ShieldCheck, Brain, FileCheck, CheckCircle2 } from 'lucide-react';

const INSURANCE_LABELS = {
  medi_cal:   'Medi-Cal',
  commercial: 'Commercial / Private',
  both:       'Dual Payer (Medi-Cal + Commercial)',
  self_pay:   'Self-Pay',
};
const MODALITY_LABELS = {
  video:     'Live Video',
  audio:     'Audio-Only',
  in_person: 'In-Person',
};
const GENDER_LABELS = {
  male:              'Male',
  female:            'Female',
  non_binary:        'Non-binary',
  prefer_not_to_say: 'Prefer not to say',
  other:             'Other',
};
const COB_LABELS = {
  medi_cal_primary:   'Medi-Cal Primary',
  commercial_primary: 'Commercial Primary',
};

export default function Step5Review({ data, onBack }) {
  const [open, setOpen] = useState({ personal: true, insurance: false, clinical: false, consents: false });
  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const sections = [
    {
      key: 'personal',
      icon: <User size={15} />,
      title: 'Personal Information',
      rows: [
        ['Name',    `${data.first_name} ${data.last_name}`],
        ['Date of Birth', data.dob ? new Date(data.dob).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—'],
        ['Gender',  GENDER_LABELS[data.gender] || data.gender || '—'],
        ['Phone',   data.phone || '—'],
        ['Email',   data.email || '—'],
        ['Address', [data.address, data.city, data.state, data.zip].filter(Boolean).join(', ')],
      ],
    },
    {
      key: 'insurance',
      icon: <ShieldCheck size={15} />,
      title: 'Insurance',
      rows: [
        ['Coverage Type', INSURANCE_LABELS[data.insurance_type] || '—'],
        ...(data.insurance_type === 'medi_cal' || data.insurance_type === 'both'
          ? [
              ['Medi-Cal ID',   data.medi_cal_id || '—'],
              ['County MHP',    data.county_mhp   || '—'],
            ]
          : []),
        ...(data.insurance_type === 'commercial' || data.insurance_type === 'both'
          ? [
              ['Payer',         data.commercial_payer || '—'],
              ['Member ID',     data.member_id        || '—'],
              ['Group #',       data.group_number      || '—'],
              ['Subscriber',    data.subscriber_name   || 'Self'],
            ]
          : []),
        ...(data.insurance_type === 'both'
          ? [['COB Order', COB_LABELS[data.cob_order] || '—']]
          : []),
        ...(data.prior_auth_required
          ? [
              ['Prior Auth #',  data.prior_auth_number || '—'],
              ['Auth Expiry',   data.prior_auth_expiry || '—'],
            ]
          : [['Prior Auth', 'Not required']]),
      ],
    },
    {
      key: 'clinical',
      icon: <Brain size={15} />,
      title: 'Clinical Preferences',
      rows: [
        ['Provider Type',       data.preferred_provider_type || '—'],
        ['Modality',            MODALITY_LABELS[data.modality_preference] || '—'],
        ['Presenting Concerns', (data.presenting_concerns || []).join(', ') || '—'],
        ['Preferred Days',      (data.preferred_days || []).join(', ') || 'No preference'],
        ['Preferred Times',     (data.preferred_time_slots || []).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') || 'No preference'],
      ],
    },
    {
      key: 'consents',
      icon: <FileCheck size={15} />,
      title: 'Consents & Signature',
      rows: [
        ['Telehealth Consent', data.consent_telehealth ? '✓ Agreed' : '✗ Not agreed'],
        ['HIPAA Notice',       data.consent_hipaa       ? '✓ Agreed' : '✗ Not agreed'],
        ['Financial Agreement',data.consent_financial   ? '✓ Agreed' : '✗ Not agreed'],
        ['Signature',          data.signature_text || '—'],
        ['Agreed On',          new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#111827] font-['Sora']">Review & Submit</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          Please review all information before submitting. Use the back button to make corrections.
        </p>
      </div>

      {/* Summary notice */}
      <div className="flex items-start gap-3 rounded-[10px] bg-[#E6F9F7] border border-[#0AB5A0]/30 p-4">
        <CheckCircle2 size={18} className="text-[#0AB5A0] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#0F766E]">Ready to submit</p>
          <p className="text-xs text-[#0F766E] mt-0.5">
            Once submitted, a welcome email will be sent to <strong>{data.email}</strong> and
            your assigned provider will be notified automatically.
          </p>
        </div>
      </div>

      {/* Accordion sections */}
      {sections.map((section) => (
        <div
          key={section.key}
          className="rounded-[10px] border border-[#E5E7EB] overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggle(section.key)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[#0AB5A0]">{section.icon}</span>
              <span className="text-sm font-semibold text-[#374151]">{section.title}</span>
            </div>
            {open[section.key]
              ? <ChevronUp size={15} className="text-[#9CA3AF]" />
              : <ChevronDown size={15} className="text-[#9CA3AF]" />
            }
          </button>

          {open[section.key] && (
            <div className="divide-y divide-[#F3F4F6]">
              {section.rows.map(([label, value]) => (
                <div key={label} className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-[#6B7280] w-36 flex-shrink-0">{label}</span>
                  <span className={`text-sm text-right ${
                    String(value).startsWith('✓')
                      ? 'text-[#10B981] font-medium'
                      : String(value).startsWith('✗')
                      ? 'text-[#EF4444] font-medium'
                      : 'text-[#111827]'
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <p className="text-xs text-[#9CA3AF] text-center leading-relaxed">
        By submitting, you confirm all information provided is accurate and complete.
        This intake form will be stored securely in the patient record.
      </p>
    </div>
  );
}