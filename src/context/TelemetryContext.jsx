import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_NODES, generateFFTSpectrum, generateHistoricalTrendData } from '../services/simulatorService';
import { subscribeToRealtimeNodes, pushNodeTelemetryToFirebase, syncAllNodesToFirebase } from '../services/firebaseService';

const TelemetryContext = createContext(null);

// Completely blank initial node state — sensors pop up ONLY when physically connected or transmitting telemetry
export const BLANK_NODES = [];

// Load saved sensor node telemetry from localStorage or start blank
const loadSavedNodes = () => {
  try {
    const saved = localStorage.getItem('acoustigrain_saved_nodes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error loading saved telemetry:", e);
  }
  return [];
};

// Load saved alerts from localStorage or start blank
const loadSavedAlerts = () => {
  try {
    const saved = localStorage.getItem('acoustigrain_saved_alerts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Error loading saved alerts:", e);
  }
  return [];
};

export function TelemetryProvider({ children, user }) {
  const isAdmin = Boolean(
    user?.role?.toLowerCase().includes('admin') || 
    user?.role?.toLowerCase().includes('inspector')
  );

  const [nodes, setNodes] = useState(loadSavedNodes);
  const [alerts, setAlerts] = useState(loadSavedAlerts);
  const [selectedNodeId, setSelectedNodeId] = useState("DEV-003");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);
  const [activeWarehouse, setActiveWarehouse] = useState("NFA Warehouse #4 - Quezon City Hub");
  const [historicalScenario, setHistoricalScenario] = useState('active');

  // Dynamically compute accurate 30-day historical data synchronized with live nodes
  const historicalData = useMemo(() => {
    return generateHistoricalTrendData(nodes, historicalScenario);
  }, [nodes, historicalScenario]);
  
  // WebSerial Hardware Connection State
  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  const [_serialPort, setSerialPort] = useState(null);

  // Automatically persist received sensor nodes data to localStorage & Firebase whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('acoustigrain_saved_nodes', JSON.stringify(nodes));
      syncAllNodesToFirebase(nodes);
    } catch (e) {
      console.error("Failed to persist nodes:", e);
    }
  }, [nodes]);

  // Automatically persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('acoustigrain_saved_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error("Failed to persist alerts:", e);
    }
  }, [alerts]);

  // Subscribe to live Firebase Realtime Database node telemetry updates if available
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeNodes((cloudNodes) => {
      if (cloudNodes && typeof cloudNodes === 'object') {
        setNodes(prev => {
          const updated = [...prev];
          Object.keys(cloudNodes).forEach(id => {
            const index = updated.findIndex(n => n.id === id);
            if (index >= 0) {
              updated[index] = { ...updated[index], ...cloudNodes[id] };
            } else {
              updated.push({
                id,
                name: cloudNodes[id].name || `Sensor Node ${id}`,
                zone: cloudNodes[id].zone || "Bin B1",
                status: "Safe",
                infestationLevel: 0,
                peakFreqHz: 0,
                amplitudeDb: -90,
                temperature: 0,
                humidity: 0,
                depthCm: 0,
                battery: 0,
                ...cloudNodes[id]
              });
            }
          });
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Change designated Bin location for any hardware sensor node
  const changeNodeZone = (nodeId, newZone) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, zone: newZone } : n));
  };

  // Change probe insertion depth (cm) for any hardware sensor node
  const changeNodeDepth = (nodeId, newDepth) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, depthCm: parseInt(newDepth, 10) || 0 } : n));
  };

  // WebSerial API: Connect physical Seeed Studio XIAO ESP32-S3 via USB COM port (Admin Only)
  const connectPhysicalHardware = async () => {
    if (!isAdmin) {
      alert("Hardware connection settings are restricted to NFA Admin Inspectors.");
      return;
    }

    if (!("serial" in navigator)) {
      alert("WebSerial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setSerialPort(port);
      setIsHardwareConnected(true);

      // Auto-activate DEV-003 node on hardware connect in Safe initial state (0% Infestation)
      // Auto-activate DEV-003 node on hardware connect in Safe initial state (0% Infestation)
      setNodes(prev => {
        const exists = prev.some(n => n.id === 'DEV-003');
        if (exists) {
          return prev.map(n => n.id === 'DEV-003' ? {
            ...n,
            status: "Safe",
            infestationLevel: 0,
            peakFreqHz: 0,
            weevilCountEst: 0,
            amplitudeDb: -90,
            temperature: 0,
            humidity: 0,
            depthCm: n.depthCm > 0 ? n.depthCm : 45,
            battery: 0,
            lastSeen: "Just now (Hardware Connected - Insert probe in rice)"
          } : n);
        }
        return [...prev, {
          id: "DEV-003",
          name: "Seeed XIAO ESP32-S3 Physical Sensor Node",
          zone: "Bin B1",
          stackId: "stack-b1",
          gridX: 1,
          gridY: 0,
          depthCm: 45,
          battery: 94,
          rssi: -65,
          snr: 9.8,
          status: "Safe",
          infestationLevel: 0,
          peakFreqHz: 0,
          amplitudeDb: -90,
          temperature: 0,
          humidity: 0,
          powerMode: "Active (30s)",
          lastSeen: "Just now (Hardware Connected - Insert probe in rice)",
          weevilCountEst: 0
        }];
      });

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (
            trimmed.includes("Transmitting") || 
            trimmed.includes("Peak:") || 
            trimmed.includes("Status:") || 
            trimmed.includes("@") ||
            trimmed.includes("DHT11") ||
            trimmed.includes("Temp") ||
            trimmed.includes("Hum") ||
            trimmed.includes("Depth")
          ) {
            parseSerialTelemetry(trimmed);
          }
        }
      }
    } catch (err) {
      console.warn("Serial connection canceled or failed:", err);
      setIsHardwareConnected(false);
    }
  };

  // Parse live Serial Monitor log line from physical XIAO ESP32-S3 hardware
  const parseSerialTelemetry = (line) => {
    const freqMatch = line.match(/Peak:\s*(\d+)\s*Hz/i);
    const dbMatch = line.match(/@\s*(-?\d+)\s*dBFS/i);
    const statusMatch = line.match(/Status:\s*(\d+)/i);
    const batMatch = line.match(/(?:Bat|Battery):\s*(\d+)%/i);
    const tempMatch = line.match(/(?:Temp|Temperature):\s*([\d.]+)/i);
    const humMatch = line.match(/(?:Hum|Humidity):\s*([\d.]+)/i);
    const depthMatch = line.match(/(?:Depth):\s*(\d+)/i);

    if (freqMatch || dbMatch || statusMatch || batMatch || tempMatch || humMatch || depthMatch) {
      const peakFreqHz = freqMatch ? parseInt(freqMatch[1], 10) : 0;
      const amplitudeDb = dbMatch ? parseInt(dbMatch[1], 10) : -90;
      const statusVal = statusMatch ? parseInt(statusMatch[1], 10) : -1;
      const parsedBat = batMatch ? parseInt(batMatch[1], 10) : null;
      const parsedTemp = tempMatch ? parseFloat(tempMatch[1]) : null;
      const parsedHum = humMatch ? parseFloat(humMatch[1]) : null;
      const parsedDepth = depthMatch ? parseInt(depthMatch[1], 10) : null;
      
      // Bio-Acoustic Grain Insertion & High Sensitivity Filter:
      // Real INMP441 MEMS I2S microphone 24-bit FFT energy for rice grain scratching / Bukbok clicking sits between -85 dBFS and -55 dBFS.
      // Firmware sends Status: 1 (Moderate) or Status: 2 (Critical) or peak frequency between 2400 Hz - 5500 Hz.
      const isBukbokBand = peakFreqHz >= 2400 && peakFreqHz <= 5500;
      let statusText = "Safe";
      let infestationLevel = 0;
      let weevilCountEst = 0;

      if (statusVal === 2 || (isBukbokBand && amplitudeDb > -60) || amplitudeDb > -45) {
        statusText = "Critical";
        infestationLevel = 89;
        weevilCountEst = 42;
      } else if (statusVal === 1 || (isBukbokBand && amplitudeDb > -85) || amplitudeDb > -68) {
        statusText = "Moderate";
        infestationLevel = 52;
        weevilCountEst = 14;
      }

      const updatedTelemetry = {
        peakFreqHz: statusText === "Safe" ? 0 : peakFreqHz,
        amplitudeDb: amplitudeDb === -90 && statusText !== "Safe" ? -68 : amplitudeDb,
        status: statusText,
        infestationLevel,
        weevilCountEst,
        ...(parsedBat !== null && { battery: parsedBat, batteryPct: parsedBat }),
        ...(parsedTemp !== null && { temperature: parsedTemp }),
        ...(parsedHum !== null && { humidity: parsedHum }),
        ...(parsedDepth !== null && { depthCm: parsedDepth }),
        lastSeen: `Just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`
      };

      setNodes(prev => prev.map(n => {
        if (n.id === "DEV-003") {
          return {
            ...n,
            ...updatedTelemetry
          };
        }
        return n;
      }));

      pushNodeTelemetryToFirebase("DEV-003", updatedTelemetry);

      if (statusText !== "Safe") {
        const targetNode = nodes.find(n => n.id === "DEV-003");
        const currentZone = targetNode ? targetNode.zone : "Bin B1";

        const newAlert = {
          id: `alt-phys-${Date.now()}`,
          nodeId: "DEV-003",
          nodeName: "Seeed XIAO ESP32-S3 Physical Sensor Node",
          zone: currentZone,
          severity: statusText === "Critical" ? "critical" : "warning",
          message: `PHYSICAL SENSOR TELEMETRY RECEIVED: Bio-acoustic spike (${peakFreqHz > 0 ? peakFreqHz + ' Hz' : 'Bukbok Signature'} @ ${amplitudeDb} dBFS) in ${currentZone}!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          acknowledged: false
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }
  };

  // Optional live simulation tick (Admin Only)
  useEffect(() => {
    if (!isLiveSimulating || !isAdmin) return;

    const timer = setInterval(() => {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === "DEV-015") return node;
          if (node.id === "DEV-003" && isHardwareConnected) return node;

          const delta = (Math.random() * 4 - 2);
          let newInfestation = Math.min(99, Math.max(0, node.infestationLevel + (delta > 1 ? 2 : delta < -1 ? -2 : 0)));
          
          let newStatus = node.status;
          if (newInfestation >= 70) newStatus = "Critical";
          else if (newInfestation >= 36) newStatus = "Moderate";
          else newStatus = "Safe";

          let newPeakFreq = node.peakFreqHz;
          if (newStatus === "Critical" || newStatus === "Moderate") {
            newPeakFreq = Math.round(3400 + Math.random() * 1100);
          } else {
            newPeakFreq = Math.round(100 + Math.random() * 200);
          }

          return {
            ...node,
            infestationLevel: newInfestation,
            status: newStatus,
            peakFreqHz: newPeakFreq,
            amplitudeDb: newStatus === "Critical" ? Math.round(-38 + Math.random() * 8) : node.amplitudeDb,
            temperature: Math.round((node.temperature || 29 + (Math.random() * 0.2 - 0.1)) * 10) / 10,
            humidity: Math.round((node.humidity || 58 + (Math.random() * 0.4 - 0.2)) * 10) / 10,
            weevilCountEst: newStatus === "Critical" ? Math.round(30 + Math.random() * 20) : newStatus === "Moderate" ? Math.round(10 + Math.random() * 10) : 0,
            lastSeen: "Just now"
          };
        })
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [isLiveSimulating, isHardwareConnected, isAdmin]);

  // Trigger simulated pest infestation (Admin Only)
  const triggerOutbreak = (targetZone = "Bin B1") => {
    if (!isAdmin) return;

    setNodes(prev => prev.map(n => {
      if (n.zone === targetZone) {
        return {
          ...n,
          status: "Critical",
          infestationLevel: 89,
          peakFreqHz: 3840,
          amplitudeDb: -26,
          weevilCountEst: 42,
          lastSeen: "Just now (Signal Connected)"
        };
      }
      return n;
    }));

    const newAlert = {
      id: `alt-${Date.now()}`,
      nodeId: "DEV-003",
      nodeName: `Sensor Node in ${targetZone}`,
      zone: targetZone,
      severity: "critical",
      message: `SENSOR DATA RECEIVED: Acoustic bio-signature breach detected in ${targetZone}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acknowledged: false
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  // Reset telemetry data back to blank initial state (Admin Only)
  const resetToBlankState = () => {
    if (!isAdmin) return;
    localStorage.removeItem('acoustigrain_saved_nodes');
    localStorage.removeItem('acoustigrain_saved_alerts');
    setNodes(BLANK_NODES);
    setAlerts([]);
    setIsHardwareConnected(false);
  };

  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  // Purely live connected physical sensor nodes ONLY (no static dummy nodes)
  const activeNodes = nodes;

  const defaultFallbackNode = {
    id: "DEV-003",
    name: "Seeed XIAO ESP32-S3 Physical Sensor Node",
    zone: "Bin B1",
    status: "Safe",
    infestationLevel: 0,
    peakFreqHz: 0,
    amplitudeDb: -90,
    weevilCountEst: 0,
    temperature: 0,
    humidity: 0,
    depthCm: 0,
    battery: 0,
    lastSeen: "Awaiting hardware sensor connection"
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0] || defaultFallbackNode;
  const selectedSpectrum = generateFFTSpectrum(selectedNode);

  const criticalCount = nodes.filter(n => n.status === "Critical").length;
  const moderateCount = nodes.filter(n => n.status === "Moderate").length;
  const safeCount = nodes.filter(n => n.status === "Safe").length;
  const activeSensorsCount = nodes.length;
  const totalPestDetections = nodes.reduce((acc, curr) => acc + (curr.weevilCountEst || 0), 0);
  const avgInfestation = nodes.length > 0 
    ? Math.round(nodes.reduce((acc, curr) => acc + (curr.infestationLevel || 0), 0) / nodes.length) 
    : 0;

  return (
    <TelemetryContext.Provider value={{
      user,
      isAdmin,
      nodes,
      activeNodes,
      setNodes,
      changeNodeZone,
      changeNodeDepth,
      selectedNode,
      setSelectedNodeId,
      selectedSpectrum,
      activeTab,
      setActiveTab,
      isLiveSimulating,
      setIsLiveSimulating,
      activeWarehouse,
      setActiveWarehouse,
      alerts,
      acknowledgeAlert,
      triggerOutbreak,
      resetToBlankState,
      historicalData,
      historicalScenario,
      setHistoricalScenario,
      isHardwareConnected,
      connectPhysicalHardware,
      metrics: {
        criticalCount,
        moderateCount,
        safeCount,
        activeSensorsCount,
        totalNodes: nodes.length,
        totalPestDetections,
        avgInfestation,
        qualityRating: nodes.length > 0 ? Math.max(0, Math.round(100 - avgInfestation * 0.8)) : 100
      }
    }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
