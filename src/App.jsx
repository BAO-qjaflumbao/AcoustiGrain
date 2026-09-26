import React, { useState } from 'react';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';
import LoginScreen from './components/LoginScreen';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StorageZoneGrid from './components/StorageZoneGrid';
import WarehouseHeatmap3D from './components/WarehouseHeatmap3D';
import DeviceFleetPanel from './components/DeviceFleetPanel';
import FFTSignalSimulator from './components/FFTSignalSimulator';
import AlertSystem from './components/AlertSystem';
import HistoricalAnalytics from './components/HistoricalAnalytics';

function DashboardContent() {
  const { activeTab } = useTelemetry();

  return (
    <main className="flex-1 overflow-y-auto bg-husk min-h-[calc(100vh-61px)]">
      {activeTab === 'dashboard' && <StorageZoneGrid />}
      {activeTab === 'heatmap' && <WarehouseHeatmap3D />}
      {activeTab === 'grid' && <StorageZoneGrid />}
      {activeTab === 'devices' && <DeviceFleetPanel />}
      {activeTab === 'fft' && <FFTSignalSimulator />}
      {activeTab === 'alerts' && <AlertSystem />}
      {activeTab === 'analytics' && <HistoricalAnalytics />}
    </main>
  );
}

function MainLayout({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-husk text-ink-900 flex flex-col font-sans selection:bg-grain-500 selection:text-white">
      <Navbar user={user} onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <DashboardContent />
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('acoustigrain_user_auth');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('acoustigrain_user_auth', JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to save auth state:", e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('acoustigrain_user_auth');
    } catch (e) {
      console.error("Failed to remove auth state:", e);
    }
  };

  // Enforce authentication on initial open: navigate to LoginScreen if not authenticated
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <TelemetryProvider user={user}>
      <MainLayout user={user} onLogout={handleLogout} />
    </TelemetryProvider>
  );
}
