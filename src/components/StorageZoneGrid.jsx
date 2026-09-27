import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  Bug, 
  AlertOctagon, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Radio,
  RotateCcw,
  Usb,
  Eye,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function StorageZoneGrid() {
  const { 
    isAdmin,
    nodes, 
    setSelectedNodeId, 
    setActiveTab, 
    metrics, 
    alerts,
    connectPhysicalHardware,
    isHardwareConnected,
    resetToBlankState,
    triggerOutbreak,
    floorMap
  } = useTelemetry();

  // Deduplicate and group by base zone (ignoring levels for the main overview)
  const zoneDefinitions = [];
  if (floorMap && floorMap.stacks) {
    const uniqueZones = new Set();
    floorMap.stacks.forEach(stk => {
      uniqueZones.add(stk.zone);
    });
    
    Array.from(uniqueZones).forEach((zoneName, i) => {
      zoneDefinitions.push({
        code: `Z${i + 1}`,
        name: zoneName
      });
    });
  }

  // Sort zone definitions alphabetically to ensure consistent grid order
  zoneDefinitions.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  // Dynamically compute zone data from live/persisted telemetry nodes
  const zonesList = zoneDefinitions.map(z => {
    const zNodes = nodes.filter(n => n.zone === z.name);
    const maxVal = zNodes.length > 0 ? Math.max(...zNodes.map(n => n.infestationLevel)) : 0;
    
    let color = 'bg-safe/10 border-safe/30 text-safe';
    let statusText = 'Safe';

    if (maxVal >= 70) {
      color = 'bg-critical/10 border-critical/40 text-critical animate-pulse';
      statusText = 'Critical Risk';
    } else if (maxVal >= 36) {
      color = 'bg-moderate/10 border-moderate/30 text-moderate';
      statusText = 'Moderate Warning';
    } else if (maxVal === 0) {
      color = 'bg-husk border-ink-100 text-ink-700';
      statusText = 'Clean / Blank';
    }

    return {
      ...z,
      val: maxVal,
      statusText,
      color
    };
  });

  const hasAnyTelemetryData = nodes.some(n => n.infestationLevel > 0 || n.peakFreqHz > 0);
  const criticalZone = zonesList.find(z => z.val >= 70);
  const moderateZone = zonesList.find(z => z.val >= 36 && z.val < 70);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white">
      {/* Top Banner: Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">
            NFA Rice Warehouse Overview
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Real-time acoustic pest monitoring &amp; grain safety assessment for warehouse staff.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {isAdmin && (
            <button 
              onClick={resetToBlankState}
              className="flex items-center space-x-1.5 bg-paper hover:bg-husk text-ink-700 text-xs font-semibold px-3 py-2 rounded-md border border-ink-100 shadow-card transition cursor-pointer"
              title="Reset dashboard back to blank initial state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-ink-400" />
              <span>Reset Data</span>
            </button>
          )}

          <button 
            onClick={() => setActiveTab('heatmap')}
            className="bg-grain-500 hover:bg-grain-600 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-card transition cursor-pointer"
          >
            Open 3D Rice Stack Map
          </button>
        </div>
      </div>

      {/* Prominent Action Banner for Non-Tech Warehouse Personnel */}
      {criticalZone ? (
        <div className="bg-critical/10 border-2 border-critical/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-critical text-white rounded-lg shrink-0 pulse-dot">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-critical">
                🚨 ACTION REQUIRED: Critical Pest Activity Detected in {criticalZone.name} ({criticalZone.val}%)
              </h3>
              <p className="text-xs text-ink-800 mt-0.5">
                Bukbok feeding activity has breached safety thresholds. Immediate inspection or target fumigation recommended.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('alerts')}
            className="bg-critical text-white font-bold text-xs px-4 py-2 rounded-md shadow-card hover:bg-critical/90 transition shrink-0 cursor-pointer"
          >
            View Alert Details
          </button>
        </div>
      ) : moderateZone ? (
        <div className="bg-moderate/10 border-2 border-moderate/40 rounded-xl p-4 flex items-center space-x-3 shadow-card">
          <div className="p-2.5 bg-moderate text-white rounded-lg shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-moderate">
              ⚠️ MODERATE WARNING: Early Pest Movement in {moderateZone.name} ({moderateZone.val}%)
            </h3>
            <p className="text-xs text-ink-800 mt-0.5">
              Low-frequency feeding activity detected. Keep monitoring bag stacks closely over the next 24 hours.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-safe/10 border border-safe/30 rounded-xl p-4 flex items-center space-x-3 shadow-card">
          <div className="p-2 bg-safe text-white rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-safe">
              ✅ ALL RICE BINS SAFE: No Pest Threat Detected
            </h3>
            <p className="text-xs text-ink-800 mt-0.5">
              Bio-acoustic sensors confirm zero Bukbok activity across all monitored 50kg bag stacks.
            </p>
          </div>
        </div>
      )}

      {/* Top Level Non-Tech Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pest Activity */}
        <div className="rounded-xl border border-ink-100 bg-paper p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">Total Pest Detections</p>
            <p className="mt-1.5 font-display text-2xl font-semibold text-ink-900">{metrics.totalPestDetections}</p>
            <div className="flex items-center space-x-1 text-xs text-safe mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Live Insect Count</span>
            </div>
          </div>
          <div className="p-3 bg-grain-50 text-grain-600 rounded-xl border border-grain-200">
            <Bug className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Critical Bins */}
        <div className="rounded-xl border border-ink-100 bg-paper p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">Bins Needing Action</p>
            <p className="mt-1.5 font-display text-2xl font-semibold text-critical">{metrics.criticalCount}</p>
            <div className="flex items-center space-x-1 text-xs text-critical mt-1 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{metrics.criticalCount > 0 ? 'Action Needed' : 'Zero Breaches'}</span>
            </div>
          </div>
          <div className="p-3 bg-critical/10 text-critical rounded-xl border border-critical/20">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Sensors */}
        <div className="rounded-xl border border-ink-100 bg-paper p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">Active Sensors</p>
            <p className="mt-1.5 font-display text-2xl font-semibold text-ink-900">
              {metrics.activeSensorsCount} <span className="text-xs text-ink-400 font-normal">/ {metrics.totalNodes}</span>
            </p>
            <div className="flex items-center space-x-1 text-xs text-safe mt-1 font-medium">
              <span>{isHardwareConnected ? 'Hardware USB Active' : 'Wireless Standby'}</span>
            </div>
          </div>
          <div className="p-3 bg-safe/10 text-safe rounded-xl border border-safe/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Rice Quality Index */}
        <div className="rounded-xl border border-ink-100 bg-paper p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">Rice Safety Index</p>
            <p className="mt-1.5 font-display text-2xl font-semibold text-safe">{metrics.qualityRating}%</p>
            <div className="flex items-center space-x-1 text-xs text-safe mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>NFA Certified Standard</span>
            </div>
          </div>
          <div className="p-3 bg-grain-50 text-grain-700 rounded-xl border border-grain-200">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Storage Facility Grid & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Facility Grid (2 Cols) */}
        <div className="lg:col-span-2 border border-ink-100 bg-paper rounded-xl p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <div>
              <h3 className="font-display text-base font-semibold text-ink-900">Rice Storage Bin Grid</h3>
              <p className="text-xs text-ink-400">Click any bin below to inspect insect depth &amp; sound profile</p>
            </div>
            <div className="flex items-center space-x-3 text-xs text-ink-400">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-safe" />
                <span>Safe (0-35%)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-moderate" />
                <span>Warning (36-65%)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-critical" />
                <span>Critical (66-100%)</span>
              </span>
            </div>
          </div>

          {/* 4x3 Rice Bin Containers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {zonesList.map((z) => (
              <div 
                key={z.code}
                onClick={() => {
                  const targetNode = nodes.find(n => n.zone === z.name) || nodes[0];
                  if (targetNode) {
                    setSelectedNodeId(targetNode.id);
                  }
                  setActiveTab('heatmap');
                }}
                className={`p-4 rounded-lg border cursor-pointer hover:shadow-card transition flex flex-col justify-between min-h-[110px] ${z.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">{z.name}</span>
                  <MapPin className="w-3.5 h-3.5 opacity-60" />
                </div>
                <div className="font-display text-3xl font-bold mt-2">{z.val}%</div>
                <div className="text-[10px] opacity-80 mt-1 flex justify-between font-mono">
                  <span>Status</span>
                  <span className="font-bold">{z.statusText}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Inspector Helper Note */}
          <div className="pt-3 border-t border-ink-100 flex items-center justify-between text-xs text-ink-400">
            <span className="font-medium text-ink-800 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-grain-500" />
              <span>Inspector Tip: Click any bin to see 3D internal bag stack view.</span>
            </span>
          </div>
        </div>

        {/* Right Active Alerts & Recent Activity */}
        <div className="space-y-6">
          {/* Active Alerts Card */}
          <div className="border border-ink-100 bg-paper rounded-xl p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="font-display text-base font-semibold text-ink-900">Live Pest Breach Feed</h3>
              <span className="bg-critical/10 text-critical text-xs font-bold px-2 py-0.5 rounded-full border border-critical/20">
                {alerts.length} Active
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-6 bg-husk rounded-lg border border-ink-100 text-center text-xs text-ink-400 space-y-1">
                <ShieldCheck className="w-6 h-6 text-safe mx-auto" />
                <p className="font-bold text-ink-800">All Rice Stacks Clear</p>
                <p className="text-[11px] text-ink-400">Pest breach notifications will automatically appear here when feeding sounds are detected.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 4).map(alt => (
                  <div 
                    key={alt.id}
                    className="p-3 bg-husk rounded-lg border border-critical/30 flex items-start space-x-3 text-xs"
                  >
                    <div className="p-1.5 bg-critical/10 text-critical rounded-md shrink-0">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between font-bold text-ink-900">
                        <span>{alt.zone} - {alt.nodeName}</span>
                        <span className="text-[10px] font-mono text-ink-400">{alt.timestamp}</span>
                      </div>
                      <p className="text-ink-600 text-[11px] leading-snug">{alt.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Telemetry Status Summary */}
          <div className="border border-ink-100 bg-paper rounded-xl p-5 space-y-3 text-xs shadow-card">
            <h3 className="font-display text-base font-semibold text-ink-900 border-b border-ink-100 pb-2">Warehouse Connection Status</h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1 border-b border-ink-100 text-ink-800">
                <span>Inspector Access</span>
                <span className={`text-xs font-bold ${isAdmin ? 'text-safe' : 'text-grain-600'}`}>
                  {isAdmin ? 'ADMIN FULL CONTROL' : 'OPERATOR READ-ONLY'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ink-100 text-ink-800">
                <span>Database Sync</span>
                <span className="text-xs font-bold text-safe font-mono">AUTOMATIC CLOUD SYNC</span>
              </div>
              <div className="flex items-center justify-between py-1 text-ink-800">
                <span>Hardware USB Sensor</span>
                <span className={`text-xs font-bold ${isHardwareConnected ? 'text-safe' : 'text-ink-400'}`}>
                  {isHardwareConnected ? 'CONNECTED (COM4)' : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
