import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Zap, LayoutDashboard, Users, CalendarDays, MessageSquare,
    FileText, Sparkles, ShieldCheck, Receipt, Settings,
    HelpCircle, ChevronLeft, ChevronRight, LogOut, ChevronUp, X,
} from 'lucide-react';

const NAV = [
    {
        group: 'MAIN',
        items: [
            { label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard' },
            { label: 'Patients',     icon: Users,           href: '/patients' },
            { label: 'Appointments', icon: CalendarDays,    href: '/appointments' },
            { label: 'Messages',     icon: MessageSquare,   href: '/messages' },
        ],
    },
    {
        group: 'CLINICAL',
        items: [
            { label: 'Clinical Notes',    icon: FileText,  href: '/notes' },
            { label: 'AI Note Assistant', icon: Sparkles,  href: '/notes/assistant' },
        ],
    },
    {
        group: 'BILLING',
        items: [
            { label: 'Billing Validator', icon: ShieldCheck, href: '/billing/validator' },
            { label: 'Claims',            icon: Receipt,     href: '/billing/claims' },
        ],
    },
    {
        group: 'ADMIN',
        items: [
            { label: 'Settings', icon: Settings, href: '/settings' },
        ],
    },
];

const initials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const roleLabel = role =>
    ({ admin: 'Administrator', clinician: 'Clinician', biller: 'Biller' })[role] ?? role ?? 'Staff';

/* ─── NavItem ─────────────────────────────────────────────────────────────── */
function NavItem({ item, active, collapsed, onClose }) {
    const Icon = item.icon;
    const [hovered, setHovered] = useState(false);

    const bg    = active ? 'rgba(10,181,160,0.14)' : hovered ? '#1A2D4A' : 'transparent';
    const color = active ? '#0AB5A0' : hovered ? '#FFFFFF' : '#8FA3C0';

    return (
        <Link
            href={item.href}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 9, height: 40,
                paddingLeft: collapsed ? 0 : 10, paddingRight: collapsed ? 0 : 10,
                borderRadius: 8, backgroundColor: bg, color,
                textDecoration: 'none', position: 'relative',
                transition: 'background-color 130ms, color 130ms',
            }}
        >
            {active && (
                <span style={{
                    position: 'absolute', left: 0, top: 8, bottom: 8,
                    width: 3, borderRadius: '0 3px 3px 0', backgroundColor: '#0AB5A0',
                }} />
            )}
            <Icon size={17} strokeWidth={active ? 2.1 : 1.75} style={{ flexShrink: 0 }} />
            {!collapsed && (
                <span style={{
                    fontSize: 13.5, fontWeight: active ? 600 : 400,
                    fontFamily: 'DM Sans, sans-serif',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1,
                }}>
                    {item.label}
                </span>
            )}
        </Link>
    );
}

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */
export default function Sidebar({ collapsed, onCollapse, isMobile, drawerOpen, onDrawerClose }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const isActive = href => {
        if (href === '/dashboard') return url === '/dashboard' || url === '/';
        return url.startsWith(href);
    };

    // On mobile a nav click closes the drawer; on desktop no action needed
    const navClose = isMobile ? onDrawerClose : undefined;

    const showLabel = isMobile || !collapsed; // always show labels in mobile drawer

    // Desktop: fixed sidebar | Mobile: slide-in drawer from left
    const sidebarStyle = {
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: isMobile ? 260 : (collapsed ? 64 : 240),
        backgroundColor: '#0F1A2E',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        display: 'flex', flexDirection: 'column', zIndex: 40, overflow: 'hidden',
        ...(isMobile
            ? {
                transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 260ms cubic-bezier(0.4,0,0.2,1)',
                boxShadow: drawerOpen ? '4px 0 32px rgba(0,0,0,0.3)' : 'none',
            }
            : { transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)' }),
    };

    return (
        <aside style={sidebarStyle}>

            {/* Logo row */}
            <div style={{
                height: 60, display: 'flex', alignItems: 'center',
                paddingLeft: showLabel ? 14 : 0, paddingRight: showLabel ? 12 : 0,
                justifyContent: showLabel ? 'space-between' : 'center',
                borderBottom: '1px solid rgba(255,255,255,0.055)', flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 8, backgroundColor: '#0AB5A0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Zap size={15} color="#fff" strokeWidth={2.5} />
                    </div>
                    {showLabel && (
                        <span style={{
                            fontFamily: 'Sora, sans-serif', fontSize: 15.5, fontWeight: 600,
                            color: '#fff', letterSpacing: '-0.015em', whiteSpace: 'nowrap',
                        }}>
                            TeleFlow
                        </span>
                    )}
                </div>

                {/* Desktop collapse button */}
                {!isMobile && !collapsed && (
                    <CollapseBtn onClick={() => onCollapse(true)}>
                        <ChevronLeft size={15} />
                    </CollapseBtn>
                )}

                {/* Mobile close button */}
                {isMobile && (
                    <button
                        onClick={onDrawerClose}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            borderRadius: 6, cursor: 'pointer', color: '#8FA3C0', flexShrink: 0,
                        }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }}>
                {!isMobile && collapsed && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                        <CollapseBtn onClick={() => onCollapse(false)}>
                            <ChevronRight size={15} />
                        </CollapseBtn>
                    </div>
                )}

                {NAV.map((section, si) => (
                    <div key={section.group} style={{ marginBottom: showLabel ? 20 : 8 }}>
                        {showLabel ? (
                            <p style={{
                                paddingLeft: 10, marginBottom: 4, fontSize: 9.5, fontWeight: 700,
                                letterSpacing: '0.1em', color: '#3A5070',
                                fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase',
                            }}>
                                {section.group}
                            </p>
                        ) : (
                            si > 0 && (
                                <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.055)', margin: '8px 12px' }} />
                            )
                        )}
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {section.items.map(item => (
                                <li key={item.href}>
                                    <NavItem
                                        item={item}
                                        active={isActive(item.href)}
                                        collapsed={!isMobile && collapsed}
                                        onClose={navClose}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Bottom: help + user */}
            <div style={{ padding: '8px 8px 10px', borderTop: '1px solid rgba(255,255,255,0.055)', flexShrink: 0 }}>
                <HelpItem collapsed={!isMobile && collapsed} onClose={navClose} />

                <div ref={menuRef} style={{ position: 'relative' }}>
                    {userMenuOpen && (
                        <div style={{
                            position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
                            backgroundColor: '#162438', border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: 10, padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            minWidth: (!isMobile && collapsed) ? 160 : 'auto', zIndex: 50,
                        }}>
                            {showLabel && (
                                <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4 }}>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: '#E2EAF4', fontFamily: 'DM Sans, sans-serif', marginBottom: 2 }}>
                                        {user?.name}
                                    </p>
                                    <p style={{ fontSize: 11.5, color: '#8FA3C0', fontFamily: 'DM Sans, sans-serif' }}>
                                        {user?.email}
                                    </p>
                                </div>
                            )}
                            <MenuBtn icon={<LogOut size={13} />} label="Sign out" danger onClick={() => router.post('/logout')} />
                        </div>
                    )}

                    <button
                        onClick={() => setUserMenuOpen(o => !o)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            gap: showLabel ? 9 : 0,
                            justifyContent: showLabel ? 'flex-start' : 'center',
                            height: 44,
                            paddingLeft: showLabel ? 10 : 0, paddingRight: showLabel ? 8 : 0,
                            borderRadius: 8, border: 'none', cursor: 'pointer',
                            backgroundColor: userMenuOpen ? '#1A2D4A' : 'transparent',
                            transition: 'background-color 130ms',
                        }}
                        onMouseEnter={e => { if (!userMenuOpen) e.currentTarget.style.backgroundColor = '#1A2D4A'; }}
                        onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0AB5A0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: '#fff',
                            fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em',
                        }}>
                            {initials(user?.name)}
                        </div>
                        {showLabel && (
                            <>
                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: '#E2EAF4', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2, marginBottom: 1 }}>
                                        {user?.name ?? 'User'}
                                    </p>
                                    <p style={{ fontSize: 11, color: '#4A6080', fontFamily: 'DM Sans, sans-serif', lineHeight: 1 }}>
                                        {roleLabel(user?.role)}
                                    </p>
                                </div>
                                <ChevronUp size={13} color="#4A6080" style={{ flexShrink: 0, transform: userMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 200ms' }} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}

/* ─── Small sub-components ─────────────────────────────────────────────────── */
function CollapseBtn({ children, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, border: 'none', cursor: 'pointer', flexShrink: 0,
                backgroundColor: hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: '#8FA3C0', transition: 'background-color 130ms',
            }}
        >
            {children}
        </button>
    );
}

function HelpItem({ collapsed, onClose }) {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href="/help"
            onClick={onClose}
            title={collapsed ? 'Help' : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                height: 36, paddingLeft: collapsed ? 0 : 10, borderRadius: 8,
                color: hovered ? '#fff' : '#8FA3C0',
                backgroundColor: hovered ? '#1A2D4A' : 'transparent',
                textDecoration: 'none', marginBottom: 4,
                transition: 'background-color 130ms, color 130ms',
            }}
        >
            <HelpCircle size={17} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13.5, fontFamily: 'DM Sans, sans-serif' }}>Help</span>}
        </a>
    );
}

function MenuBtn({ icon, label, danger, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                backgroundColor: hovered ? (danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)') : 'transparent',
                color: danger ? '#EF4444' : '#8FA3C0',
                fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                transition: 'background-color 130ms',
            }}
        >
            {icon}{label}
        </button>
    );
}
