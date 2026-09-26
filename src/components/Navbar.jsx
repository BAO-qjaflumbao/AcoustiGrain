import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import FirebaseModal from './FirebaseModal';
import { 
  Database,
  Usb,
  Radio,
  Zap,
  Eye,
  LogOut
} from 'lucide-react';

const TITLES = {
  dashboard: 'Storage Overview',
  heatmap: 'Rice Storage Floor Map (3D / 2D Stack Layout)',
  devices: 'Sensors & Hardware Network',
  fft: 'Pest Audio & Chewing Sound Scanner',
  alerts: 'Real-Time Pest Breach Alerts',
  analytics: '30-Day Infestation Trends & CSV Reports'
};

export default function Navbar({ user, onLogout }) {
  const { 
    isAdmin,
    activeTab,
    activeWarehouse, 
    isLiveSimulating, 
    setIsLiveSimulating,
    triggerOutbreak,
    isHardwareConnected,
    connectPhysicalHardware
  } = useTelemetry();

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-ink-100 bg-paper px-4 py-3.5 sm:px-6 lg:px-8 gap-3 shadow-card selection:bg-grain-500 selection:text-white">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
            NFA Grain Inspector Portal &middot; {activeWarehouse}
          </p>
          <h1 className="font-display text-lg font-bold text-ink-900 leading-tight">
            {TITLES[activeTab] || 'Storage Overview'}
          </h1>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin Controls */}
          {isAdmin ? (
            <>
              {/* Firebase Settings */}
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-grain-50 hover:bg-grain-100 text-grain-700 border border-grain-200 transition shadow-card cursor-pointer"
                title="Configure Database Cloud Sync"
              >
                <Database className="w-3.5 h-3.5 text-grain-500" />
                <span>Cloud Settings</span>
              </button>

              {/* Connect COM4 */}
              <button
                onClick={connectPhysicalHardware}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition shadow-card cursor-pointer ${
                  isHardwareConnected 
                    ? 'bg-safe text-white border border-safe' 
                    : 'bg-paper hover:bg-husk text-ink-800 border border-ink-100'
                }`}
                title="Connect physical USB sensor hardware"
              >
                <Usb className="w-3.5 h-3.5" />
                <span>{isHardwareConnected ? 'Sensor Connected (COM4)' : 'Connect Hardware Sensor'}</span>
              </button>

              {/* Feed & Outbreak Toggle */}
              <div className="flex items-center bg-husk p-1 rounded-md border border-ink-100 text-xs">
                <button 
                  onClick={() => setIsLiveSimulating(!isLiveSimulating)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                    isLiveSimulating ? 'bg-grain-500 text-white font-bold' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>{isLiveSimulating ? 'Live Stream' : 'Stream Off'}</span>
                </button>
                
                <button
                  onClick={() => triggerOutbreak('Bin B1')}
                  title="Simulate a test pest detection signal in Bin B1"
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-moderate hover:bg-grain-100 rounded transition font-medium cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>Test Signal</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-husk border border-ink-100 text-ink-600 rounded-md text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-grain-500" />
              <span>Operator View Only</span>
            </div>
          )}

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3 pl-2 border-l border-ink-100">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-ink-900">
                {user?.name || user?.email || 'NFA Inspector'}
              </p>
              <p className="text-[10px] text-ink-400 font-medium">
                {user?.role || 'Operator'}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-1 rounded-md border border-ink-100 bg-paper px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-critical/40 hover:text-critical cursor-pointer shadow-card"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Firebase Modal */}
      {isAdmin && (
        <FirebaseModal 
          isOpen={isFirebaseModalOpen} 
          onClose={() => setIsFirebaseModalOpen(false)} 
        />
      )}
    </>
  );
}
