import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
    ChevronLeft, ChevronRight, Plus, X, Video, Headphones, Building2,
    CalendarDays, Clock, User, Sparkles, ExternalLink, Check,
    XCircle, AlertCircle, Search, Filter, SlidersHorizontal, CalendarOff,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_START  = 8;   // 8am
const HOUR_END    = 19;  // 7pm
const HOURS       = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const HOUR_PX     = 64;  // px per hour
const GRID_HEIGHT = HOURS.length * HOUR_PX;
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Provider colour palette — distinct teal/accent shades
const PROVIDER_COLORS = [
    { bg: '#E6F9F7', border: '#0AB5A0', text: '#0AB5A0', dark: '#089888' },
    { bg: '#DBEAFE', border: '#2563EB', text: '#2563EB', dark: '#1D4ED8' },
    { bg: '#EDE9FE', border: '#7C3AED', text: '#7C3AED', dark: '#6D28D9' },
    { bg: '#FCE7F3', border: '#BE185D', text: '#BE185D', dark: '#9D174D' },
    { bg: '#FEF3C7', border: '#D97706', text: '#D97706', dark: '#B45309' },
    { bg: '#DCFCE7', border: '#16A34A', text: '#16A34A', dark: '#15803D' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
    return (name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function ymd(date) {
    return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sun
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function getWeekDays(baseDate) {
    const start = startOfWeek(baseDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function apptTopPx(dateStr) {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes();
    const offset = (h - HOUR_START) * HOUR_PX + (m / 60) * HOUR_PX;
    return Math.max(0, offset);
}

function apptHeightPx(minutes) {
    return Math.max(24, (minutes / 60) * HOUR_PX);
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateLong(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDateShort(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isToday(date) {
    return ymd(date) === ymd(new Date());
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ModalityIcon({ modality, size = 13 }) {
    const icons = { video: Video, audio: Headphones, in_person: Building2 };
    const Icon = icons[modality] ?? Video;
    return <Icon size={size} />;
}

function ModalityBadge({ modality }) {
    const map = {
        video:     { label: 'Video',      bg: '#DBEAFE', color: '#2563EB' },
        audio:     { label: 'Audio-Only', bg: '#EDE9FE', color: '#7C3AED' },
        in_person: { label: 'In-Person',  bg: '#DCFCE7', color: '#16A34A' },
    };
    const s = map[modality] ?? { label: modality, bg: '#F3F4F6', color: '#6B7280' };
    return (
        <span style={{ backgroundColor: s.bg, color: s.color, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <ModalityIcon modality={modality} /> {s.label}
        </span>
    );
}

function StatusBadge({ status }) {
    const map = {
        confirmed: { label: 'Confirmed',  bg: '#DCFCE7', color: '#15803D' },
        pending:   { label: 'Pending',    bg: '#FEF3C7', color: '#D97706' },
        completed: { label: 'Completed',  bg: '#E6F9F7', color: '#0AB5A0' },
        cancelled: { label: 'Cancelled',  bg: '#FEE2E2', color: '#DC2626' },
        no_show:   { label: 'No-Show',    bg: '#F3F4F6', color: '#6B7280' },
    };
    const s = map[status] ?? { label: status, bg: '#F3F4F6', color: '#6B7280' };
    return (
        <span style={{ backgroundColor: s.bg, color: s.color, borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            {s.label}
        </span>
    );
}

function PatientAvatar({ name, size = 36 }) {
    const colors = [
        { bg: '#E6F9F7', text: '#0AB5A0' }, { bg: '#FEF3C7', text: '#D97706' },
        { bg: '#EDE9FE', text: '#7C3AED' }, { bg: '#DBEAFE', text: '#2563EB' },
    ];
    const { bg, text } = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
            {getInitials(name || '')}
        </div>
    );
}

// ─── Mini Month Calendar ──────────────────────────────────────────────────────

function MiniCalendar({ selectedDate, onSelectDate, appointmentDates }) {
    const [viewYear, setViewYear]   = useState(selectedDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
    const apptSet     = new Set(appointmentDates.map(d => d.slice(0, 10)));

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div style={{ padding: '16px' }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button onClick={prevMonth} style={navBtn}>
                    <ChevronLeft size={14} />
                </button>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth} style={navBtn}>
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                {DAY_NAMES.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', padding: '2px 0' }}>
                        {d[0]}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const thisDate  = new Date(viewYear, viewMonth, day);
                    const isSelected = ymd(thisDate) === ymd(selectedDate);
                    const todayDay  = isToday(thisDate);
                    const hasAppt   = apptSet.has(ymd(thisDate));

                    return (
                        <button
                            key={day}
                            onClick={() => onSelectDate(thisDate)}
                            style={{
                                width: '100%', aspectRatio: '1', border: 'none',
                                borderRadius: 6, cursor: 'pointer',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                gap: 2, position: 'relative',
                                backgroundColor: isSelected ? '#0AB5A0' : todayDay ? '#E6F9F7' : 'transparent',
                                color: isSelected ? '#fff' : todayDay ? '#0AB5A0' : '#374151',
                                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                                fontWeight: isSelected || todayDay ? 700 : 400,
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F3F4F6'; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = todayDay ? '#E6F9F7' : 'transparent'; }}
                        >
                            {day}
                            {hasAppt && (
                                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#0AB5A0' }} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Week Grid ────────────────────────────────────────────────────────────────

function WeekGrid({ weekDays, appointments, providerColorMap, onSelectAppt, selectedApptId }) {

    const apptsByDay = useMemo(() => {
        const map = {};
        weekDays.forEach(d => { map[ymd(d)] = []; });
        appointments.forEach(a => {
            const day = ymd(new Date(a.scheduled_at));
            if (map[day]) map[day].push(a);
        });
        return map;
    }, [weekDays, appointments]);

    const nowLine = useMemo(() => {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        if (h < HOUR_START || h >= HOUR_END) return null;
        return (h - HOUR_START) * HOUR_PX + (m / 60) * HOUR_PX;
    }, []);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', borderBottom: '1px solid #E5E7EB', background: '#fff', flexShrink: 0 }}>
                <div />
                {weekDays.map(d => {
                    const today = isToday(d);
                    return (
                        <div key={ymd(d)} style={{ padding: '10px 4px', textAlign: 'center', borderLeft: '1px solid #F3F4F6' }}>
                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: today ? '#0AB5A0' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {DAY_NAMES[d.getDay()]}
                            </div>
                            <div style={{
                                fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700,
                                color: today ? '#fff' : '#111827',
                                backgroundColor: today ? '#0AB5A0' : 'transparent',
                                width: 36, height: 36, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '4px auto 0',
                            }}>
                                {d.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Scrollable time grid */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', minHeight: GRID_HEIGHT }}>

                    {/* Time labels */}
                    <div style={{ position: 'relative' }}>
                        {HOURS.map(h => (
                            <div key={h} style={{ position: 'absolute', top: (h - HOUR_START) * HOUR_PX - 8, left: 0, width: '100%', textAlign: 'right', paddingRight: 8 }}>
                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>
                                    {h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map(d => {
                        const dayKey  = ymd(d);
                        const dayAppts = apptsByDay[dayKey] ?? [];
                        const todayCol = isToday(d);

                        return (
                            <div key={dayKey} style={{ position: 'relative', borderLeft: '1px solid #F3F4F6', minHeight: GRID_HEIGHT, backgroundColor: todayCol ? 'rgba(10,181,160,0.02)' : 'transparent' }}>
                                {/* Hour grid lines */}
                                {HOURS.map(h => (
                                    <div key={h} style={{ position: 'absolute', top: (h - HOUR_START) * HOUR_PX, left: 0, right: 0, borderTop: '1px solid #F3F4F6' }} />
                                ))}

                                {/* Now indicator (today column only) */}
                                {todayCol && nowLine !== null && (
                                    <div style={{ position: 'absolute', top: nowLine, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444', flexShrink: 0, marginLeft: -4 }} />
                                        <div style={{ flex: 1, height: 1.5, backgroundColor: '#EF4444', opacity: 0.7 }} />
                                    </div>
                                )}

                                {/* Appointment blocks */}
                                {dayAppts.map(appt => {
                                    const color   = providerColorMap[appt.provider_id] ?? PROVIDER_COLORS[0];
                                    const top     = apptTopPx(appt.scheduled_at);
                                    const height  = apptHeightPx(appt.duration_minutes);
                                    const selected = appt.id === selectedApptId;

                                    return (
                                        <button
                                            key={appt.id}
                                            onClick={() => onSelectAppt(appt)}
                                            style={{
                                                position: 'absolute', top: top + 2, left: 3, right: 3,
                                                height: height - 4, border: `2px solid ${selected ? color.dark : color.border}`,
                                                borderRadius: 7, backgroundColor: selected ? color.border : color.bg,
                                                cursor: 'pointer', textAlign: 'left',
                                                padding: '4px 6px', overflow: 'hidden',
                                                boxShadow: selected ? `0 2px 8px ${color.border}40` : '0 1px 2px rgba(0,0,0,0.06)',
                                                transition: 'all 0.12s',
                                                zIndex: selected ? 5 : 2,
                                            }}
                                            onMouseEnter={e => { if (!selected) { e.currentTarget.style.backgroundColor = color.border; e.currentTarget.style.transform = 'scale(1.01)'; }}}
                                            onMouseLeave={e => { if (!selected) { e.currentTarget.style.backgroundColor = color.bg; e.currentTarget.style.transform = 'none'; }}}
                                        >
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: selected ? '#fff' : color.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {appt.patient ? `${appt.patient.first_name} ${appt.patient.last_name}` : 'Patient'}
                                            </div>
                                            {height >= 40 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, color: selected ? 'rgba(255,255,255,0.85)' : color.text, opacity: 0.85 }}>
                                                    <ModalityIcon modality={appt.modality} size={10} />
                                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10 }}>{formatTime(appt.scheduled_at)}</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Day View (mobile) ────────────────────────────────────────────────────────

function DayView({ selectedDate, appointments, providerColorMap, onSelectAppt, selectedApptId }) {
    const dateKey = ymd(selectedDate);
    const dayAppts = useMemo(() =>
        appointments
            .filter(a => a.scheduled_at.slice(0, 10) === dateKey)
            .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)),
        [appointments, dateKey]
    );

    if (dayAppts.length === 0) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
                <CalendarOff size={32} color="#D1D5DB" />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
                    No appointments on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dayAppts.map(appt => {
                    const color = providerColorMap[appt.provider_id] ?? PROVIDER_COLORS[0];
                    const selected = appt.id === selectedApptId;
                    const patientName = appt.patient ? `${appt.patient.first_name} ${appt.patient.last_name}` : 'Patient';
                    return (
                        <button
                            key={appt.id}
                            onClick={() => onSelectAppt(appt)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 14px', borderRadius: 12,
                                border: `2px solid ${selected ? color.dark : color.border}`,
                                backgroundColor: selected ? color.border : color.bg,
                                textAlign: 'left', cursor: 'pointer',
                                boxShadow: selected ? `0 2px 8px ${color.border}40` : '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.12s',
                                width: '100%',
                            }}
                        >
                            {/* Time */}
                            <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 48 }}>
                                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: selected ? '#fff' : color.text }}>
                                    {formatTime(appt.scheduled_at)}
                                </div>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: selected ? 'rgba(255,255,255,0.75)' : '#9CA3AF', marginTop: 2 }}>
                                    {appt.duration_minutes}m
                                </div>
                            </div>
                            {/* Divider */}
                            <div style={{ width: 2, height: 36, borderRadius: 1, backgroundColor: selected ? 'rgba(255,255,255,0.4)' : color.border, flexShrink: 0 }} />
                            {/* Patient info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: selected ? '#fff' : '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {patientName}
                                </div>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: selected ? 'rgba(255,255,255,0.8)' : '#6B7280', marginTop: 2 }}>
                                    {appt.provider?.name ?? '—'}
                                </div>
                            </div>
                            {/* Modality icon */}
                            <div style={{ color: selected ? '#fff' : color.text, flexShrink: 0 }}>
                                <ModalityIcon modality={appt.modality} size={16} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Appointment Slide-Over ───────────────────────────────────────────────────

function AppointmentSlideOver({ appt, onClose, onStatusChange, isMobile }) {
    const [updating, setUpdating] = useState(false);

    const changeStatus = (status) => {
        setUpdating(true);
        router.patch(`/appointments/${appt.id}`, { status }, {
            preserveState: true,
            onFinish: () => { setUpdating(false); onStatusChange?.(); },
        });
    };

    const patientName = appt.patient
        ? `${appt.patient.first_name} ${appt.patient.last_name}`
        : 'Patient';

    const statusActions = [
        { status: 'confirmed', label: 'Confirm',   icon: Check,       color: '#15803D', bg: '#DCFCE7' },
        { status: 'completed', label: 'Complete',  icon: Check,       color: '#0AB5A0', bg: '#E6F9F7' },
        { status: 'cancelled', label: 'Cancel',    icon: XCircle,     color: '#DC2626', bg: '#FEE2E2' },
        { status: 'no_show',   label: 'No-Show',   icon: AlertCircle, color: '#6B7280', bg: '#F3F4F6' },
    ].filter(a => a.status !== appt.status);

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, height: '100vh', width: isMobile ? '100%' : 400,
            background: '#fff', borderLeft: '1px solid #E5E7EB',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.10)', zIndex: 100,
            display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.2s ease-out',
        }}>
            <style>{`@keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

            {/* Header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Appointment Details
                </h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#9CA3AF' }}>
                    <X size={18} />
                </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                {/* Patient */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: '16px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                    <PatientAvatar name={patientName} size={48} />
                    <div>
                        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                            {patientName}
                        </div>
                        {appt.patient?.dob && (
                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                                {appt.patient.email}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                        { label: 'Date & Time', value: new Date(appt.scheduled_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) },
                        { label: 'Duration',    value: `${appt.duration_minutes} minutes` },
                        { label: 'Provider',    value: appt.provider?.name ?? '—' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #F3F4F6' }}>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280' }}>{label}</span>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#111827', fontWeight: 500 }}>{value}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280' }}>Modality</span>
                        <ModalityBadge modality={appt.modality} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280' }}>Status</span>
                        <StatusBadge status={appt.status} />
                    </div>
                    {appt.notes && (
                        <div style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 6 }}>Notes</div>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.55 }}>{appt.notes}</p>
                        </div>
                    )}
                </div>

                {/* Status actions */}
                <div style={{ marginTop: 20 }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                        Update Status
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {statusActions.map(({ status, label, icon: Icon, color, bg }) => (
                            <button
                                key={status}
                                onClick={() => changeStatus(status)}
                                disabled={updating}
                                style={{
                                    height: 36, border: `1px solid ${color}30`,
                                    borderRadius: 8, backgroundColor: bg, color,
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                                    cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.6 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    transition: 'opacity 0.1s',
                                }}
                            >
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer CTAs */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link
                    href={`/notes/assistant?patient=${appt.patient_id}&appointment=${appt.id}`}
                    style={{ height: 40, border: 'none', borderRadius: 8, backgroundColor: '#0AB5A0', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#089888'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0AB5A0'}
                >
                    <Sparkles size={15} /> Start Note
                </Link>
                <Link
                    href={`/patients/${appt.patient_id}`}
                    style={{ height: 38, border: '1px solid #E5E7EB', borderRadius: 8, backgroundColor: '#fff', color: '#374151', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                >
                    <ExternalLink size={14} /> View Patient Profile
                </Link>
            </div>
        </div>
    );
}

// ─── New Appointment Modal ────────────────────────────────────────────────────

function NewAppointmentModal({ patients, providers, onClose, defaultDate }) {
    const today = defaultDate ? defaultDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({
        patient_id:       '',
        provider_id:      '',
        date:             today,
        time:             '09:00',
        duration_minutes: '50',
        modality:         'video',
        notes:            '',
    });
    const [patientSearch, setPatientSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const filteredPatients = (patients ?? []).filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const validate = () => {
        const e = {};
        if (!form.patient_id)  e.patient_id  = 'Required';
        if (!form.provider_id) e.provider_id = 'Required';
        if (!form.date)        e.date        = 'Required';
        if (!form.time)        e.time        = 'Required';
        return e;
    };

    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSubmitting(true);
        const scheduled_at = `${form.date}T${form.time}:00`;
        router.post('/appointments', { ...form, scheduled_at }, {
            preserveState: false,
            onError: (errs) => { setErrors(errs); setSubmitting(false); },
            onSuccess: () => onClose(),
        });
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {/* Backdrop */}
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />

            {/* Modal */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 540, background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E6F9F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarDays size={18} color="#0AB5A0" />
                        </div>
                        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
                            New Appointment
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#9CA3AF' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Patient */}
                    <div>
                        <label style={labelStyle}>Patient <span style={{ color: '#EF4444' }}>*</span></label>
                        <div style={{ position: 'relative', marginBottom: errors.patient_id ? 4 : 0 }}>
                            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                placeholder="Search patient…"
                                value={patientSearch}
                                onChange={e => { setPatientSearch(e.target.value); set('patient_id', ''); }}
                                style={{ ...inputStyle, paddingLeft: 34, borderColor: errors.patient_id ? '#EF4444' : '#E5E7EB' }}
                            />
                        </div>
                        {patientSearch && (
                            <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', maxHeight: 180, overflowY: 'auto', marginTop: 4 }}>
                                {filteredPatients.length === 0
                                    ? <div style={{ padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF' }}>No patients found</div>
                                    : filteredPatients.map(p => (
                                        <button key={p.id} onClick={() => { set('patient_id', p.id); setPatientSearch(`${p.first_name} ${p.last_name}`); }} style={{ width: '100%', padding: '10px 14px', background: form.patient_id === p.id ? '#E6F9F7' : '#fff', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <PatientAvatar name={`${p.first_name} ${p.last_name}`} size={28} />
                                            <div>
                                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#111827' }}>{p.first_name} {p.last_name}</div>
                                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF' }}>{p.email}</div>
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        )}
                        {errors.patient_id && <span style={errStyle}>{errors.patient_id}</span>}
                    </div>

                    {/* Provider */}
                    <div>
                        <label style={labelStyle}>Provider <span style={{ color: '#EF4444' }}>*</span></label>
                        <select value={form.provider_id} onChange={e => set('provider_id', e.target.value)} style={{ ...inputStyle, borderColor: errors.provider_id ? '#EF4444' : '#E5E7EB' }}>
                            <option value="">Select provider…</option>
                            {(providers ?? []).map(p => (
                                <option key={p.id} value={p.id}>{p.name} — {p.provider_type}</option>
                            ))}
                        </select>
                        {errors.provider_id && <span style={errStyle}>{errors.provider_id}</span>}
                    </div>

                    {/* Date + Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Date <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ ...inputStyle, borderColor: errors.date ? '#EF4444' : '#E5E7EB' }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Time <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={{ ...inputStyle, borderColor: errors.time ? '#EF4444' : '#E5E7EB' }} />
                        </div>
                    </div>

                    {/* Duration + Session Type */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Duration</label>
                            <select value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} style={inputStyle}>
                                {[30, 45, 50, 60, 90].map(m => <option key={m} value={m}>{m} min</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Session Type</label>
                            <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                {[
                                    { val: 'video',     label: 'Video',    Icon: Video },
                                    { val: 'audio',     label: 'Audio',    Icon: Headphones },
                                    { val: 'in_person', label: 'In-Person',Icon: Building2 },
                                ].map(({ val, label, Icon }) => (
                                    <button
                                        key={val}
                                        onClick={() => set('modality', val)}
                                        style={{
                                            flex: 1, height: 40, border: `1.5px solid ${form.modality === val ? '#0AB5A0' : '#E5E7EB'}`,
                                            borderRadius: 8, background: form.modality === val ? '#E6F9F7' : '#fff',
                                            color: form.modality === val ? '#0AB5A0' : '#6B7280',
                                            fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600,
                                            cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', gap: 2,
                                            transition: 'all 0.1s',
                                        }}
                                    >
                                        <Icon size={13} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={labelStyle}>Notes <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                        <textarea
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            rows={2}
                            placeholder="Any pre-session notes…"
                            style={{ ...inputStyle, resize: 'vertical', minHeight: 72, paddingTop: 10 }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ height: 40, padding: '0 20px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', color: '#374151', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{ height: 40, padding: '0 24px', border: 'none', borderRadius: 8, backgroundColor: submitting ? '#9CA3AF' : '#0AB5A0', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#089888'; }}
                        onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#0AB5A0'; }}
                    >
                        {submitting ? 'Saving…' : <><CalendarDays size={15} /> Book Appointment</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppointmentsIndex({ appointments = [], patients = [], providers = [] }) {
    const [selectedDate, setSelectedDate]     = useState(new Date());
    const [weekBase, setWeekBase]             = useState(new Date());
    const [selectedAppt, setSelectedAppt]     = useState(null);
    const [showNewModal, setShowNewModal]     = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [showLeftPanel, setShowLeftPanel]   = useState(false);
    const isMobile                            = useIsMobile();

    // Build provider → colour map (stable by provider id order)
    const providerColorMap = useMemo(() => {
        const map = {};
        providers.forEach((p, i) => { map[p.id] = PROVIDER_COLORS[i % PROVIDER_COLORS.length]; });
        return map;
    }, [providers]);

    // Filter appointments
    const filtered = useMemo(() => {
        return appointments.filter(a => !selectedProvider || String(a.provider_id) === String(selectedProvider));
    }, [appointments, selectedProvider]);

    // Dates that have appointments (for mini calendar dots)
    const apptDates = useMemo(() => filtered.map(a => a.scheduled_at.slice(0, 10)), [filtered]);

    const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase]);

    const goToPrevWeek = () => setWeekBase(d => addDays(d, -7));
    const goToNextWeek = () => setWeekBase(d => addDays(d, 7));
    const goToPrevDay  = () => { const d = addDays(selectedDate, -1); setSelectedDate(d); setWeekBase(d); };
    const goToNextDay  = () => { const d = addDays(selectedDate,  1); setSelectedDate(d); setWeekBase(d); };
    const goToToday    = () => { setWeekBase(new Date()); setSelectedDate(new Date()); };

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        setWeekBase(date);
        if (isMobile) setShowLeftPanel(false);
    };

    const weekLabel = `${formatDateShort(weekDays[0])} – ${formatDateShort(weekDays[6])}, ${weekDays[0].getFullYear()}`;
    const dayLabel  = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <AppLayout>
            <Head title="Appointments" />

            <div style={{ display: 'flex', height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)', overflow: 'hidden' }}>

                {/* ── Left Panel (desktop always visible; mobile: slide-over) ── */}
                {isMobile && showLeftPanel && (
                    <div
                        onClick={() => setShowLeftPanel(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 39, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
                    />
                )}
                <div style={{
                    width: isMobile ? 280 : 260, flexShrink: 0,
                    borderRight: '1px solid #E5E7EB', background: '#fff',
                    display: 'flex', flexDirection: 'column', overflowY: 'auto',
                    ...(isMobile ? {
                        position: 'fixed', top: 56, bottom: 0, left: 0, zIndex: 40,
                        transform: showLeftPanel ? 'translateX(0)' : 'translateX(-100%)',
                        transition: 'transform 260ms cubic-bezier(0.4,0,0.2,1)',
                        boxShadow: showLeftPanel ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
                    } : {}),
                }}>

                    {/* Mini Calendar */}
                    <MiniCalendar
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        appointmentDates={apptDates}
                    />

                    <div style={{ borderTop: '1px solid #F3F4F6', padding: '14px 16px' }}>
                        <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                            Provider
                        </label>
                        <select
                            value={selectedProvider}
                            onChange={e => setSelectedProvider(e.target.value)}
                            style={{ width: '100%', height: 36, border: '1px solid #E5E7EB', borderRadius: 8, padding: '0 10px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151', background: '#fff', outline: 'none' }}
                        >
                            <option value="">All Providers</option>
                            {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Provider colour legend */}
                    {providers.length > 0 && (
                        <div style={{ padding: '0 16px 16px' }}>
                            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 10 }}>
                                Legend
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                {providers.map((p, i) => {
                                    const color = PROVIDER_COLORS[i % PROVIDER_COLORS.length];
                                    return (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color.border, flexShrink: 0 }} />
                                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#374151' }}>{p.name}</span>
                                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>{p.provider_type}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Panel ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F7F8FA' }}>

                    {/* Nav bar — day nav on mobile, week nav on desktop */}
                    <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Calendar toggle — mobile only */}
                            {isMobile && (
                                <button
                                    onClick={() => setShowLeftPanel(p => !p)}
                                    style={{ ...navBtn, color: showLeftPanel ? '#0AB5A0' : '#6B7280', borderColor: showLeftPanel ? '#0AB5A0' : '#E5E7EB' }}
                                    title="Toggle calendar"
                                >
                                    <SlidersHorizontal size={14} />
                                </button>
                            )}
                            <button onClick={isMobile ? goToPrevDay : goToPrevWeek} style={navBtn}><ChevronLeft size={15} /></button>
                            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#111827', minWidth: isMobile ? 'unset' : 200 }}>
                                {isMobile ? dayLabel : weekLabel}
                            </span>
                            <button onClick={isMobile ? goToNextDay : goToNextWeek} style={navBtn}><ChevronRight size={15} /></button>
                            <button onClick={goToToday} style={{ height: 32, padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', color: '#374151', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                                Today
                            </button>
                        </div>

                        <button
                            onClick={() => setShowNewModal(true)}
                            style={{ height: 38, padding: '0 18px', border: 'none', borderRadius: 8, backgroundColor: '#0AB5A0', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#089888'}
                            onMouseLeave={e => e.currentTarget.style.background = '#0AB5A0'}
                        >
                            <Plus size={16} /> {isMobile ? 'New' : 'New Appointment'}
                        </button>
                    </div>

                    {/* Day view (mobile) / Week grid (desktop) */}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff' }}>
                        {isMobile ? (
                            <DayView
                                selectedDate={selectedDate}
                                appointments={filtered}
                                providerColorMap={providerColorMap}
                                onSelectAppt={a => setSelectedAppt(prev => prev?.id === a.id ? null : a)}
                                selectedApptId={selectedAppt?.id}
                            />
                        ) : (
                            <WeekGrid
                                weekDays={weekDays}
                                appointments={filtered}
                                providerColorMap={providerColorMap}
                                onSelectAppt={a => setSelectedAppt(prev => prev?.id === a.id ? null : a)}
                                selectedApptId={selectedAppt?.id}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Slide-over ── */}
            {selectedAppt && (
                <>
                    <div onClick={() => setSelectedAppt(null)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
                    <AppointmentSlideOver
                        appt={selectedAppt}
                        onClose={() => setSelectedAppt(null)}
                        onStatusChange={() => router.reload({ only: ['appointments'] })}
                        isMobile={isMobile}
                    />
                </>
            )}

            {/* ── New Appointment Modal ── */}
            {showNewModal && (
                <NewAppointmentModal
                    patients={patients}
                    providers={providers}
                    defaultDate={selectedDate}
                    onClose={() => setShowNewModal(false)}
                />
            )}
        </AppLayout>
    );
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const navBtn = {
    width: 30, height: 30, border: '1px solid #E5E7EB', borderRadius: 6,
    background: '#fff', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#6B7280',
    transition: 'background 0.1s',
};

const inputStyle = {
    width: '100%', height: 40, padding: '0 12px',
    border: '1px solid #E5E7EB', borderRadius: 8,
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#111827',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle = {
    display: 'block', fontFamily: 'DM Sans, sans-serif',
    fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
};

const errStyle = {
    fontFamily: 'DM Sans, sans-serif', fontSize: 12,
    color: '#EF4444', marginTop: 4, display: 'block',
};