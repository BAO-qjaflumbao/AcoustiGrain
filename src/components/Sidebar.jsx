import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  LayoutGrid, 
  Map, 
  Cpu, 
  Volume2, 
  Bell, 
  BarChart3 
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useTelemetry();

  const navItems = [
    { id: 'dashboard', label: 'Storage Overview', icon: LayoutGrid },
    { id: 'heatmap', label: 'Rice Floor Map', icon: Map },
    { id: 'devices', label: 'Sensors & Hardware', icon: Cpu },
    { id: 'fft', label: 'Pest Audio Scanner', icon: Volume2 },
    { id: 'alerts', label: 'Notifications', icon: Bell },
    { id: 'analytics', label: '30-Day Reports', icon: BarChart3 },
  ];

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-100 bg-paper px-4 py-6 sm:flex justify-between selection:bg-grain-500 selection:text-white">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-grain-500 font-display text-sm font-bold text-white shadow-card">
            AG
          </span>
          <div>
            <span className="font-display text-base font-semibold tracking-tight text-ink-900 block">
              AcoustiGrain
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-400 block">
              NFA Pest Monitor
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-xs font-semibold transition text-left cursor-pointer ${
                  active 
                    ? 'bg-grain-50 text-grain-700 font-bold border-l-2 border-grain-500' 
                    : 'text-ink-600 hover:bg-husk hover:text-ink-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-grain-600' : 'text-ink-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Deployment Footer Badge */}
      <div className="rounded-lg bg-husk border border-ink-100 px-3.5 py-3 text-xs text-ink-400 space-y-0.5">
        <p className="font-medium text-ink-800">NFA Warehouse Inspector</p>
        <p className="text-[11px] text-ink-400">Bio-Acoustic Grain Safeguard</p>
      </div>
    </aside>
  );
}
