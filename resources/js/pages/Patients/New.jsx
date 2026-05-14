import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Loader2, UserPlus, X } from 'lucide-react';
import Step1Personal  from './steps/Step1Personal';
import Step2Insurance from './steps/Step2Insurance';
import Step3Clinical  from './steps/Step3Clinical';
import Step4Consents  from './steps/Step4Consents';
import Step5Review    from './steps/Step5Review';

// ─── Step metadata ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Personal',   shortLabel: 'Personal'  },
  { id: 2, label: 'Insurance',  shortLabel: 'Insurance' },
  { id: 3, label: 'Clinical',   shortLabel: 'Clinical'  },
  { id: 4, label: 'Consents',   shortLabel: 'Consents'  },
  { id: 5, label: 'Review',     shortLabel: 'Review'    },
];

// ─── Default form state ────────────────────────────────────────────────────────

const INITIAL_DATA = {
  // Step 1
  first_name: '',
  last_name:  '',
  dob:        '',
  gender:     '',
  phone:      '',
  email:      '',
  address:    '',
  city:       '',
  state:      'CA',
  zip:        '',
  // Step 2
  insurance_type:      '',
  medi_cal_id:         '',
  county_mhp:          '',
  commercial_payer:    '',
  member_id:           '',
  group_number:        '',
  subscriber_name:     '',
  subscriber_dob:      '',
  cob_order:           'medi_cal_primary',
  prior_auth_required: false,
  prior_auth_number:   '',
  prior_auth_expiry:   '',
  // Step 3
  preferred_provider_type: '',
  modality_preference:     '',
  presenting_concerns:     [],
  preferred_days:          [],
  preferred_time_slots:    [],
  // Step 4
  consent_telehealth: false,
  consent_hipaa:      false,
  consent_financial:  false,
  signature_text:     '',
};

// ─── Per-step client-side validation ──────────────────────────────────────────

