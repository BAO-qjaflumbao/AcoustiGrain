const TONE_STYLES = {
  neutral: "text-ink-900",
  safe: "text-safe",
  moderate: "text-moderate",
  critical: "text-critical",
};

export default function StatusCard({ label, value, unit, tone = "neutral", caption }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-paper p-4 shadow-card">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold ${TONE_STYLES[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-ink-400">{unit}</span>}
      </p>
      {caption && <p className="mt-1 text-xs text-ink-400">{caption}</p>}
    </div>
  );
}
