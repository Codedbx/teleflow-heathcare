import { useState, forwardRef } from 'react';

/**
 * Input
 *
 * Props:
 *   label       — string
 *   error       — string (shows below input in red)
 *   hint        — string (shows below input in muted — only when no error)
 *   icon        — Lucide element (left)
 *   suffix      — Lucide element or node (right)
 *   size        — 'sm' | 'md'   (default: 'md')
 *   labelRight  — node placed right of label (e.g., "Forgot password?")
 */
const Input = forwardRef(function Input(
    {
        label,
        error,
        hint,
        icon,
        suffix,
        size = 'md',
        labelRight,
        className,
        style: extraStyle,
        ...props
    },
    ref
) {
    const [focused, setFocused] = useState(false);
    const height = size === 'sm' ? 34 : 40;
    const fontSize = size === 'sm' ? 12.5 : 13.5;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(label || labelRight) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {label && (
                        <label style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            fontFamily: 'DM Sans, sans-serif',
                        }}>
                            {label}
                        </label>
                    )}
                    {labelRight}
                </div>
            )}

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {icon && (
                    <span style={{
                        position: 'absolute', left: 11,
                        display: 'flex', lineHeight: 0,
                        pointerEvents: 'none',
                        color: focused ? '#0AB5A0' : '#9CA3AF',
                        transition: 'color 130ms',
                    }}>
                        {icon}
                    </span>
                )}

                <input
                    ref={ref}
                    onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
                    onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
                    style={{
                        width: '100%',
                        height,
                        paddingLeft:  icon   ? 34 : 11,
                        paddingRight: suffix ? 36 : 11,
                        border: `1.5px solid ${
                            error   ? '#EF4444'
                            : focused ? '#0AB5A0'
                            : '#E5E7EB'
                        }`,
                        borderRadius: 6,
                        fontSize,
                        fontFamily: 'DM Sans, sans-serif',
                        color: '#111827',
                        backgroundColor: props.disabled ? '#F9FAFB' : '#fff',
                        outline: 'none',
                        boxShadow: focused && !error
                            ? '0 0 0 3px rgba(10,181,160,0.15)'
                            : focused && error
                            ? '0 0 0 3px rgba(239,68,68,0.12)'
                            : 'none',
                        transition: 'border-color 150ms, box-shadow 150ms',
                        cursor: props.disabled ? 'not-allowed' : 'text',
                        ...extraStyle,
                    }}
                    {...props}
                />

                {suffix && (
                    <span style={{
                        position: 'absolute', right: 11,
                        display: 'flex', lineHeight: 0,
                    }}>
                        {suffix}
                    </span>
                )}
            </div>

            {error && (
                <p style={{ fontSize: 12, color: '#EF4444', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                    {error}
                </p>
            )}
            {!error && hint && (
                <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                    {hint}
                </p>
            )}
        </div>
    );
});

export default Input;