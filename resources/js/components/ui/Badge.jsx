/**
 * Badge — pill-shaped status indicator.
 *
 * variant:
 *   'success'  — green  (Active, Clean, Validated)
 *   'warning'  — amber  (Pending, Warning, Pending Intake)
 *   'danger'   — red    (Error, Denied, Inactive)
 *   'info'     — teal   (Confirmed, AI-Generated)
 *   'neutral'  — grey   (Draft, Not Checked, Inactive)
 *   'muted'    — light grey (secondary labels)
 *
 * size: 'sm' | 'md'  (default: 'sm')
 */
export default function Badge({ children, variant = 'neutral', size = 'sm', dot = false, style: extraStyle }) {
    const palettes = {
        success: { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },
        warning: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
        danger:  { bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' },
        info:    { bg: '#E6F9F7', color: '#0AB5A0', border: '#99E6DE' },
        neutral: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
        muted:   { bg: '#F9FAFB', color: '#9CA3AF', border: '#F3F4F6' },
    };

    const p = palettes[variant] ?? palettes.neutral;

    const fontSize = size === 'sm' ? 11.5 : 12.5;
    const padding  = size === 'sm' ? '2px 8px' : '3px 10px';

    return (
        <span style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            dot ? 5 : 0,
            padding,
            borderRadius:   99,
            fontSize,
            fontWeight:     600,
            fontFamily:     'DM Sans, sans-serif',
            lineHeight:     1.5,
            whiteSpace:     'nowrap',
            letterSpacing:  '0.01em',
            backgroundColor: p.bg,
            color:          p.color,
            border:         `1px solid ${p.border}`,
            ...extraStyle,
        }}>
            {dot && (
                <span style={{
                    width: 5, height: 5,
                    borderRadius: '50%',
                    backgroundColor: p.color,
                    flexShrink: 0,
                }} />
            )}
            {children}
        </span>
    );
}

/* ─── Pre-configured status badges ────────────────────────────────────────── */
export const StatusBadge = {
    // Patient status
    Active:        (p) => <Badge variant="success" {...p}>{p.children ?? 'Active'}</Badge>,
    Inactive:      (p) => <Badge variant="neutral" {...p}>{p.children ?? 'Inactive'}</Badge>,
    PendingIntake: (p) => <Badge variant="warning" {...p}>{p.children ?? 'Pending Intake'}</Badge>,

    // Appointment status
    Confirmed:  (p) => <Badge variant="info"    dot {...p}>{p.children ?? 'Confirmed'}</Badge>,
    Completed:  (p) => <Badge variant="success" dot {...p}>{p.children ?? 'Completed'}</Badge>,
    Cancelled:  (p) => <Badge variant="neutral" dot {...p}>{p.children ?? 'Cancelled'}</Badge>,
    NoShow:     (p) => <Badge variant="danger"  dot {...p}>{p.children ?? 'No Show'}</Badge>,
    Pending:    (p) => <Badge variant="warning" dot {...p}>{p.children ?? 'Pending'}</Badge>,

    // Billing validation
    Clean:      (p) => <Badge variant="success" {...p}>{p.children ?? 'Clean'}</Badge>,
    Warning:    (p) => <Badge variant="warning" {...p}>{p.children ?? 'Warning'}</Badge>,
    Error:      (p) => <Badge variant="danger"  {...p}>{p.children ?? 'Error'}</Badge>,
    NotChecked: (p) => <Badge variant="muted"   {...p}>{p.children ?? 'Not Checked'}</Badge>,

    // Claim status
    Draft:      (p) => <Badge variant="muted"   {...p}>{p.children ?? 'Draft'}</Badge>,
    Validated:  (p) => <Badge variant="info"    {...p}>{p.children ?? 'Validated'}</Badge>,
    Submitted:  (p) => <Badge variant="neutral" {...p}>{p.children ?? 'Submitted'}</Badge>,
    Paid:       (p) => <Badge variant="success" {...p}>{p.children ?? 'Paid'}</Badge>,
    Denied:     (p) => <Badge variant="danger"  {...p}>{p.children ?? 'Denied'}</Badge>,
    Appealing:  (p) => <Badge variant="warning" {...p}>{p.children ?? 'Appealing'}</Badge>,
};