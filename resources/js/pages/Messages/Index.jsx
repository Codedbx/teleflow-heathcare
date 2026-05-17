import { useState, useRef, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
    Search, Send, Plus, X, MessageSquare,
    Paperclip, User, ChevronRight, ArrowLeft,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name = '') {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function relativeTime(iso) {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ThreadAvatar({ name, unread }) {
    return (
        <div className="relative flex-shrink-0">
            <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--accent-teal)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
            }}>
                {initials(name)}
            </div>
            {unread > 0 && (
                <span style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 10, height: 10, borderRadius: '50%',
                    background: 'var(--accent-teal)',
                    border: '2px solid var(--bg-surface)',
                }} />
            )}
        </div>
    );
}

// ─── New Message Modal ────────────────────────────────────────────────────────

function NewMessageModal({ patients, onClose, onSent }) {
    const { data, setData, processing, errors, reset } = useForm({
        patient_id: '',
        subject: '',
        body: '',
    });

    function submit(e) {
        e.preventDefault();
        router.post('/messages', data, {
            preserveScroll: true,
            onSuccess: () => { reset(); onSent?.(data.patient_id); onClose(); },
        });
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                width: '100%', maxWidth: 520, padding: 32,
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', margin: 0 }}>
                        New Message
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            To (Patient)
                        </label>
                        <select
                            value={data.patient_id}
                            onChange={e => setData('patient_id', e.target.value)}
                            required
                            style={{
                                width: '100%', height: 40, padding: '0 12px',
                                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                fontSize: 14, color: 'var(--text-primary)',
                                background: 'var(--bg-surface)', outline: 'none',
                            }}
                        >
                            <option value="">Select patient…</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                            ))}
                        </select>
                        {errors.patient_id && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.patient_id}</p>}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            Subject <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={e => setData('subject', e.target.value)}
                            placeholder="e.g. Follow-up from today's session"
                            style={{
                                width: '100%', height: 40, padding: '0 12px',
                                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                fontSize: 14, color: 'var(--text-primary)',
                                background: 'var(--bg-surface)', outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            Message
                        </label>
                        <textarea
                            value={data.body}
                            onChange={e => setData('body', e.target.value)}
                            required
                            rows={5}
                            placeholder="Write your message here…"
                            style={{
                                width: '100%', padding: '10px 12px',
                                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                fontSize: 14, color: 'var(--text-primary)',
                                background: 'var(--bg-surface)', outline: 'none',
                                resize: 'vertical', fontFamily: 'DM Sans, sans-serif',
                                boxSizing: 'border-box',
                            }}
                        />
                        {errors.body && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.body}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
                        <button type="button" onClick={onClose} style={{
                            height: 40, padding: '0 20px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)', background: 'var(--bg-surface)',
                            color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} style={{
                            height: 40, padding: '0 20px', borderRadius: 'var(--radius-sm)',
                            border: 'none', background: 'var(--accent-teal)',
                            color: '#fff', fontSize: 14, fontWeight: 600,
                            cursor: processing ? 'not-allowed' : 'pointer',
                            opacity: processing ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Send size={14} />
                            {processing ? 'Sending…' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesIndex({ threads, patients, active_patient, active_messages }) {
    const [search, setSearch]         = useState('');
    const [showModal, setShowModal]   = useState(false);
    const [messages, setMessages]     = useState(active_messages ?? []);
    const [sending, setSending]       = useState(false);
    const [body, setBody]             = useState('');
    const messagesEndRef              = useRef(null);
    const isMobile                    = useIsMobile();
    // On mobile: show 'list' or 'thread' panel
    const [mobilePanel, setMobilePanel] = useState(active_patient ? 'thread' : 'list');

    useEffect(() => {
        setMessages(active_messages ?? []);
    }, [active_patient?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredThreads = threads.filter(t =>
        t.patient_name.toLowerCase().includes(search.toLowerCase())
    );

    function openThread(patientId) {
        if (isMobile) setMobilePanel('thread');
        router.get(`/messages/${patientId}`, {}, { preserveScroll: false });
    }

    function sendMessage(e) {
        e.preventDefault();
        if (!body.trim() || !active_patient) return;

        setSending(true);
        router.post('/messages', {
            patient_id: active_patient.id,
            body: body.trim(),
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setBody('');
                setSending(false);
                // Reload the thread to get updated messages
                router.reload({ only: ['active_messages', 'threads'] });
            },
            onError: () => setSending(false),
        });
    }

    return (
        <AppLayout fullHeight>
            <Head title="Messages" />

            <div style={{
                display: 'flex', height: isMobile ? 'calc(100vh - 56px)' : '100vh',
                background: 'var(--bg-base)', overflow: 'hidden',
            }}>

                {/* ── Thread List (left) ────────────────────────────────── */}
                <div style={{
                    width: isMobile ? '100%' : 300,
                    flexShrink: 0,
                    background: 'var(--bg-surface)',
                    borderRight: '1px solid var(--border)',
                    display: isMobile && mobilePanel === 'thread' ? 'none' : 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Header */}
                    <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', margin: 0 }}>
                                Messages
                            </h1>
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    height: 32, padding: '0 12px',
                                    background: 'var(--accent-teal)', color: '#fff',
                                    border: 'none', borderRadius: 'var(--radius-sm)',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <Plus size={13} /> New
                            </button>
                        </div>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search patients…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: '100%', height: 34, padding: '0 10px 0 30px',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                    fontSize: 13, color: 'var(--text-primary)',
                                    background: 'var(--bg-base)', outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    </div>

                    {/* Threads */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredThreads.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center' }}>
                                <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
                                    {search ? 'No results' : 'No messages yet'}
                                </p>
                            </div>
                        ) : filteredThreads.map(thread => {
                            const isActive = active_patient?.id === thread.patient_id;
                            return (
                                <button
                                    key={thread.patient_id}
                                    onClick={() => openThread(thread.patient_id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center',
                                        gap: 12, padding: '12px 16px', textAlign: 'left',
                                        border: 'none', borderBottom: '1px solid var(--border)',
                                        background: isActive ? 'var(--accent-light)' : 'transparent',
                                        cursor: 'pointer',
                                        borderLeft: isActive ? '3px solid var(--accent-teal)' : '3px solid transparent',
                                    }}
                                >
                                    <ThreadAvatar name={thread.patient_name} unread={thread.unread_count} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                            <span style={{
                                                fontSize: 13, fontWeight: thread.unread_count > 0 ? 700 : 500,
                                                color: 'var(--text-primary)',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {thread.patient_name}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 4 }}>
                                                {relativeTime(thread.last_at)}
                                            </span>
                                        </div>
                                        <p style={{
                                            fontSize: 12, color: 'var(--text-secondary)', margin: 0,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {thread.preview ?? 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Message View (right) ─────────────────────────────── */}
                <div style={{
                    flex: 1, display: isMobile && mobilePanel === 'list' ? 'none' : 'flex',
                    flexDirection: 'column', overflow: 'hidden',
                }}>
                    {!active_patient ? (
                        /* Empty state */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'var(--accent-light)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <MessageSquare size={28} style={{ color: 'var(--accent-teal)' }} />
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                Select a conversation
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                                or start a new message
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                                    height: 40, padding: '0 20px',
                                    background: 'var(--accent-teal)', color: '#fff',
                                    border: 'none', borderRadius: 'var(--radius-sm)',
                                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <Plus size={16} /> New Message
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Thread header */}
                            <div style={{
                                padding: isMobile ? '12px 16px' : '16px 24px',
                                background: 'var(--bg-surface)',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {isMobile && (
                                    <button
                                        onClick={() => setMobilePanel('list')}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: 32, height: 32, border: 'none',
                                            background: 'var(--bg-base)', borderRadius: 8,
                                            cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0,
                                        }}
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        background: 'var(--accent-teal)', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 600,
                                    }}>
                                        {initials(`${active_patient.first_name} ${active_patient.last_name}`)}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {active_patient.first_name} {active_patient.last_name}
                                        </p>
                                        {active_patient.provider && (
                                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                                                Provider: {active_patient.provider}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <a
                                    href={`/patients/${active_patient.id}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 13, color: 'var(--accent-teal)', fontWeight: 500,
                                        textDecoration: 'none',
                                    }}
                                >
                                    View Patient Profile <ChevronRight size={14} />
                                </a>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 40 }}>
                                        No messages yet. Start the conversation.
                                    </div>
                                )}
                                {messages.map(msg => {
                                    const isProvider = msg.sender_type === 'provider';
                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isProvider ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <div style={{
                                                maxWidth: '70%',
                                                padding: '12px 16px',
                                                borderRadius: isProvider
                                                    ? '16px 16px 4px 16px'
                                                    : '16px 16px 16px 4px',
                                                background: isProvider ? 'var(--accent-teal)' : 'var(--bg-surface)',
                                                border: isProvider ? 'none' : '1px solid var(--border)',
                                                color: isProvider ? '#fff' : 'var(--text-primary)',
                                                fontSize: 14,
                                                lineHeight: 1.5,
                                                boxShadow: 'var(--shadow-card)',
                                            }}>
                                                {msg.body}
                                            </div>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                                {msg.sender_name} · {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            <div style={{
                                padding: '16px 24px',
                                background: 'var(--bg-surface)',
                                borderTop: '1px solid var(--border)',
                            }}>
                                <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <textarea
                                            value={body}
                                            onChange={e => setBody(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage(e);
                                                }
                                            }}
                                            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                                            rows={1}
                                            style={{
                                                width: '100%', padding: '10px 44px 10px 14px',
                                                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                                fontSize: 14, color: 'var(--text-primary)',
                                                background: 'var(--bg-base)', outline: 'none',
                                                resize: 'none', fontFamily: 'DM Sans, sans-serif',
                                                boxSizing: 'border-box', maxHeight: 120, lineHeight: 1.5,
                                            }}
                                        />
                                        {/* Attachment icon — disabled in demo */}
                                        <button
                                            type="button"
                                            title="Attachments not available in demo"
                                            style={{
                                                position: 'absolute', right: 10, bottom: 10,
                                                background: 'none', border: 'none',
                                                color: 'var(--text-muted)', cursor: 'not-allowed',
                                            }}
                                        >
                                            <Paperclip size={16} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sending || !body.trim()}
                                        style={{
                                            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                                            background: body.trim() ? 'var(--accent-teal)' : 'var(--border)',
                                            border: 'none', color: '#fff', cursor: body.trim() ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showModal && (
                <NewMessageModal
                    patients={patients}
                    onClose={() => setShowModal(false)}
                    onSent={(patientId) => router.get(`/messages/${patientId}`)}
                />
            )}
        </AppLayout>
    );
}