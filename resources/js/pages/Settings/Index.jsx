import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
    Building2, Users, Bell, Zap,
    Copy, Check, Download, Shield,
    Globe, Phone, Mail, MapPin,
    BadgeCheck, Stethoscope,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <button onClick={copy} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            height: 30, padding: '0 10px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', fontSize: 12,
            color: copied ? 'var(--success)' : 'var(--text-secondary)',
            cursor: 'pointer', fontWeight: 500,
        }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon size={15} style={{ color: 'var(--accent-teal)' }} />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</p>
            </div>
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
        }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>{title}</h3>
            </div>
            <div style={{ padding: '0 24px 8px' }}>{children}</div>
        </div>
    );
}

// ─── Tab: Practice Info ───────────────────────────────────────────────────────

function PracticeTab({ practice }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <SectionCard title="Practice Details">
                <InfoRow icon={Building2}  label="Practice Name"       value={practice.name} />
                <InfoRow icon={MapPin}     label="Address"             value={`${practice.address}, ${practice.city}, ${practice.state} ${practice.zip}`} />
                <InfoRow icon={Phone}      label="Phone"               value={practice.phone} />
                <InfoRow icon={Mail}       label="Email"               value={practice.email} />
            </SectionCard>
            <SectionCard title="Billing & Compliance IDs">
                <InfoRow icon={BadgeCheck}   label="NPI Number"          value={practice.npi} />
                <InfoRow icon={Shield}       label="Taxonomy Code"        value={practice.taxonomy_code} />
                <InfoRow icon={Stethoscope}  label="Medi-Cal Provider ID" value={practice.medi_cal_id} />
            </SectionCard>

            <div style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)', padding: '14px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
                <Shield size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                    Practice settings are read-only in this demo. In production, these fields
                    would be editable by Admin users only, with all changes logged to the audit trail.
                </p>
            </div>
        </div>
    );
}

// ─── Tab: Providers ───────────────────────────────────────────────────────────

