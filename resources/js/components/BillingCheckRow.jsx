import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * BillingCheckRow
 * Renders one row in the validation results table.
 *
 * Props:
 *   check   {string}              — check name
 *   status  {'clean'|'warning'|'error'}
 *   detail  {string}              — explanation
 *   fix     {string|null}         — actionable fix text
 */
export default function BillingCheckRow({ check, status, detail, fix }) {
    const configs = {
        clean: {
            icon:       <CheckCircle size={16} />,
            iconColor:  'var(--success)',
            labelColor: 'var(--success)',
            label:      'Pass',
            bg:         'transparent',
        },
        warning: {
            icon:       <AlertTriangle size={16} />,
            iconColor:  'var(--warning)',
            labelColor: 'var(--warning)',
            label:      'Warning',
            bg:         '#FFFBEB',
        },
        error: {
            icon:       <XCircle size={16} />,
            iconColor:  'var(--danger)',
            labelColor: 'var(--danger)',
            label:      'Error',
            bg:         '#FEF2F2',
        },
    };

    const cfg = configs[status] || configs.clean;

    return (
        <tr
            style={{
                borderBottom: '1px solid var(--border)',
                background: cfg.bg,
                transition: 'background 0.1s',
            }}
        >
            {/* Check name */}
            <td style={cell('200px')}>
                <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                }}>
                    {check}
                </span>
            </td>

            {/* Status pill */}
            <td style={cell('90px')}>
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: cfg.labelColor,
                    background: cfg.bg === 'transparent' ? '#F0FDF4' : cfg.bg,
                    border: `1px solid ${cfg.iconColor}30`,
                }}>
                    <span style={{ color: cfg.iconColor, display: 'flex' }}>{cfg.icon}</span>
                    {cfg.label}
                </span>
            </td>

            {/* Detail */}
            <td style={{ ...cell(), paddingRight: '24px' }}>
                <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13.5px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                }}>
                    {detail}
                </span>
            </td>

            {/* Fix */}
            <td style={cell('220px')}>
                {fix ? (
                    <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '13px',
                        color: status === 'error' ? 'var(--danger)' : 'var(--warning)',
                        fontWeight: 500,
                    }}>
                        {fix}
                    </span>
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                )}
            </td>
        </tr>
    );
}

function cell(width) {
    return {
        padding: '14px 16px',
        verticalAlign: 'middle',
        width: width || 'auto',
    };
}