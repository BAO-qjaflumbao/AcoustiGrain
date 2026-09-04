import StatusPill from "@/components/StatusPill";

export default function AlertsFeed({ alerts }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-paper p-5 shadow-card">
      <h2 className="font-display text-base font-semibold text-ink-900">Recent alerts</h2>
      <p className="mb-4 text-xs text-ink-400">Threshold breaches reported by the node</p>

      {alerts.length === 0 ? (
        <p className="rounded-md bg-husk px-3 py-6 text-center text-sm text-ink-400">
          No alerts yet — the storage floor is quiet.
        </p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink-800">
                  {alert.message || "Infestation threshold reached"}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-400">
                  {alert.timestamp.toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <StatusPill level={alert.level} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
