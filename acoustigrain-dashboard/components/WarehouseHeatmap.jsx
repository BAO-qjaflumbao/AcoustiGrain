import StatusPill from "@/components/StatusPill";

const LEVEL_FILL = {
  safe: "bg-safe/15 border-safe/40",
  moderate: "bg-moderate/15 border-moderate/40",
  critical: "bg-critical/15 border-critical/50",
  unknown: "bg-husk border-ink-100",
};

const LEVEL_DOT = {
  safe: "bg-safe",
  moderate: "bg-moderate",
  critical: "bg-critical",
  unknown: "bg-ink-400",
};

/**
 * Renders the storage floor as a grid sized to whatever layout the
 * operator configured (rows x cols of sack piles). Because the
 * layout comes from Firestore rather than being hard-coded, the same
 * component works for a 2x2 backroom shelf or a 6x10 stockroom — the
 * node's highlighted cell just moves to wherever it's positioned.
 */
export default function WarehouseHeatmap({ gridConfig, position, level }) {
  const rows = gridConfig?.rows || 3;
  const cols = gridConfig?.cols || 3;
  const cells = Array.from({ length: rows * cols }, (_, i) => ({
    row: Math.floor(i / cols),
    col: i % cols,
  }));

  return (
    <div className="rounded-xl border border-ink-100 bg-paper p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-ink-900">Storage floor map</h2>
          <p className="text-xs text-ink-400">
            {rows} &times; {cols} sack-pile layout &middot; node at row {position?.row + 1 || 1}, column{" "}
            {position?.col + 1 || 1}
          </p>
        </div>
        <StatusPill level={level} pulse={level === "critical"} />
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => {
          const isNode = cell.row === position?.row && cell.col === position?.col;
          const fill = isNode ? LEVEL_FILL[level] || LEVEL_FILL.unknown : "bg-husk border-ink-100";
          return (
            <div
              key={`${cell.row}-${cell.col}`}
              className={`relative flex aspect-square items-center justify-center rounded-md border transition ${fill}`}
              title={
                isNode
                  ? `Wedge node · ${level}`
                  : `Sack pile (row ${cell.row + 1}, col ${cell.col + 1}) — unmonitored`
              }
            >
              <SackIcon muted={!isNode} />
              {isNode && (
                <span
                  className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-paper ${LEVEL_DOT[level] || LEVEL_DOT.unknown} ${
                    level === "critical" ? "pulse-dot" : ""
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-400">
        <LegendDot color="bg-safe" label="Safe" />
        <LegendDot color="bg-moderate" label="Moderate" />
        <LegendDot color="bg-critical" label="Critical" />
        <LegendDot color="bg-husk border border-ink-100" label="Unmonitored pile" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function SackIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-1/2 w-1/2 ${muted ? "opacity-30" : "opacity-70"}`} fill="none">
      <path
        d="M8 3h8l2 5v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8l2-5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M6 9h12" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
