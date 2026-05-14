import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import SoapNoteDisplay from '@/components/SoapNoteDisplay';
import {
    Phone, Mail, MapPin, Calendar, User, Sparkles,
    MessageSquare, FileText, ShieldCheck, ChevronRight,
    Video, Headphones, Building2, Clock,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(first, last) {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function age(dob) {
    if (!dob) return '—';
    return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const STATUS_STYLES = {
    active:          { bg: '#DCFCE7', color: '#15803D', label: 'Active' },
    inactive:        { bg: '#F3F4F6', color: '#6B7280', label: 'Inactive' },
    pending_intake:  { bg: '#FEF3C7', color: '#D97706', label: 'Pending Intake' },
};

const APPT_STATUS = {
    confirmed: { bg: '#DCFCE7', color: '#15803D' },
    pending:   { bg: '#FEF3C7', color: '#D97706' },
    completed: { bg: '#DBEAFE', color: '#1D4ED8' },
    cancelled: { bg: '#F3F4F6', color: '#6B7280' },
    no_show:   { bg: '#FEE2E2', color: '#DC2626' },
};

const VALIDATION_STYLES = {
    clean:       { bg: '#DCFCE7', color: '#15803D', label: 'Clean' },
    warning:     { bg: '#FEF3C7', color: '#D97706', label: 'Warning' },
    error:       { bg: '#FEE2E2', color: '#DC2626', label: 'Error' },
    not_checked: { bg: '#F3F4F6', color: '#6B7280', label: 'Not Checked' },
};

function Badge({ label, bg, color }) {
    return (
        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: bg, color }}>
            {label}
        </span>
    );
}

function ModalityIcon({ modality }) {
    if (modality === 'video')     return <Video size={13} style={{ color: '#0AB5A0' }} />;
    if (modality === 'audio')     return <Headphones size={13} style={{ color: '#2563EB' }} />;
    if (modality === 'in_person') return <Building2 size={13} style={{ color: '#374151' }} />;
    return null;
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ patient }) {
    const ins = patient.insurance;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Insurance */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insurance</h3>
                {!ins ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No insurance on file</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Row label="Type" value={ins.insurance_type?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
                        {ins.medi_cal_id    && <Row label="Medi-Cal ID"   value={ins.medi_cal_id} mono />}
                        {ins.county_mhp    && <Row label="County MHP"    value={ins.county_mhp} />}
                        {ins.commercial_payer && <Row label="Payer"       value={ins.commercial_payer} />}
                        {ins.member_id     && <Row label="Member ID"      value={ins.member_id} mono />}
                        {ins.group_number  && <Row label="Group #"        value={ins.group_number} mono />}
                        {ins.cob_order     && <Row label="COB Order"      value={ins.cob_order.replace('_', ' ')} />}
                        <Row label="Prior Auth" value={ins.prior_auth_required ? `Required — ${ins.prior_auth_number ?? 'No # on file'}` : 'Not required'} />
                        {ins.prior_auth_expiry && <Row label="Auth Expiry" value={formatDate(ins.prior_auth_expiry)} />}
                    </div>
                )}
            </div>

            {/* Intake summary */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intake Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Row label="Intake Date"    value={formatDate(patient.intake_completed_at)} />
                    <Row label="Modality Pref"  value={patient.modality_preference?.replace('_', ' ')} />
                    <Row label="Consents"       value={`${patient.consents?.length ?? 0} signed`} />
                    <div>
                        <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Presenting Concerns</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(patient.presenting_concerns ?? []).map(c => (
                                <span key={c} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: 'var(--accent-light)', color: 'var(--accent-teal)' }}>
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, mono }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
            <span style={{
                color: 'var(--text-primary)', fontWeight: 500,
                fontFamily: mono ? 'JetBrains Mono, monospace' : undefined,
                fontSize: mono ? 12 : 13,
            }}>
                {value ?? '—'}
            </span>
        </div>
    );
}

// ─── Tab: Notes ───────────────────────────────────────────────────────────────

