import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  Bell, 
  ShieldAlert, 
  Send,
  CheckCircle2
} from 'lucide-react';

export default function AlertSystem() {
  const { isAdmin, alerts, acknowledgeAlert, triggerOutbreak } = useTelemetry();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper p-5 rounded-xl border border-ink-100 shadow-card">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-critical" />
            <span>Pest Breach Notification Center</span>
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">Automated alert system triggered when feeding activity exceeds safe thresholds in rice bag stacks.</p>
        </div>

        {/* Admin Only Trigger Button */}
        {isAdmin && (
          <button
            onClick={() => triggerOutbreak('Bin C2')}
            className="bg-critical hover:bg-critical/90 text-white text-xs font-bold px-4 py-2 rounded-md shadow-card transition flex items-center space-x-1.5 cursor-pointer"
            title="Dispatch a test sensor breach alert (Admin Only)"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Test Alert</span>
          </button>
        )}
      </div>

      {/* Alerts Feed */}
      {alerts.length === 0 ? (
        <div className="bg-paper border border-ink-100 rounded-xl p-8 text-center text-xs text-ink-400 space-y-2 shadow-card">
          <CheckCircle2 className="w-8 h-8 text-safe mx-auto" />
          <p className="font-display font-bold text-ink-900 text-sm">No Active Pest Alerts</p>
          <p className="text-ink-400 max-w-md mx-auto">The system is continuously scanning 50kg bag stacks. Alerts will be recorded automatically when Bukbok feeding sounds are detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alt => (
            <div 
              key={alt.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                alt.acknowledged 
                  ? 'bg-husk/60 border-ink-100 opacity-60' 
                  : 'bg-paper border-critical/40 shadow-card'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-xl shrink-0 ${
                  alt.severity === 'critical' ? 'bg-critical/10 text-critical border border-critical/20' : 'bg-moderate/10 text-moderate border border-moderate/20'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-ink-900">{alt.zone} &bull; {alt.nodeName}</span>
                    <span className="text-[10px] font-mono text-ink-400">({alt.timestamp})</span>
                  </div>
                  <p className="text-xs text-ink-600 font-medium">{alt.message}</p>
                  <p className="text-[11px] text-grain-700 font-semibold mt-1">
                    Recommended Action: Inspect bag stack in {alt.zone} &amp; verify with manual probe probe sample.
                  </p>
                </div>
              </div>

              <button
                onClick={() => acknowledgeAlert(alt.id)}
                disabled={alt.acknowledged}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition shrink-0 cursor-pointer ${
                  alt.acknowledged 
                    ? 'bg-husk text-ink-400 border border-ink-100 cursor-default' 
                    : 'bg-safe hover:bg-safe/90 text-white shadow-card'
                }`}
              >
                {alt.acknowledged ? 'Checked & Resolved' : 'Mark as Checked'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
