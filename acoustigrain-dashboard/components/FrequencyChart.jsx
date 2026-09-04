"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function FrequencyChart({ readings }) {
  const data = readings.map((r) => ({
    time: r.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    dB: typeof r.dB === "number" ? r.dB : null,
  }));

  return (
    <div className="rounded-xl border border-ink-100 bg-paper p-5 shadow-card">
      <div className="mb-4">
        <h2 className="font-display text-base font-semibold text-ink-900">
          Acoustic energy (3&ndash;5 kHz band)
        </h2>
        <p className="text-xs text-ink-400">Live signal level from the wedge&rsquo;s FFT output</p>
      </div>

      <div className="h-56 w-full">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="dbFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#AC7F35" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#AC7F35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E7E4DE" strokeDasharray="3 4" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#736A5E" }}
                axisLine={{ stroke: "#E7E4DE" }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#736A5E" }}
                axisLine={false}
                tickLine={false}
                width={36}
                unit="dB"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#E7E4DE",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="dB"
                stroke="#AC7F35"
                strokeWidth={2}
                fill="url(#dbFill)"
                isAnimationActive={false}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium text-ink-600">Waiting on the wedge&rsquo;s first reading</p>
      <p className="text-xs text-ink-400">Readings will appear here as soon as the node reports in.</p>
    </div>
  );
}