function NotesTab({ patient }) {
    const notes = patient.clinical_notes ?? [];
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Link
                    href={`/notes/assistant?patient=${patient.id}`}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        height: 36, padding: '0 16px',
                        background: 'var(--accent-teal)', color: '#fff',
                        borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                        fontSize: 13, fontWeight: 600,
                    }}
                >
                    <Sparkles size={13} /> Generate New Note
                </Link>
            </div>

            {notes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>
                    No clinical notes yet
                </div>
            ) : notes.map(note => (
                <div key={note.id} style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 12,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {formatDate(note.session_date)}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{note.session_duration_minutes} min</span>
                            <ModalityIcon modality={note.modality} />
                            {note.generated_by_ai && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: '#F3E8FF', color: '#7C3AED' }}>
                                    <Sparkles size={9} /> AI
                                </span>
                            )}
                        </div>
                        <Link href={`/notes/${note.id}`} style={{ fontSize: 12, color: 'var(--accent-teal)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                            View Full Note <ChevronRight size={12} />
                        </Link>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {note.soap_subjective?.substring(0, 120)}{note.soap_subjective?.length > 120 ? '…' : ''}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ─── Tab: Appointments ────────────────────────────────────────────────────────

function AppointmentsTab({ patient }) {
    const appts = [...(patient.appointments ?? [])].sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>No appointments</div>
            ) : appts.map(a => {
                const s = APPT_STATUS[a.status] ?? APPT_STATUS.pending;
                return (
                    <div key={a.id} style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: '14px 20px',
                        display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                        <div style={{ width: 130 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formatDateTime(a.scheduled_at)}</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{a.duration_minutes} min</p>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{a.provider?.name}</p>
                        </div>
                        <ModalityIcon modality={a.modality} />
                        <Badge label={a.status?.replace('_', ' ')} bg={s.bg} color={s.color} />
                    </div>
                );
            })}
        </div>
    );
}

// ─── Tab: Billing ─────────────────────────────────────────────────────────────

