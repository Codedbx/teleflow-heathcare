import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal
 * Props:
 *   open        {boolean}
 *   onClose     {function}
 *   title       {string}
 *   children    {ReactNode}
 *   size        {'sm'|'md'|'lg'}  — default 'md' (560px)
 *   footer      {ReactNode}       — optional bottom action bar
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
    const overlayRef = useRef(null);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const widths = { sm: '400px', md: '560px', lg: '720px' };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                    width: '100%',
                    maxWidth: widths[size],
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'modalIn 0.18s ease',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                }}>
                    <h2
                        id="modal-title"
                        style={{
                            fontFamily: 'Sora, sans-serif',
                            fontSize: '17px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: 0,
                        }}
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '4px', borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center',
                            transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.background = 'var(--bg-base)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'none';
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '20px 24px',
                    overflowY: 'auto',
                    flex: 1,
                }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        flexShrink: 0,
                    }}>
                        {footer}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);   }
                }
            `}</style>
        </div>
    );
}