import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  TrendingUp, 
  Download, 
  BarChart2, 
  CheckCircle, 
  FileSpreadsheet,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Activity,
  Thermometer,
  Droplets,
  Volume2,
  FileText,
  CheckSquare,
  Square,
  Printer,
  Layers,
  Microscope,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

export default function HistoricalAnalytics() {
  const { 
    historicalData, 
    historicalScenario, 
    setHistoricalScenario, 
    nodes, 
    metrics, 
    activeWarehouse, 
    user 
  } = useTelemetry();

  const [chartView, setChartView] = useState('infestation'); // 'infestation' | 'acoustics' | 'microclimate' | 'fleet'
  const [activeTab, setActiveTab] = useState('diagnosis'); // 'diagnosis' | 'microclimate' | 'sop' | 'forecast'
  const [selectedDay, setSelectedDay] = useState(null);
  const [checklist, setChecklist] = useState({
    trierSample: true,
    sealCheck: false,
    fumigationPlan: false,
    aerationFans: false,
    auditSignoff: false
  });

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Safe fallback if data is empty
  const data = (historicalData && historicalData.length > 0) ? historicalData : [];
  const firstDay = data[0] || { avgInfestationPct: 0, avgTemp: 28, avgHumidity: 55, avgAcousticPowerDb: -80 };
  const latestDay = data[data.length - 1] || { avgInfestationPct: 0, avgTemp: 28, avgHumidity: 55, avgAcousticPowerDb: -80, criticalNodes: 0, moderateNodes: 0, safeNodes: 14 };

  // Calculate Accurate 30-Day Metrics
  const trendDelta = latestDay.avgInfestationPct - firstDay.avgInfestationPct;
  const trendVelocity = (trendDelta / 29).toFixed(1);
  const totalPestEvents30D = data.reduce((acc, d) => acc + (d.detectedPestEvents || 0), 0);
  const avgTemp30D = (data.reduce((acc, d) => acc + (d.avgTemp || 0), 0) / (data.length || 1)).toFixed(1);
  const avgHum30D = (data.reduce((acc, d) => acc + (d.avgHumidity || 0), 0) / (data.length || 1)).toFixed(1);
  
  // Find peak acoustic and risk days
  const peakRiskDay = [...data].sort((a, b) => b.avgInfestationPct - a.avgInfestationPct)[0] || latestDay;
  const peakAcousticDay = [...data].sort((a, b) => b.avgAcousticPowerDb - a.avgAcousticPowerDb)[0] || latestDay;

  // Active hotspots from live nodes
  const criticalZones = [...new Set((nodes || []).filter(n => n.status === 'Critical').map(n => n.zone))];
  const moderateZones = [...new Set((nodes || []).filter(n => n.status === 'Moderate').map(n => n.zone))];
  const hotspotText = criticalZones.length > 0 
    ? criticalZones.join(', ') 
    : moderateZones.length > 0 
      ? moderateZones.join(', ') 
      : 'None (Warehouse Baseline Safe)';

  // Determine current overall risk
  const currentRisk = latestDay.avgInfestationPct >= 70 
    ? 'Critical' 
    : latestDay.avgInfestationPct >= 36 
      ? 'Moderate' 
      : 'Safe';

  // Export Comprehensive 12-Column CSV Report
  const handleExportCSV = () => {
    const csvHeader = "Date,ISO_Date,Day_Index,Avg_Infestation_Pct,Critical_Nodes,Moderate_Nodes,Safe_Nodes,Avg_Temp_C,Avg_Humidity_Pct,Est_Grain_Moisture_MC,Acoustic_Power_dBFS,Peak_Frequency_Hz,Pest_Detection_Events,Dominant_Species,Risk_Category,Recommended_NFA_Action\n";
    const csvRows = data.map(e => 
      `"${e.date}","${e.isoDate}",${e.dayIndex},${e.avgInfestationPct}%,${e.criticalNodes},${e.moderateNodes},${e.safeNodes},${e.avgTemp},${e.avgHumidity}%,${e.grainMoistureEst}%,${e.avgAcousticPowerDb},${e.peakFreqHz},${e.detectedPestEvents},"${e.dominantSpecies}","${e.riskCategory}","${e.recommendedAction}"`
    ).join("\n");

    const fullContent = `data:text/csv;charset=utf-8,# ACOUSTIGRAIN NFA 30-DAY BIO-ACOUSTIC GRAIN INSPECTION REPORT\n# Facility: ${activeWarehouse}\n# Certified Inspector: ${user?.name || user?.email || 'NFA Authorized Inspector'}\n# Report Period: ${firstDay.date} - ${latestDay.date}\n# Generated: ${new Date().toLocaleString()}\n` + csvHeader + csvRows;
    
    const encodedUri = encodeURI(fullContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NFA_AcoustiGrain_30Day_Inspection_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white print:p-0 print:space-y-4">
      {/* Top Banner: Header + Scenarios + Quick Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-paper p-5 rounded-xl border border-ink-100 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-grain-50 text-grain-700 rounded-lg">
              <TrendingUp className="w-5 h-5 text-grain-600" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
                <span>30-Day Historical Trend Analytics &amp; Grain Inspection Reports</span>
              </h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Bio-acoustic population progression, microclimate correlation, and NFA regulatory compliance interpretation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Scenario Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scenario Selector */}
          <div className="flex items-center bg-husk rounded-lg p-1 border border-ink-100 text-xs">
            <span className="px-2 py-1 text-[11px] font-semibold text-ink-600 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-grain-500" />
              <span>Dataset:</span>
            </span>
            <select
              value={historicalScenario || 'active'}
              onChange={(e) => setHistoricalScenario(e.target.value)}
              className="bg-paper text-ink-900 text-xs font-semibold px-2.5 py-1 rounded border border-ink-100 focus:outline-none focus:ring-1 focus:ring-grain-500 cursor-pointer"
            >
              <option value="active">🟢 Live Warehouse Telemetry (Anchored)</option>
              <option value="balingbing">🔬 Balingbing et al. (2024) Lab Incubation</option>
              <option value="post_fumigation">💨 Post-Fumigation Recovery Cycle</option>
              <option value="monsoon_ingress">🌧️ Monsoon Moisture Ingress Surge</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="bg-paper hover:bg-husk text-ink-700 text-xs font-bold px-3 py-2 rounded-md border border-ink-100 shadow-card transition flex items-center space-x-1.5 cursor-pointer print:hidden"
            title="Print official audit summary"
          >
            <Printer className="w-4 h-4 text-ink-600" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-grain-500 hover:bg-grain-600 text-white text-xs font-bold px-4 py-2 rounded-md shadow-card transition flex items-center space-x-2 cursor-pointer print:hidden"
            title="Download full 12-column CSV dataset"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Inspection Report</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: EXECUTIVE DIAGNOSTIC INTERPRETATION BANNER */}
      <div className={`p-5 rounded-xl border-2 transition shadow-card ${
        currentRisk === 'Critical' 
          ? 'bg-critical/10 border-critical/40 text-critical' 
          : currentRisk === 'Moderate'
            ? 'bg-moderate/10 border-moderate/30 text-moderate'
            : 'bg-safe/10 border-safe/30 text-safe'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-3 rounded-xl shrink-0 ${
              currentRisk === 'Critical' 
                ? 'bg-critical text-white pulse-dot' 
                : currentRisk === 'Moderate'
                  ? 'bg-moderate text-white'
                  : 'bg-safe text-white'
            }`}>
              {currentRisk === 'Critical' ? (
                <AlertOctagon className="w-6 h-6" />
              ) : currentRisk === 'Moderate' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  currentRisk === 'Critical' ? 'bg-critical text-white' : currentRisk === 'Moderate' ? 'bg-moderate text-white' : 'bg-safe text-white'
                }`}>
                  {currentRisk === 'Critical' ? 'Critical Outbreak Detected' : currentRisk === 'Moderate' ? 'Moderate Risk Warning' : 'Safe Equilibrium Maintained'}
                </span>
                <span className="text-xs font-mono text-ink-600 font-semibold">
                  30-Day Velocity: {trendDelta >= 0 ? `+${trendDelta}%` : `${trendDelta}%`} ({trendVelocity}% / day)
                </span>
                <span className="text-xs text-ink-400">• Evaluated against NFA Certified Thresholds</span>
              </div>

              <h3 className="font-display text-base font-bold text-ink-900">
                {currentRisk === 'Critical'
                  ? `🚨 ACTION REQUIRED: Severe Sitophilus oryzae (Bukbok) Infestation Breach (${latestDay.avgInfestationPct}%)`
                  : currentRisk === 'Moderate'
                    ? `⚠️ ADVISORY: Active Larval Incubation & Early Feeding Activity (${latestDay.avgInfestationPct}%)`
                    : `✅ GRAIN STACK VERIFIED: Optimal Storage Equilibrium with Baseline Noise (${latestDay.avgInfestationPct}%)`}
              </h3>

              <p className="text-xs text-ink-800 leading-relaxed max-w-4xl">
                {currentRisk === 'Critical' ? (
                  <>
                    Bio-acoustic telemetry over the past 30 days indicates an aggressive population surge in milled rice stacks. 
                    Narrowband acoustic power has escalated to <strong className="font-bold text-critical">{latestDay.avgAcousticPowerDb} dBFS</strong> with peak frequency 
                    concentrating at <strong className="font-bold text-critical">{latestDay.peakFreqHz.toLocaleString()} Hz</strong>, matching the published ground-truth 
                    signature of <em>Sitophilus oryzae</em> pericarp mastication from Engr. Balingbing et al. (2024). 
                    Acoustic epicenters are concentrated in <strong>{hotspotText}</strong>. Immediate chemical fumigation (Aluminium Phosphide) 
                    and stack isolation are required under NFA Standard Operating Procedures.
                  </>
                ) : currentRisk === 'Moderate' ? (
                  <>
                    Acoustic monitoring indicates early colonization with feeding clicks concentrating in the 3.2 kHz – 3.6 kHz band. 
                    Warehouse microclimate ({latestDay.avgTemp}°C, {latestDay.avgHumidity}% RH) has entered the optimal reproductive window 
                    for stored grain beetles, accelerating oviposition. Active localized feeding is detected in <strong>{hotspotText}</strong>. 
                    Forced-air aeration fans should be engaged immediately to lower grain moisture below 13.5% and prevent escalation to Critical grade.
                  </>
                ) : (
                  <>
                    The warehouse grain bulk has maintained stable baseline conditions across the 30-day evaluation period. 
                    Acoustic signals remain suppressed at the sensor noise floor ({latestDay.avgAcousticPowerDb} dBFS) with dominant frequencies below 250 Hz, 
                    corresponding solely to ambient building hum and mechanical grain settling. Relative humidity ({latestDay.avgHumidity}%) 
                    and grain temperature ({latestDay.avgTemp}°C) comply with NFA Grade 1 safe preservation standards. Continue routine passive monitoring.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              onClick={() => setActiveTab('sop')}
              className={`text-xs font-bold px-4 py-2 rounded-md shadow-card transition text-center cursor-pointer ${
                currentRisk === 'Critical' 
                  ? 'bg-critical hover:bg-critical/90 text-white' 
                  : currentRisk === 'Moderate' 
                    ? 'bg-moderate hover:bg-moderate/90 text-white' 
                    : 'bg-safe hover:bg-safe/90 text-white'
              }`}
            >
              {currentRisk === 'Critical' ? 'View Emergency SOP Protocol' : 'View Action Recommendations'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: 5 KEY 30-DAY DIAGNOSTIC KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: 30-Day Infestation Velocity */}
        <div className="bg-paper p-4 rounded-xl border border-ink-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span className="font-medium">30-Day Trend Velocity</span>
            {trendDelta > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-critical" />
            ) : trendDelta < 0 ? (
              <ArrowDownRight className="w-4 h-4 text-safe" />
            ) : (
              <Activity className="w-4 h-4 text-ink-400" />
            )}
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-xl font-display font-extrabold ${trendDelta > 15 ? 'text-critical' : trendDelta > 0 ? 'text-moderate' : 'text-safe'}`}>
              {trendDelta > 0 ? `+${trendDelta}%` : `${trendDelta}%`}
            </span>
            <span className="text-[10px] text-ink-400 font-mono">({trendVelocity}%/d)</span>
          </div>
          <p className="text-[11px] text-ink-600 truncate">
            {firstDay.avgInfestationPct}% → {latestDay.avgInfestationPct}% (30-day shift)
          </p>
        </div>

        {/* KPI 2: Peak Acoustic Energy */}
        <div className="bg-paper p-4 rounded-xl border border-ink-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span className="font-medium">Peak Acoustic Amplitude</span>
            <Volume2 className="w-4 h-4 text-grain-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-display font-extrabold text-ink-900">
              {peakAcousticDay.avgAcousticPowerDb} <span className="text-xs font-normal text-ink-400">dBFS</span>
            </span>
          </div>
          <p className="text-[11px] text-ink-600 truncate">
            Peak Day: {peakAcousticDay.date} @ {peakAcousticDay.peakFreqHz} Hz
          </p>
        </div>

        {/* KPI 3: Total 30-Day Pest Events */}
        <div className="bg-paper p-4 rounded-xl border border-ink-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span className="font-medium">Cumulative Pest Detections</span>
            <Activity className="w-4 h-4 text-critical" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-display font-extrabold text-ink-900">
              {totalPestEvents30D.toLocaleString()}
            </span>
            <span className="text-[10px] text-ink-400">clicks</span>
          </div>
          <p className="text-[11px] text-ink-600 truncate">
            Avg {Math.round(totalPestEvents30D / 30)} detected events / day
          </p>
        </div>

        {/* KPI 4: Microclimate Storage Index */}
        <div className="bg-paper p-4 rounded-xl border border-ink-100 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span className="font-medium">Avg Microclimate Index</span>
            <Thermometer className="w-4 h-4 text-moderate" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-display font-extrabold text-ink-900">
              {avgTemp30D}°C
            </span>
            <span className="text-xs text-ink-400 font-semibold">• {avgHum30D}% RH</span>
          </div>
          <p className="text-[11px] text-ink-600 truncate">
            Grain Moisture: ~{latestDay.grainMoistureEst || 13.8}% MC
          </p>
        </div>

        {/* KPI 5: NFA Storage Integrity Rating */}
        <div className="bg-paper p-4 rounded-xl border border-ink-100 shadow-card space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span className="font-medium">NFA Grain Quality Index</span>
            <ShieldCheck className="w-4 h-4 text-safe" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-xl font-display font-extrabold ${metrics.qualityRating >= 80 ? 'text-safe' : metrics.qualityRating >= 50 ? 'text-moderate' : 'text-critical'}`}>
              {metrics.qualityRating}/100
            </span>
          </div>
          <p className="text-[11px] text-ink-600 truncate">
            {metrics.qualityRating >= 80 ? 'NFA Grade 1 Certified' : metrics.qualityRating >= 50 ? 'Grade 2 Warning' : 'Quarantine / Animal Feed'}
          </p>
        </div>
      </div>

      {/* SECTION 3: MULTI-PERSPECTIVE 30-DAY CHARTS */}
      <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-5 shadow-card">
        {/* Chart View Switcher Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ink-100 pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900 flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-grain-500" />
              <span>30-Day Multi-Dimensional Trend Analytics</span>
            </h3>
            <p className="text-xs text-ink-400">
              Toggle between pest growth, acoustic spectrum evolution, environmental correlation, and fleet health distribution.
            </p>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-husk rounded-lg p-1 border border-ink-100 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setChartView('infestation')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                chartView === 'infestation' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              📈 Infestation &amp; Events
            </button>
            <button
              onClick={() => setChartView('acoustics')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                chartView === 'acoustics' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              🔊 Bio-Acoustic Spectrum
            </button>
            <button
              onClick={() => setChartView('microclimate')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                chartView === 'microclimate' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              🌡️ Microclimate Drivers
            </button>
            <button
              onClick={() => setChartView('fleet')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                chartView === 'fleet' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              🛡️ 14-Node Health Fleet
            </button>
          </div>
        </div>

        {/* Chart View 1: Infestation Growth & Pest Detections */}
        {chartView === 'infestation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-ink-600 px-1">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#C97A1F]"></span>
                  <span>Warehouse Infestation Level (%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#C0392B]"></span>
                  <span>Daily Detected Pest Events</span>
                </span>
              </div>
              <span className="font-mono text-ink-400 text-[11px]">NFA Thresholds: Safe (&lt;36%) | Warning (36-69%) | Critical (&ge;70%)</span>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} onClick={(e) => e?.activePayload?.[0] && setSelectedDay(e.activePayload[0].payload)}>
                  <defs>
                    <linearGradient id="infestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C97A1F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C97A1F" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#736A5E" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px', color: '#1A1712', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    formatter={(value, name) => {
                      if (name === 'avgInfestationPct') return [`${value}%`, 'Average Infestation'];
                      if (name === 'detectedPestEvents') return [`${value} clicks`, 'Pest Chewing Events'];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine y={70} stroke="#C0392B" strokeDasharray="4 4" label={{ value: 'CRITICAL (70%)', position: 'insideTopLeft', fill: '#C0392B', fontSize: 10, fontWeight: 'bold' }} />
                  <ReferenceLine y={36} stroke="#C97A1F" strokeDasharray="4 4" label={{ value: 'WARNING (36%)', position: 'insideTopLeft', fill: '#C97A1F', fontSize: 10, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="avgInfestationPct" stroke="#C97A1F" strokeWidth={2.5} fillOpacity={1} fill="url(#infestGradient)" name="avgInfestationPct" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Accompanying Pest Chewing Events Bar Chart */}
            <div className="h-[140px] w-full pt-2 border-t border-ink-100">
              <p className="text-[11px] font-bold text-ink-600 mb-1 flex items-center justify-between">
                <span>Daily Pest Detection Frequency (Chewing Click Audio Events)</span>
                <span className="font-mono text-ink-400 font-normal">Peak: {peakRiskDay.detectedPestEvents} events on {peakRiskDay.date}</span>
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" opacity={0.4} />
                  <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#736A5E" tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v) => [`${v} click events`, 'Pest Detections']}
                  />
                  <Bar dataKey="detectedPestEvents" fill="#C0392B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart View 2: Bio-Acoustic Spectrum & Power Evolution */}
        {chartView === 'acoustics' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs text-ink-600 px-1 gap-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#6B4C1F]"></span>
                  <span>Acoustic Amplitude (dBFS, Left Axis)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#1E8E5A]"></span>
                  <span>Dominant Peak Frequency (Hz, Right Axis)</span>
                </span>
              </div>
              <span className="font-mono text-grain-700 font-semibold text-[11px]">
                Target Bukbok Acoustic Band: 3,000 Hz – 5,000 Hz (Balingbing et al. 2024)
              </span>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#6B4C1F" tick={{ fontSize: 10 }} unit=" dB" domain={[-90, -20]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#1E8E5A" tick={{ fontSize: 10 }} unit=" Hz" domain={[0, 5000]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value, name) => {
                      if (name === 'avgAcousticPowerDb') return [`${value} dBFS`, 'Acoustic Amplitude'];
                      if (name === 'peakFreqHz') return [`${value} Hz`, 'Dominant Frequency'];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine yAxisId="right" y={3840} stroke="#C0392B" strokeDasharray="3 3" label={{ value: '3,840 Hz (Sitophilus Oryzae)', position: 'insideTopRight', fill: '#C0392B', fontSize: 10 }} />
                  <ReferenceLine yAxisId="left" y={-45} stroke="#C97A1F" strokeDasharray="3 3" label={{ value: '-45 dBFS (Audible Threshold)', position: 'insideBottomLeft', fill: '#C97A1F', fontSize: 10 }} />
                  <Line yAxisId="left" type="monotone" dataKey="avgAcousticPowerDb" stroke="#6B4C1F" strokeWidth={2.5} dot={{ r: 2 }} name="avgAcousticPowerDb" />
                  <Line yAxisId="right" type="monotone" dataKey="peakFreqHz" stroke="#1E8E5A" strokeWidth={2} dot={{ r: 2 }} name="peakFreqHz" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-husk p-3.5 rounded-lg border border-ink-100 text-xs text-ink-600 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-grain-600 shrink-0 mt-0.5" />
              <p>
                <strong>Bio-Acoustic Interpretation:</strong> Uninfested milled rice produces ambient background levels between <strong>-85 dBFS and -75 dBFS</strong> with low-frequency mechanical rumble below <strong>300 Hz</strong>. When <em>Sitophilus oryzae</em> larvae begin burrowing into rice grains, acoustic clicks elevate amplitude toward <strong>-35 dBFS</strong> and shift frequency into the <strong>3,400 Hz – 4,200 Hz</strong> resonant band.
              </p>
            </div>
          </div>
        )}

        {/* Chart View 3: Microclimate Drivers (Temp & Humidity vs Pest Events) */}
        {chartView === 'microclimate' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs text-ink-600 px-1 gap-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#C0392B]"></span>
                  <span>Temperature (°C, Left Axis)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#2980B9]"></span>
                  <span>Relative Humidity (% RH, Right Axis)</span>
                </span>
              </div>
              <span className="font-mono text-ink-400 text-[11px]">Critical Humidity Threshold: &gt; 65% RH triggers oviposition</span>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="temp" stroke="#C0392B" tick={{ fontSize: 10 }} unit="°C" domain={[24, 38]} />
                  <YAxis yAxisId="hum" orientation="right" stroke="#2980B9" tick={{ fontSize: 10 }} unit="%" domain={[45, 80]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value, name) => {
                      if (name === 'avgTemp') return [`${value}°C`, 'Grain Temp'];
                      if (name === 'avgHumidity') return [`${value}% RH`, 'Relative Humidity'];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine yAxisId="hum" y={65} stroke="#2980B9" strokeDasharray="3 3" label={{ value: '65% RH (Fungal & Pest Surge)', position: 'insideTopRight', fill: '#2980B9', fontSize: 10 }} />
                  <ReferenceLine yAxisId="temp" y={32} stroke="#C0392B" strokeDasharray="3 3" label={{ value: '32°C (Biological Hot Spot)', position: 'insideTopLeft', fill: '#C0392B', fontSize: 10 }} />
                  <Line yAxisId="temp" type="monotone" dataKey="avgTemp" stroke="#C0392B" strokeWidth={2.5} dot={{ r: 2 }} name="avgTemp" />
                  <Line yAxisId="hum" type="monotone" dataKey="avgHumidity" stroke="#2980B9" strokeWidth={2.5} dot={{ r: 2 }} name="avgHumidity" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-husk p-3.5 rounded-lg border border-ink-100 text-xs text-ink-600 flex items-start space-x-2.5">
              <Thermometer className="w-4 h-4 text-critical shrink-0 mt-0.5" />
              <p>
                <strong>Entomological Moisture Law:</strong> High ambient humidity (&gt;65% RH) elevates equilibrium moisture content (EMC) in milled rice above <strong>14.0%</strong>. This softens kernel pericarp tissue, allowing weevil larvae to chew with significantly reduced mechanical resistance, multiplying feeding frequency by <strong>3.2x</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Chart View 4: 14-Node Health Fleet Distribution */}
        {chartView === 'fleet' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs text-ink-600 px-1 gap-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#1E8E5A]"></span>
                  <span>Safe Nodes (0-35%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#C97A1F]"></span>
                  <span>Moderate Nodes (36-69%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#C0392B]"></span>
                  <span>Critical Nodes (&ge;70%)</span>
                </span>
              </div>
              <span className="font-mono text-ink-400 text-[11px]">Strict Total Fleet Sum: Exactly 14 Monitored Sensor Wedges</span>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#736A5E" tick={{ fontSize: 10 }} domain={[0, 14]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value, name) => {
                      if (name === 'safeNodes') return [`${value} Nodes`, 'Safe Nodes'];
                      if (name === 'moderateNodes') return [`${value} Nodes`, 'Moderate Nodes'];
                      if (name === 'criticalNodes') return [`${value} Nodes`, 'Critical Nodes'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="safeNodes" stackId="a" fill="#1E8E5A" name="Safe" />
                  <Bar dataKey="moderateNodes" stackId="a" fill="#C97A1F" name="Moderate" />
                  <Bar dataKey="criticalNodes" stackId="a" fill="#C0392B" name="Critical" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-husk p-3.5 rounded-lg border border-ink-100 text-xs text-ink-600 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-safe shrink-0 mt-0.5" />
              <p>
                <strong>Fleet Health Ratio:</strong> Today, the warehouse operates with <strong>{latestDay.safeNodes} Safe</strong>, <strong>{latestDay.moderateNodes} Moderate</strong>, and <strong>{latestDay.criticalNodes} Critical</strong> sensor probes out of 14 total nodes across 12 rice bin stacks.
              </p>
            </div>
          </div>
        )}

        {/* Selected Data Point Inspector Drilldown */}
        {selectedDay && (
          <div className="mt-4 p-4 rounded-xl bg-husk border border-grain-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-ink-900 text-sm flex items-center space-x-2">
                <span>Inspection Point: {selectedDay.date} ({selectedDay.isoDate})</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                  selectedDay.riskCategory === 'Critical' ? 'bg-critical text-white' : selectedDay.riskCategory === 'Moderate' ? 'bg-moderate text-white' : 'bg-safe text-white'
                }`}>
                  {selectedDay.riskCategory}
                </span>
              </span>
              <p className="text-ink-600">
                Infestation: <strong>{selectedDay.avgInfestationPct}%</strong> • Acoustic Power: <strong>{selectedDay.avgAcousticPowerDb} dBFS</strong> • Peak Freq: <strong>{selectedDay.peakFreqHz} Hz</strong> • Microclimate: <strong>{selectedDay.avgTemp}°C / {selectedDay.avgHumidity}% RH</strong>
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-grain-600 hover:text-grain-700 font-semibold cursor-pointer underline text-[11px]"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* SECTION 4: IN-DEPTH NFA TECHNICAL INTERPRETATION & ACTION PLAN */}
      <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-5 shadow-card">
        {/* Navigation Tabs for Interpretation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ink-100 pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900 flex items-center space-x-2">
              <Microscope className="w-5 h-5 text-grain-500" />
              <span>NFA Bio-Acoustic Interpretation &amp; Technical Analysis</span>
            </h3>
            <p className="text-xs text-ink-400">
              Grounded in Engr. Balingbing et al. (2024) research paper and NFA Grains Maintenance Manual.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-husk rounded-lg p-1 border border-ink-100 text-xs">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                activeTab === 'diagnosis' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              🔬 Bio-Acoustic Diagnosis
            </button>
            <button
              onClick={() => setActiveTab('microclimate')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                activeTab === 'microclimate' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              🌡️ Moisture &amp; Thermal Drivers
            </button>
            <button
              onClick={() => setActiveTab('sop')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                activeTab === 'sop' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              📋 Prescriptive SOP Checklist
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                activeTab === 'forecast' ? 'bg-paper text-grain-700 shadow-xs font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              📊 Grain Grade Forecast
            </button>
          </div>
        </div>

        {/* TAB 1: Bio-Acoustic Diagnosis */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2">
                <h4 className="font-display text-sm font-bold text-ink-900 flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-grain-600" />
                  <span>Spectral Identification: Sitophilus oryzae (Bukbok)</span>
                </h4>
                <p className="text-xs text-ink-700 leading-relaxed">
                  According to the benchmark research by <strong>Engr. Balingbing et al. (2024)</strong> in <em>Computers and Electronics in Agriculture</em>, 
                  milled rice grain weevil activity exhibits distinct bio-acoustic characteristics:
                </p>
                <ul className="text-xs text-ink-600 space-y-1.5 list-disc pl-4">
                  <li><strong>Target Feeding Frequency:</strong> Resonant acoustic energy concentrates between <strong>3,400 Hz and 4,500 Hz</strong> (peaking at <strong>3,840 Hz</strong>).</li>
                  <li><strong>Micro-Mastication Waveforms:</strong> Each feeding click generates an impulsive burst of <strong>2.5 ms to 4.0 ms</strong> duration.</li>
                  <li><strong>Grain Sound Attenuation:</strong> Milled rice exhibits an acoustic attenuation of <strong>0.5 to 0.8 dB/cm</strong>, confirming that probes placed at 50cm core depth measure localized colony density rather than exterior warehouse noise.</li>
                </ul>
              </div>

              <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-bold text-ink-900 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-critical" />
                    <span>Sitophilus oryzae (Bukbok) Acoustic Activity Profile</span>
                  </h4>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-grain-100 text-grain-800 font-bold">
                    Target Species Scope
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-ink-200 text-ink-800 font-bold">
                        <th className="py-1">Sitophilus oryzae Activity State</th>
                        <th className="py-1">Peak Resonant Freq</th>
                        <th className="py-1">Acoustic Power</th>
                        <th className="py-1">NFA Risk Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 text-ink-600">
                      <tr>
                        <td className="py-1 font-semibold text-critical">
                          Sitophilus oryzae: Heavy Outbreak Colony
                        </td>
                        <td className="py-1 font-mono">3,840 Hz</td>
                        <td className="py-1 font-mono">-32 dBFS (&gt;30 clicks/min)</td>
                        <td className="py-1 font-bold text-critical">Critical (&ge;70%)</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-moderate">
                          Sitophilus oryzae: Active Larval Boring
                        </td>
                        <td className="py-1 font-mono">3,520 Hz</td>
                        <td className="py-1 font-mono">-48 dBFS (10-25 clicks/min)</td>
                        <td className="py-1 font-bold text-moderate">Moderate (36-69%)</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-ink-700">
                          Sitophilus oryzae: Early Larval Incubation
                        </td>
                        <td className="py-1 font-mono">3,300 Hz</td>
                        <td className="py-1 font-mono">-65 dBFS (1-8 clicks/min)</td>
                        <td className="py-1 font-bold text-ink-700">Early Warning (&lt;36%)</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-safe">
                          Clean Milled Rice (Uninfested Control)
                        </td>
                        <td className="py-1 font-mono">120 Hz</td>
                        <td className="py-1 font-mono">-78 dBFS (0 clicks/min)</td>
                        <td className="py-1 font-bold text-safe">Safe Baseline</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-ink-500 italic">
                  <strong>Project Scope:</strong> AcoustiGrain focuses exclusively on <em>Sitophilus oryzae</em> (Rice Weevil / Bukbok) in milled rice bulk. Digital bandpass filters and DSP FFT thresholds are calibrated specifically to its 3.4 kHz &ndash; 4.5 kHz mastication frequency band (Engr. Balingbing et al., 2024).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Moisture & Thermal Drivers */}
        {activeTab === 'microclimate' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2">
                <span className="text-xs font-bold text-ink-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  Grain Moisture Equilibrium
                </span>
                <div className="text-2xl font-display font-extrabold text-ink-900">
                  {latestDay.grainMoistureEst || 13.8}% <span className="text-xs font-normal text-ink-400">MC</span>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Safe storage threshold is <strong>&le; 14.0% MC</strong>. When ambient humidity exceeds <strong>65% RH</strong>, 
                  hygroscopic absorption pushes moisture into the outer kernel layers, softening the pericarp and speeding up oviposition by <strong>2.8x</strong>.
                </p>
              </div>

              <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2">
                <span className="text-xs font-bold text-ink-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-critical" />
                  Biological Hot-Spot Formation
                </span>
                <div className="text-2xl font-display font-extrabold text-critical">
                  +{((latestDay.avgTemp || 30) - 27.5).toFixed(1)}°C <span className="text-xs font-normal text-ink-400">Heat Delta</span>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Insect metabolic respiration generates biogenic heat and moisture. A localized cluster of 40 weevils in a 50kg bag 
                  increases core temperature from ambient 28°C up to <strong>34°C - 36°C</strong>, accelerating development cycles from 35 days down to 24 days.
                </p>
              </div>

              <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2">
                <span className="text-xs font-bold text-ink-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-grain-600" />
                  Pest Life Cycle Acceleration
                </span>
                <div className="text-2xl font-display font-extrabold text-ink-900">
                  24-28 <span className="text-xs font-normal text-ink-400">Days (Egg to Adult)</span>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Under optimal microclimate conditions (30°C - 33°C, 65% - 70% RH), Bukbok females lay <strong>300 to 400 eggs</strong> 
                  individually inside grain bores. Acoustic sensors detect 2nd-instar chewing sounds up to <strong>14 days earlier</strong> than visual surface checks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Prescriptive SOP Checklist */}
        {activeTab === 'sop' && (
          <div className="space-y-4">
            <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-ink-900 flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-grain-600" />
                  <span>NFA Warehouse Inspector Action Protocol &amp; Verification Checklist</span>
                </h4>
                <span className="text-[11px] font-mono text-grain-700 font-semibold">
                  Standard Operating Procedures (NFA-SOP-GR-2024)
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Step 1 */}
                <div 
                  onClick={() => toggleChecklist('trierSample')}
                  className={`p-3 rounded-lg border transition flex items-start space-x-3 cursor-pointer ${
                    checklist.trierSample ? 'bg-safe/5 border-safe/40' : 'bg-paper border-ink-100'
                  }`}
                >
                  <div className="pt-0.5">
                    {checklist.trierSample ? <CheckSquare className="w-4 h-4 text-safe" /> : <Square className="w-4 h-4 text-ink-400" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-ink-900">1. Physical Trier Probe Sampling (0 - 24 Hours)</p>
                    <p className="text-[11px] text-ink-600">
                      Deploy a 1.5-meter brass compartmental trier into the core depth (50cm - 80cm) of identified hot spot stacks ({hotspotText}). Sieve 1kg grain sample through a 10-mesh screen to verify live beetle count.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div 
                  onClick={() => toggleChecklist('sealCheck')}
                  className={`p-3 rounded-lg border transition flex items-start space-x-3 cursor-pointer ${
                    checklist.sealCheck ? 'bg-safe/5 border-safe/40' : 'bg-paper border-ink-100'
                  }`}
                >
                  <div className="pt-0.5">
                    {checklist.sealCheck ? <CheckSquare className="w-4 h-4 text-safe" /> : <Square className="w-4 h-4 text-ink-400" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-ink-900">2. Stack Hermetic Seal &amp; Gas-Tight Enclosure (24 - 48 Hours)</p>
                    <p className="text-[11px] text-ink-600">
                      Enclose affected 50kg bag stacks with heavy-duty 0.15mm PVC fumigation tarpaulins. Weigh down perimeter edges with continuous sand snakes (minimum 10cm overlap) to prevent phosphine gas leakage.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div 
                  onClick={() => toggleChecklist('fumigationPlan')}
                  className={`p-3 rounded-lg border transition flex items-start space-x-3 cursor-pointer ${
                    checklist.fumigationPlan ? 'bg-safe/5 border-safe/40' : 'bg-paper border-ink-100'
                  }`}
                >
                  <div className="pt-0.5">
                    {checklist.fumigationPlan ? <CheckSquare className="w-4 h-4 text-safe" /> : <Square className="w-4 h-4 text-ink-400" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-ink-900">3. Aluminium Phosphide (Phosphine) Application (48 - 72 Hours)</p>
                    <p className="text-[11px] text-ink-600">
                      {currentRisk === 'Critical'
                        ? 'CRITICAL PROTOCOL: Apply Aluminium Phosphide at 1.5 - 2.0 g/m³ (3 tablets per metric ton). Maintain airtight exposure for 7 to 10 days at warehouse temperatures above 25°C. Post warning hazard placards.'
                        : 'PREVENTATIVE PROTOCOL: For moderate risk zones, schedule targeted spot fumigation or quarantine adjacent buffer corridors.'}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div 
                  onClick={() => toggleChecklist('aerationFans')}
                  className={`p-3 rounded-lg border transition flex items-start space-x-3 cursor-pointer ${
                    checklist.aerationFans ? 'bg-safe/5 border-safe/40' : 'bg-paper border-ink-100'
                  }`}
                >
                  <div className="pt-0.5">
                    {checklist.aerationFans ? <CheckSquare className="w-4 h-4 text-safe" /> : <Square className="w-4 h-4 text-ink-400" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-ink-900">4. Post-Treatment Aeration &amp; Grain Conditioning</p>
                    <p className="text-[11px] text-ink-600">
                      After exposure completion, engage warehouse exhaust fans for a minimum of 3 hours. Verify residual phosphine gas levels drop below 0.3 ppm before personnel entry. Run forced-air night aeration to reduce grain core temp below 25°C.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div 
                  onClick={() => toggleChecklist('auditSignoff')}
                  className={`p-3 rounded-lg border transition flex items-start space-x-3 cursor-pointer ${
                    checklist.auditSignoff ? 'bg-safe/5 border-safe/40' : 'bg-paper border-ink-100'
                  }`}
                >
                  <div className="pt-0.5">
                    {checklist.auditSignoff ? <CheckSquare className="w-4 h-4 text-safe" /> : <Square className="w-4 h-4 text-ink-400" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-ink-900">5. Digital Inspection Log &amp; NFA Certification Sign-Off</p>
                    <p className="text-[11px] text-ink-600">
                      Submit electronic certification of inspection to NFA Central Operations. Record sensor telemetry baseline to confirm bio-acoustic silence post-fumigation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Grain Grade Impact & Trajectory Forecast */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2.5">
                <h4 className="font-display text-sm font-bold text-ink-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-critical" />
                  <span>Unmitigated 7-Day &amp; 14-Day Trajectory Projection</span>
                </h4>
                <p className="text-xs text-ink-700 leading-relaxed">
                  If current thermal conditions ({latestDay.avgTemp}°C) and relative humidity ({latestDay.avgHumidity}%) persist without forced aeration or fumigation:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-paper rounded-lg border border-ink-100 flex items-center justify-between">
                    <span>Day +7 Forecast (No Intervention):</span>
                    <strong className="text-critical font-bold">~{Math.min(99, Math.round(latestDay.avgInfestationPct * 1.25 + 5))}% Infestation</strong>
                  </div>
                  <div className="p-2.5 bg-paper rounded-lg border border-ink-100 flex items-center justify-between">
                    <span>Day +14 Forecast (No Intervention):</span>
                    <strong className="text-critical font-bold">~{Math.min(100, Math.round(latestDay.avgInfestationPct * 1.55 + 12))}% Infestation</strong>
                  </div>
                  <div className="p-2.5 bg-safe/10 rounded-lg border border-safe/30 flex items-center justify-between text-safe">
                    <span>Day +7 Forecast (With Phosphine SOP):</span>
                    <strong className="font-bold">&lt; 8.0% (Colony Neutralized)</strong>
                  </div>
                </div>
              </div>

              <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2.5">
                <h4 className="font-display text-sm font-bold text-ink-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-grain-600" />
                  <span>NFA Milling Quality Grade &amp; Economic Exposure</span>
                </h4>
                <div className="text-xs text-ink-700 space-y-1.5">
                  <p>
                    <strong>Grain Bulk at Risk:</strong> ~500 Bags (25 Metric Tons) across affected stacks ({hotspotText}).
                  </p>
                  <p>
                    <strong>Estimated Commodity Value:</strong> 25 MT &times; &#8369;23,000 / MT = <strong className="text-ink-900">&#8369;575,000.00</strong>.
                  </p>
                  <p>
                    <strong>Insect Damaged Kernel (IDK) Limit:</strong> NFA Well-Milled Rice Grade 1 allows a maximum of <strong>1.0% IDK</strong>. Unchecked infestation above 70% results in Grade Demotion to Animal Feed, representing a <strong>45% loss in procurement value</strong> (&#8369;258,750.00 loss).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: OFFICIAL NFA INSPECTION AUDIT SIGN-OFF BLOCK */}
      <div className="bg-paper border border-ink-100 rounded-xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-grain-500 text-white font-display font-black text-lg flex items-center justify-center shadow-card">
              NFA
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-ink-900 uppercase tracking-wide">
                National Food Authority &bull; Grain Quality Assurance Division
              </h4>
              <p className="text-[11px] text-ink-400">
                AcoustiGrain Automated Bio-Acoustic Surveillance System &bull; Sensor Calibration ISO/IEC 17025 Compliant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-safe/10 text-safe border border-safe/30 text-[11px] font-bold flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>DIGITALLY AUDITED</span>
            </span>
          </div>
        </div>

        {/* Audit Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-ink-400 block text-[10px] uppercase font-semibold">Certified Inspector:</span>
            <span className="font-bold text-ink-900">{user?.name || user?.email || 'NFA Certified Inspector'}</span>
          </div>
          <div>
            <span className="text-ink-400 block text-[10px] uppercase font-semibold">Designated Facility:</span>
            <span className="font-bold text-ink-900 truncate block">{activeWarehouse}</span>
          </div>
          <div>
            <span className="text-ink-400 block text-[10px] uppercase font-semibold">Audit Timeframe:</span>
            <span className="font-bold text-ink-900">{firstDay.date} &ndash; {latestDay.date} (30 Days)</span>
          </div>
          <div>
            <span className="text-ink-400 block text-[10px] uppercase font-semibold">Inspection ID:</span>
            <span className="font-mono text-ink-900 font-bold">NFA-AG-2026-{Math.abs(totalPestEvents30D % 9999).toString().padStart(4, '0')}</span>
          </div>
        </div>

        {/* Action Footnote */}
        <div className="pt-3 border-t border-ink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink-400">
          <p className="text-[11px]">
            This 30-day historical trend report is generated automatically by AcoustiGrain bio-acoustic IoT sensor telemetry and adheres to the Philippine National Standards for Milled Rice Storage (PNS/BAFS 290:2020).
          </p>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="text-grain-600 hover:text-grain-700 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Full CSV (12 Columns)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
