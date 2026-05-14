import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useState } from 'react';

const CONSENTS = [
  {
    key: 'consent_telehealth',
    title: 'Telehealth Informed Consent',
    subtitle: 'California Health & Safety Code §1348.6 — Required',
    icon: <FileText size={15} />,
    body: `TELEHEALTH INFORMED CONSENT — State of California

This document confirms your voluntary consent to receive mental health services via telehealth technology. Please read carefully before agreeing.

WHAT IS TELEHEALTH?
Telehealth is the delivery of health care services using interactive audio-video or audio-only technology where the patient and provider are not in the same physical location. Under California Health & Safety Code §1348.6, you have the right to receive mental health services via telehealth.

SERVICES PROVIDED VIA TELEHEALTH
Your provider may use telehealth to conduct individual therapy sessions, psychiatric evaluations, medication management, crisis counselling, and follow-up consultations.

BENEFITS
Telehealth may improve access to care, reduce travel time, and allow you to receive care from the comfort of your home.

RISKS AND LIMITATIONS
• Technology failures may interrupt sessions. In the event of a technology failure, your provider will attempt to reconnect or continue via telephone.
• Telehealth may not be appropriate for all clinical situations. Your provider will use clinical judgment to determine suitability.
• Information transmitted electronically carries some risk of privacy breach despite all reasonable precautions.
• Emergency situations may require in-person care. If you are in immediate danger, call 911.

PRIVACY AND SECURITY
Sessions are conducted via HIPAA-compliant platforms. Recordings are not made without explicit written consent. All transmission is encrypted.

EMERGENCY PROCEDURES
If you experience a mental health emergency during a telehealth session, you agree to call 988 (Suicide & Crisis Lifeline) or 911, or proceed to your nearest emergency room. Provide your provider with your current address at the start of each session.

AUDIO-ONLY MODIFIER
California AB 32 permits audio-only telehealth for established patients under specific circumstances. Your provider will advise when this option applies. Billing modifier 93 is used for audio-only sessions.

CONSENT
By signing below, you confirm that you understand and voluntarily agree to receive services via telehealth, including the associated risks, and that you have had the opportunity to ask questions.`,
  },
  {
    key: 'consent_hipaa',
    title: 'HIPAA Notice of Privacy Practices',
    subtitle: '45 CFR §164.520 — Notice Required at First Contact',
    icon: <FileText size={15} />,
    body: `NOTICE OF PRIVACY PRACTICES — HIPAA Compliance

This notice describes how medical information about you may be used and disclosed, and how you can get access to this information. Please review carefully.

YOUR RIGHTS
You have the right to:
• Inspect and receive a copy of your health records (within 30 days of request).
• Request corrections to your health information.
• Receive a list of disclosures of your health information.
• Request restrictions on how your information is used.
• Request confidential communications at alternative locations or via alternative means.
• Receive this notice in another language or format if needed.

HOW WE MAY USE YOUR INFORMATION
Treatment: We may use your information to provide, coordinate, and manage your care.
Payment: We may use your information to bill your insurer and process payments.
Operations: We may use your information for quality improvement, staff training, and legal compliance.

CALIFORNIA-SPECIFIC PROTECTIONS
California Confidentiality of Medical Information Act (CMIA) and Welfare & Institutions Code §5328 provide additional protections beyond HIPAA for mental health records. We will not disclose your mental health records without your written authorization except as required by law.

REQUIRED DISCLOSURES
We are required by law to disclose your information: (1) to you or your personal representative; (2) to the Secretary of HHS for compliance investigations; (3) when required by California mandatory reporting laws (child abuse, elder abuse, imminent danger to self or others).

CONTACT
To exercise any of these rights or with privacy questions, contact our Privacy Officer at the practice address or via secure message through your patient portal.`,
  },
  {
    key: 'consent_financial',
    title: 'Financial Agreement',
    subtitle: 'Payment Policy and Billing Authorisation',
    icon: <FileText size={15} />,
    body: `FINANCIAL AGREEMENT AND BILLING AUTHORISATION

INSURANCE BILLING
You authorise this practice to bill your insurance company on your behalf for services rendered. You agree to provide accurate and complete insurance information and to notify us promptly of any changes to your coverage.

ASSIGNMENT OF BENEFITS
You assign your insurance benefits to this practice. Payments from your insurer will be made directly to us.

PATIENT RESPONSIBILITY
You are responsible for all co-pays, deductibles, co-insurance, and any charges not covered by your insurance at the time of service. Amounts not paid within 30 days of invoice are subject to a late fee.

MEDI-CAL PATIENTS
Medi-Cal patients are generally not billed co-pays for covered mental health services. You are responsible for any services Medi-Cal does not cover. We participate with the Medi-Cal Specialty Mental Health Services program.

CANCELLATION POLICY
Appointments cancelled with less than 24 hours' notice may be subject to a late-cancellation fee ($75) unless cancelled due to documented illness or emergency. Medi-Cal managed care plans prohibit no-show fees for Medi-Cal beneficiaries.

RELEASE OF INFORMATION FOR BILLING
You authorise this practice to release your clinical and demographic information to your insurance company as necessary to process claims and verify benefits. This includes diagnosis codes, procedure codes, and treatment dates.

OUTSTANDING BALANCES
Accounts with balances over 90 days may be referred to a collection agency after reasonable attempt to contact you. This will not affect your right to continued treatment unless clinically contraindicated.`,
  },
];

