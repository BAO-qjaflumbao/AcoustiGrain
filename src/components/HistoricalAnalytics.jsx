import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  BarChart2, 
  CheckCircle, 
  FileSpreadsheet 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

export default function HistoricalAnalytics() {
  const { historicalData } = useTelemetry();

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,AvgInfestationPct,CriticalNodes,ModerateNodes,SafeNodes,AvgTempC,PestEvents\n"
      + historicalData.map(e => `${e.date},${e.avgInfestationPct},${e.criticalNodes},${e.moderateNodes},${e.safeNodes},${e.avgTemp},${e.detectedPestEvents}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NFA_AcoustiGrain_30Day_Inspection_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper p-5 rounded-xl border border-ink-100 shadow-card">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-grain-500" />
            <span>30-Day Infestation Trends &amp; Monthly Reports</span>
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">Track seasonal Bukbok population movements and generate downloadable inspection reports for NFA management.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-grain-500 hover:bg-grain-600 text-white text-xs font-bold px-4 py-2 rounded-md shadow-card transition flex items-center space-x-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV Inspection Report</span>
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 30-Day Infestation Rate */}
        <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-4 shadow-card">
          <h3 className="font-display text-base font-bold text-ink-900">30-Day Average Infestation Level (%)</h3>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="infestGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C97A1F" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#C97A1F" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                <YAxis stroke="#736A5E" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px', color: '#1A1712' }} />
                <Area type="monotone" dataKey="avgInfestationPct" stroke="#C97A1F" strokeWidth={2} fillOpacity={1} fill="url(#infestGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pest Event Frequency */}
        <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-4 shadow-card">
          <h3 className="font-display text-base font-bold text-ink-900">Number of Pest Detections per Day</h3>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#736A5E" tick={{ fontSize: 10 }} />
                <YAxis stroke="#736A5E" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px', color: '#1A1712' }} />
                <Bar dataKey="detectedPestEvents" fill="#C0392B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