function validateStep(step, data) {
  const errs = {};

  if (step === 1) {
    if (!data.first_name.trim())  errs.first_name = 'First name is required.';
    if (!data.last_name.trim())   errs.last_name  = 'Last name is required.';
    if (!data.dob)                errs.dob        = 'Date of birth is required.';
    if (data.dob && new Date(data.dob) >= new Date()) errs.dob = 'Date of birth must be in the past.';
    if (!data.gender)             errs.gender     = 'Please select a gender.';
    if (!data.phone.trim())       errs.phone      = 'Phone number is required.';
    if (!data.email.trim())       errs.email      = 'Email is required.';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
                                  errs.email      = 'Enter a valid email address.';
    if (!data.address.trim())     errs.address    = 'Address is required.';
    if (!data.city.trim())        errs.city       = 'City is required.';
    if (!data.state.trim())       errs.state      = 'State is required.';
    if (!data.zip.trim())         errs.zip        = 'ZIP code is required.';
  }

  if (step === 2) {
    if (!data.insurance_type)     errs.insurance_type = 'Please select a coverage type.';
    const needsMedi = data.insurance_type === 'medi_cal' || data.insurance_type === 'both';
    const needsComm = data.insurance_type === 'commercial' || data.insurance_type === 'both';
    if (needsMedi && !data.medi_cal_id.trim()) errs.medi_cal_id = 'Medi-Cal ID is required.';
    if (needsComm && !data.commercial_payer)   errs.commercial_payer = 'Please select an insurance company.';
    if (needsComm && !data.member_id.trim())   errs.member_id = 'Member ID is required.';
    if (data.insurance_type === 'both' && !data.cob_order) errs.cob_order = 'Please select COB order.';
    if (data.prior_auth_required && !data.prior_auth_number.trim())
      errs.prior_auth_number = 'Prior auth number is required.';
    if (data.prior_auth_required && !data.prior_auth_expiry)
      errs.prior_auth_expiry = 'Expiration date is required.';
  }

  if (step === 3) {
    if (!data.preferred_provider_type) errs.preferred_provider_type = 'Please select a provider type.';
    if (!data.modality_preference)     errs.modality_preference     = 'Please select a session modality.';
    if (!data.presenting_concerns.length)
      errs.presenting_concerns = 'Please select at least one presenting concern.';
  }

  if (step === 4) {
    if (!data.consent_telehealth) errs.consent_telehealth = 'You must agree to the Telehealth Informed Consent.';
    if (!data.consent_hipaa)      errs.consent_hipaa      = 'You must agree to the HIPAA Notice.';
    if (!data.consent_financial)  errs.consent_financial  = 'You must agree to the Financial Agreement.';
    if (!data.signature_text.trim()) errs.signature_text  = 'Electronic signature is required.';
    if (data.signature_text && data.signature_text.trim().length < 2)
      errs.signature_text = 'Please type your full name.';
  }

  return errs;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function New({ isPublic = false, token = null, practiceName = 'TeleFlow' }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData,    setFormData]    = useState(INITIAL_DATA);
  const [errors,      setErrors]      = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, formData]);

  const handleBack = useCallback(() => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Submission ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    const endpoint = isPublic
      ? `/intake/${token}`
      : '/api/patients/intake';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (!response.ok) {
        // Laravel validation errors (422)
        if (response.status === 422 && json.errors) {
          // Map server errors back to the correct step
          const serverErrors = {};
          Object.entries(json.errors).forEach(([key, msgs]) => {
            serverErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
          setErrors(serverErrors);
          setSubmitError('Please correct the errors above and resubmit.');
        } else {
          setSubmitError(json.message || 'Submission failed. Please try again.');
        }
      } else {
        setSubmitted(true);
        // Admin flow: redirect to patients list after brief delay
        if (!isPublic) {
          setTimeout(() => router.visit('/patients'), 2500);
        }
      }
    } catch (err) {
      setSubmitError('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step renderer ────────────────────────────────────────────────────────────

  const renderStep = () => {
    const props = { data: formData, onChange: setFormData, errors };
    switch (currentStep) {
      case 1: return <Step1Personal  {...props} />;
      case 2: return <Step2Insurance {...props} />;
      case 3: return <Step3Clinical  {...props} />;
      case 4: return <Step4Consents  {...props} />;
      case 5: return <Step5Review    {...props} />;
      default: return null;
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <WizardShell isPublic={isPublic} practiceName={practiceName}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E6F9F7] flex items-center justify-center mb-5">
            <Check size={32} className="text-[#0AB5A0]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] font-['Sora']">Intake Submitted</h2>
          <p className="text-[#6B7280] text-sm mt-2 max-w-xs">
            {isPublic
              ? `Thank you! A welcome email has been sent to ${formData.email}. Your care team will be in touch within 1–2 business days.`
              : `Patient intake complete. A welcome email was queued for ${formData.email}. Redirecting to patients list…`}
          </p>
          {!isPublic && (
            <button
              onClick={() => router.visit('/patients')}
              className="mt-8 px-6 py-2.5 bg-[#0AB5A0] text-white text-sm font-semibold rounded-[6px] hover:bg-[#099e8c] transition-colors"
            >
              Go to Patients
            </button>
          )}
        </div>
      </WizardShell>
    );
  }

  // ── Main wizard ──────────────────────────────────────────────────────────────

  return (
    <WizardShell isPublic={isPublic} practiceName={practiceName}>
      {/* Progress bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Step content */}
      <div className="mt-8">
        {renderStep()}
      </div>

      {/* Server-side error banner */}
      {submitError && (
        <div className="mt-4 flex items-start gap-2 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3">
          <X size={15} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#EF4444]">{submitError}</p>
        </div>
      )}

      {/* Navigation footer */}
      <div className="mt-8 pt-5 border-t border-[#E5E7EB] flex items-center justify-between">
        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#374151] border border-[#E5E7EB] rounded-[6px] hover:bg-[#F9FAFB] disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft size={15} /> Back
        </button>

        {/* Step indicator */}
        <span className="text-xs text-[#9CA3AF]">
          Step {currentStep} of {STEPS.length}
        </span>

        {/* Next / Submit */}
        {currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#0AB5A0] rounded-[6px] hover:bg-[#099e8c] transition-colors"
          >
            Continue <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0AB5A0] rounded-[6px] hover:bg-[#099e8c] disabled:opacity-60 disabled:pointer-events-none transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <UserPlus size={15} />
                Submit Intake
              </>
            )}
          </button>
        )}
      </div>
    </WizardShell>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ currentStep }) {
  return (
    <div>
      {/* Step labels */}
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex-1 text-center text-xs font-semibold transition-colors ${
              step.id === currentStep
                ? 'text-[#0AB5A0]'
                : step.id < currentStep
                ? 'text-[#10B981]'
                : 'text-[#9CA3AF]'
            }`}
          >
            {step.shortLabel}
          </div>
        ))}
      </div>

      {/* Track + steps */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-[#E5E7EB]" />
        {/* Filled track */}
        <div
          className="absolute top-3.5 left-0 h-0.5 bg-[#0AB5A0] transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {/* Step circles */}
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const done    = step.id < currentStep;
            const current = step.id === currentStep;
            return (
              <div
                key={step.id}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-300 border-2 bg-white
                  ${done
                    ? 'border-[#10B981] bg-[#10B981] text-white'
                    : current
                    ? 'border-[#0AB5A0] text-[#0AB5A0] shadow-[0_0_0_4px_rgba(10,181,160,0.15)]'
                    : 'border-[#E5E7EB] text-[#9CA3AF]'}
                `}
              >
                {done ? <Check size={13} /> : step.id}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Shell (handles both admin and public layouts) ─────────────────────────────

function WizardShell({ children, isPublic, practiceName }) {
  if (isPublic) {
    // Public-facing: full-page centred, no sidebar
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-start py-12 px-4">
        {/* Practice header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl font-bold text-[#0F1A2E] font-['Sora']">⚡ {practiceName}</span>
          </div>
          <p className="text-sm text-[#6B7280]">Secure Patient Intake Form</p>
        </div>

        <div className="w-full max-w-[640px] bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-8">
          {children}
        </div>

        <p className="mt-6 text-xs text-[#9CA3AF] text-center">
          Your information is encrypted and protected under HIPAA and California CMIA.
        </p>
      </div>
    );
  }

  // Admin view: rendered inside AppLayout (sidebar handles the outer chrome)
  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Page header */}
      <div className="w-full max-w-[640px] mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111827] font-['Sora']">New Patient Intake</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Complete all 5 steps to register the patient.</p>
        </div>
        <button
          onClick={() => router.visit('/patients')}
          className="p-2 rounded-[6px] hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
          title="Cancel and return to patients"
        >
          <X size={18} />
        </button>
      </div>

      <div className="w-full max-w-[640px] bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-8">
        {children}
      </div>
    </div>
  );
}