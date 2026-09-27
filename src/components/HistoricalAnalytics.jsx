import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  TrendingUp, 
  Download, 
  Printer 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

export default function HistoricalAnalytics() {
  const { 
    historicalData, 
    activeWarehouse, 
    user 
  } = useTelemetry();

  // Safe fallback if data is empty
  const data = (historicalData && historicalData.length > 0) ? historicalData : [];
  const firstDay = data[0] || { avgInfestationPct: 0, date: '' };
  const latestDay = data[data.length - 1] || { avgInfestationPct: 0, date: '' };

  // Export Comprehensive CSV Report
  const handleExportCSV = () => {
    const csvHeader = "Date,ISO_Date,Day_Index,Avg_Infestation_Pct,Critical_Nodes,Moderate_Nodes,Safe_Nodes,Avg_Temp_C,Avg_Humidity_Pct,Est_Grain_Moisture_MC,Acoustic_Power_dBFS,Peak_Frequency_Hz,Pest_Detection_Events,Dominant_Species,Risk_Category,Recommended_NFA_Action\n";
    const csvRows = data.map(e => 
      `"${e.date}","${e.isoDate}",${e.dayIndex},${e.avgInfestationPct}%,${e.criticalNodes},${e.moderateNodes},${e.safeNodes},${e.avgTemp},${e.avgHumidity}%,${e.grainMoistureEst}%,${e.avgAcousticPowerDb},${e.peakFreqHz},${e.detectedPestEvents},"${e.dominantSpecies}","${e.riskCategory}","${e.recommendedAction}"`
    ).join("\n");

    const fullContent = `data:text/csv;charset=utf-8,# ACOUSTIGRAIN NFA 30-DAY BIO-ACOUSTIC GRAIN INSPECTION REPORT\n# Facility: ${activeWarehouse}\n# Certified Inspector: ${user?.name || user?.email || 'NFA Authorized Inspector'}\n# Target Species: Sitophilus oryzae (Rice Weevil / Bukbok)\n# Report Period: ${firstDay.date} - ${latestDay.date}\n# Generated: ${new Date().toLocaleString()}\n` + csvHeader + csvRows;
    
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
      {/* Header: Title + Print & CSV Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper p-5 rounded-xl border border-ink-100 shadow-card">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-grain-500" />
            <span>30-Day Historical Trend Analytics &amp; Monthly Reports</span>
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Track <em>Sitophilus oryzae</em> (Bukbok) population movements and generate downloadable inspection reports for NFA management.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-paper hover:bg-husk text-ink-700 text-xs font-bold px-3 py-2 rounded-md border border-ink-100 shadow-card transition flex items-center space-x-1.5 cursor-pointer"
            title="Print official inspection summary"
          >
            <Printer className="w-4 h-4 text-ink-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-grain-500 hover:bg-grain-600 text-white text-xs font-bold px-4 py-2 rounded-md shadow-card transition flex items-center space-x-2 cursor-pointer"
            title="Download CSV Inspection Report"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Inspection Report</span>
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 30-Day Infestation Rate */}
        <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink-900">30-Day Average Infestation Level (%)</h3>
            <span className="text-[11px] font-mono text-ink-400">Current: {latestDay.avgInfestationPct}%</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="infestGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C97A1F" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#C97A1F" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" opacity={0.5} />
                <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                <YAxis stroke="#736A5E" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px', color: '#1A1712', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} 
                  formatter={(value) => [`${value}%`, 'Average Infestation']}
                />
                <ReferenceLine y={70} stroke="#C0392B" strokeDasharray="3 3" label={{ value: 'CRITICAL (70%)', position: 'insideTopLeft', fill: '#C0392B', fontSize: 10, fontWeight: 'bold' }} />
                <ReferenceLine y={36} stroke="#C97A1F" strokeDasharray="3 3" label={{ value: 'WARNING (36%)', position: 'insideTopLeft', fill: '#C97A1F', fontSize: 10, fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="avgInfestationPct" stroke="#C97A1F" strokeWidth={2} fillOpacity={1} fill="url(#infestGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-ink-400 border-t border-ink-100 pt-2 flex items-center justify-between">
            <span>Thresholds: Safe (&lt;36%) | Warning (36-69%) | Critical (&ge;70%)</span>
            <span className="font-mono">PNS/BAFS 290:2020 Standard</span>
          </p>
        </div>

        {/* Chart 2: Pest Event Frequency */}
        <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink-900">Number of Pest Detections per Day</h3>
            <span className="text-[11px] font-mono text-ink-400">Total 30D: {data.reduce((a, b) => a + (b.detectedPestEvents || 0), 0).toLocaleString()} clicks</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" opacity={0.5} />
                <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                <YAxis stroke="#736A5E" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px', color: '#1A1712', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} 
                  formatter={(value) => [`${value} click events`, 'Pest Detections']}
                />
                <Bar dataKey="detectedPestEvents" fill="#C0392B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-ink-400 border-t border-ink-100 pt-2 flex items-center justify-between">
            <span>Bio-acoustic mastication clicks peaking at 3.84 kHz (Balingbing et al., 2024)</span>
            <span className="font-mono">Sensor: INMP441 MEMS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