function ProvidersTab({ providers }) {
    const PROVIDER_TYPE_LABELS = {
        LCSW: 'Licensed Clinical Social Worker',
        LMFT: 'Licensed Marriage & Family Therapist',
        LPCC: 'Licensed Professional Clinical Counselor',
        Psychologist: 'Psychologist',
        Psychiatrist: 'Psychiatrist',
    };

    const ROLE_COLORS = {
        admin:     { bg: '#EEF2FF', text: '#4338CA' },
        clinician: { bg: 'var(--accent-light)', text: 'var(--accent-teal)' },
        biller:    { bg: '#FEF3C7', text: '#D97706' },
    };

    return (
        <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
        }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                    Care Team — {providers.length} members
                </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-base)' }}>
                        {['Name', 'Role', 'Credential', 'NPI', 'Email'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {providers.map((p, i) => {
                        const roleColor = ROLE_COLORS[p.role] ?? ROLE_COLORS.clinician;
                        return (
                            <tr key={p.id} style={{ borderBottom: i < providers.length - 1 ? '1px solid var(--border)' : 'none', height: 52 }}>
                                <td style={{ padding: '0 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'var(--accent-teal)', color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 600, flexShrink: 0,
                                        }}>
                                            {p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '0 16px' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center',
                                        padding: '3px 8px', borderRadius: 99,
                                        fontSize: 11, fontWeight: 600,
                                        background: roleColor.bg, color: roleColor.text,
                                        textTransform: 'capitalize',
                                    }}>{p.role}</span>
                                </td>
                                <td style={{ padding: '0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                    {p.provider_type ? (
                                        <span title={PROVIDER_TYPE_LABELS[p.provider_type]}>{p.provider_type}</span>
                                    ) : '—'}
                                </td>
                                <td style={{ padding: '0 16px' }}>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {p.npi_number || '—'}
                                    </span>
                                </td>
                                <td style={{ padding: '0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                    {p.email}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

function NotificationsTab() {
    const [settings, setSettings] = useState({
        new_intake:           true,
        appointment_confirmed: true,
        billing_error:        true,
        message_received:     true,
        claim_denied:         true,
        daily_summary:        false,
    });

    function toggle(key) {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }

    const items = [
        { key: 'new_intake',            label: 'New patient intake submitted',         desc: 'Notifies admin when a patient completes intake.' },
        { key: 'appointment_confirmed', label: 'Appointment confirmed',                desc: 'Notifies provider and patient on booking.' },
        { key: 'billing_error',         label: 'Billing validation error',             desc: 'Notifies billers when a claim has errors.' },
        { key: 'message_received',      label: 'New message from patient',             desc: 'Notifies provider when a patient sends a message.' },
        { key: 'claim_denied',          label: 'Claim denied by payer',                desc: 'Notifies biller when a submitted claim is denied.' },
        { key: 'daily_summary',         label: 'Daily operations summary (9am)',       desc: 'Morning digest: appointments, outstanding claims, tasks.' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>Email Notifications</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Sent via the configured SMTP address</p>
                </div>
                {items.map((item, i) => (
                    <div key={item.key} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 24px',
                        borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</p>
                        </div>
                        {/* Toggle switch */}
                        <button
                            onClick={() => toggle(item.key)}
                            style={{
                                width: 44, height: 24, borderRadius: 12,
                                background: settings[item.key] ? 'var(--accent-teal)' : 'var(--border)',
                                border: 'none', cursor: 'pointer',
                                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                            }}
                        >
                            <span style={{
                                position: 'absolute', top: 3,
                                left: settings[item.key] ? 23 : 3,
                                width: 18, height: 18, borderRadius: '50%',
                                background: '#fff', transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </button>
                    </div>
                ))}
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Changes are illustrative in this demo. In production, preferences are stored per-user and per-role.
            </p>
        </div>
    );
}

// ─── Tab: Integrations ────────────────────────────────────────────────────────

function IntegrationsTab({ webhookUrl }) {
    const [exported, setExported] = useState(false);

    function handleExport() {
        setExported(true);
        const data = {
            export_type: 'teleflow_patient_data',
            version:     '1.0',
            exported_at: new Date().toISOString(),
            note:        'Production export would include encrypted patient records, consents, and billing history.',
            patients:    '(data would appear here in production)',
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `teleflow-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(() => setExported(false), 3000);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* n8n Webhook */}
            <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Zap size={16} style={{ color: '#F59E0B' }} />
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                        n8n Workflow Automation
                    </h3>
                </div>
                <div style={{ padding: 24 }}>
                    <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        TeleFlow fires a webhook on patient intake, appointment changes, and billing events.
                        Point your n8n workflow at this endpoint to trigger automations — EHR sync,
                        SMS reminders, Slack alerts, and more.
                    </p>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                            Intake Webhook Endpoint
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                flex: 1, padding: '10px 14px',
                                background: 'var(--bg-base)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                                color: 'var(--text-secondary)', overflowX: 'auto', whiteSpace: 'nowrap',
                            }}>
                                {webhookUrl}
                            </div>
                            <CopyButton text={webhookUrl} />
                        </div>
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['patient.intake_completed', 'appointment.confirmed', 'billing.error_flagged', 'message.sent'].map(event => (
                            <span key={event} style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '3px 10px', borderRadius: 99,
                                fontSize: 11, fontWeight: 500,
                                background: 'var(--accent-light)', color: 'var(--accent-teal)',
                                fontFamily: 'JetBrains Mono, monospace',
                            }}>
                                {event}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* EHR Export */}
            <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Globe size={16} style={{ color: 'var(--accent-teal)' }} />
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                        EHR Export (JSON / FHIR-ready)
                    </h3>
                </div>
                <div style={{ padding: 24 }}>
                    <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Export patient data as structured JSON. In production, this conforms to
                        FHIR R4 for interoperability with SimplePractice, Athenahealth, and other EHRs.
                        Data is de-identified for export unless run by an Admin.
                    </p>
                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            height: 40, padding: '0 20px',
                            background: exported ? 'var(--success)' : 'var(--bg-base)',
                            border: `1px solid ${exported ? 'var(--success)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            color: exported ? '#fff' : 'var(--text-primary)',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        {exported ? <Check size={15} /> : <Download size={15} />}
                        {exported ? 'Exported!' : 'Export Patient Data (.json)'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'practice',      label: 'Practice Info',  icon: Building2 },
    { id: 'providers',     label: 'Providers',      icon: Users },
    { id: 'notifications', label: 'Notifications',  icon: Bell },
    { id: 'integrations',  label: 'Integrations',   icon: Zap },
];

export default function SettingsIndex({ practice, providers, webhook_url }) {
    const [activeTab, setActiveTab] = useState('practice');

    return (
        <AppLayout>
            <Head title="Settings" />

            <div style={{ width: '100%' }}>
                {/* Page header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>
                        Settings
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                        Practice configuration, providers, and integrations.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                    {/* Left tab nav */}
                    <div style={{
                        width: 200, flexShrink: 0,
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)',
                        overflow: 'hidden',
                    }}>
                        {TABS.map((tab, i) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '13px 16px', textAlign: 'left',
                                        background: isActive ? 'var(--accent-light)' : 'transparent',
                                        borderLeft: isActive ? '3px solid var(--accent-teal)' : '3px solid transparent',
                                        border: 'none',
                                        borderBottom: i < TABS.length - 1 ? '1px solid var(--border)' : 'none',
                                        cursor: 'pointer',
                                        color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                                        fontSize: 14, fontWeight: isActive ? 600 : 400,
                                    }}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content — min-height keeps layout stable across tabs */}
                    <div style={{ flex: 1, minWidth: 0, minHeight: 640 }}>
                        {activeTab === 'practice'      && <PracticeTab practice={practice} />}
                        {activeTab === 'providers'     && <ProvidersTab providers={providers} />}
                        {activeTab === 'notifications' && <NotificationsTab />}
                        {activeTab === 'integrations'  && <IntegrationsTab webhookUrl={webhook_url} />}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}