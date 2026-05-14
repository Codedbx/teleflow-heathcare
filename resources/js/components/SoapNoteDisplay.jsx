import { AlertTriangle, Sparkles } from 'lucide-react';

/**
 * SoapNoteDisplay
 *
 * Reusable component that renders a structured SOAP note.
 * Used in: Notes/Assistant.jsx (output panel), Notes/Show.jsx, Patients/Show.jsx (Notes tab).
 *
 * Props:
 *   soap           — { subjective, objective, assessment, plan }
 *   clinicalFlags  — string[] — AI-flagged concerns to surface to the clinician
 *   compact        — bool — tighter layout for patient profile tabs
 *   generatedByAi  — bool — shows "AI Generated" badge
 */
export default function SoapNoteDisplay({
  soap,
  clinicalFlags = [],
  compact       = false,
  generatedByAi = false,
}) {
  if (!soap) return null;

  const sections = [
    {
      key:    'subjective',
      label:  'S — Subjective',
      sub:    'What the patient reported',
      color:  'border-[#0AB5A0]',
      bg:     'bg-[#F0FDFB]',
      labelColor: 'text-[#0AB5A0]',
    },
    {
      key:    'objective',
      label:  'O — Objective',
      sub:    'Clinician observations & assessments',
      color:  'border-[#6366F1]',
      bg:     'bg-[#EEF2FF]',
      labelColor: 'text-[#6366F1]',
    },
    {
      key:    'assessment',
      label:  'A — Assessment',
      sub:    'Clinical impressions & diagnosis',
      color:  'border-[#F59E0B]',
      bg:     'bg-[#FFFBEB]',
      labelColor: 'text-[#D97706]',
    },
    {
      key:    'plan',
      label:  'P — Plan',
      sub:    'Treatment plan & next steps',
      color:  'border-[#10B981]',
      bg:     'bg-[#F0FDF4]',
      labelColor: 'text-[#10B981]',
    },
  ];

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>

      {/* AI badge */}
      {generatedByAi && (
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={13} className="text-[#0AB5A0]" />
          <span className="text-xs font-semibold text-[#0AB5A0] uppercase tracking-wider">
            AI Generated Note
          </span>
        </div>
      )}

      {/* SOAP sections */}
      {sections.map((s) => {
        const content = soap[s.key];
        if (!content) return null;

        return (
          <div
            key={s.key}
            className={`
              border-l-[3px] ${s.color} rounded-r-[8px] ${s.bg}
              ${compact ? 'p-3' : 'p-4'}
            `}
          >
            {/* Section label */}
            <p
              className={`
                font-['Sora'] text-[11px] font-semibold uppercase tracking-widest mb-1
                ${s.labelColor}
              `}
            >
              {s.label}
            </p>

            {!compact && (
              <p className="text-[11px] text-[#9CA3AF] mb-2">{s.sub}</p>
            )}

            {/* Content */}
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
        );
      })}

      {/* Clinical Flags */}
      {clinicalFlags && clinicalFlags.length > 0 && (
        <div className="mt-2 rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-[#D97706]" />
            <span className="text-xs font-semibold text-[#D97706] uppercase tracking-wide">
              Clinical Flags
            </span>
          </div>
          <ul className="space-y-1">
            {clinicalFlags.map((flag, i) => (
              <li key={i} className="text-xs text-[#92400E] flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}