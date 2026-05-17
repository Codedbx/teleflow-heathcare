import { useState, useRef, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
  Sparkles, ChevronDown, ChevronUp, Save, Copy, ShieldCheck,
  X, Check, Loader2, Video, Phone, MapPin, ClipboardList,
  AlertTriangle, CheckCircle2,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import SoapNoteDisplay from '@/components/SoapNoteDisplay';

// ─── Constants ─────────────────────────────────────────────────────────────────

const MODALITIES = [
  { value: 'video',     label: 'Live Video',  icon: <Video size={14} /> },
  { value: 'audio',     label: 'Audio-Only',  icon: <Phone size={14} /> },
  { value: 'in_person', label: 'In-Person',   icon: <MapPin size={14} /> },
];

const NOTE_FORMATS = ['SOAP', 'DAP', 'BIRP'];

const PLACEHOLDER_NOTES =
  `Patient presented visibly anxious. Discussed triggers around work stress and upcoming performance review. PHQ-9 score 14 (moderate depression), down from 17 last session. Reviewed CBT thought-challenging strategies — patient demonstrated understanding. Reports improved sleep since starting sleep hygiene protocol. Partner conflict decreased this week. Next steps: journaling homework (3x/week), continue sleep hygiene, follow-up in 2 weeks. Session 53 minutes.`;

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Assistant({ patients, currentUser, preselected }) {
  // ── Input state ─────────────────────────────────────────────────────────────
  const [patientId,    setPatientId]    = useState(preselected?.patient_id ?? '');
  const [sessionDate,  setSessionDate]  = useState(today());
  const [duration,     setDuration]     = useState('');
  const [modality,     setModality]     = useState('video');
  const [rawNotes,     setRawNotes]     = useState('');
  const [noteFormat,   setNoteFormat]   = useState('SOAP');
  const [includeCpt,   setIncludeCpt]   = useState(true);
  const [includeBill,  setIncludeBill]  = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // ── Output state ────────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generatedNote, setGeneratedNote] = useState(null);  // full API response
  const [activeTab,    setActiveTab]    = useState('soap');

  // ── Save state ──────────────────────────────────────────────────────────────
  const [isSaving,    setIsSaving]    = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedNoteId, setSavedNoteId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const textareaRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [rawNotes]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const selectedPatient = patients.find((p) => p.id === parseInt(patientId));
  const hasOutput       = generatedNote !== null;

  // ── Generate ─────────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    setGenerateError('');
    setIsGenerating(true);
    setGeneratedNote(null);
    setSaveSuccess(false);
    setSavedNoteId(null);

    try {
      const res = await fetch('/api/notes/generate', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken(),
          'Accept':       'application/json',
        },
        body: JSON.stringify({
          patient_id:   parseInt(patientId),
          session_date: sessionDate,
          duration:     parseInt(duration),
          modality,
          raw_notes:    rawNotes,
          note_format:  noteFormat,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Generation failed. Please try again.');
      }

      setGeneratedNote(json);
      setActiveTab('soap');
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [patientId, sessionDate, duration, modality, rawNotes, noteFormat]);

  const canGenerate =
    patientId && sessionDate && duration && modality && rawNotes.trim().length >= 20 && !isGenerating;

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!generatedNote) return;
    setIsSaving(true);

    const soap = generatedNote.note.soap;
    const usage = generatedNote.note.usage ?? {};

    try {
      const res = await fetch('/notes', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken(),
          'Accept':       'application/json',
        },
        body: JSON.stringify({
          patient_id:                parseInt(patientId),
          appointment_id:            preselected?.appointment_id ?? null,
          session_date:              sessionDate,
          session_duration_minutes:  parseInt(duration),
          modality,
          raw_notes:                 rawNotes,
          soap_subjective:           soap.subjective,
          soap_objective:            soap.objective,
          soap_assessment:           soap.assessment,
          soap_plan:                 soap.plan,
          generated_by_ai:           true,
          ai_prompt_tokens:          usage.input_tokens  ?? null,
          ai_completion_tokens:      usage.output_tokens ?? null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Save failed.');

      setSaveSuccess(true);
      setSavedNoteId(json.note_id);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [generatedNote, patientId, sessionDate, duration, modality, rawNotes, preselected]);

  // ── Copy ────────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(() => {
    if (!generatedNote) return;
    const soap = generatedNote.note.soap;
    const text = [
      `SUBJECTIVE:\n${soap.subjective}`,
      `OBJECTIVE:\n${soap.objective}`,
      `ASSESSMENT:\n${soap.assessment}`,
      `PLAN:\n${soap.plan}`,
    ].join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  }, [generatedNote]);

  // ── Clear ───────────────────────────────────────────────────────────────────

  const handleClear = () => {
    setRawNotes('');
    setGeneratedNote(null);
    setGenerateError('');
    setSaveSuccess(false);
    setSavedNoteId(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AppLayout title="AI Note Assistant">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#111827] font-['Sora'] flex items-center gap-2">
            <Sparkles size={20} className="text-[#0AB5A0]" />
            AI Note Assistant
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Paste raw session notes — get a structured SOAP note and billing codes in seconds.
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Input Panel ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Session selectors */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 space-y-4">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Session Details</p>

            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className={selectCls(!patientId && hasOutput)}
              >
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (age {p.age})</option>
                ))}
              </select>
            </div>

            {/* Provider (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Provider</label>
              <div className="h-10 px-3 flex items-center rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#374151]">
                {currentUser.name}
                <span className="ml-2 text-xs font-mono text-[#9CA3AF]">{currentUser.provider_type}</span>
              </div>
            </div>

            {/* Date + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  max={today()}
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Duration (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 53"
                  min={5}
                  max={240}
                  className={inputCls()}
                />
              </div>
            </div>

            {/* Modality */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Modality</label>
              <div className="grid grid-cols-3 gap-2">
                {MODALITIES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModality(m.value)}
                    className={`
                      flex items-center justify-center gap-1.5 py-2 px-3 rounded-[6px] border text-xs font-semibold transition-all
                      ${modality === m.value
                        ? 'border-[#0AB5A0] bg-[#E6F9F7] text-[#0AB5A0]'
                        : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#D1D5DB]'}
                    `}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Notes */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 space-y-3">
            <label className="block text-sm font-medium text-[#374151]">
              Paste or type raw session notes
            </label>
            <textarea
              ref={textareaRef}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder={PLACEHOLDER_NOTES}
              rows={8}
              className="
                w-full px-3 py-3 rounded-[6px] border border-[#E5E7EB] text-sm text-[#111827]
                placeholder:text-[#C4C9D4] leading-relaxed resize-none
                focus:outline-none focus:border-[#0AB5A0] focus:ring-[3px] focus:ring-[rgba(10,181,160,0.25)]
                transition-all min-h-[200px]
              "
              style={{ height: 'auto', overflow: 'hidden' }}
            />
            <p className="text-xs text-[#9CA3AF] text-right">
              {rawNotes.length} chars
              {rawNotes.length < 20 && rawNotes.length > 0 && (
                <span className="text-[#F59E0B] ml-2">· min 20 chars</span>
              )}
            </p>
          </div>

          {/* Quick Settings (collapsible) */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <span>Quick Settings</span>
              {showSettings ? <ChevronUp size={15} className="text-[#9CA3AF]" /> : <ChevronDown size={15} className="text-[#9CA3AF]" />}
            </button>

            {showSettings && (
              <div className="px-5 pb-5 space-y-4 border-t border-[#F3F4F6]">
                {/* Note format */}
                <div className="pt-4">
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                    Note Format
                  </label>
                  <div className="flex gap-2">
                    {NOTE_FORMATS.map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setNoteFormat(fmt)}
                        className={`
                          px-4 py-1.5 rounded-[6px] text-sm font-semibold border transition-all
                          ${noteFormat === fmt
                            ? 'bg-[#0F1A2E] text-white border-[#0F1A2E]'
                            : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#D1D5DB]'}
                        `}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1">SOAP is standard for CA mental health billing</p>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <Toggle
                    label="Include CPT code suggestion"
                    checked={includeCpt}
                    onChange={setIncludeCpt}
                  />
                  <Toggle
                    label="Include billing codes"
                    checked={includeBill}
                    onChange={setIncludeBill}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="
              w-full h-12 flex items-center justify-center gap-2.5
              bg-[#0AB5A0] hover:bg-[#099e8c] text-white font-semibold rounded-[8px]
              disabled:opacity-50 disabled:pointer-events-none
              transition-all shadow-sm
            "
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Teleflow is writing your note…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate SOAP Note
              </>
            )}
          </button>

          {/* Validation error */}
          {generateError && (
            <div className="flex items-start gap-2 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3">
              <X size={15} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#EF4444]">{generateError}</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Output Panel ────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden min-h-[500px]">

            {/* Tabs */}
            <div className="flex border-b border-[#E5E7EB]">
              {['soap', 'billing', 'raw'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  disabled={!hasOutput}
                  className={`
                    flex-1 py-3.5 text-sm font-semibold capitalize transition-colors
                    disabled:opacity-40 disabled:pointer-events-none
                    ${activeTab === tab
                      ? 'border-b-2 border-[#0AB5A0] text-[#0AB5A0]'
                      : 'text-[#6B7280] hover:text-[#374151]'}
                  `}
                >
                  {tab === 'soap'    ? 'SOAP Note'     : null}
                  {tab === 'billing' ? 'Billing Codes'  : null}
                  {tab === 'raw'     ? 'Raw Text'       : null}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {!hasOutput && !isGenerating && (
                <EmptyState />
              )}

              {isGenerating && (
                <GeneratingState />
              )}

              {hasOutput && activeTab === 'soap' && (
                <SoapNoteDisplay
                  soap={generatedNote.note.soap}
                  clinicalFlags={generatedNote.note.clinical_flags ?? []}
                  generatedByAi
                />
              )}

              {hasOutput && activeTab === 'billing' && (
                <BillingCodesTab
                  billing={generatedNote.note.billing}
                  suggestedCpt={generatedNote.suggested_cpt}
                  patientId={patientId}
                  duration={duration}
                  sessionDate={sessionDate}
                />
              )}

              {hasOutput && activeTab === 'raw' && (
                <RawTab soap={generatedNote.note.soap} />
              )}
            </div>
          </div>

          {/* Action bar */}
          {hasOutput && (
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 flex items-center gap-3 flex-wrap">
              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0AB5A0] text-white text-sm font-semibold rounded-[6px] hover:bg-[#099e8c] disabled:opacity-60 disabled:pointer-events-none transition-colors"
              >
                {isSaving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving…</>
                ) : saveSuccess ? (
                  <><CheckCircle2 size={14} /> Saved</>
                ) : (
                  <><Save size={14} /> Save Note</>
                )}
              </button>

              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-semibold rounded-[6px] hover:bg-[#F9FAFB] transition-colors"
              >
                {copySuccess ? <><Check size={14} className="text-[#10B981]" /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>

              {/* Run Billing Validation */}
              <button
                type="button"
                onClick={() => {
                  const b = generatedNote.note.billing;
                  const cpt = generatedNote.suggested_cpt;
                  router.visit('/billing/validator', {
                    data: {
                      patient_id:   patientId,
                      cpt_code:     b.cpt_code     || cpt.code,
                      modifier:     b.modifier     || cpt.modifier,
                      pos_code:     b.pos_code     || cpt.pos_code,
                      duration:     duration,
                      modality,
                      icd10:        (b.icd10_suggestions ?? [])[0] ?? '',
                    },
                  });
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-semibold rounded-[6px] hover:bg-[#F9FAFB] transition-colors"
              >
                <ShieldCheck size={14} className="text-[#0AB5A0]" /> Run Billing Validation
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={handleClear}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 text-[#6B7280] text-sm font-semibold rounded-[6px] hover:bg-[#F9FAFB] transition-colors"
              >
                <X size={14} /> Clear
              </button>
            </div>
          )}

          {/* Saved link */}
          {saveSuccess && savedNoteId && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-[8px] bg-[#F0FDF4] border border-[#10B981]/30">
              <CheckCircle2 size={15} className="text-[#10B981]" />
              <span className="text-sm text-[#065F46]">
                Note saved to patient record.{' '}
                <button
                  className="underline font-semibold"
                  onClick={() => router.visit(`/notes/${savedNoteId}`)}
                >
                  View note →
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
      </div>
    </AppLayout>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
        <ClipboardList size={24} className="text-[#D1D5DB]" />
      </div>
      <p className="text-sm font-semibold text-[#9CA3AF]">No note generated yet</p>
      <p className="text-xs text-[#C4C9D4] mt-1">
        Fill in the session details and paste your notes, then hit Generate.
      </p>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-[#E6F9F7] flex items-center justify-center mb-4 animate-pulse">
        <Sparkles size={24} className="text-[#0AB5A0]" />
      </div>
      <p className="text-sm font-semibold text-[#374151]">Teleflow is writing your note…</p>
      <p className="text-xs text-[#9CA3AF] mt-1">Usually takes 5–15 seconds</p>
      <div className="mt-4 flex gap-1.5">
        {[0, 150, 300].map((d) => (
          <div
            key={d}
            className="w-2 h-2 rounded-full bg-[#0AB5A0] animate-bounce"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function BillingCodesTab({ billing, suggestedCpt, patientId, duration, sessionDate }) {
  if (!billing) return null;

  const validation = billing.cpt_validation ?? {};
  const isClean    = validation.status === 'clean';

  const rows = [
    {
      label: 'CPT Code',
      value: billing.cpt_code,
      mono: true,
      large: true,
      status: isClean ? 'clean' : 'warning',
      hint: validation.message,
    },
    {
      label: 'Description',
      value: billing.cpt_description,
    },
    {
      label: 'Telehealth Modifier',
      value: billing.modifier_validated || billing.modifier || '—',
      mono: true,
      hint: billing.modifier_validated === '95'
        ? 'Modifier 95: Synchronous telehealth (AB 72)'
        : billing.modifier_validated === '93'
        ? 'Modifier 93: Audio-only telehealth (AB 32)'
        : 'No modifier (in-person)',
    },
    {
      label: 'Place of Service',
      value: billing.pos_code_validated || billing.pos_code || '—',
      mono: true,
      hint: (billing.pos_code_validated || billing.pos_code) === '10'
        ? "POS 10: Patient's home (telehealth)"
        : (billing.pos_code_validated || billing.pos_code) === '11'
        ? 'POS 11: Office'
        : 'POS 02: Other telehealth',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Code rows */}
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between py-2.5 border-b border-[#F3F4F6] last:border-0">
          <div className="flex-1">
            <p className="text-xs text-[#9CA3AF] mb-0.5">{row.label}</p>
            <p className={`
              ${row.mono ? "font-['JetBrains_Mono']" : ''}
              ${row.large ? 'text-2xl font-bold text-[#111827]' : 'text-sm font-semibold text-[#111827]'}
            `}>
              {row.value || '—'}
            </p>
            {row.hint && (
              <p className="text-xs text-[#6B7280] mt-0.5">{row.hint}</p>
            )}
          </div>
          {row.status && (
            <div className="ml-3 flex-shrink-0">
              {row.status === 'clean'
                ? <CheckCircle2 size={18} className="text-[#10B981]" />
                : <AlertTriangle size={18} className="text-[#F59E0B]" />}
            </div>
          )}
        </div>
      ))}

      {/* ICD-10 suggestions */}
      {billing.icd10_suggestions && billing.icd10_suggestions.length > 0 && (
        <div>
          <p className="text-xs text-[#9CA3AF] mb-2">ICD-10 Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {billing.icd10_suggestions.map((code) => (
              <span
                key={code}
                className="px-3 py-1 rounded-full bg-[#F3F4F6] font-['JetBrains_Mono'] text-sm font-semibold text-[#374151] border border-[#E5E7EB]"
              >
                {code}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1.5">
            Confirm ICD-10 codes against patient record before billing.
          </p>
        </div>
      )}

      {/* Duration note from Teleflow */}
      {billing.session_duration_note && (
        <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3">
          <p className="text-xs text-[#6B7280]">{billing.session_duration_note}</p>
        </div>
      )}
    </div>
  );
}

function RawTab({ soap }) {
  const [copied, setCopied] = useState(false);

  const text = soap
    ? [
        `SUBJECTIVE:\n${soap.subjective}`,
        `OBJECTIVE:\n${soap.objective}`,
        `ASSESSMENT:\n${soap.assessment}`,
        `PLAN:\n${soap.plan}`,
      ].join('\n\n')
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#9CA3AF]">Plain text — paste into any EHR</p>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#0AB5A0] hover:text-[#099e8c]"
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy all</>}
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        className="w-full h-80 px-3 py-3 rounded-[6px] bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#374151] font-['DM_Sans'] leading-relaxed resize-none focus:outline-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-[#374151]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-9 h-5 rounded-full transition-colors flex-shrink-0
          ${checked ? 'bg-[#0AB5A0]' : 'bg-[#D1D5DB]'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function inputCls() {
  return 'w-full h-10 px-3 rounded-[6px] border border-[#E5E7EB] text-sm text-[#111827] bg-white focus:outline-none focus:border-[#0AB5A0] focus:ring-[3px] focus:ring-[rgba(10,181,160,0.25)] transition-all placeholder:text-[#9CA3AF]';
}

function selectCls(error) {
  const base = 'w-full h-10 px-3 rounded-[6px] border text-sm text-[#111827] bg-white focus:outline-none focus:border-[#0AB5A0] focus:ring-[3px] focus:ring-[rgba(10,181,160,0.25)] transition-all';
  return error ? `${base} border-[#EF4444]` : `${base} border-[#E5E7EB]`;
}