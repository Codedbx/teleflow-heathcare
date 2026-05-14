import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from '@/components/ui/Toast';

const SIDEBAR_EXPANDED  = 240;
const SIDEBAR_COLLAPSED = 64;

export default function AppLayout({ children, title, fullHeight = false }) {
    const [collapsed, setCollapsed] = useState(false);
    const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
            {title && <Head title={title} />}

            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

            <main
                className="main-transition"
                style={{
                    marginLeft: sidebarWidth,
                    flex: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: fullHeight ? 0 : '32px',
                    width: '100%',
                }}
            >
                {children}
            </main>

            <ToastContainer />
        </div>
    );
}