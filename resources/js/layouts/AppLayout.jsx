import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Menu, Zap } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from '@/components/ui/Toast';
import { useIsMobile } from '@/hooks/useIsMobile';

const SIDEBAR_W_EXPANDED  = 240;
const SIDEBAR_W_COLLAPSED = 64;

export default function AppLayout({ children, title, fullHeight = false }) {
    const [collapsed, setCollapsed]   = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isMobile = useIsMobile();

    const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
            {title && <Head title={title} />}

            {/* Mobile drawer backdrop */}
            {isMobile && drawerOpen && (
                <div
                    onClick={() => setDrawerOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 39,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(3px)',
                    }}
                />
            )}

            <Sidebar
                collapsed={isMobile ? false : collapsed}
                onCollapse={setCollapsed}
                isMobile={isMobile}
                drawerOpen={drawerOpen}
                onDrawerClose={() => setDrawerOpen(false)}
            />

            {/* Main content — zero margin-left on mobile (sidebar is overlay drawer) */}
            <main
                className="main-transition"
                style={{
                    marginLeft: isMobile ? 0 : sidebarW,
                    flex: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    width: isMobile ? '100%' : `calc(100% - ${sidebarW}px)`,
                    overflowX: 'hidden',
                }}
            >
                {/* Mobile top bar */}
                {isMobile && (
                    <header style={{
                        position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '0 16px', height: 56,
                        backgroundColor: '#0F1A2E',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <button
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open navigation"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 36, height: 36, border: 'none',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                borderRadius: 8, cursor: 'pointer', color: '#fff', flexShrink: 0,
                            }}
                        >
                            <Menu size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                backgroundColor: '#0AB5A0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Zap size={14} color="#fff" strokeWidth={2.5} />
                            </div>
                            <span style={{
                                fontFamily: 'Sora, sans-serif', fontSize: 15,
                                fontWeight: 600, color: '#fff', letterSpacing: '-0.015em',
                            }}>
                                TeleFlow
                            </span>
                        </div>
                    </header>
                )}

                {/* Page body — each page owns its own padding */}
                {fullHeight ? (
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        overflow: 'hidden',
                        // On mobile the top bar takes 56px, subtract that
                        height: isMobile ? 'calc(100vh - 56px)' : '100vh',
                    }}>
                        {children}
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {children}
                    </div>
                )}
            </main>

            <ToastContainer />
        </div>
    );
}
