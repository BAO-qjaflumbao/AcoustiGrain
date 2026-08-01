"use client";

import { useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, DEVICE_ID } from "@/lib/firebase";
import useDeviceListener from "@/hooks/useDeviceListener";
import WarehouseHeatmap from "@/components/WarehouseHeatmap";

export default function NodeSetupPage() {
  const { device, loading } = useDeviceListener();

  const [name, setName] = useState("");
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [row, setRow] = useState(0);
  const [col, setCol] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!device) return;
    setName(device.name || "");
    setRows(device.gridConfig?.rows || 3);
    setCols(device.gridConfig?.cols || 3);
    setRow(device.position?.row ?? 0);
    setCol(device.position?.col ?? 0);
  }, [device]);

  // Keep the position clamped inside whatever grid size is chosen.
  useEffect(() => {
    setRow((r) => Math.min(r, rows - 1));
    setCol((c) => Math.min(c, cols - 1));
  }, [rows, cols]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(
        doc(db, "devices", DEVICE_ID),
        {
          name,
          gridConfig: { rows: Number(rows), cols: Number(cols) },
          position: { row: Number(row), col: Number(col) },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-16 lg:grid-cols-2 sm:pb-0">
      <div className="rounded-xl border border-ink-100 bg-paper p-5 shadow-card">
        <h2 className="font-display text-base font-semibold text-ink-900">Node setup</h2>
        <p className="mb-5 text-xs text-ink-400">
          Describe how sacks are laid out in this storage area and where the wedge
          node ({DEVICE_ID}) is currently placed. This only affects how the floor
          map is drawn — it doesn&rsquo;t move the physical sensor.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <Field label="Node label">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Backroom wedge"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Storage rows">
              <input
                type="number"
                min={1}
                max={12}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value) || 1)}
                className="input"
              />
            </Field>
            <Field label="Storage columns">
              <input
                type="number"
                min={1}
                max={12}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value) || 1)}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Node row">
              <select value={row} onChange={(e) => setRow(Number(e.target.value))} className="input">
                {Array.from({ length: rows }, (_, i) => (
                  <option key={i} value={i}>
                    Row {i + 1}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Node column">
              <select value={col} onChange={(e) => setCol(Number(e.target.value))} className="input">
                {Array.from({ length: cols }, (_, i) => (
                  <option key={i} value={i}>
                    Column {i + 1}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full rounded-lg bg-grain-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-grain-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save layout"}
          </button>
          {saved && <p className="text-center text-xs text-safe">Layout saved.</p>}
        </form>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-400">
          Preview
        </p>
        <WarehouseHeatmap
          gridConfig={{ rows, cols }}
          position={{ row, col }}
          level={device?.infestationLevel || "unknown"}
        />
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e7e4de;
          background: #f7f5f0;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: #1a1712;
          outline: none;
          transition: 0.15s;
        }
        .input:focus {
          border-color: #c49a4e;
          box-shadow: 0 0 0 3px rgba(196, 154, 78, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
        {label}
      </span>
      {children}
    </label>
  );
}