function BillingTab({ patient }) {
    const claims = patient.billing_claims ?? [];
    return (
        <div>
            {claims.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>No billing claims</div>
            ) : (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-base)' }}>
                                {['Date', 'CPT', 'Modifier', 'Payer', 'Amount', 'Validation', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map((c, i) => {
                                const v = VALIDATION_STYLES[c.validation_status] ?? VALIDATION_STYLES.not_checked;
                                const cs = STATUS_STYLES[c.claim_status] ?? { bg: '#F3F4F6', color: '#6B7280', label: c.claim_status };
                                return (
                                    <tr key={c.id} style={{ borderBottom: i < claims.length - 1 ? '1px solid var(--border)' : 'none', height: 48 }}>
                                        <td style={{ padding: '0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(c.service_date)}</td>
                                        <td style={{ padding: '0 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.cpt_code}</td>
                                        <td style={{ padding: '0 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{c.modifier ?? '—'}</td>
                                        <td style={{ padding: '0 16px', fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{c.primary_payer?.replace('_', ' ')}</td>
                                        <td style={{ padding: '0 16px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>${c.amount}</td>
                                        <td style={{ padding: '0 16px' }}><Badge label={v.label} bg={v.bg} color={v.color} /></td>
                                        <td style={{ padding: '0 16px' }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                                {c.claim_status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Tab: Messages ────────────────────────────────────────────────────────────

function MessagesTab({ patient }) {
    const messages = [...(patient.messages ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Link href={`/messages/${patient.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 16px',
                    background: 'var(--bg-surface)', color: 'var(--accent-teal)',
                    border: '1px solid var(--accent-teal)',
                    borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                    fontSize: 13, fontWeight: 600,
                }}>
                    <MessageSquare size={13} /> Open Thread
                </Link>
            </div>
            {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>No messages</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                    {messages.map(m => {
                        const isProvider = m.sender_type === 'provider';
                        return (
                            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isProvider ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '75%', padding: '10px 14px',
                                    borderRadius: isProvider ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                                    background: isProvider ? 'var(--accent-teal)' : 'var(--bg-surface)',
                                    border: isProvider ? 'none' : '1px solid var(--border)',
                                    color: isProvider ? '#fff' : 'var(--text-primary)',
                                    fontSize: 13, lineHeight: 1.5,
                                }}>
                                    {m.body}
                                </div>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                                    {formatDateTime(m.created_at)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview',      label: 'Overview',     icon: User },
    { id: 'notes',         label: 'Notes',        icon: FileText },
    { id: 'appointments',  label: 'Appointments', icon: Calendar },
    { id: 'billing',       label: 'Billing',      icon: ShieldCheck },
    { id: 'messages',      label: 'Messages',     icon: MessageSquare },
];

export default function PatientShow({ patient, currentUser }) {
    const [activeTab, setActiveTab] = useState('overview');
    const status = STATUS_STYLES[patient.status] ?? STATUS_STYLES.active;

    return (
        <AppLayout>
            <Head title={`${patient.first_name} ${patient.last_name}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                <Link href="/patients" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Patients</Link>
                <ChevronRight size={13} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{patient.first_name} {patient.last_name}</span>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                {/* ── Left sidebar card ───────────────────────────────────── */}
                <div style={{
                    width: 240, flexShrink: 0,
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)',
                    padding: 24, position: 'sticky', top: 24,
                }}>
                    {/* Avatar */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--accent-teal)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 700, margin: '0 auto 12px',
                            fontFamily: 'Sora, sans-serif',
                        }}>
                            {initials(patient.first_name, patient.last_name)}
                        </div>
                        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                            {patient.first_name} {patient.last_name}
                        </h2>
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-muted)' }}>
                            DOB: {formatDate(patient.dob)} · Age {age(patient.dob)}
                        </p>
                        <Badge label={status.label} bg={status.bg} color={status.color} />
                    </div>

                    {/* Contact */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                        <a href={`tel:${patient.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            <Phone size={13} style={{ color: 'var(--text-muted)' }} /> {patient.phone}
                        </a>
                        <a href={`mailto:${patient.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Mail size={13} style={{ color: 'var(--text-muted)' }} /> {patient.email}
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                            {patient.city}, {patient.state}
                        </div>
                        {patient.provider && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                <User size={13} style={{ color: 'var(--text-muted)' }} /> {patient.provider?.name}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Link
                            href={`/messages/${patient.id}`}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                height: 36, borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)', background: 'var(--bg-surface)',
                                color: 'var(--text-primary)', textDecoration: 'none',
                                fontSize: 13, fontWeight: 500,
                            }}
                        >
                            <MessageSquare size={13} /> Send Message
                        </Link>
                        <Link
                            href={`/notes/assistant?patient=${patient.id}`}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                height: 36, borderRadius: 'var(--radius-sm)',
                                background: 'var(--accent-teal)', color: '#fff',
                                textDecoration: 'none', fontSize: 13, fontWeight: 600,
                            }}
                        >
                            <Sparkles size={13} /> New Note
                        </Link>
                    </div>
                </div>

                {/* ── Main content ────────────────────────────────────────── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Tab bar */}
                    <div style={{
                        display: 'flex', gap: 0, marginBottom: 20,
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: 4,
                    }}>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        height: 34, borderRadius: 6, border: 'none',
                                        background: active ? 'var(--accent-teal)' : 'transparent',
                                        color: active ? '#fff' : 'var(--text-secondary)',
                                        fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
                                    }}
                                >
                                    <Icon size={13} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content */}
                    {activeTab === 'overview'     && <OverviewTab patient={patient} />}
                    {activeTab === 'notes'        && <NotesTab patient={patient} />}
                    {activeTab === 'appointments' && <AppointmentsTab patient={patient} />}
                    {activeTab === 'billing'      && <BillingTab patient={patient} />}
                    {activeTab === 'messages'     && <MessagesTab patient={patient} />}
                </div>
            </div>
        </AppLayout>
    );
}