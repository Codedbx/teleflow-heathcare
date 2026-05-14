import { useState, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import {
    Search, Filter, UserPlus, MoreHorizontal, ChevronLeft, ChevronRight,
    Eye, FileText, ShieldCheck, Edit2, Users, CheckCircle, Clock, UserX,
    ArrowUpDown, Phone, Mail, Link2, Copy, Check
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name) {
    return name
        .split(' ')
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getAge(dob) {
    if (!dob) return '—';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

function formatDob(dob) {
    if (!dob) return '—';
    const d = new Date(dob);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const avatarColors = [
    { bg: '#E6F9F7', text: '#0AB5A0' },
    { bg: '#FEF3C7', text: '#D97706' },
    { bg: '#EDE9FE', text: '#7C3AED' },
    { bg: '#FCE7F3', text: '#BE185D' },
    { bg: '#DBEAFE', text: '#2563EB' },
    { bg: '#DCFCE7', text: '#16A34A' },
];

function PatientAvatar({ name, size = 36 }) {
    const idx = (name?.charCodeAt(0) ?? 0) % avatarColors.length;
    const { bg, text } = avatarColors[idx];
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            backgroundColor: bg, color: text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            fontSize: size * 0.38, flexShrink: 0, letterSpacing: '0.02em'
        }}>
            {getInitials(name || 'Unknown Patient')}
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        active:         { label: 'Active',          bg: '#DCFCE7', color: '#15803D' },
        inactive:       { label: 'Inactive',         bg: '#F3F4F6', color: '#6B7280' },
        pending_intake: { label: 'Pending Intake',   bg: '#FEF3C7', color: '#D97706' },
    };
    const { label, bg, color } = map[status] ?? { label: status, bg: '#F3F4F6', color: '#6B7280' };
    return (
        <span style={{
            backgroundColor: bg, color, borderRadius: 999,
            padding: '3px 10px', fontSize: 12, fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
}

function InsuranceBadge({ insurance }) {
    if (!insurance) return <span style={{ color: '#9CA3AF', fontSize: 13 }}>—</span>;

    const typeMap = {
        medi_cal:   { label: 'Medi-Cal',   bg: '#EDE9FE', color: '#7C3AED' },
        commercial: { label: insurance.commercial_payer || 'Commercial', bg: '#DBEAFE', color: '#2563EB' },
        self_pay:   { label: 'Self-Pay',   bg: '#F3F4F6', color: '#6B7280' },
        both:       null,
    };

    if (insurance.insurance_type === 'both') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#EDE9FE', color: '#7C3AED', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                    Medi-Cal
                </span>
                <span style={{ backgroundColor: '#DBEAFE', color: '#2563EB', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                    {insurance.commercial_payer || 'Commercial'}
                </span>
                <span style={{ backgroundColor: '#E6F9F7', color: '#0AB5A0', borderRadius: 999, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                    Dual
                </span>
            </div>
        );
    }

    const style = typeMap[insurance.insurance_type] ?? { label: insurance.insurance_type, bg: '#F3F4F6', color: '#6B7280' };
    return (
        <span style={{ backgroundColor: style.bg, color: style.color, borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
            {style.label}
        </span>
    );
}

function ThreeDotsMenu({ patient }) {
    const [open, setOpen] = useState(false);

    const actions = [
        { icon: Eye,        label: 'View Profile',       href: `/patients/${patient.id}` },
        { icon: Edit2,      label: 'Edit Patient',        href: `/patients/${patient.id}/edit` },
        { icon: FileText,   label: 'Start Note',          href: `/notes/assistant?patient=${patient.id}` },
        { icon: ShieldCheck, label: 'Validate Billing',   href: `/billing/validator?patient=${patient.id}` },
    ];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                onBlur={() => setTimeout(() => setOpen(false), 300)}
                style={{
                    width: 32, height: 32, border: 'none',
                    background: 'transparent', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#9CA3AF',
                    transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
            >
                <MoreHorizontal size={16} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 36, zIndex: 50,
                    background: '#fff', border: '1px solid #E5E7EB',
                    borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    padding: '6px 0', minWidth: 180,
                }}>
                    {actions.map(({ icon: Icon, label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '9px 14px', color: '#374151',
                                textDecoration: 'none', fontSize: 13,
                                fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Icon size={14} style={{ color: '#6B7280' }} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function EmptyState({ hasSearch }) {
    return (
        <tr>
            <td colSpan={8}>
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#F3F4F6', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <Users size={24} color="#9CA3AF" />
                    </div>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 15, color: '#374151', margin: '0 0 6px' }}>
                        {hasSearch ? 'No patients match your search' : 'No patients yet'}
                    </p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', margin: 0 }}>
                        {hasSearch ? 'Try adjusting your filters.' : 'Add your first patient to get started.'}
                    </p>
                </div>
            </td>
        </tr>
    );
}



function IntakeLinkButton() {
    const [loading, setLoading]   = useState(false);
    const [url, setUrl]           = useState(null);
    const [copied, setCopied]     = useState(false);
    const [showModal, setShowModal] = useState(false);
 
    async function generate() {
        setLoading(true);
        try {
            const res = await fetch('/patients/intake-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            setUrl(data.url);
            setShowModal(true);
        } catch (e) {
            alert('Failed to generate link. Please try again.');
        } finally {
            setLoading(false);
        }
    }
 
    function copy() {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
 
    return (
        <>
            <button
                onClick={generate}
                disabled={loading}
                style={{
                    height: 40, padding: '0 18px',
                    backgroundColor: '#fff', color: '#0AB5A0',
                    borderRadius: 8, border: '1px solid #0AB5A0',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                }}
            >
                <Link2 size={15} />
                {loading ? 'Generating…' : 'Send Intake Link'}
            </button>
 
            {showModal && url && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: 32,
                        width: '100%', maxWidth: 500,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827', fontFamily: 'Sora, sans-serif' }}>
                            Intake Link Generated
                        </h2>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6B7280' }}>
                            Share this link with the patient. It expires in 7 days and can only be used once.
                        </p>
 
                        <div style={{
                            padding: '10px 14px', borderRadius: 8,
                            background: '#F9FAFB', border: '1px solid #E5E7EB',
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                            color: '#374151', wordBreak: 'break-all',
                            marginBottom: 16,
                        }}>
                            {url}
                        </div>
 
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    height: 38, padding: '0 18px',
                                    border: '1px solid #E5E7EB', borderRadius: 6,
                                    background: '#fff', color: '#374151',
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={copy}
                                style={{
                                    height: 38, padding: '0 18px',
                                    border: 'none', borderRadius: 6,
                                    background: copied ? '#10B981' : '#0AB5A0',
                                    color: '#fff',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    transition: 'background 0.2s',
                                }}
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PatientsIndex({ patients, filters, stats }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortBy, setSortBy] = useState(filters?.sort ?? 'created_at');
    const [sortDir, setSortDir] = useState(filters?.dir ?? 'desc');

    const patientList = patients?.data ?? [];
    const meta = patients?.meta ?? {};
    const links = patients?.links ?? {};

    // Debounced search
    const handleSearch = useCallback((value) => {
        setSearch(value);
        router.get('/patients', { search: value, status, sort: sortBy, dir: sortDir }, {
            preserveState: true, replace: true,
        });
    }, [status, sortBy, sortDir]);

    const handleStatusFilter = (val) => {
        setStatus(val);
        router.get('/patients', { search, status: val, sort: sortBy, dir: sortDir }, {
            preserveState: true, replace: true,
        });
    };

    const handleSort = (col) => {
        const newDir = (sortBy === col && sortDir === 'asc') ? 'desc' : 'asc';
        setSortBy(col);
        setSortDir(newDir);
        router.get('/patients', { search, status, sort: col, dir: newDir }, {
            preserveState: true, replace: true,
        });
    };

    const allChecked = patientList.length > 0 && selectedIds.length === patientList.length;
    const toggleAll = () => setSelectedIds(allChecked ? [] : patientList.map(p => p.id));
    const toggleOne = (id) => setSelectedIds(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

    const statusOptions = [
        { value: '',               label: 'All Patients' },
        { value: 'active',         label: 'Active' },
        { value: 'inactive',       label: 'Inactive' },
        { value: 'pending_intake', label: 'Pending Intake' },
    ];

    const SortableHeader = ({ col, label }) => (
        <th
            onClick={() => handleSort(col)}
            style={{
                padding: '12px 16px', textAlign: 'left',
                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                fontWeight: 600, color: '#6B7280', textTransform: 'uppercase',
                letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {label}
                <ArrowUpDown size={12} style={{ opacity: sortBy === col ? 1 : 0.4 }} />
            </div>
        </th>
    );

    return (
        <AppLayout>
            <Head title="Patients" />

            <div style={{ padding: '32px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h1 style={{
                            fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700,
                            color: '#111827', margin: 0,
                        }}>
                            Patients
                        </h1>
                        {meta.total != null && (
                            <span style={{
                                backgroundColor: '#E6F9F7', color: '#0AB5A0',
                                borderRadius: 999, padding: '3px 12px',
                                fontSize: 13, fontWeight: 600,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                                {meta.total}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
                            }} />
                            <input
                                type="text"
                                placeholder="Search patients…"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                style={{
                                    height: 40, width: 300, paddingLeft: 38, paddingRight: 14,
                                    border: '1px solid #E5E7EB', borderRadius: 8,
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#111827',
                                    background: '#fff', outline: 'none',
                                    transition: 'box-shadow 0.15s, border-color 0.15s',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#0AB5A0'; e.target.style.boxShadow = '0 0 0 3px rgba(10,181,160,0.15)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Filter */}
                        <div style={{ position: 'relative' }}>
                            <Filter size={14} style={{
                                position: 'absolute', left: 11, top: '50%',
                                transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none', zIndex: 1,
                            }} />
                            <select
                                value={status}
                                onChange={e => handleStatusFilter(e.target.value)}
                                style={{
                                    height: 40, paddingLeft: 32, paddingRight: 36,
                                    border: '1px solid #E5E7EB', borderRadius: 8,
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#374151',
                                    background: '#fff', cursor: 'pointer', appearance: 'none',
                                    outline: 'none',
                                }}
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        
                         <IntakeLinkButton />

                        {/* Add Patient */}
                        <Link
                            href="/patients/new"
                            style={{
                                height: 40, padding: '0 18px',
                                backgroundColor: '#0AB5A0', color: '#fff',
                                borderRadius: 8, border: 'none',
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
                                textDecoration: 'none', cursor: 'pointer',
                                transition: 'background 0.15s',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#089888'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0AB5A0'}
                        >
                            <UserPlus size={16} />
                            Add Patient
                        </Link>
                    </div>
                </div>

                {/* ── Stats Strip ── */}
                {stats && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 16, marginBottom: 24,
                    }}>
                        {[
                            { label: 'Total Patients',    value: stats.total,         icon: Users,       color: '#0AB5A0', bg: '#E6F9F7' },
                            { label: 'Active',            value: stats.active,         icon: CheckCircle, color: '#10B981', bg: '#DCFCE7' },
                            { label: 'Pending Intake',    value: stats.pending,        icon: Clock,       color: '#F59E0B', bg: '#FEF3C7' },
                            { label: 'Inactive',          value: stats.inactive,       icon: UserX,       color: '#6B7280', bg: '#F3F4F6' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} style={{
                                background: '#fff', borderRadius: 12,
                                border: '1px solid #E5E7EB', padding: '16px 20px',
                                display: 'flex', alignItems: 'center', gap: 14,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={20} color={color} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
                                        {value ?? '—'}
                                    </div>
                                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                                        {label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Table Card ── */}
                <div style={{
                    background: '#fff', borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}>

                    {/* Bulk action bar */}
                    {selectedIds.length > 0 && (
                        <div style={{
                            padding: '10px 20px', background: '#E6F9F7',
                            borderBottom: '1px solid #B2EDE8',
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#0AB5A0' }}>
                                {selectedIds.length} selected
                            </span>
                            <button style={ghostBtn}>Run Billing Validation</button>
                            <button style={ghostBtn}>Export</button>
                            <button onClick={() => setSelectedIds([])} style={{ ...ghostBtn, marginLeft: 'auto', color: '#6B7280' }}>
                                Clear selection
                            </button>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                                    <th style={{ padding: '12px 16px', width: 44 }}>
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            onChange={toggleAll}
                                            style={{ accentColor: '#0AB5A0', width: 16, height: 16, cursor: 'pointer' }}
                                        />
                                    </th>
                                    <SortableHeader col="last_name" label="Patient" />
                                    <th style={plainTh}>DOB / Age</th>
                                    <th style={plainTh}>Insurance</th>
                                    <SortableHeader col="provider" label="Provider" />
                                    <SortableHeader col="status" label="Status" />
                                    <SortableHeader col="last_visit" label="Last Visit" />
                                    <th style={{ ...plainTh, width: 48 }} />
                                </tr>
                            </thead>
                            <tbody>
                                {patientList.length === 0 ? (
                                    <EmptyState hasSearch={!!search || !!status} />
                                ) : patientList.map((patient, i) => (
                                    <tr
                                        key={patient.id}
                                        style={{
                                            borderBottom: i < patientList.length - 1 ? '1px solid #F3F4F6' : 'none',
                                            background: selectedIds.includes(patient.id) ? '#F0FDFB' : '#fff',
                                            transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={e => { if (!selectedIds.includes(patient.id)) e.currentTarget.style.background = '#F9FAFB'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = selectedIds.includes(patient.id) ? '#F0FDFB' : '#fff'; }}
                                    >
                                        {/* Checkbox */}
                                        <td style={{ padding: '0 16px', height: 52 }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(patient.id)}
                                                onChange={() => toggleOne(patient.id)}
                                                style={{ accentColor: '#0AB5A0', width: 16, height: 16, cursor: 'pointer' }}
                                            />
                                        </td>

                                        {/* Avatar + Name */}
                                        <td style={{ padding: '0 16px', height: 52 }}>
                                            <Link href={`/patients/${patient.id}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <PatientAvatar name={`${patient.first_name} ${patient.last_name}`} size={34} />
                                                    <div>
                                                        <div style={{
                                                            fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                                                            fontWeight: 600, color: '#111827',
                                                        }}>
                                                            {patient.first_name} {patient.last_name}
                                                        </div>
                                                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9CA3AF' }}>
                                                            {patient.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>

                                        {/* DOB / Age */}
                                        <td style={{ padding: '0 16px', height: 52 }}>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151' }}>
                                                {formatDob(patient.dob)}
                                            </div>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9CA3AF' }}>
                                                {getAge(patient.dob)} yrs
                                            </div>
                                        </td>

                                        {/* Insurance */}
                                        <td style={{ padding: '0 16px', height: 52 }}>
                                            <InsuranceBadge insurance={patient.insurance} />
                                        </td>

                                        {/* Provider */}
                                        <td style={{ padding: '0 16px', height: 52 }}>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151' }}>
                                                {patient.provider?.name ?? <span style={{ color: '#9CA3AF' }}>Unassigned</span>}
                                            </div>
                                            {patient.provider?.provider_type && (
                                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF' }}>
                                                    {patient.provider.provider_type}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td style={{ padding: '0 16px', height: 52 }}>
                                            <StatusBadge status={patient.status} />
                                        </td>

                                        {/* Last Visit */}
                                        <td style={{ padding: '0 16px', height: 52 }}>
                                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151' }}>
                                                {formatDate(patient.last_visit)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '0 12px', height: 52, textAlign: 'right' }}>
                                            <ThreeDotsMenu patient={patient} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {meta.last_page > 1 && (
                        <div style={{
                            padding: '14px 20px',
                            borderTop: '1px solid #E5E7EB',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#F9FAFB',
                        }}>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280' }}>
                                Showing {meta.from}–{meta.to} of {meta.total} patients
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Link
                                    href={links.prev ?? '#'}
                                    style={{
                                        ...pagBtn,
                                        opacity: links.prev ? 1 : 0.4,
                                        pointerEvents: links.prev ? 'auto' : 'none',
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                </Link>
                                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
                                    <Link
                                        key={page}
                                        href={`/patients?page=${page}&search=${search}&status=${status}`}
                                        style={{
                                            ...pagBtn,
                                            backgroundColor: page === meta.current_page ? '#0AB5A0' : 'transparent',
                                            color: page === meta.current_page ? '#fff' : '#374151',
                                            fontWeight: page === meta.current_page ? 600 : 400,
                                        }}
                                    >
                                        {page}
                                    </Link>
                                ))}
                                <Link
                                    href={links.next ?? '#'}
                                    style={{
                                        ...pagBtn,
                                        opacity: links.next ? 1 : 0.4,
                                        pointerEvents: links.next ? 'auto' : 'none',
                                    }}
                                >
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// ─── Shared inline style snippets ────────────────────────────────────────────

const plainTh = {
    padding: '12px 16px', textAlign: 'left',
    fontFamily: 'DM Sans, sans-serif', fontSize: 12,
    fontWeight: 600, color: '#6B7280', textTransform: 'uppercase',
    letterSpacing: '0.04em', whiteSpace: 'nowrap',
};

const ghostBtn = {
    height: 32, padding: '0 14px', border: '1px solid #B2EDE8',
    borderRadius: 6, background: '#fff', color: '#0AB5A0',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
};

const pagBtn = {
    width: 32, height: 32, display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: 6,
    border: '1px solid #E5E7EB', background: '#fff',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151',
    textDecoration: 'none', cursor: 'pointer',
    transition: 'background 0.1s',
};