export default function Step4Consents({ data, onChange, errors }) {
  const [scrolled, setScrolled] = useState({});

  const field = (key, value) => onChange({ ...data, [key]: value });

  const handleScroll = (key, e) => {
    const el = e.target;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    if (atBottom) setScrolled((prev) => ({ ...prev, [key]: true }));
  };

  const allConsentsChecked =
    data.consent_telehealth && data.consent_hipaa && data.consent_financial;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827] font-['Sora']">Consents & Agreements</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          All three agreements are required by California law before services can begin.
          Scroll each document fully before agreeing.
        </p>
      </div>

      {/* Consent blocks */}
      {CONSENTS.map((consent) => {
        const isChecked = !!data[consent.key];
        const hasScrolled = !!scrolled[consent.key];

        return (
          <div
            key={consent.key}
            className={`rounded-[10px] border transition-all ${
              isChecked ? 'border-[#0AB5A0] bg-[#F0FDFB]' : 'border-[#E5E7EB] bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-start gap-3 p-4 border-b border-[#E5E7EB]">
              <span className="text-[#0AB5A0] mt-0.5">{consent.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{consent.title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{consent.subtitle}</p>
              </div>
              {isChecked && (
                <CheckCircle2 size={18} className="text-[#0AB5A0] ml-auto flex-shrink-0 mt-0.5" />
              )}
            </div>

            {/* Scrollable content */}
            <div
              className="mx-4 mt-3 mb-3 h-36 overflow-y-auto rounded-[6px] bg-[#F9FAFB] border border-[#E5E7EB] p-4 text-xs text-[#374151] leading-relaxed whitespace-pre-line font-['DM_Sans']"
              onScroll={(e) => handleScroll(consent.key, e)}
            >
              {consent.body}
            </div>

            {!hasScrolled && !isChecked && (
              <p className="px-4 pb-2 text-[11px] text-[#9CA3AF] flex items-center gap-1">
                <AlertTriangle size={11} /> Scroll to the bottom to enable the checkbox
              </p>
            )}

            {/* Agreement checkbox */}
            <div className="px-4 pb-4">
              <label
                className={`flex items-center gap-3 cursor-pointer ${
                  !hasScrolled && !isChecked ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => field(consent.key, e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0AB5A0]"
                />
                <span className="text-sm font-medium text-[#374151]">
                  I have read and agree to the {consent.title}
                </span>
              </label>
              {errors?.[consent.key] && (
                <p className="mt-1 ml-7 text-xs text-[#EF4444]">{errors[consent.key]}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Signature */}
      <div className={`space-y-3 transition-opacity ${allConsentsChecked ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="border-t border-[#E5E7EB] pt-5">
          <label className="block text-sm font-semibold text-[#374151] mb-1">
            Electronic Signature
          </label>
          <p className="text-xs text-[#6B7280] mb-3">
            Type your full legal name to serve as your electronic signature on all agreements above.
            This is legally equivalent to a handwritten signature under California Civil Code §1633.7.
          </p>
          <input
            type="text"
            value={data.signature_text || ''}
            onChange={(e) => field('signature_text', e.target.value)}
            placeholder="Type your full name"
            className={`
              w-full h-12 px-4 rounded-[6px] border text-base text-[#111827] bg-white
              focus:outline-none focus:ring-[3px] transition-all placeholder:text-[#9CA3AF]
              font-['Sora'] italic
              ${errors?.signature_text
                ? 'border-[#EF4444] focus:ring-red-100'
                : 'border-[#E5E7EB] focus:border-[#0AB5A0] focus:ring-[rgba(10,181,160,0.25)]'}
            `}
          />
          {errors?.signature_text && (
            <p className="mt-1 text-xs text-[#EF4444]">{errors.signature_text}</p>
          )}
          {data.signature_text && (
            <p className="mt-2 text-xs text-[#6B7280]">
              Signed as: <span className="font-semibold text-[#111827] italic">{data.signature_text}</span> · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {!allConsentsChecked && (
        <p className="text-xs text-[#9CA3AF] text-center">
          Complete all three agreements above to unlock the signature field.
        </p>
      )}
    </div>
  );
}