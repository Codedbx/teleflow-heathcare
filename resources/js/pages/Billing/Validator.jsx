import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
    ShieldCheck, AlertTriangle, CheckCircle, XCircle,
    ChevronDown, RefreshCw, Save, Send,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Select from '@/components/ui/Select';
import BillingCheckRow from '@/components/BillingCheckRow';
import { toast } from '@/components/ui/Toast';

// ─── Constants ───────────────────────────────────────────────────────────────

const CPT_OPTIONS = [
    { value: '90832', label: '90832 — Psychotherapy, 16–37 min' },
    { value: '90834', label: '90834 — Psychotherapy, 38–52 min' },
    { value: '90837', label: '90837 — Psychotherapy, 53+ min' },
    { value: '90791', label: '90791 — Psychiatric Diagnostic Evaluation' },
    { value: '90792', label: '90792 — Psychiatric Eval with Medical Services' },
    { value: '90847', label: '90847 — Family Psychotherapy with Patient' },
    { value: '90853', label: '90853 — Group Psychotherapy' },
    { value: '90839', label: '90839 — Psychotherapy Crisis, 30–74 min' },
];

const MODIFIER_OPTIONS = [
    { value: '95',   label: '95 — Telehealth (Live Video)' },
    { value: 'GT',   label: 'GT — Medi-Cal Telehealth' },
    { value: '93',   label: '93 — Audio-Only Telehealth' },
    { value: 'none', label: 'None — In-Person' },
];

const POS_OPTIONS = [
    { value: '02', label: '02 — Telehealth, patient at facility' },
    { value: '10', label: '10 — Telehealth, patient at home' },
    { value: '11', label: '11 — Office/Clinic' },
];

const PAYER_OPTIONS = [
    { value: 'medi_cal',   label: 'Medi-Cal' },
    { value: 'commercial', label: 'Commercial / Private' },
    { value: 'both',       label: 'Both (Dual-Payer)' },
    { value: 'self_pay',   label: 'Self-Pay' },
];

const COB_OPTIONS = [
    { value: 'commercial_primary', label: 'Commercial Primary, Medi-Cal Secondary' },
    { value: 'medi_cal_primary',   label: 'Medi-Cal Primary (confirm patient opted out)' },
];

const PROVIDER_TYPES = [
    { value: 'LCSW',         label: 'LCSW' },
    { value: 'LMFT',         label: 'LMFT' },
    { value: 'LPCC',         label: 'LPCC' },
    { value: 'Psychologist', label: 'Psychologist' },
    { value: 'Psychiatrist', label: 'Psychiatrist' },
];

