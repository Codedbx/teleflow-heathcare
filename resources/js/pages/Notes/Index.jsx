import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { FileText, Sparkles, Video, Headphones, Building2, ChevronRight } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function modalityIcon(modality) {
    if (modality === 'video')     return <Video size={13} />;
    if (modality === 'audio')     return <Headphones size={13} />;
    if (modality === 'in_person') return <Building2 size={13} />;
    return null;
}

function modalityLabel(modality) {
    return { video: 'Video', audio: 'Audio-Only', in_person: 'In-Person' }[modality] ?? modality;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NotesIndex({ notes }) {
    const noteList = notes?.data ?? [];
    const meta     = notes?.meta ?? {};

    return (
        <AppLayout>
            <Head title="Clinical Notes" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>
                        Clinical Notes
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                        {meta.total ?? noteList.length} notes on record
                    </p>
                </div>
                <Link
                    href="/notes/assistant"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        height: 40, padding: '0 20px',
                        background: 'var(--accent-teal)', color: '#fff',
                        borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                        fontSize: 14, fontWeight: 600,
                    }}
                >
                    <Sparkles size={15} />
                    Generate New Note
                </Link>
            </div>

            {/* Notes list */}
            {noteList.length === 0 ? (
                <div style={{
                    background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)', padding: '60px 32px',
                    textAlign: 'center',
                }}>
                    <FileText size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No notes yet</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                        Use the AI Note Assistant to generate your first SOAP note.
                    </p>
                    <Link
                        href="/notes/assistant"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            height: 38, padding: '0 18px',
                            background: 'var(--accent-teal)', color: '#fff',
                            borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                            fontSize: 13, fontWeight: 600,
                        }}
                    >
                        <Sparkles size={14} /> Open AI Assistant
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {noteList.map(note => (
                        <div
                            key={note.id}
                            style={{
                                background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-card)',
                                padding: '18px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                            }}
                        >
                            {/* Date */}
                            <div style={{ width: 90, flexShrink: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {formatDate(note.session_date)}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                                    {note.duration_minutes} min
                                </p>
                            </div>

                            {/* Divider */}
                            <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />

                            {/* Patient */}
                            <div style={{ width: 160, flexShrink: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {note.patient?.first_name} {note.patient?.last_name}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                                    {note.provider?.name}
                                </p>
                            </div>

                            {/* CPT + Modality */}
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                {note.cpt_code && (
                                    <span style={{
                                        fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                                        padding: '3px 8px', borderRadius: 4,
                                        background: 'var(--bg-base)', border: '1px solid var(--border)',
                                        color: 'var(--text-secondary)',
                                    }}>
                                        {note.cpt_code}
                                    </span>
                                )}
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontSize: 11, padding: '3px 8px', borderRadius: 99,
                                    background: 'var(--accent-light)', color: 'var(--accent-teal)',
                                    fontWeight: 500,
                                }}>
                                    {modalityIcon(note.modality)}
                                    {modalityLabel(note.modality)}
                                </span>
                                {note.generated_by_ai && (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        fontSize: 11, padding: '3px 8px', borderRadius: 99,
                                        background: '#F3E8FF', color: '#7C3AED',
                                        fontWeight: 500,
                                    }}>
                                        <Sparkles size={10} /> AI
                                    </span>
                                )}
                            </div>

                            {/* Note preview */}
                            <p style={{
                                flex: 1, margin: 0, fontSize: 13, color: 'var(--text-secondary)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {note.subjective_preview ?? 'No preview available'}
                            </p>

                            {/* Action */}
                            <Link
                                href={`/notes/${note.id}`}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontSize: 13, color: 'var(--accent-teal)', fontWeight: 500,
                                    textDecoration: 'none', flexShrink: 0,
                                }}
                            >
                                View Note <ChevronRight size={14} />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                    {notes.links?.map((link, i) => (
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                style={{
                                    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                                    background: link.active ? 'var(--accent-teal)' : 'var(--bg-surface)',
                                    color: link.active ? '#fff' : 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                    fontSize: 13, textDecoration: 'none',
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                style={{
                                    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-surface)', color: 'var(--text-muted)',
                                    border: '1px solid var(--border)', fontSize: 13,
                                    opacity: 0.5,
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}
        </AppLayout>
    );
}