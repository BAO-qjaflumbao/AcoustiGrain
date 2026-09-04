import Link from "next/link";
import StatusPill from "@/components/StatusPill";

export default function FloorMapSummaryCard({ gridConfig, position, level }) {
  const rows = gridConfig?.rows || 3;
  const cols = gridConfig?.cols || 3;

  return (
    <Link
      href="/dashboard/heatmap"
      className="group flex items-center justify-between rounded-xl border border-ink-100 bg-paper p-5 shadow-card transition hover:border-grain-300"
    >
      <div>
        <h2 className="font-display text-base font-semibold text-ink-900">Storage floor map</h2>
        <p className="mt-1 text-xs text-ink-400">
          {rows} &times; {cols} sack-pile layout &middot; node at row {(position?.row ?? 0) + 1},
          column {(position?.col ?? 0) + 1}
        </p>
        <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-grain-600 group-hover:text-grain-700">
          View full floor map
          <ArrowIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </p>
      </div>
      <StatusPill level={level} pulse={level === "critical"} />
    </Link>
  );
}

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}