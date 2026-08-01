"use client";

import useDeviceListener from "@/hooks/useDeviceListener";
import useReadingsListener from "@/hooks/useReadingsListener";
import useAlertsListener from "@/hooks/useAlertsListener";
import StatusCard from "@/components/StatusCard";
import StatusPill from "@/components/StatusPill";
import WarehouseHeatmap from "@/components/WarehouseHeatmap";
import FrequencyChart from "@/components/FrequencyChart";
import AlertsFeed from "@/components/AlertsFeed";

export default function DashboardPage() {
  const { device, loading: deviceLoading } = useDeviceListener();
  const { readings } = useReadingsListener(40);
  const { alerts } = useAlertsListener(10);

  const level = device?.infestationLevel || "unknown";
  const isOnline = device?.status === "online";

  return (
    <div className="space-y-6 pb-16 sm:pb-0">
      {deviceLoading ? (
        <SkeletonState />
      ) : !device ? (
        <NoDeviceState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatusCard
              label="Node status"
              value={isOnline ? "Online" : "Offline"}
              tone={isOnline ? "safe" : "critical"}
              caption={device.name || "Wedge node"}
            />
            <StatusCard
              label="Infestation level"
              value={<StatusPill level={level} pulse={level === "critical"} />}
              caption="Current classification"
            />
            <StatusCard
              label="Signal level"
              value={device.dB ?? "—"}
              unit="dB"
              caption="3–5 kHz band energy"
            />
            <StatusCard
              label="Battery"
              value={device.battery ?? "—"}
              unit="%"
              tone={device.battery != null && device.battery < 20 ? "critical" : "neutral"}
              caption={formatLastSeen(device.lastSeen)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <WarehouseHeatmap
                gridConfig={device.gridConfig}
                position={device.position}
                level={level}
              />
            </div>
            <div className="xl:col-span-2">
              <AlertsFeed alerts={alerts} />
            </div>
          </div>

          <FrequencyChart readings={readings} />
        </>
      )}
    </div>
  );
}

function formatLastSeen(lastSeen) {
  if (!lastSeen?.toDate) return "No reports yet";
  const date = lastSeen.toDate();
  return `Last report ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function SkeletonState() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl border border-ink-100 bg-husk" />
      ))}
    </div>
  );
}

function NoDeviceState() {
  return (
    <div className="rounded-xl border border-dashed border-ink-100 bg-husk px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink-800">No device data yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
        We haven&rsquo;t received a document for this node in Firestore yet. Confirm the
        device ID in your <code className="rounded bg-white px-1 py-0.5">.env.local</code>{" "}
        matches the document under <code className="rounded bg-white px-1 py-0.5">devices/</code>,
        and that your ESP32-S3 has written its first status update.
      </p>
    </div>
  );
}
