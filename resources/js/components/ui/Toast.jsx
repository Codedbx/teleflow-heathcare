import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

// ─── Internal event bus (no external deps) ────────────────────────────────────

const listeners = new Set();

function emit(toast) {
    listeners.forEach(fn => fn(toast));
}

// ─── Public API ───────────────────────────────────────────────────────────────
// Usage anywhere in the app:
//   import { toast } from '@/components/ui/Toast';
//   toast.success('Saved!');
//   toast.error('Something went wrong');
//   toast.warning('Check before submitting');
//   toast.info('Note saved to patient record');

export const toast = {
    success: (message, options) => emit({ id: Date.now(), type: 'success', message, ...options }),
    error:   (message, options) => emit({ id: Date.now(), type: 'error',   message, ...options }),
    warning: (message, options) => emit({ id: Date.now(), type: 'warning', message, ...options }),
    info:    (message, options) => emit({ id: Date.now(), type: 'info',    message, ...options }),
};

// ─── Config ───────────────────────────────────────────────────────────────────

const TOAST_CONFIG = {
    success: {
        icon:    <CheckCircle size={16} />,
        color:   'var(--success)',
        bg:      '#F0FDF4',
        border:  '#BBF7D0',
    },
    error: {
        icon:    <XCircle size={16} />,
        color:   'var(--danger)',
        bg:      '#FEF2F2',
        border:  '#FECACA',
    },
    warning: {
        icon:    <AlertTriangle size={16} />,
        color:   'var(--warning)',
        bg:      '#FFFBEB',
        border:  '#FDE68A',
    },
    info: {
        icon:    <Info size={16} />,
        color:   '#2563EB',
        bg:      '#EFF6FF',
        border:  '#BFDBFE',
    },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ toast: t, onRemove }) {
    const config = TOAST_CONFIG[t.type] ?? TOAST_CONFIG.info;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setVisible(true));

        // Auto-dismiss after 4s
        const timer = setTimeout(() => dismiss(), t.duration ?? 4000);
        return () => clearTimeout(timer);
    }, []);

    function dismiss() {
        setVisible(false);
        setTimeout(() => onRemove(t.id), 300);
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                width: 320,
                padding: '12px 14px',
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                transform: visible ? 'translateX(0)' : 'translateX(120%)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
                cursor: 'default',
            }}
        >
            {/* Icon */}
            <span style={{ color: config.color, flexShrink: 0, marginTop: 1 }}>
                {config.icon}
            </span>

            {/* Message */}
            <span style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.4,
            }}>
                {t.message}
            </span>

            {/* Dismiss */}
            <button
                onClick={dismiss}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 2, flexShrink: 0,
                    marginTop: -1,
                }}
            >
                <X size={14} />
            </button>
        </div>
    );
}

// ─── Toast Container (mount once in AppLayout or app root) ───────────────────

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((t) => {
        setToasts(prev => [...prev, t]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        listeners.add(addToast);
        return () => listeners.delete(addToast);
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                pointerEvents: 'none',
            }}
        >
            {toasts.map(t => (
                <div key={t.id} style={{ pointerEvents: 'all' }}>
                    <ToastItem toast={t} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;