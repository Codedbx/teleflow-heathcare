import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Zap,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Sparkles,
    CalendarCheck,
} from 'lucide-react';

/* ─── Demo accounts (clickable — auto-fills the form) ──────────────────────── */
const DEMO_ACCOUNTS = [
    { role: 'Admin',     email: 'admin@teleflow.demo',   password: 'password' },
    { role: 'Clinician', email: 'dr.chen@teleflow.demo', password: 'password' },
    { role: 'Biller',    email: 'billing@teleflow.demo', password: 'password' },
];

/* ─── Feature bullets ───────────────────────────────────────────────────────── */
const FEATURES = [
    {
        icon: ShieldCheck,
        title: 'CA Billing Validated',
        sub: 'CPT codes, modifiers, Medi-Cal & dual-payer rules',
    },
    {
        icon: Sparkles,
        title: 'AI Note Generation',
        sub: 'SOAP notes in seconds via Claude API',
    },
    {
        icon: CalendarCheck,
        title: 'Smart Scheduling',
        sub: 'Provider matching and automated confirmations',
    },
];

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passFocused, setPassFocused]   = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const fillDemo = (account) => {
        setData({ email: account.email, password: account.password, remember: false });
    };

    return (
        <>
            <Head title="Sign In" />

            <div style={{ display: 'flex', minHeight: '100vh' }}>

                {/* ══════════════════════════════════════════════════════════════
                    LEFT — Brand panel (40%)
                ══════════════════════════════════════════════════════════════ */}
                <div style={{
                    width: '40%',
                    minWidth: 340,
                    backgroundColor: '#0F1A2E',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px 44px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34,
                            borderRadius: 9,
                            backgroundColor: '#0AB5A0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={17} color="#fff" strokeWidth={2.5} />
                        </div>
                        <span style={{
                            fontFamily: 'Sora, sans-serif',
                            fontSize: 17,
                            fontWeight: 600,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                        }}>
                            TeleFlow
                        </span>
                    </div>

                    {/* Main copy */}
                    <div style={{ marginTop: 'auto', paddingBottom: 20 }}>
                        <p style={{
                            fontFamily: 'Sora, sans-serif',
                            fontSize: 30,
                            fontWeight: 600,
                            color: '#fff',
                            lineHeight: 1.25,
                            letterSpacing: '-0.02em',
                            marginBottom: 10,
                        }}>
                            Clinical operations,<br />automated.
                        </p>
                        <p style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 14,
                            color: '#6B8BAD',
                            marginBottom: 44,
                            lineHeight: 1.5,
                        }}>
                            Built for California telehealth<br />mental health practices.
                        </p>

                        {/* Feature callouts */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {FEATURES.map(({ icon: Icon, title, sub }) => (
                                <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                                    <div style={{
                                        width: 36, height: 36,
                                        borderRadius: 9,
                                        backgroundColor: 'rgba(10,181,160,0.1)',
                                        border: '1px solid rgba(10,181,160,0.18)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: 1,
                                    }}>
                                        <Icon size={16} color="#0AB5A0" strokeWidth={1.75} />
                                    </div>
                                    <div>
                                        <p style={{
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 13.5,
                                            fontWeight: 600,
                                            color: '#D6E4F0',
                                            marginBottom: 3,
                                            lineHeight: 1,
                                        }}>
                                            {title}
                                        </p>
                                        <p style={{
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 12,
                                            color: '#6B8BAD',
                                            lineHeight: 1.4,
                                        }}>
                                            {sub}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative radial glows — CSS only, no images */}
                    <div style={{
                        position: 'absolute', bottom: -100, right: -80,
                        width: 340, height: 340, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(10,181,160,0.13) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', top: '30%', left: -60,
                        width: 220, height: 220, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(10,181,160,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    {/* Subtle grid texture */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                        pointerEvents: 'none',
                    }} />
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    RIGHT — Form panel (60%)
                ══════════════════════════════════════════════════════════════ */}
                <div style={{
                    flex: 1,
                    backgroundColor: '#F7F8FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 40px',
                }}>
                    <div style={{ width: '100%', maxWidth: 400 }}>

                        {/* Heading */}
                        <h1 style={{
                            fontFamily: 'Sora, sans-serif',
                            fontSize: 26,
                            fontWeight: 600,
                            color: '#111827',
                            marginBottom: 6,
                            letterSpacing: '-0.02em',
                        }}>
                            Welcome back
                        </h1>
                        <p style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 14,
                            color: '#6B7280',
                            marginBottom: 30,
                        }}>
                            Sign in to your practice dashboard
                        </p>

                        {/* Form */}
                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Email */}
                            <Field label="Email address" error={errors.email}>
                                <InputWrapper icon={<Mail size={15} color="#9CA3AF" />}>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@practice.com"
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        style={inputStyle(emailFocused, !!errors.email)}
                                    />
                                </InputWrapper>
                            </Field>

                            {/* Password */}
                            <Field
                                label="Password"
                                error={errors.password}
                                labelRight={
                                    <a
                                        href="/forgot-password"
                                        style={{ fontSize: 12.5, color: '#0AB5A0', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        Forgot password?
                                    </a>
                                }
                            >
                                <InputWrapper
                                    icon={<Lock size={15} color="#9CA3AF" />}
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', display: 'flex', lineHeight: 0 }}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    }
                                >
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        onFocus={() => setPassFocused(true)}
                                        onBlur={() => setPassFocused(false)}
                                        style={inputStyle(passFocused, !!errors.password)}
                                    />
                                </InputWrapper>
                            </Field>

                            {/* Remember */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    style={{ accentColor: '#0AB5A0', width: 14, height: 14, cursor: 'pointer' }}
                                />
                                <label htmlFor="remember" style={{ fontSize: 13.5, color: '#6B7280', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', userSelect: 'none' }}>
                                    Keep me signed in
                                </label>
                            </div>

                            {/* Submit */}
                            <PrimaryButton type="submit" disabled={processing} style={{ marginTop: 4 }}>
                                {processing ? 'Signing in…' : 'Sign in'}
                            </PrimaryButton>
                        </form>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 20px' }}>
                            <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                            <span style={{ fontSize: 11.5, color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                                Interview demo accounts
                            </span>
                            <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                        </div>

                        {/* Demo credentials card */}
                        <div style={{
                            backgroundColor: '#0F1A2E',
                            borderRadius: 10,
                            padding: '14px 16px 12px',
                            border: '1px solid rgba(10,181,160,0.18)',
                        }}>
                            <p style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.09em',
                                color: '#3A5070',
                                fontFamily: 'DM Sans, sans-serif',
                                textTransform: 'uppercase',
                                marginBottom: 10,
                            }}>
                                Click any row to auto-fill
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {DEMO_ACCOUNTS.map((account) => (
                                    <button
                                        key={account.role}
                                        type="button"
                                        onClick={() => fillDemo(account)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            background: 'none',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: 6,
                                            padding: '7px 10px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'border-color 130ms, background-color 130ms',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(10,181,160,0.3)';
                                            e.currentTarget.style.backgroundColor = 'rgba(10,181,160,0.06)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <span style={{
                                            fontSize: 9.5,
                                            fontWeight: 700,
                                            color: '#0AB5A0',
                                            backgroundColor: 'rgba(10,181,160,0.12)',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontFamily: 'DM Sans, sans-serif',
                                            letterSpacing: '0.04em',
                                            textTransform: 'uppercase',
                                            flexShrink: 0,
                                        }}>
                                            {account.role}
                                        </span>
                                        <code style={{
                                            fontSize: 12,
                                            color: '#8FA3C0',
                                            fontFamily: 'JetBrains Mono, monospace',
                                        }}>
                                            {account.email}
                                        </code>
                                    </button>
                                ))}
                            </div>

                            <p style={{
                                marginTop: 10,
                                fontSize: 11,
                                color: '#3A5070',
                                fontFamily: 'JetBrains Mono, monospace',
                            }}>
                                password: <span style={{ color: '#6B8BAD' }}>password</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Micro-components ──────────────────────────────────────────────────────── */
function Field({ label, error, labelRight, children }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', fontFamily: 'DM Sans, sans-serif' }}>
                    {label}
                </label>
                {labelRight}
            </div>
            {children}
            {error && (
                <p style={{ marginTop: 5, fontSize: 12, color: '#EF4444', fontFamily: 'DM Sans, sans-serif' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

function InputWrapper({ icon, suffix, children }) {
    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 11, pointerEvents: 'none', display: 'flex', lineHeight: 0 }}>
                {icon}
            </span>
            <div style={{ width: '100%' }}>
                {children}
            </div>
            {suffix && (
                <span style={{ position: 'absolute', right: 11, display: 'flex', lineHeight: 0 }}>
                    {suffix}
                </span>
            )}
        </div>
    );
}

function PrimaryButton({ children, disabled, style: extraStyle, ...props }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            {...props}
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%',
                height: 40,
                backgroundColor: disabled ? '#7ed6ce' : hovered ? '#089e8c' : '#0AB5A0',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 150ms',
                letterSpacing: '0.01em',
                ...extraStyle,
            }}
        >
            {children}
        </button>
    );
}

function inputStyle(focused, hasError) {
    return {
        width: '100%',
        height: 40,
        paddingLeft: 34,
        paddingRight: 34,
        border: `1.5px solid ${hasError ? '#EF4444' : focused ? '#0AB5A0' : '#E5E7EB'}`,
        borderRadius: 6,
        fontSize: 13.5,
        color: '#111827',
        backgroundColor: '#fff',
        fontFamily: 'DM Sans, sans-serif',
        outline: 'none',
        boxShadow: focused && !hasError ? '0 0 0 3px rgba(10,181,160,0.15)' : 'none',
        transition: 'border-color 150ms, box-shadow 150ms',
    };
}