// Modifier / POS auto-suggestion based on modality
function autoSuggest(modality, payer) {
    if (modality === 'video') {
        return { modifier: payer === 'medi_cal' ? 'GT' : '95', pos_code: '10' };
    }
    if (modality === 'audio') {
        return { modifier: '93', pos_code: '10' };
    }
    return { modifier: 'none', pos_code: '11' };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Validator({ patients = [], providers = [], prefill = null }) {
    const empty = {
        patient_id:               '',
        service_date:             new Date().toISOString().slice(0, 10),
        provider_type:            '',
        provider_id:              '',
        cpt_code:                 '',
        session_duration_minutes: '',
        session_count:            '1',
        modality:                 'video',
        pos_code:                 '10',
        modifier:                 '95',
        primary_payer:            '',
        secondary_payer:          '',
        cob_order:                'commercial_primary',
        prior_auth_number:        '',
        prior_auth_expiry:        '',
        icd10_primary:            '',
    };

    const [form, setForm]           = useState(prefill ? { ...empty, ...prefill } : empty);
    const [loading, setLoading]     = useState(false);
    const [result, setResult]       = useState(null);
    const [saving, setSaving]       = useState(false);

    // Auto-suggest modifier/POS when modality or payer changes
    useEffect(() => {
        const suggestions = autoSuggest(form.modality, form.primary_payer);
        setForm(prev => ({ ...prev, ...suggestions }));
    }, [form.modality, form.primary_payer]);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    // Auto-fill patient insurance data when patient is selected
    const handlePatientChange = (patientId) => {
        const patient = patients.find(p => p.id === parseInt(patientId));
        set('patient_id', patientId);
        if (patient) {
            if (patient.insurance_type) set('primary_payer', patient.insurance_type);
            if (patient.cob_order)      set('cob_order', patient.cob_order);
        }
    };

    // ─── Submit ──────────────────────────────────────────────────────────────

    const handleValidate = async () => {
        if (!form.cpt_code) { toast.error('CPT code is required.'); return; }
        if (!form.primary_payer) { toast.error('Primary payer is required.'); return; }
        if (!form.modality) { toast.error('Session modality is required.'); return; }

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/billing/validate', {
                method:  'POST',
                headers: {
                    'Content-Type':     'application/json',
                    'X-CSRF-TOKEN':     document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept':           'application/json',
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const msg = res.status === 419 ? 'Session expired — please refresh the page.' : `Server error (${res.status}). Please try again.`;
                toast.error(msg);
                return;
            }

            const data = await res.json();
            setResult(data);

            if (data.status === 'clean') toast.success('Claim is clean — ready to submit.');
            else if (data.status === 'warning') toast.warning('Validation complete — review warnings before submitting.');
            else toast.error('Validation errors found — cannot submit as-is.');

        } catch (err) {
            toast.error('Validation request failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Save ────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!result || !form.patient_id) {
            toast.error('Run validation first, and select a patient.');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/billing/claims', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept':       'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    validation_status:  result.status,
                    validation_results: result,
                    claim_status:       result.status === 'clean' ? 'validated' : 'draft',
                }),
            });
            if (res.ok) {
                toast.success('Claim saved to billing.');
            } else {
                toast.error('Failed to save claim.');
            }
        } finally {
            setSaving(false);
        }
    };

    // ─── Apply corrections ───────────────────────────────────────────────────

    const applyCorrections = () => {
        if (!result?.corrected_fields) return;
        setForm(prev => ({ ...prev, ...result.corrected_fields }));
        toast.info('Suggested corrections applied — re-run validation to confirm.');
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    const patientOptions = patients.map(p => ({ value: String(p.id), label: p.name }));
    const isMobile = useIsMobile();

    return (
        <AppLayout title="Billing Validator">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '16px 16px 48px' : '32px 32px 48px' }}>

                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldCheck size={20} color="var(--accent-teal)" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            Billing Pre-Submission Validator
                        </h1>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                            California-specific rules engine · Medi-Cal · Telehealth · CalAIM
                        </p>
                    </div>
                </div>

                {/* Input form card */}
                <div style={card}>
                    <SectionLabel>Claim Details</SectionLabel>

                    {/* Row 1 */}
                    <FormRow cols={3}>
                        <Select
                            label="Patient"
                            placeholder="Select patient…"
                            options={patientOptions}
                            value={String(form.patient_id)}
                            onChange={handlePatientChange}
                        />
                        <FormField label="Service Date">
                            <input
                                type="date"
                                value={form.service_date}
                                onChange={e => set('service_date', e.target.value)}
                                style={inputStyle}
                            />
                        </FormField>
                        <Select
                            label="Provider"
                            placeholder="Select provider…"
                            options={providers.map(p => ({
                                value: String(p.id),
                                label: `${p.name} (${p.provider_type ?? 'N/A'})`,
                            }))}
                            value={String(form.provider_id)}
                            onChange={v => {
                                const provider = providers.find(p => String(p.id) === v);
                                setForm(prev => ({
                                    ...prev,
                                    provider_id:   v,
                                    provider_type: provider?.provider_type ?? prev.provider_type,
                                }));
                            }}
                        />
                    </FormRow>

                    {/* Row 2 */}
                    <FormRow cols={3}>
                        <Select
                            label="CPT Code"
                            placeholder="Select CPT code…"
                            options={CPT_OPTIONS}
                            value={form.cpt_code}
                            onChange={v => set('cpt_code', v)}
                            mono
                        />
                        <FormField label="Session Duration (min)">
                            <input
                                type="number"
                                min="1"
                                max="240"
                                placeholder="53"
                                value={form.session_duration_minutes}
                                onChange={e => set('session_duration_minutes', e.target.value)}
                                style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }}
                            />
                        </FormField>
                        <FormField label="Session Count">
                            <input
                                type="number"
                                min="1"
                                max="99"
                                value={form.session_count}
                                onChange={e => set('session_count', e.target.value)}
                                style={inputStyle}
                            />
                        </FormField>
                    </FormRow>

                    {/* Row 3 — Modality radio pills */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Session Modality</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {[
                                { val: 'video',     label: 'Live Video' },
                                { val: 'audio',     label: 'Audio-Only' },
                                { val: 'in_person', label: 'In-Person' },
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => set('modality', opt.val)}
                                    style={{
                                        padding: '7px 18px',
                                        borderRadius: '999px',
                                        border: `2px solid ${form.modality === opt.val ? 'var(--accent-teal)' : 'var(--border)'}`,
                                        background: form.modality === opt.val ? 'var(--accent-light)' : 'var(--bg-surface)',
                                        color: form.modality === opt.val ? 'var(--accent-teal)' : 'var(--text-secondary)',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        fontFamily: 'DM Sans, sans-serif',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Row 4 — POS + Modifier */}
                    <FormRow cols={2}>
                        <Select
                            label="Place of Service (POS)"
                            options={POS_OPTIONS}
                            value={form.pos_code}
                            onChange={v => set('pos_code', v)}
                            mono
                        />
                        <Select
                            label="Modifier"
                            options={MODIFIER_OPTIONS}
                            value={form.modifier}
                            onChange={v => set('modifier', v)}
                            mono
                        />
                    </FormRow>

                    {/* Row 5 — Payer */}
                    <FormRow cols={form.primary_payer === 'both' ? 3 : 1}>
                        <Select
                            label="Primary Payer"
                            placeholder="Select payer…"
                            options={PAYER_OPTIONS}
                            value={form.primary_payer}
                            onChange={v => set('primary_payer', v)}
                        />
                        {form.primary_payer === 'both' && (
                            <>
                                <FormField label="Secondary Payer">
                                    <input
                                        type="text"
                                        placeholder="e.g. Blue Shield"
                                        value={form.secondary_payer}
                                        onChange={e => set('secondary_payer', e.target.value)}
                                        style={inputStyle}
                                    />
                                </FormField>
                                <Select
                                    label="COB Order"
                                    options={COB_OPTIONS}
                                    value={form.cob_order}
                                    onChange={v => set('cob_order', v)}
                                />
                            </>
                        )}
                    </FormRow>

                    {/* Row 6 — Prior Auth */}
                    <FormRow cols={2}>
                        <FormField label="Prior Auth Number (optional)">
                            <input
                                type="text"
                                placeholder="PA-XXXXXXXX"
                                value={form.prior_auth_number}
                                onChange={e => set('prior_auth_number', e.target.value)}
                                style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }}
                            />
                        </FormField>
                        <FormField label="Auth Expiry Date (optional)">
                            <input
                                type="date"
                                value={form.prior_auth_expiry}
                                onChange={e => set('prior_auth_expiry', e.target.value)}
                                style={inputStyle}
                            />
                        </FormField>
                    </FormRow>

                    {/* Row 7 — ICD-10 */}
                    <FormRow cols={1}>
                        <FormField label="Primary Diagnosis (ICD-10)">
                            <input
                                type="text"
                                placeholder="F32.1"
                                value={form.icd10_primary}
                                onChange={e => set('icd10_primary', e.target.value.toUpperCase())}
                                style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', maxWidth: '200px' }}
                            />
                        </FormField>
                    </FormRow>

                    {/* Validate button */}
                    <button
                        onClick={handleValidate}
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: '44px',
                            marginTop: '8px',
                            background: loading ? 'var(--text-muted)' : 'var(--accent-teal)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '15px',
                            fontWeight: 600,
                            fontFamily: 'DM Sans, sans-serif',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#089e8c'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-teal)'; }}
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                                Checking against CA billing rules…
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={16} />
                                Validate Claim
                            </>
                        )}
                    </button>
                </div>

                {/* ─── Results Panel ──────────────────────────────────────── */}
                {result && (
                    <div style={{ marginTop: '24px' }}>

                        {/* Status banner */}
                        <StatusBanner status={result.status} />

                        {/* Checks table */}
                        <div style={{ ...card, padding: 0, overflow: 'hidden', marginTop: '16px' }}>
                            <div style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid var(--border)',
                                fontFamily: 'Sora, sans-serif',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                            }}>
                                Detailed Check Results
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                                        {['Check', 'Status', 'Detail', 'Suggested Fix'].map(h => (
                                            <th key={h} style={{
                                                padding: '10px 16px',
                                                textAlign: 'left',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: 'var(--text-secondary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontFamily: 'DM Sans, sans-serif',
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.checks.map((check, i) => (
                                        <BillingCheckRow key={i} {...check} />
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>

                        {/* Action bar */}
                        <div style={{
                            display: 'flex', gap: '10px', marginTop: '16px',
                            justifyContent: 'flex-end', flexWrap: 'wrap',
                        }}>
                            {result.status !== 'clean' && Object.keys(result.corrected_fields || {}).length > 0 && (
                                <button onClick={applyCorrections} style={secondaryBtn}>
                                    <RefreshCw size={14} />
                                    Apply Suggested Corrections
                                </button>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={secondaryBtn}
                            >
                                <Save size={14} />
                                {saving ? 'Saving…' : 'Save This Validation'}
                            </button>

                            {result.status === 'clean' && (
                                <button
                                    onClick={() => {
                                        handleSave().then(() => {
                                            toast.success('Claim marked as ready for billing.');
                                        });
                                    }}
                                    style={{
                                        ...secondaryBtn,
                                        background: 'var(--accent-teal)',
                                        color: '#fff',
                                        borderColor: 'var(--accent-teal)',
                                    }}
                                >
                                    <Send size={14} />
                                    Send to Billing
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </AppLayout>
    );
}

// ─── Status Banner ────────────────────────────────────────────────────────────

function StatusBanner({ status }) {
    const configs = {
        clean: {
            icon:    <CheckCircle size={22} />,
            color:   'var(--success)',
            bg:      '#F0FDF4',
            border:  '#86EFAC',
            heading: 'CLEAN — Ready to Submit',
            sub:     'All checks passed. This claim meets CA billing requirements.',
        },
        warning: {
            icon:    <AlertTriangle size={22} />,
            color:   'var(--warning)',
            bg:      '#FFFBEB',
            border:  '#FCD34D',
            heading: 'WARNINGS — Review Before Submitting',
            sub:     'Some items need review. Submission may be possible but carries risk.',
        },
        error: {
            icon:    <XCircle size={22} />,
            color:   'var(--danger)',
            bg:      '#FEF2F2',
            border:  '#FCA5A5',
            heading: 'ERRORS — Cannot Submit',
            sub:     'This claim has critical errors. Fix all errors before submitting.',
        },
    };

    const cfg = configs[status] || configs.warning;

    return (
        <div style={{
            background: cfg.bg,
            border: `1.5px solid ${cfg.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
        }}>
            <span style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
            <div>
                <p style={{
                    margin: 0,
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: cfg.color,
                }}>
                    {cfg.heading}
                </p>
                <p style={{
                    margin: '2px 0 0',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'DM Sans, sans-serif',
                }}>
                    {cfg.sub}
                </p>
            </div>
        </div>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
    return (
        <p style={{
            margin: '0 0 16px',
            fontFamily: 'Sora, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
        }}>
            {children}
        </p>
    );
}

function FormRow({ cols = 2, children }) {
    const isMobile = useIsMobile();
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${cols}, 1fr)`,
            gap: '16px',
            marginBottom: '16px',
        }}>
            {children}
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {label && (
                <label style={labelStyle}>{label}</label>
            )}
            {children}
        </div>
    );
}

const card = {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
};

const inputStyle = {
    height: '40px',
    padding: '0 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle = {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
};

const secondaryBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 16px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'background 0.15s',
};