import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import SoapNoteDisplay from '@/components/SoapNoteDisplay';
import {
    ChevronRight, Video, Headphones, Building2,
    Calendar, Clock, User, Sparkles, Copy, Check,
} from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function modalityLabel(m) {
    return { video: 'Live Video', audio: 'Audio-Only', in_person: 'In-Person' }[m] ?? m;
}

function ModalityIcon({ modality }) {
    if (modality === 'video')     return <Video size={14} style={{ color: '#0AB5A0' }} />;
    if (modality === 'audio')     return <Headphones size={14} style={{ color: '#2563EB' }} />;
    if (modality === 'in_person') return <Building2 size={14} style={{ color: '#374151' }} />;
    return null;
}

function MetaItem({ icon: Icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}:</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NoteShow({ note }) {
    const [copied, setCopied] = useState(false);
    const isMobile = useIsMobile();

    const soap = {
        subjective: note.soap_subjective,
        objective:  note.soap_objective,
        assessment: note.soap_assessment,
        plan:       note.soap_plan,
    };

    const rawText = `SOAP NOTE — ${formatDate(note.session_date)}
Patient: ${note.patient?.first_name} ${note.patient?.last_name}
Provider: ${note.provider?.name}
Duration: ${note.session_duration_minutes} min | ${modalityLabel(note.modality)}

SUBJECTIVE
${note.soap_subjective}

OBJECTIVE
${note.soap_objective}

ASSESSMENT
${note.soap_assessment}

PLAN
${note.soap_plan}`;

    function copyToClipboard() {
        navigator.clipboard.writeText(rawText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <AppLayout>
            <Head title={`Note — ${note.patient?.first_name} ${note.patient?.last_name}`} />

            <div style={{ padding: isMobile ? '16px 16px 32px' : '32px 32px 48px' }}>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <Link href="/notes" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Clinical Notes</Link>
                <ChevronRight size={13} />
                <Link href={`/patients/${note.patient_id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                    {note.patient?.first_name} {note.patient?.last_name}
                </Link>
                <ChevronRight size={13} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatDate(note.session_date)}</span>
            </div>

            {/* Header card */}
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)',
                padding: '20px 24px', marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    <MetaItem icon={User}     label="Patient"  value={`${note.patient?.first_name} ${note.patient?.last_name}`} />
                    <MetaItem icon={User}     label="Provider" value={note.provider?.name} />
                    <MetaItem icon={Calendar} label="Date"     value={formatDate(note.session_date)} />
                    <MetaItem icon={Clock}    label="Duration" value={`${note.session_duration_minutes} min`} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ModalityIcon modality={note.modality} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{modalityLabel(note.modality)}</span>
                    </div>
                    {note.generated_by_ai && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                            background: '#F3E8FF', color: '#7C3AED',
                        }}>
                            <Sparkles size={11} /> AI Generated
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={copyToClipboard}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            height: 36, padding: '0 16px',
                            background: copied ? 'var(--success)' : 'var(--bg-base)',
                            border: `1px solid ${copied ? 'var(--success)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            color: copied ? '#fff' : 'var(--text-secondary)',
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? 'Copied!' : 'Copy Note'}
                    </button>
                    <Link
                        href={`/patients/${note.patient_id}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            height: 36, padding: '0 16px',
                            background: 'var(--accent-teal)', color: '#fff',
                            borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                            fontSize: 13, fontWeight: 600,
                        }}
                    >
                        View Patient
                    </Link>
                </div>
            </div>

            {/* SOAP Note */}
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)',
                padding: 28,
            }}>
                <SoapNoteDisplay
                    soap={soap}
                    generatedByAi={note.generated_by_ai}
                />
            </div>

            {/* Token usage */}
            {note.generated_by_ai && note.ai_prompt_tokens && (
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                    Tokens used: {note.ai_prompt_tokens} prompt + {note.ai_completion_tokens} completion
                </p>
            )}

            </div>
        </AppLayout>
    );
}