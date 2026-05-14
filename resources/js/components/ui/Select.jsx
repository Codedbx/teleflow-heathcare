import { ChevronDown } from 'lucide-react';

/**
 * Select
 * Props:
 *   value       {string}
 *   onChange    {function}  — receives the raw string value
 *   options     {Array<{ value: string, label: string, disabled?: boolean }>}
 *   placeholder {string}
 *   label       {string}
 *   error       {string}
 *   disabled    {boolean}
 *   className   {string}   — extra wrapper class
 *   style       {object}   — extra wrapper style
 *   id          {string}
 *   mono        {boolean}  — use JetBrains Mono (for codes)
 */
export default function Select({
    value,
    onChange,
    options = [],
    placeholder = 'Select…',
    label,
    error,
    disabled = false,
    id,
    mono = false,
    style = {},
}) {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', ...style }}>
            {label && (
                <label
                    htmlFor={selectId}
                    style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                    }}
                >
                    {label}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                <select
                    id={selectId}
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 36px 0 12px',
                        border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: disabled ? 'var(--bg-base)' : 'var(--bg-surface)',
                        color: value ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '14px',
                        fontFamily: mono ? 'JetBrains Mono, monospace' : 'DM Sans, sans-serif',
                        appearance: 'none',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => {
                        if (!error) e.target.style.borderColor = 'var(--accent-teal)';
                        e.target.style.boxShadow = 'var(--shadow-focus)';
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map(opt => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled}
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={15}
                    style={{
                        position: 'absolute',
                        right: '11px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--text-muted)',
                    }}
                />
            </div>

            {error && (
                <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--danger)',
                    fontFamily: 'DM Sans, sans-serif',
                }}>
                    {error}
                </p>
            )}
        </div>
    );
}