import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
    Receipt, Filter, RefreshCw, ChevronLeft, ChevronRight,
    CheckCircle, AlertTriangle, XCircle, HelpCircle, Search,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const VALIDATION_BADGES = {
    clean:       { label: 'Clean',       color: 'var(--success)', bg: '#F0FDF4', icon: <CheckCircle size={12} /> },
    warning:     { label: 'Warning',     color: 'var(--warning)', bg: '#FFFBEB', icon: <AlertTriangle size={12} /> },
    error:       { label: 'Error',       color: 'var(--danger)',  bg: '#FEF2F2', icon: <XCircle size={12} /> },
    not_checked: { label: 'Not Checked', color: 'var(--text-muted)', bg: 'var(--bg-base)', icon: <HelpCircle size={12} /> },
};

const CLAIM_STATUS_BADGES = {
    draft:      { label: 'Draft',      color: 'var(--text-muted)', bg: '#F3F4F6' },
    validated:  { label: 'Validated',  color: '#3B82F6',           bg: '#EFF6FF' },
    submitted:  { label: 'Submitted',  color: 'var(--warning)',    bg: '#FFFBEB' },
    paid:       { label: 'Paid',       color: 'var(--success)',    bg: '#F0FDF4' },
    denied:     { label: 'Denied',     color: 'var(--danger)',     bg: '#FEF2F2' },
    appealing:  { label: 'Appealing',  color: '#8B5CF6',           bg: '#F5F3FF' },
};

