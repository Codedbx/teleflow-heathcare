/**
 * Card — base white surface with shadow.
 *
 * Props:
 *   padding  — css shorthand (default: '20px 24px')
 *   radius   — css value (default: '10px')
 *   border   — bool, adds subtle border (default: true)
 *   shadow   — bool (default: true)
 *   hover    — bool, subtle lift on hover (default: false)
 */
import { useState } from 'react';

export default function Card({
    children,
    padding = '20px 24px',
    radius  = '10px',
    border  = true,
    shadow  = true,
    hover   = false,
    style: extraStyle,
    ...rest
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => hover && setHovered(true)}
            onMouseLeave={() => hover && setHovered(false)}
            style={{
                backgroundColor: '#fff',
                borderRadius: radius,
                padding,
                border: border ? '1px solid #E5E7EB' : 'none',
                boxShadow: shadow
                    ? hovered
                        ? '0 4px 12px rgba(0,0,0,0.08)'
                        : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                    : 'none',
                transition: 'box-shadow 180ms',
                ...extraStyle,
            }}
            {...rest}
        >
            {children}
        </div>
    );
}

/**
 * CardHeader — optional heading row inside a Card.
 */
export function CardHeader({ title, icon, action, style: extraStyle }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            ...extraStyle,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && (
                    <span style={{ display: 'flex', color: '#0AB5A0', lineHeight: 0 }}>
                        {icon}
                    </span>
                )}
                <h2 style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0,
                    letterSpacing: '-0.01em',
                }}>
                    {title}
                </h2>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}