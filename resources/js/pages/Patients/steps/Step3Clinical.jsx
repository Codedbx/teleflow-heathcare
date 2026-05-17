import { Video, Phone, MapPin, Brain, Clock, Calendar } from 'lucide-react';

const PROVIDER_TYPES = [
  { value: 'LCSW',          label: 'LCSW',         desc: 'Licensed Clinical Social Worker' },
  { value: 'LMFT',          label: 'LMFT',         desc: 'Licensed Marriage & Family Therapist' },
  { value: 'LPCC',          label: 'LPCC',         desc: 'Licensed Professional Clinical Counselor' },
  { value: 'Psychologist',  label: 'Psychologist', desc: 'Licensed Psychologist (PhD/PsyD)' },
  { value: 'Psychiatrist',  label: 'Psychiatrist', desc: 'Psychiatrist (MD/DO)' },
];

const MODALITIES = [
  { value: 'video',     label: 'Live Video',   desc: 'Secure telehealth video session',  icon: <Video size={16} /> },
  { value: 'audio',     label: 'Audio-Only',   desc: 'Phone session, no video required', icon: <Phone size={16} /> },
  { value: 'in_person', label: 'In-Person',    desc: 'Visit our office location',        icon: <MapPin size={16} /> },
];

const CONCERNS = [
  'Anxiety', 'Depression', 'PTSD', 'Bipolar Disorder',
  'Substance Use', 'Relationship Issues', 'Grief / Loss',
  'Life Transitions', 'Work Stress', 'Trauma', 'OCD', 'Other',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_SLOTS = [
  { value: 'morning',   label: 'Morning',   desc: '8am – 12pm' },
  { value: 'afternoon', label: 'Afternoon', desc: '12pm – 5pm' },
  { value: 'evening',   label: 'Evening',   desc: '5pm – 8pm' },
];

export default function Step3Clinical({ data, onChange, errors }) {
  const field = (key, value) => onChange({ ...data, [key]: value });

  const toggleArrayItem = (key, item) => {
    const arr = data[key] || [];
    const updated = arr.includes(item)
      ? arr.filter((x) => x !== item)
      : [...arr, item];
    field(key, updated);
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-semibold text-[#111827] font-['Sora']">Clinical Preferences</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          These preferences guide provider matching. All selections can be updated after intake.
        </p>
      </div>

      {/* Provider Type */}
      <section>
        <label className="block text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
          <Brain size={15} className="text-[#0AB5A0]" />
          Preferred Provider Type
        </label>
        <div className="space-y-2">
          {PROVIDER_TYPES.map((pt) => (
            <label key={pt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="preferred_provider_type"
                value={pt.value}
                checked={data.preferred_provider_type === pt.value}
                onChange={() => field('preferred_provider_type', pt.value)}
                className="accent-[#0AB5A0] w-4 h-4 flex-shrink-0"
              />
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[#111827] font-['JetBrains_Mono']">
                  {pt.label}
                </span>
                <span className="text-xs text-[#6B7280]">{pt.desc}</span>
              </div>
            </label>
          ))}
        </div>
        {errors?.preferred_provider_type && (
          <p className="mt-1.5 text-xs text-[#EF4444]">{errors.preferred_provider_type}</p>
        )}
      </section>

      {/* Session Modality */}
      <section>
        <label className="block text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
          <Video size={15} className="text-[#0AB5A0]" />
          Session Modality Preference
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODALITIES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => field('modality_preference', m.value)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-[10px] border-2 text-center transition-all
                ${data.modality_preference === m.value
                  ? 'border-[#0AB5A0] bg-[#E6F9F7] shadow-sm'
                  : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'}
              `}
            >
              <span className={data.modality_preference === m.value ? 'text-[#0AB5A0]' : 'text-[#9CA3AF]'}>
                {m.icon}
              </span>
              <span className="text-sm font-semibold text-[#111827]">{m.label}</span>
              <span className="text-[11px] text-[#6B7280] leading-tight">{m.desc}</span>
            </button>
          ))}
        </div>
        {errors?.modality_preference && (
          <p className="mt-1.5 text-xs text-[#EF4444]">{errors.modality_preference}</p>
        )}
      </section>

      {/* Presenting Concerns */}
      <section>
        <label className="block text-sm font-semibold text-[#374151] mb-1">
          Presenting Concerns
          <span className="font-normal text-[#9CA3AF] ml-1">(select all that apply)</span>
        </label>
        <p className="text-xs text-[#6B7280] mb-3">This information stays confidential within your care team.</p>
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map((concern) => {
            const selected = (data.presenting_concerns || []).includes(concern);
            return (
              <button
                key={concern}
                type="button"
                onClick={() => toggleArrayItem('presenting_concerns', concern)}
                className={`
                  px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all
                  ${selected
                    ? 'bg-[#0AB5A0] text-white border-[#0AB5A0]'
                    : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#0AB5A0] hover:text-[#0AB5A0]'}
                `}
              >
                {concern}
              </button>
            );
          })}
        </div>
        {errors?.presenting_concerns && (
          <p className="mt-1.5 text-xs text-[#EF4444]">{errors.presenting_concerns}</p>
        )}
      </section>

      {/* Preferred Days */}
      <section>
        <label className="block text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
          <Calendar size={15} className="text-[#0AB5A0]" />
          Preferred Appointment Days
          <span className="font-normal text-[#9CA3AF]">(optional)</span>
        </label>
        <div className="flex gap-2">
          {DAYS.map((day) => {
            const selected = (data.preferred_days || []).includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleArrayItem('preferred_days', day)}
                className={`
                  w-10 h-10 rounded-[8px] text-sm font-semibold border transition-all
                  ${selected
                    ? 'bg-[#0F1A2E] text-white border-[#0F1A2E]'
                    : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#9CA3AF]'}
                `}
              >
                {day.charAt(0)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Preferred Time Slots */}
      <section>
        <label className="block text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
          <Clock size={15} className="text-[#0AB5A0]" />
          Preferred Time of Day
          <span className="font-normal text-[#9CA3AF]">(optional)</span>
        </label>
        <div className="flex gap-3">
          {TIME_SLOTS.map((slot) => {
            const selected = (data.preferred_time_slots || []).includes(slot.value);
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => toggleArrayItem('preferred_time_slots', slot.value)}
                className={`
                  flex-1 py-2.5 px-3 rounded-[8px] border text-center transition-all
                  ${selected
                    ? 'bg-[#E6F9F7] border-[#0AB5A0] text-[#0AB5A0]'
                    : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB]'}
                `}
              >
                <p className="text-sm font-semibold">{slot.label}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{slot.desc}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}