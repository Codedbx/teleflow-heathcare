import { useState } from 'react';

/**
 * Button
 *
 * Props:
 *   variant  — 'primary' | 'secondary' | 'ghost' | 'danger'   (default: 'primary')
 *   size     — 'sm' | 'md' | 'lg'                              (default: 'md')
 *   icon     — Lucide element rendered left of label
 *   iconRight— Lucide element rendered right of label
 *   loading  — bool, replaces content with spinner
 *   disabled — bool
 */
export default function Button({
    children,
    variant  = 'primary',
    size     = 'md',
    icon,
    iconRight,
    loading  = false,
    disabled = false,
    style: extraStyle,
    onClick,
    type = 'button',
    ...rest
}) {
    const [hovered, setHovered] = useState(false);
    const isDisabled = disabled || loading;

    const heights = { sm: 32, md: 40, lg: 44 };
    const fontSizes = { sm: 12.5, md: 13.5, lg: 14 };
    const paddings = { sm: '0 12px', md: '0 16px', lg: '0 20px' };

    const styles = {
        primary: {
            backgroundColor: isDisabled ? '#7ed6ce' : hovered ? '#089e8c' : '#0AB5A0',
            color: '#fff',
            border: '1.5px solid transparent',
        },
        secondary: {
            backgroundColor: hovered ? '#F7F8FA' : '#fff',
            color: '#111827',
            border: '1.5px solid #E5E7EB',
        },
        ghost: {
            backgroundColor: hovered ? '#F3F4F6' : 'transparent',
            color: '#374151',
            border: '1.5px solid transparent',
        },
        danger: {
            backgroundColor: isDisabled ? '#fca5a5' : hovered ? '#DC2626' : '#EF4444',
            color: '#fff',
            border: '1.5px solid transparent',
        },
    };

    const v = styles[variant] ?? styles.primary;

    return (
        <button
            type={type}
            disabled={isDisabled}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            6,
                height:         heights[size],
                padding:        paddings[size],
                minWidth:       88,
                borderRadius:   6,
                fontSize:       fontSizes[size],
                fontWeight:     600,
                fontFamily:     'DM Sans, sans-serif',
                cursor:         isDisabled ? 'not-allowed' : 'pointer',
                transition:     'background-color 130ms, border-color 130ms',
                whiteSpace:     'nowrap',
                userSelect:     'none',
                letterSpacing:  '0.01em',
                ...v,
                ...extraStyle,
            }}
            {...rest}
        >
            {loading ? (
                <Spinner size={size === 'sm' ? 13 : 15} />
            ) : (
                <>
                    {icon && <span style={{ display: 'flex', lineHeight: 0 }}>{icon}</span>}
                    {children}
                    {iconRight && <span style={{ display: 'flex', lineHeight: 0 }}>{iconRight}</span>}
                </>
            )}
        </button>
    );
}

function Spinner({ size }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            style={{ animation: 'spin 0.75s linear infinite' }}
        >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeDasharray="28" strokeDashoffset="20" />
        </svg>
    );
}