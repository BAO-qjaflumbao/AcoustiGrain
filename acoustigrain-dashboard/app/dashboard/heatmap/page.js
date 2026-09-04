"use client";

import useDeviceListener from "@/hooks/useDeviceListener";
import WarehouseHeatmap from "@/components/WarehouseHeatmap";
import Link from "next/link";

export default function HeatmapPage() {
  const { device, loading } = useDeviceListener();
  const level = device?.infestationLevel || "unknown";

  return (
    <div className="space-y-4 pb-16 sm:pb-0">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">
          Layout is defined per node in{" "}
          <Link href="/dashboard/settings" className="font-medium text-grain-600 hover:text-grain-700">
            Node setup
          </Link>
          .
        </p>
      </div>

      {loading ? (
        <div className="aspect-[4/3] w-full animate-pulse rounded-xl border border-ink-100 bg-husk" />
      ) : !device ? (
        <div className="rounded-xl border border-dashed border-ink-100 bg-husk px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-ink-800">No device data yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            Once the node&rsquo;s Firestore document exists, its floor map will appear here.
          </p>
        </div>
      ) : (
        <WarehouseHeatmap gridConfig={device.gridConfig} position={device.position} level={level} />
      )}
    </div>
  );
}