// ─── Add this component to resources/js/pages/Patients/Index.jsx ─────────────
// Place it right before the closing </div> of the header actions section
// (next to the existing "Add Patient" Link button)
//
// Also add this import at the top of Index.jsx:
//   import { Link2, Copy, Check } from 'lucide-react';
//   import { useState } from 'react'; // already imported

function IntakeLinkButton() {
    const [loading, setLoading]   = useState(false);
    const [url, setUrl]           = useState(null);
    const [copied, setCopied]     = useState(false);
    const [showModal, setShowModal] = useState(false);

    async function generate() {
        setLoading(true);
        try {
            const res = await fetch('/patients/intake-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            setUrl(data.url);
            setShowModal(true);
        } catch (e) {
            alert('Failed to generate link. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function copy() {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <>
            <button
                onClick={generate}
                disabled={loading}
                style={{
                    height: 40, padding: '0 18px',
                    backgroundColor: '#fff', color: '#0AB5A0',
                    borderRadius: 8, border: '1px solid #0AB5A0',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                }}
            >
                <Link2 size={15} />
                {loading ? 'Generating…' : 'Send Intake Link'}
            </button>

            {showModal && url && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: 32,
                        width: '100%', maxWidth: 500,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827', fontFamily: 'Sora, sans-serif' }}>
                            Intake Link Generated
                        </h2>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6B7280' }}>
                            Share this link with the patient. It expires in 7 days and can only be used once.
                        </p>

                        <div style={{
                            padding: '10px 14px', borderRadius: 8,
                            background: '#F9FAFB', border: '1px solid #E5E7EB',
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                            color: '#374151', wordBreak: 'break-all',
                            marginBottom: 16,
                        }}>
                            {url}
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    height: 38, padding: '0 18px',
                                    border: '1px solid #E5E7EB', borderRadius: 6,
                                    background: '#fff', color: '#374151',
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={copy}
                                style={{
                                    height: 38, padding: '0 18px',
                                    border: 'none', borderRadius: 6,
                                    background: copied ? '#10B981' : '#0AB5A0',
                                    color: '#fff',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    transition: 'background 0.2s',
                                }}
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}