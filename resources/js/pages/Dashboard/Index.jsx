import { Link } from '@inertiajs/react';
import {
  CalendarDays, Receipt, UserPlus, Sparkles,
  AlertTriangle, Video, Phone, MapPin,
  TrendingUp, TrendingDown, Minus,
  ArrowRight, CalendarOff,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Index({ stats, todaySchedule, billingAlerts, recentPatients, todayDate }) {
  return (
    <AppLayout title="Dashboard">
      <div className="p-4 sm:p-6 lg:p-8">

      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-[#111827] font-['Sora']">Dashboard</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{todayDate}</p>
      </div>

      {/* ── Stat Row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-7">
        <StatCard
          icon={<CalendarDays size={22} />}
          iconColor="text-[#0AB5A0]"
          iconBg="bg-[#E6F9F7]"
          label="Today's Appointments"
          value={stats.today_appointments.value}
          trend={stats.today_appointments.trend}
          trendLabel={stats.today_appointments.trend_label}
          positiveIsGood={stats.today_appointments.positive_is_good}
        />
        <StatCard
          icon={<Receipt size={22} />}
          iconColor="text-[#F59E0B]"
          iconBg="bg-[#FEF3C7]"
          label="Pending Billing Claims"
          value={stats.pending_claims.value}
          trend={stats.pending_claims.trend}
          trendLabel={stats.pending_claims.trend_label}
          positiveIsGood={stats.pending_claims.positive_is_good}
        />
        <StatCard
          icon={<UserPlus size={22} />}
          iconColor="text-[#0AB5A0]"
          iconBg="bg-[#E6F9F7]"
          label="New Patient Intakes"
          value={stats.new_intakes.value}
          trend={stats.new_intakes.trend}
          trendLabel={stats.new_intakes.trend_label}
          positiveIsGood={stats.new_intakes.positive_is_good}
        />
        <StatCard
          icon={<Sparkles size={22} />}
          iconColor="text-[#10B981]"
          iconBg="bg-[#F0FDF4]"
          label="AI Notes Generated"
          value={stats.ai_notes.value}
          trend={stats.ai_notes.trend}
          trendLabel={stats.ai_notes.trend_label}
          positiveIsGood={stats.ai_notes.positive_is_good}
        />
      </div>

      {/* ── Main content: 60/40 split ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5 mb-7">

        {/* Today's Schedule — 60% (3 of 5 cols) */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-[#0AB5A0]" />
              <h2 className="text-sm font-semibold text-[#111827]">Today's Schedule</h2>
              {todaySchedule.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#E6F9F7] text-[#0AB5A0] text-xs font-semibold">
                  {todaySchedule.length}
                </span>
              )}
            </div>
            <Link
              href="/appointments"
              className="flex items-center gap-1 text-xs font-semibold text-[#0AB5A0] hover:text-[#099e8c] transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Schedule list */}
          <div className="divide-y divide-[#F9FAFB]">
            {todaySchedule.length === 0 ? (
              <ScheduleEmptyState />
            ) : (
              todaySchedule.map((appt) => (
                <AppointmentRow key={appt.id} appt={appt} />
              ))
            )}
          </div>
        </div>

        {/* Billing Alerts — 40% (2 of 5 cols) */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#F59E0B]" />
              <h2 className="text-sm font-semibold text-[#111827]">Billing Alerts</h2>
              {billingAlerts.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-semibold">
                  {billingAlerts.length}
                </span>
              )}
            </div>
            <Link
              href="/billing/claims"
              className="flex items-center gap-1 text-xs font-semibold text-[#0AB5A0] hover:text-[#099e8c] transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Alert rows */}
          <div className="divide-y divide-[#F9FAFB]">
            {billingAlerts.length === 0 ? (
              <BillingEmptyState />
            ) : (
              billingAlerts.map((alert) => (
                <BillingAlertRow key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Patient Activity ──────────────────────────────────────────── */}
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <h2 className="text-sm font-semibold text-[#111827]">Recent Patient Activity</h2>
          <Link
            href="/patients"
            className="flex items-center gap-1 text-xs font-semibold text-[#0AB5A0] hover:text-[#099e8c] transition-colors"
          >
            View all patients <ArrowRight size={12} />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB]">
                {[
                  { label: 'Patient', cls: '' },
                  { label: 'Last Session', cls: 'hidden md:table-cell' },
                  { label: 'Next Session', cls: 'hidden md:table-cell' },
                  { label: 'Provider', cls: 'hidden lg:table-cell' },
                  { label: 'Status', cls: '' },
                ].map(({ label, cls }) => (
                  <th
                    key={label}
                    className={`px-4 lg:px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9FAFB]">
              {recentPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#9CA3AF]">
                    No active patients yet
                  </td>
                </tr>
              ) : (
                recentPatients.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>{/* /responsive padding wrapper */}
    </AppLayout>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ icon, iconColor, iconBg, label, value, trend, trendLabel, positiveIsGood }) {
  const isPositive = trend > 0;
  const isNeutral  = trend === 0;

  // Determine if this trend is visually good or bad
  const isGood = isPositive ? positiveIsGood : !positiveIsGood;
  const trendColor = isNeutral
    ? 'text-[#9CA3AF]'
    : isGood
    ? 'text-[#10B981]'
    : 'text-[#EF4444]';

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center mb-4 ${iconColor}`}>
        {icon}
      </div>

      {/* Value */}
      <p className="text-[36px] font-bold text-[#111827] font-['Sora'] leading-none mb-1">
        {value}
      </p>

      {/* Label */}
      <p className="text-[13px] text-[#6B7280] mb-3">{label}</p>

      {/* Trend chip */}
      <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
        <TrendIcon size={13} />
        <span>
          {isNeutral ? 'No change' : `${isPositive ? '+' : ''}${trend}`} {trendLabel}
        </span>
      </div>
    </div>
  );
}

// ─── AppointmentRow ────────────────────────────────────────────────────────────

const MODALITY_CONFIG = {
  video:     { icon: <Video size={12} />,  label: 'Video',     color: 'bg-[#E6F9F7] text-[#0AB5A0]' },
  audio:     { icon: <Phone size={12} />,  label: 'Audio',     color: 'bg-[#EEF2FF] text-[#6366F1]' },
  in_person: { icon: <MapPin size={12} />, label: 'In-Person', color: 'bg-[#F3F4F6] text-[#374151]' },
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-[#FEF3C7] text-[#D97706]' },
  confirmed: { label: 'Confirmed', color: 'bg-[#E6F9F7] text-[#0AB5A0]' },
  completed: { label: 'Completed', color: 'bg-[#F0FDF4] text-[#10B981]' },
  cancelled: { label: 'Cancelled', color: 'bg-[#FEF2F2] text-[#EF4444]' },
  no_show:   { label: 'No-Show',   color: 'bg-[#F3F4F6] text-[#6B7280]' },
};

function AppointmentRow({ appt }) {
  const modality = MODALITY_CONFIG[appt.modality] ?? MODALITY_CONFIG.video;
  const status   = STATUS_CONFIG[appt.status]     ?? STATUS_CONFIG.pending;

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors">
      {/* Time pill */}
      <div className="w-[72px] flex-shrink-0">
        <span className="text-xs font-bold text-[#0F1A2E] font-['JetBrains_Mono'] bg-[#F3F4F6] px-2.5 py-1 rounded-[6px] whitespace-nowrap">
          {appt.time}
        </span>
      </div>

      {/* Patient avatar + name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-[#0F1A2E] flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-white">{appt.patient.initials}</span>
        </div>
        <div className="min-w-0">
          <Link
            href={`/patients/${appt.patient.id}`}
            className="text-sm font-semibold text-[#111827] hover:text-[#0AB5A0] truncate block transition-colors"
          >
            {appt.patient.name}
          </Link>
          <p className="text-xs text-[#9CA3AF] truncate">{appt.provider}</p>
        </div>
      </div>

      {/* Modality badge */}
      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${modality.color}`}>
        {modality.icon} {modality.label}
      </span>

      {/* Status badge */}
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${status.color}`}>
        {status.label}
      </span>
    </div>
  );
}

// ─── BillingAlertRow ───────────────────────────────────────────────────────────

function BillingAlertRow({ alert }) {
  const isError = alert.validation_status === 'error';

  // Build the prefill URL for the billing validator
  const fixUrl = `/billing/validator?patient_id=${alert.patient_id}&cpt_code=${alert.cpt_code}&modifier=${alert.modifier ?? ''}`;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors">
      {/* Patient name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111827] truncate">
          {alert.patient_name}
        </p>
        <p className="text-xs text-[#9CA3AF] truncate mt-0.5" title={alert.error_summary}>
          {alert.error_summary.length > 48
            ? alert.error_summary.slice(0, 48) + '…'
            : alert.error_summary}
        </p>
      </div>

      {/* Status pill */}
      <span className={`
        px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0
        ${isError
          ? 'bg-[#FEF2F2] text-[#EF4444]'
          : 'bg-[#FEF3C7] text-[#D97706]'}
      `}>
        {isError ? 'Error' : 'Warning'}
      </span>

      {/* CPT code */}
      <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#374151] flex-shrink-0">
        {alert.cpt_code}
      </span>

      {/* Fix button */}
      <Link
        href={fixUrl}
        className="flex-shrink-0 px-3 py-1.5 rounded-[6px] bg-[#0F1A2E] text-white text-xs font-semibold hover:bg-[#1A2D4A] transition-colors"
      >
        Fix
      </Link>
    </div>
  );
}

// ─── PatientRow ────────────────────────────────────────────────────────────────

const PATIENT_STATUS_CONFIG = {
  active:         { label: 'Active',         color: 'bg-[#E6F9F7] text-[#0AB5A0]' },
  inactive:       { label: 'Inactive',       color: 'bg-[#F3F4F6] text-[#6B7280]' },
  pending_intake: { label: 'Pending Intake', color: 'bg-[#FEF3C7] text-[#D97706]' },
};

function PatientRow({ patient }) {
  const statusCfg = PATIENT_STATUS_CONFIG[patient.status] ?? PATIENT_STATUS_CONFIG.active;

  return (
    <tr className="hover:bg-[#F9FAFB] transition-colors" style={{ height: '52px' }}>
      {/* Patient */}
      <td className="px-4 lg:px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0F1A2E] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-white">{patient.initials}</span>
          </div>
          <Link
            href={`/patients/${patient.id}`}
            className="text-sm font-semibold text-[#111827] hover:text-[#0AB5A0] transition-colors"
          >
            {patient.name}
          </Link>
        </div>
      </td>

      {/* Last session */}
      <td className="hidden md:table-cell px-4 lg:px-5 py-3 text-sm text-[#374151]">
        {patient.last_session}
      </td>

      {/* Next session */}
      <td className="hidden md:table-cell px-4 lg:px-5 py-3 text-sm text-[#374151]">
        {patient.next_session === '—' ? (
          <span className="text-[#9CA3AF]">—</span>
        ) : (
          patient.next_session
        )}
      </td>

      {/* Provider */}
      <td className="hidden lg:table-cell px-4 lg:px-5 py-3 text-sm text-[#374151]">
        {patient.provider}
      </td>

      {/* Status */}
      <td className="px-4 lg:px-5 py-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </td>
    </tr>
  );
}

// ─── Empty States ──────────────────────────────────────────────────────────────

function ScheduleEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-5">
      <CalendarOff size={28} className="text-[#D1D5DB] mb-3" />
      <p className="text-sm text-[#9CA3AF]">No appointments today</p>
    </div>
  );
}

function BillingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-5">
      <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-3">
        <Receipt size={18} className="text-[#10B981]" />
      </div>
      <p className="text-sm text-[#9CA3AF]">No billing alerts</p>
    </div>
  );
}