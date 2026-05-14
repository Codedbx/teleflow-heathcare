import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { ChevronRight, Save, X } from 'lucide-react';

export default function PatientEdit({ patient, providers }) {
    const { data, setData, processing, errors, put } = useForm({
        first_name:           patient.first_name ?? '',
        last_name:            patient.last_name  ?? '',
        phone:                patient.phone       ?? '',
        email:                patient.email       ?? '',
        status:               patient.status      ?? 'active',
        assigned_provider_id: patient.assigned_provider_id ?? '',
        modality_preference:  patient.modality_preference  ?? '',
    });

    function submit(e) {
        e.preventDefault();
        put(`/patients/${patient.id}`, {
            onSuccess: () => router.visit(`/patients/${patient.id}`),
        });
    }

    const inputStyle = {
        width: '100%', height: 40, padding: '0 12px',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        fontSize: 14, color: 'var(--text-primary)',
        background: 'var(--bg-surface)', outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block', fontSize: 13, fontWeight: 500,
        color: 'var(--text-secondary)', marginBottom: 6,
    };

    const errorStyle = { color: 'var(--danger)', fontSize: 12, marginTop: 4 };

    return (
        <AppLayout>
            <Head title={`Edit — ${patient.first_name} ${patient.last_name}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
                <Link href="/patients" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Patients</Link>
                <ChevronRight size={13} />
                <Link href={`/patients/${patient.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                    {patient.first_name} {patient.last_name}
                </Link>
                <ChevronRight size={13} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Edit</span>
            </div>

            <div style={{ maxWidth: 640 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', margin: '0 0 24px' }}>
                    Edit Patient
                </h1>

                <form onSubmit={submit}>
                    <div style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)',
                        padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
                    }}>

                        {/* Name row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>First Name</label>
                                <input style={inputStyle} value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                                {errors.first_name && <p style={errorStyle}>{errors.first_name}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Last Name</label>
                                <input style={inputStyle} value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                                {errors.last_name && <p style={errorStyle}>{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Contact */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input style={inputStyle} type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                {errors.email && <p style={errorStyle}>{errors.email}</p>}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select style={{ ...inputStyle }} value={data.status} onChange={e => setData('status', e.target.value)}>
                                <option value="active">Active</option>
                                <option value="pending_intake">Pending Intake</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Provider */}
                        <div>
                            <label style={labelStyle}>Assigned Provider</label>
                            <select style={{ ...inputStyle }} value={data.assigned_provider_id} onChange={e => setData('assigned_provider_id', e.target.value)}>
                                <option value="">Unassigned</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} {p.provider_type ? `(${p.provider_type})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Modality */}
                        <div>
                            <label style={labelStyle}>Session Modality Preference</label>
                            <select style={{ ...inputStyle }} value={data.modality_preference} onChange={e => setData('modality_preference', e.target.value)}>
                                <option value="">No preference</option>
                                <option value="video">Live Video</option>
                                <option value="audio">Audio-Only</option>
                                <option value="in_person">In-Person</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                            <Link
                                href={`/patients/${patient.id}`}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    height: 40, padding: '0 20px',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-surface)', color: 'var(--text-primary)',
                                    fontSize: 14, fontWeight: 500, textDecoration: 'none',
                                }}
                            >
                                <X size={14} /> Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    height: 40, padding: '0 20px',
                                    border: 'none', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--accent-teal)', color: '#fff',
                                    fontSize: 14, fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: processing ? 0.7 : 1,
                                }}
                            >
                                <Save size={14} />
                                {processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}