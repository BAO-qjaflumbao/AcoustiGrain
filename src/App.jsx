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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[App ErrorBoundary caught error]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-paper rounded-xl border border-critical/30 shadow-card text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-critical/10 flex items-center justify-center text-critical font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-ink-900 font-display">Something went wrong loading this view</h2>
          <p className="text-xs text-ink-500 font-mono bg-husk p-3 rounded border border-ink-100 text-left overflow-x-auto">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-grain-500 text-white rounded-md text-xs font-bold hover:bg-grain-600 transition shadow-sm cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardContent() {
  const { activeTab } = useTelemetry();

  return (
    <main className="flex-1 overflow-y-auto bg-husk min-h-[calc(100vh-61px)]">
      <ErrorBoundary key={activeTab}>
        {activeTab === 'dashboard' && <StorageZoneGrid />}
        {activeTab === 'heatmap' && <WarehouseHeatmap3D />}
        {activeTab === 'grid' && <StorageZoneGrid />}
        {activeTab === 'devices' && <DeviceFleetPanel />}
        {activeTab === 'fft' && <FFTSignalSimulator />}
        {activeTab === 'alerts' && <AlertSystem />}
        {activeTab === 'analytics' && <HistoricalAnalytics />}
      </ErrorBoundary>
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