function Badge({ config }) {
    if (!config) return '—';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 9px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            color: config.color, background: config.bg,
        }}>
            {config.icon && config.icon}
            {config.label}
        </span>
    );
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const COLUMNS = [
    { key: 'patient',      label: 'Patient',       width: '180px' },
    { key: 'service_date', label: 'Service Date',  width: '120px' },
    { key: 'cpt_code',     label: 'CPT',           width: '90px',  mono: true },
    { key: 'modifier',     label: 'Mod',           width: '65px',  mono: true },
    { key: 'pos_code',     label: 'POS',           width: '60px',  mono: true },
    { key: 'primary_payer',label: 'Payer',         width: '120px' },
    { key: 'amount',       label: 'Amount',        width: '90px',  align: 'right' },
    { key: 'validation',   label: 'Validation',    width: '110px' },
    { key: 'status',       label: 'Status',        width: '110px' },
    { key: 'actions',      label: '',              width: '80px',  align: 'right' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Claims({ claims, patients = [], providers = [], filters = {} }) {
    const [selected, setSelected]   = useState([]);
    const [localFilters, setF]      = useState(filters);
    const [batchLoading, setBatch]  = useState(false);
    const [detailClaim, setDetail]  = useState(null);
    const isMobile = useIsMobile();

    const setFilter = (key, val) => setF(prev => ({ ...prev, [key]: val }));

    const applyFilters = () => {
        router.get('/billing/claims', localFilters, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setF({});
        router.get('/billing/claims', {}, { preserveState: true, replace: true });
    };

    const handleBatchValidate = async () => {
        if (!selected.length) { toast.info('Select at least one claim to validate.'); return; }
        setBatch(true);
        try {
            const res = await fetch('/billing/claims/batch-validate', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept':       'application/json',
                },
                body: JSON.stringify({ claim_ids: selected }),
            });
            const data = await res.json();
            toast.success(`${selected.length} claim(s) re-validated.`);
            setSelected([]);
            router.reload({ only: ['claims'] });
        } catch {
            toast.error('Batch validation failed.');
        } finally {
            setBatch(false);
        }
    };

    const handleSelect = (id, checked) => {
        setSelected(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
    };

    const pagerData = claims;

    const patientOptions  = patients.map(p => ({ value: String(p.id), label: p.name }));
    const providerOptions = providers.map(p => ({ value: String(p.id), label: p.name }));

    // ─── Cell renderer ───────────────────────────────────────────────────────

    const renderCell = (row, col) => {
        switch (col.key) {
            case 'patient':
                return (
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {row.patient?.first_name} {row.patient?.last_name}
                    </span>
                );
            case 'service_date':
                return row.service_date
                    ? new Date(row.service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';
            case 'cpt_code':
                return (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                        {row.cpt_code || '—'}
                    </span>
                );
            case 'modifier':
                return (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                        {row.modifier || '—'}
                    </span>
                );
            case 'pos_code':
                return (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                        {row.pos_code || '—'}
                    </span>
                );
            case 'primary_payer': {
                const labels = {
                    medi_cal:   'Medi-Cal',
                    commercial: 'Commercial',
                    both:       'Dual-Payer',
                    self_pay:   'Self-Pay',
                };
                return (
                    <span>
                        {labels[row.primary_payer] || row.primary_payer || '—'}
                        {row.primary_payer === 'both' && (
                            <span style={{
                                marginLeft: '5px',
                                fontSize: '10px',
                                fontWeight: 700,
                                background: 'var(--accent-light)',
                                color: 'var(--accent-teal)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                            }}>
                                DUAL
                            </span>
                        )}
                    </span>
                );
            }
            case 'amount':
                return row.amount != null
                    ? <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>${parseFloat(row.amount).toFixed(2)}</span>
                    : '—';
            case 'validation':
                return <Badge config={VALIDATION_BADGES[row.validation_status]} />;
            case 'status':
                return <Badge config={CLAIM_STATUS_BADGES[row.claim_status]} />;
            case 'actions':
                return (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <ActionBtn
                            label="View"
                            onClick={e => { e.stopPropagation(); setDetail(row); }}
                        />
                        <ActionBtn
                            label="Validate"
                            onClick={e => {
                                e.stopPropagation();
                                router.visit(`/billing/validator?claim_id=${row.id}`);
                            }}
                            primary
                        />
                    </div>
                );
            default:
                return row[col.key] ?? '—';
        }
    };

    return (
        <AppLayout title="Claims">
            <div style={{ padding: isMobile ? '16px 16px 48px' : '32px 32px 48px' }}>

                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                            background: '#FFF7ED',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Receipt size={20} color="var(--warning)" />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                Claims
                            </h1>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                                {pagerData?.total ?? 0} total claims
                            </p>
                        </div>
                    </div>
                    {selected.length > 0 && (
                        <button
                            onClick={handleBatchValidate}
                            disabled={batchLoading}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '7px',
                                padding: '9px 16px',
                                background: 'var(--accent-teal)', color: '#fff',
                                border: 'none', borderRadius: 'var(--radius-sm)',
                                fontSize: '13.5px', fontWeight: 600,
                                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                            }}
                        >
                            <RefreshCw size={14} style={batchLoading ? { animation: 'spin 0.8s linear infinite' } : {}} />
                            Batch Validate ({selected.length})
                        </button>
                    )}
                </div>

                {/* Filter bar */}
                <div style={{ ...filterCard, marginBottom: '16px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: '10px',
                    }}>
                        <FormField label="Date From">
                            <input
                                type="date"
                                value={localFilters.date_from || ''}
                                onChange={e => setFilter('date_from', e.target.value)}
                                style={miniInput}
                            />
                        </FormField>
                        <FormField label="Date To">
                            <input
                                type="date"
                                value={localFilters.date_to || ''}
                                onChange={e => setFilter('date_to', e.target.value)}
                                style={miniInput}
                            />
                        </FormField>
                        <Select
                            label="Patient"
                            placeholder="All patients"
                            options={patientOptions}
                            value={String(localFilters.patient_id || '')}
                            onChange={v => setFilter('patient_id', v)}
                        />
                        <Select
                            label="Payer"
                            placeholder="All payers"
                            options={[
                                { value: 'medi_cal',   label: 'Medi-Cal' },
                                { value: 'commercial', label: 'Commercial' },
                                { value: 'both',       label: 'Dual-Payer' },
                                { value: 'self_pay',   label: 'Self-Pay' },
                            ]}
                            value={localFilters.payer || ''}
                            onChange={v => setFilter('payer', v)}
                        />
                        <Select
                            label="Validation"
                            placeholder="Any"
                            options={[
                                { value: 'clean',       label: 'Clean' },
                                { value: 'warning',     label: 'Warning' },
                                { value: 'error',       label: 'Error' },
                                { value: 'not_checked', label: 'Not Checked' },
                            ]}
                            value={localFilters.validation_status || ''}
                            onChange={v => setFilter('validation_status', v)}
                        />
                        <Select
                            label="Status"
                            placeholder="Any"
                            options={[
                                { value: 'draft',     label: 'Draft' },
                                { value: 'validated', label: 'Validated' },
                                { value: 'submitted', label: 'Submitted' },
                                { value: 'paid',      label: 'Paid' },
                                { value: 'denied',    label: 'Denied' },
                                { value: 'appealing', label: 'Appealing' },
                            ]}
                            value={localFilters.status || ''}
                            onChange={v => setFilter('status', v)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={applyFilters} style={{ ...primarySmallBtn, flex: isMobile ? 1 : 'none' }}>
                            <Filter size={13} /> Apply Filters
                        </button>
                        <button onClick={clearFilters} style={{ ...ghostBtn, flex: isMobile ? 1 : 'none' }}>Clear</button>
                    </div>
                </div>

                {/* Table — desktop | Cards — mobile */}
                {isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(pagerData?.data ?? []).length === 0 ? (
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                                No claims found. Adjust your filters or add a new claim.
                            </div>
                        ) : (pagerData?.data ?? []).map(row => {
                            const vBadge = VALIDATION_BADGES[row.validation_status];
                            const sBadge = CLAIM_STATUS_BADGES[row.claim_status];
                            const payerLabels = { medi_cal: 'Medi-Cal', commercial: 'Commercial', both: 'Dual-Payer', self_pay: 'Self-Pay' };
                            return (
                                <div key={row.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', padding: '14px 16px' }}>
                                    {/* Header: patient + amount */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <div>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {row.patient?.first_name} {row.patient?.last_name}
                                            </div>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                {row.service_date ? new Date(row.service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {row.amount != null ? `$${parseFloat(row.amount).toFixed(2)}` : '—'}
                                        </div>
                                    </div>
                                    {/* Meta row: CPT, Payer */}
                                    <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>CPT</div>
                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{row.cpt_code || '—'}</div>
                                        </div>
                                        {row.modifier && (
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Mod</div>
                                                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{row.modifier}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Payer</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{payerLabels[row.primary_payer] || row.primary_payer || '—'}</div>
                                        </div>
                                    </div>
                                    {/* Badges + actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                                        <Badge config={vBadge} />
                                        <Badge config={sBadge} />
                                        <div style={{ flex: 1 }} />
                                        <ActionBtn label="View" onClick={() => setDetail(row)} />
                                        <ActionBtn label="Validate" onClick={() => router.visit(`/billing/validator?claim_id=${row.id}`)} primary />
                                    </div>
                                </div>
                            );
                        })}
                        {/* Mobile pagination */}
                        {pagerData && pagerData.last_page > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                                    {pagerData.from}–{pagerData.to} of {pagerData.total}
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {pagerData.prev_page_url && (
                                        <button onClick={() => router.visit(pagerData.prev_page_url, { preserveState: true })} style={pagerBtn}>
                                            <ChevronLeft size={15} /> Prev
                                        </button>
                                    )}
                                    {pagerData.next_page_url && (
                                        <button onClick={() => router.visit(pagerData.next_page_url, { preserveState: true })} style={pagerBtn}>
                                            Next <ChevronRight size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflowX: 'auto' }}>
                        <div style={{ minWidth: 920 }}>
                            <Table
                                columns={COLUMNS}
                                rows={pagerData?.data ?? []}
                                renderCell={renderCell}
                                selectable
                                selected={selected}
                                onSelect={handleSelect}
                                emptyState={
                                    <div style={{ padding: '40px 0', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                                        No claims found. Adjust your filters or add a new claim.
                                    </div>
                                }
                            />
                        </div>
                        {/* Pagination */}
                        {pagerData && pagerData.last_page > 1 && (
                            <div style={{
                                padding: '14px 20px',
                                borderTop: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: 8,
                            }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                                    Showing {pagerData.from}–{pagerData.to} of {pagerData.total} claims
                                </span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {pagerData.prev_page_url && (
                                        <button
                                            onClick={() => router.visit(pagerData.prev_page_url, { preserveState: true })}
                                            style={pagerBtn}
                                        >
                                            <ChevronLeft size={15} /> Prev
                                        </button>
                                    )}
                                    {pagerData.next_page_url && (
                                        <button
                                            onClick={() => router.visit(pagerData.next_page_url, { preserveState: true })}
                                            style={pagerBtn}
                                        >
                                            Next <ChevronRight size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Claim detail modal */}
            {detailClaim && (
                <ClaimDetailModal
                    claim={detailClaim}
                    onClose={() => setDetail(null)}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AppLayout>
    );
}

// ─── Claim Detail Modal ───────────────────────────────────────────────────────

function ClaimDetailModal({ claim, onClose }) {
    const vBadge = VALIDATION_BADGES[claim.validation_status] || VALIDATION_BADGES.not_checked;
    const sBadge = CLAIM_STATUS_BADGES[claim.claim_status]    || CLAIM_STATUS_BADGES.draft;

    const checks = claim.validation_results?.checks ?? [];

    return (
        <Modal
            open
            onClose={onClose}
            title={`Claim — ${claim.patient?.first_name} ${claim.patient?.last_name}`}
            size="lg"
        >
            {/* Summary row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Badge config={vBadge} />
                <Badge config={sBadge} />
            </div>

            <DetailGrid>
                <DetailItem label="CPT Code" mono value={claim.cpt_code} />
                <DetailItem label="Modifier" mono value={claim.modifier || '—'} />
                <DetailItem label="POS" mono value={claim.pos_code || '—'} />
                <DetailItem label="ICD-10" mono value={claim.icd10_primary || '—'} />
                <DetailItem label="Service Date" value={claim.service_date ? new Date(claim.service_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'} />
                <DetailItem label="Duration" value={claim.session_duration_minutes ? `${claim.session_duration_minutes} min` : '—'} />
                <DetailItem label="Primary Payer" value={claim.primary_payer} />
                <DetailItem label="Amount" value={claim.amount != null ? `$${parseFloat(claim.amount).toFixed(2)}` : '—'} />
                <DetailItem label="Prior Auth" value={claim.prior_auth_number || 'None'} />
                <DetailItem label="Auth Expiry" value={claim.prior_auth_expiry || '—'} />
            </DetailGrid>

            {checks.length > 0 && (
                <>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                    <p style={{ margin: '0 0 12px', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Validation Results
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {checks.map((c, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '10px 0', width: '160px', fontWeight: 500, fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)' }}>{c.check}</td>
                                    <td style={{ padding: '10px 8px' }}>
                                        <Badge config={{
                                            clean:   VALIDATION_BADGES.clean,
                                            warning: VALIDATION_BADGES.warning,
                                            error:   VALIDATION_BADGES.error,
                                        }[c.status] || VALIDATION_BADGES.not_checked} />
                                    </td>
                                    <td style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>{c.detail}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </Modal>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function FormField({ label, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {label && <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
            {children}
        </div>
    );
}

function DetailGrid({ children }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {children}
        </div>
    );
}

function DetailItem({ label, value, mono = false }) {
    return (
        <div>
            <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'DM Sans, sans-serif' }}>
                {label}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontFamily: mono ? 'JetBrains Mono, monospace' : 'DM Sans, sans-serif', fontWeight: mono ? 500 : 400 }}>
                {value || '—'}
            </p>
        </div>
    );
}

function ActionBtn({ label, onClick, primary = false }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                border: `1px solid ${primary ? 'var(--accent-teal)' : 'var(--border)'}`,
                background: primary ? 'var(--accent-light)' : 'transparent',
                color: primary ? 'var(--accent-teal)' : 'var(--text-secondary)',
                transition: 'all 0.12s',
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </button>
    );
}

const filterCard = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    boxShadow: 'var(--shadow-card)',
};

const miniInput = {
    height: '40px',
    padding: '0 10px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
};

const primarySmallBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '9px 14px', height: '40px',
    background: 'var(--accent-teal)', color: '#fff',
    border: 'none', borderRadius: 'var(--radius-sm)',
    fontSize: '13px', fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
    whiteSpace: 'nowrap',
};

const ghostBtn = {
    display: 'inline-flex', alignItems: 'center',
    padding: '9px 12px', height: '40px',
    background: 'transparent', color: 'var(--text-secondary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
    whiteSpace: 'nowrap',
};

const pagerBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '7px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
};