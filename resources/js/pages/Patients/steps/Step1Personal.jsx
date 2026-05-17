import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';

const GENDER_OPTIONS = [
  { value: 'male',                label: 'Male' },
  { value: 'female',              label: 'Female' },
  { value: 'non_binary',          label: 'Non-binary' },
  { value: 'prefer_not_to_say',   label: 'Prefer not to say' },
  { value: 'other',               label: 'Other' },
];

export default function Step1Personal({ data, onChange, errors }) {
  const field = (key, value) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827] font-['Sora']">Personal Information</h2>
        <p className="text-sm text-[#6B7280] mt-1">Basic demographic details for the patient record.</p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" error={errors?.first_name} icon={<User size={15} />}>
          <input
            type="text"
            value={data.first_name}
            onChange={(e) => field('first_name', e.target.value)}
            placeholder="Maria"
            className={inputCls(errors?.first_name)}
          />
        </Field>
        <Field label="Last Name" error={errors?.last_name}>
          <input
            type="text"
            value={data.last_name}
            onChange={(e) => field('last_name', e.target.value)}
            placeholder="Gonzalez"
            className={inputCls(errors?.last_name)}
          />
        </Field>
      </div>

      {/* DOB + Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Date of Birth" error={errors?.dob} icon={<Calendar size={15} />}>
          <input
            type="date"
            value={data.dob}
            onChange={(e) => field('dob', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={inputCls(errors?.dob)}
          />
        </Field>
        <Field label="Gender" error={errors?.gender}>
          <select
            value={data.gender}
            onChange={(e) => field('gender', e.target.value)}
            className={inputCls(errors?.gender)}
          >
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone Number" error={errors?.phone} icon={<Phone size={15} />}>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => field('phone', e.target.value)}
            placeholder="(415) 555-0123"
            className={inputCls(errors?.phone)}
          />
        </Field>
        <Field label="Email Address" error={errors?.email} icon={<Mail size={15} />}>
          <input
            type="email"
            value={data.email}
            onChange={(e) => field('email', e.target.value)}
            placeholder="maria@example.com"
            className={inputCls(errors?.email)}
          />
        </Field>
      </div>

      {/* Address */}
      <Field label="Street Address" error={errors?.address} icon={<MapPin size={15} />}>
        <input
          type="text"
          value={data.address}
          onChange={(e) => field('address', e.target.value)}
          placeholder="123 Oak Street, Apt 4B"
          className={inputCls(errors?.address)}
        />
      </Field>

      {/* City / State / Zip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="col-span-2 sm:col-span-3">
          <Field label="City" error={errors?.city}>
            <input
              type="text"
              value={data.city}
              onChange={(e) => field('city', e.target.value)}
              placeholder="Los Angeles"
              className={inputCls(errors?.city)}
            />
          </Field>
        </div>
        <div className="col-span-1">
          <Field label="State" error={errors?.state}>
            <input
              type="text"
              value={data.state}
              onChange={(e) => field('state', e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="CA"
              className={inputCls(errors?.state) + ' uppercase'}
            />
          </Field>
        </div>
        <div className="col-span-1">
          <Field label="ZIP" error={errors?.zip}>
            <input
              type="text"
              value={data.zip}
              onChange={(e) => field('zip', e.target.value)}
              placeholder="90001"
              maxLength={10}
              className={inputCls(errors?.zip)}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function Field({ label, children, error, icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#374151] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            {icon}
          </span>
        )}
        <div className={icon ? '[&>*]:pl-9' : ''}>
          {children}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  const base =
    'w-full h-10 px-3 rounded-[6px] border text-sm text-[#111827] bg-white ' +
    'focus:outline-none focus:ring-[3px] transition-all placeholder:text-[#9CA3AF]';
  return error
    ? `${base} border-[#EF4444] focus:ring-red-100`
    : `${base} border-[#E5E7EB] focus:border-[#0AB5A0] focus:ring-[rgba(10,181,160,0.25)]`;
}