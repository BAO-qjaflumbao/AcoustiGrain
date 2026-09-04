const CONFIG = {
  safe: { label: "Safe", dot: "bg-safe", text: "text-safe", bg: "bg-safe/10" },
  moderate: { label: "Moderate", dot: "bg-moderate", text: "text-moderate", bg: "bg-moderate/10" },
  critical: { label: "Critical", dot: "bg-critical", text: "text-critical", bg: "bg-critical/10" },
  unknown: { label: "No data", dot: "bg-ink-400", text: "text-ink-400", bg: "bg-ink-50" },
};

export default function StatusPill({ level = "unknown", pulse = false }) {
  const c = CONFIG[level] || CONFIG.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${pulse ? "pulse-dot" : ""}`} />
      {c.label}
    </span>
  );
}
