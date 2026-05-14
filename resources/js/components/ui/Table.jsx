/**
 * Table
 * Props:
 *   columns   {Array<{ key: string, label: string, width?: string, mono?: boolean, align?: 'left'|'right'|'center' }>}
 *   rows      {Array<object>}
 *   renderCell {function(row, col) => ReactNode}   — optional custom cell renderer
 *   onRowClick {function(row)}                      — optional row click
 *   emptyState {ReactNode}                          — shown when rows is empty
 *   loading   {boolean}
 *   selected  {Array<any>}                          — selected row ids
 *   onSelect  {function(id)}                        — row checkbox toggle
 *   selectable {boolean}
 */
export default function Table({
    columns = [],
    rows = [],
    renderCell,
    onRowClick,
    emptyState,
    loading = false,
    selected = [],
    onSelect,
    selectable = false,
}) {
    const allSelected = rows.length > 0 && rows.every(r => selected.includes(r.id));
    const toggleAll   = () => {
        if (allSelected) {
            rows.forEach(r => onSelect?.(r.id, false));
        } else {
            rows.forEach(r => { if (!selected.includes(r.id)) onSelect?.(r.id, true); });
        }
    };

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
            }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        {selectable && (
                            <th style={thStyle('40px')}>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    style={{ accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                                />
                            </th>
                        )}
                        {columns.map(col => (
                            <th
                                key={col.key}
                                style={thStyle(col.width, col.align)}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length + (selectable ? 1 : 0)}
                                style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}
                            >
                                <LoadingSkeleton count={5} cols={columns.length + (selectable ? 1 : 0)} />
                            </td>
                        </tr>
                    ) : rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (selectable ? 1 : 0)}
                                style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}
                            >
                                {emptyState || 'No records found.'}
                            </td>
                        </tr>
                    ) : rows.map((row, i) => {
                        const isSelected = selected.includes(row.id);
                        return (
                            <tr
                                key={row.id ?? i}
                                onClick={() => onRowClick?.(row)}
                                style={{
                                    borderBottom: '1px solid var(--border)',
                                    height: '52px',
                                    background: isSelected ? 'var(--accent-light)' : 'transparent',
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.background = '#F9FAFB';
                                }}
                                onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {selectable && (
                                    <td style={tdStyle('40px')} onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={e => onSelect?.(row.id, e.target.checked)}
                                            style={{ accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                                        />
                                    </td>
                                )}
                                {columns.map(col => (
                                    <td
                                        key={col.key}
                                        style={{
                                            ...tdStyle(col.width, col.align),
                                            fontFamily: col.mono ? 'JetBrains Mono, monospace' : 'DM Sans, sans-serif',
                                        }}
                                    >
                                        {renderCell ? renderCell(row, col) : (row[col.key] ?? '—')}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function thStyle(width, align = 'left') {
    return {
        width: width || 'auto',
        padding: '0 16px',
        textAlign: align,
        fontWeight: 600,
        fontSize: '12px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        height: '44px',
        verticalAlign: 'middle',
    };
}

function tdStyle(width, align = 'left') {
    return {
        width: width || 'auto',
        padding: '0 16px',
        textAlign: align,
        color: 'var(--text-primary)',
        verticalAlign: 'middle',
    };
}

function LoadingSkeleton({ count, cols }) {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
                {Array.from({ length: count }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', height: '52px' }}>
                        {Array.from({ length: cols }).map((_, j) => (
                            <td key={j} style={{ padding: '0 16px' }}>
                                <div style={{
                                    height: '14px',
                                    borderRadius: '4px',
                                    background: 'var(--border)',
                                    width: j === 0 ? '60%' : j === 1 ? '40%' : '70%',
                                    animation: 'pulse 1.5s ease infinite',
                                }} />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
            `}</style>
        </table>
    );
}