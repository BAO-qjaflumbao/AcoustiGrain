// Simulator & Dataset Service for AcoustiGrain IoT Telemetry & Bio-Acoustic Signal Processing
// Includes Balingbing et al. (2024) Ground-Truth Research Dataset Profiles

export const INITIAL_NODES = [
  {
    id: "DEV-001",
    name: "Wedge A1-Top",
    zone: "Bin A1",
    stackId: "stack-a1",
    gridX: 0,
    gridY: 0,
    depthCm: 15,
    battery: 96,
    rssi: -65,
    snr: 9.8,
    status: "Safe",
    infestationLevel: 12,
    peakFreqHz: 140,
    amplitudeDb: -74,
    temperature: 29.8,
    humidity: 58.2,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 0
  },
  {
    id: "DEV-002",
    name: "Wedge A1-Mid",
    zone: "Bin A1",
    stackId: "stack-a1",
    gridX: 0,
    gridY: 0,
    depthCm: 45,
    battery: 88,
    rssi: -72,
    snr: 8.5,
    status: "Safe",
    infestationLevel: 18,
    peakFreqHz: 210,
    amplitudeDb: -68,
    temperature: 30.2,
    humidity: 60.1,
    powerMode: "Active (30s)",
    lastSeen: "1 min ago",
    weevilCountEst: 1
  },
  {
    id: "DEV-003",
    name: "Wedge B1-Core",
    zone: "Bin B1",
    stackId: "stack-b1",
    gridX: 1,
    gridY: 0,
    depthCm: 50,
    battery: 82,
    rssi: -84,
    snr: 5.2,
    status: "Critical",
    infestationLevel: 89,
    peakFreqHz: 3820,
    amplitudeDb: -34,
    temperature: 34.6,
    humidity: 68.9,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 42
  },
  {
    id: "DEV-004",
    name: "Wedge B1-Base",
    zone: "Bin B1",
    stackId: "stack-b1",
    gridX: 1,
    gridY: 0,
    depthCm: 80,
    battery: 79,
    rssi: -88,
    snr: 4.8,
    status: "Critical",
    infestationLevel: 94,
    peakFreqHz: 4150,
    amplitudeDb: -29,
    temperature: 36.1,
    humidity: 71.4,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 58
  },
  {
    id: "DEV-005",
    name: "Wedge C1-Mid",
    zone: "Bin C1",
    stackId: "stack-c1",
    gridX: 2,
    gridY: 0,
    depthCm: 30,
    battery: 91,
    rssi: -70,
    snr: 9.1,
    status: "Safe",
    infestationLevel: 24,
    peakFreqHz: 180,
    amplitudeDb: -65,
    temperature: 29.5,
    humidity: 57.0,
    powerMode: "Active (30s)",
    lastSeen: "2 mins ago",
    weevilCountEst: 2
  },
  {
    id: "DEV-006",
    name: "Wedge D1-Top",
    zone: "Bin D1",
    stackId: "stack-d1",
    gridX: 3,
    gridY: 0,
    depthCm: 20,
    battery: 94,
    rssi: -66,
    snr: 10.4,
    status: "Safe",
    infestationLevel: 15,
    peakFreqHz: 120,
    amplitudeDb: -76,
    temperature: 28.9,
    humidity: 55.4,
    powerMode: "Deep Sleep (4h)",
    lastSeen: "5 mins ago",
    weevilCountEst: 0
  },
  {
    id: "DEV-007",
    name: "Wedge A2-Core",
    zone: "Bin A2",
    stackId: "stack-a2",
    gridX: 0,
    gridY: 1,
    depthCm: 50,
    battery: 85,
    rssi: -76,
    snr: 7.9,
    status: "Moderate",
    infestationLevel: 58,
    peakFreqHz: 3450,
    amplitudeDb: -52,
    temperature: 32.1,
    humidity: 63.8,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 14
  },
  {
    id: "DEV-008",
    name: "Wedge B2-Mid",
    zone: "Bin B2",
    stackId: "stack-b2",
    gridX: 1,
    gridY: 1,
    depthCm: 40,
    battery: 76,
    rssi: -80,
    snr: 6.8,
    status: "Moderate",
    infestationLevel: 52,
    peakFreqHz: 3600,
    amplitudeDb: -55,
    temperature: 31.8,
    humidity: 62.4,
    powerMode: "Active (30s)",
    lastSeen: "1 min ago",
    weevilCountEst: 11
  },
  {
    id: "DEV-009",
    name: "Wedge C2-Core",
    zone: "Bin C2",
    stackId: "stack-c2",
    gridX: 2,
    gridY: 1,
    depthCm: 45,
    battery: 90,
    rssi: -71,
    snr: 8.8,
    status: "Safe",
    infestationLevel: 28,
    peakFreqHz: 250,
    amplitudeDb: -63,
    temperature: 30.0,
    humidity: 59.2,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 3
  },
  {
    id: "DEV-010",
    name: "Wedge D2-Base",
    zone: "Bin D2",
    stackId: "stack-d2",
    gridX: 3,
    gridY: 1,
    depthCm: 70,
    battery: 83,
    rssi: -75,
    snr: 8.1,
    status: "Moderate",
    infestationLevel: 46,
    peakFreqHz: 3280,
    amplitudeDb: -58,
    temperature: 31.2,
    humidity: 61.5,
    powerMode: "Deep Sleep (4h)",
    lastSeen: "8 mins ago",
    weevilCountEst: 8
  },
  {
    id: "DEV-011",
    name: "Wedge A3-Top",
    zone: "Bin A3",
    stackId: "stack-a3",
    gridX: 0,
    gridY: 2,
    depthCm: 15,
    battery: 97,
    rssi: -64,
    snr: 11.2,
    status: "Safe",
    infestationLevel: 10,
    peakFreqHz: 110,
    amplitudeDb: -78,
    temperature: 28.5,
    humidity: 54.8,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 0
  },
  {
    id: "DEV-012",
    name: "Wedge B3-Core",
    zone: "Bin B3",
    stackId: "stack-b3",
    gridX: 1,
    gridY: 2,
    depthCm: 50,
    battery: 81,
    rssi: -82,
    snr: 5.9,
    status: "Critical",
    infestationLevel: 76,
    peakFreqHz: 3950,
    amplitudeDb: -41,
    temperature: 33.8,
    humidity: 66.7,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 31
  },
  {
    id: "DEV-013",
    name: "Wedge C3-Mid",
    zone: "Bin C3",
    stackId: "stack-c3",
    gridX: 2,
    gridY: 2,
    depthCm: 35,
    battery: 89,
    rssi: -73,
    snr: 8.3,
    status: "Moderate",
    infestationLevel: 61,
    peakFreqHz: 3520,
    amplitudeDb: -49,
    temperature: 32.4,
    humidity: 64.1,
    powerMode: "Active (30s)",
    lastSeen: "3 mins ago",
    weevilCountEst: 16
  },
  {
    id: "DEV-014",
    name: "Wedge D3-Base",
    zone: "Bin D3",
    stackId: "stack-d3",
    gridX: 3,
    gridY: 2,
    depthCm: 65,
    battery: 93,
    rssi: -69,
    snr: 9.4,
    status: "Safe",
    infestationLevel: 31,
    peakFreqHz: 280,
    amplitudeDb: -62,
    temperature: 29.9,
    humidity: 58.6,
    powerMode: "Active (30s)",
    lastSeen: "Just now",
    weevilCountEst: 4
  },
  {
    id: "DEV-015",
    name: "Wedge Gateway-01",
    zone: "Central Hub",
    stackId: "hub-01",
    gridX: 1.5,
    gridY: 1,
    depthCm: 0,
    battery: 100,
    rssi: -45,
    snr: 15.0,
    status: "Safe",
    infestationLevel: 0,
    peakFreqHz: 0,
    amplitudeDb: -90,
    temperature: 27.5,
    humidity: 50.0,
    powerMode: "AC Powered 24/7",
    lastSeen: "Online",
    weevilCountEst: 0
  }
];

// Engr. Balingbing et al. (2024) Research Dataset Spectral Bins
export const BALINGBING_DATASET_PROFILES = {
  sitophilus: {
    species: "Sitophilus oryzae (Rice Weevil / Bukbok)",
    paperTitle: "Balingbing et al. (2024) - Computers and Electronics in Agriculture",
    peakFreq: 3840,
    maxDbFS: -32,
    status: "Critical",
    description: "Empirical bio-acoustic chewing clicks recorded inside milled rice grain bulk using MEMS microphone."
  },
  rhyzopertha: {
    species: "Rhyzopertha dominica (Lesser Grain Borer)",
    paperTitle: "Balingbing et al. (2024) - Ground Truth Corpus",
    peakFreq: 2450,
    maxDbFS: -42,
    status: "Moderate",
    description: "Distinct grain boring acoustic signature peaking at 2.45 kHz."
  },
  tribolium: {
    species: "Tribolium castaneum (Red Flour Beetle)",
    paperTitle: "Balingbing et al. (2024) - Ground Truth Corpus",
    peakFreq: 1850,
    maxDbFS: -54,
    status: "Moderate",
    description: "Surface crawling and husk friction signature peaking at 1.85 kHz."
  },
  clean_control: {
    species: "Clean Milled Rice (Control Baseline)",
    paperTitle: "Balingbing et al. (2024) - Uninfested Baseline",
    peakFreq: 120,
    maxDbFS: -78,
    status: "Safe",
    description: "Uninfested rice storage baseline with zero pest chewing micro-vibrations."
  }
};

// Helper to generate dynamic FFT frequency spectrum array for a node
export function generateFFTSpectrum(node, datasetMode = 'live') {
  const bins = [];
  const noiseFloor = -75; // Ambient noise floor in dBFS

  if (datasetMode !== 'live' && BALINGBING_DATASET_PROFILES[datasetMode]) {
    const profile = BALINGBING_DATASET_PROFILES[datasetMode];
    for (let i = 0; i <= 32; i++) {
      const freqHz = Math.round((i / 32) * 8000);
      let power = noiseFloor + (Math.random() * 4 - 2);

      // Low-frequency ambient noise
      if (freqHz < 1000) {
        power += 12 * (1 - freqHz / 1000);
      }

      // Target peak for Balingbing dataset species
      if (profile.peakFreq > 0) {
        const distance = Math.abs(freqHz - profile.peakFreq) / 1000;
        const peakHeight = (profile.maxDbFS - noiseFloor) * Math.max(0, 1 - distance * 0.8);
        power += peakHeight;
      }

      bins.push({
        freqHz,
        freqLabel: `${(freqHz / 1000).toFixed(1)}k`,
        powerDb: Math.min(-10, Math.max(-90, Math.round(power))),
        isTargetBand: freqHz >= 3000 && freqHz <= 5000
      });
    }
    return bins;
  }

  // Default live node processing
  for (let i = 0; i <= 32; i++) {
    const freqHz = Math.round((i / 32) * 8000);
    let power = noiseFloor + (Math.random() * 6 - 3);

    if (freqHz < 1000) {
      power += 15 * (1 - freqHz / 1000);
    }

    if (freqHz >= 3000 && freqHz <= 5000) {
      if (node.status === 'Critical') {
        const centerDistance = Math.abs(freqHz - node.peakFreqHz) / 1000;
        const peakHeight = 42 * Math.max(0, 1 - centerDistance);
        power += peakHeight;
      } else if (node.status === 'Moderate') {
        const centerDistance = Math.abs(freqHz - node.peakFreqHz) / 1000;
        const peakHeight = 24 * Math.max(0, 1 - centerDistance);
        power += peakHeight;
      } else {
        power += Math.random() * 4;
      }
    }

    bins.push({
      freqHz,
      freqLabel: `${(freqHz / 1000).toFixed(1)}k`,
      powerDb: Math.min(-10, Math.max(-90, Math.round(power))),
      isTargetBand: freqHz >= 3000 && freqHz <= 5000
    });
  }

  return bins;
}

// Generate historical 30-day data points for charts with biological & acoustic accuracy
export function generateHistoricalTrendData(currentNodes = null, scenario = 'active') {
  const days = [];
  const now = new Date();

  // Evaluate current live warehouse node fleet (excluding gateway DEV-015)
  const monitored = (currentNodes && Array.isArray(currentNodes) && currentNodes.length > 0)
    ? currentNodes.filter(n => n.id !== "DEV-015")
    : [];
  const totalFleet = monitored.length > 0 ? monitored.length : 14;

  const liveAvgInfestation = monitored.length > 0
    ? Math.round(monitored.reduce((acc, n) => acc + (n.infestationLevel || 0), 0) / totalFleet)
    : 0;
  const liveCritical = monitored.filter(n => n.status === "Critical" || (n.infestationLevel >= 70)).length;
  const liveModerate = monitored.filter(n => n.status === "Moderate" || (n.infestationLevel >= 36 && n.infestationLevel < 70)).length;
  const liveSafe = Math.max(0, totalFleet - liveCritical - liveModerate);
  const livePestEvents = monitored.reduce((acc, n) => acc + (n.weevilCountEst || 0), 0);
  const liveTemp = monitored.length > 0
    ? Math.round((monitored.reduce((acc, n) => acc + (n.temperature || 30.0), 0) / totalFleet) * 10) / 10
    : 29.8;
  const liveHum = monitored.length > 0
    ? Math.round((monitored.reduce((acc, n) => acc + (n.humidity || 60.0), 0) / totalFleet) * 10) / 10
    : 61.2;
  const liveDb = monitored.length > 0
    ? Math.round(monitored.reduce((acc, n) => acc + (n.amplitudeDb || -74), 0) / totalFleet)
    : -74;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isoDate = d.toISOString().split('T')[0];
    const progress = (29 - i) / 29; // 0.0 at 29 days ago, 1.0 at day 30 (today)

    let dayInfest = 0;
    let criticalCount = 0;
    let moderateCount = 0;
    let safeCount = totalFleet;
    let detectedPestEvents = 0;
    let avgTemp = 28.5;
    let avgHum = 56.0;
    let acousticPowerDb = -78;
    let peakFreqHz = 140;
    let dominantSpecies = "Clean Milled Rice (Control Baseline)";

    if (scenario === 'balingbing') {
      // Balingbing et al. (2024) 30-day laboratory egg-to-adult incubation cycle
      // Sigmoidal growth curve from day 1 (inoculation 8%) to day 30 (outbreak 86%)
      const logistic = 1 / (1 + Math.exp(-9 * (progress - 0.55)));
      dayInfest = Math.min(95, Math.round(8 + 78 * logistic + Math.sin(i * 1.2) * 1.5));
      avgTemp = Math.round((28.5 + 5.5 * logistic + Math.sin(i) * 0.2) * 10) / 10;
      avgHum = Math.round((58.0 + 10.5 * logistic + Math.cos(i) * 0.3) * 10) / 10;
      acousticPowerDb = Math.round(-76 + (44 * logistic));
      peakFreqHz = dayInfest >= 36 ? Math.round(3840 + Math.sin(i) * 80) : Math.round(180 + i * 5);
      dominantSpecies = "Sitophilus oryzae (Bukbok)";
      detectedPestEvents = Math.round(dayInfest * 3.4 + Math.max(0, Math.sin(i) * 6));
      criticalCount = Math.min(totalFleet, Math.floor(dayInfest / 22));
      moderateCount = Math.min(totalFleet - criticalCount, Math.floor((dayInfest % 22) / 8) + (dayInfest >= 36 ? 3 : 0));
      moderateCount = Math.min(totalFleet - criticalCount, Math.max(0, moderateCount));
      safeCount = Math.max(0, totalFleet - criticalCount - moderateCount);
    } else if (scenario === 'post_fumigation') {
      // 30-day Post-Fumigation Recovery: Severe infestation days 1-12, fumigation on Day 13, rapid decay to clean safe grain
      if (progress < 0.4) {
        // Pre-fumigation high plateau
        dayInfest = Math.min(92, Math.round(82 + Math.sin(i) * 4));
        avgTemp = 34.2;
        avgHum = 67.5;
        acousticPowerDb = -32;
        peakFreqHz = 3840;
        dominantSpecies = "Sitophilus oryzae (Bukbok)";
        detectedPestEvents = Math.round(160 + Math.sin(i) * 12);
        criticalCount = 6;
        moderateCount = 5;
        safeCount = 3;
      } else {
        // Phosphine gas clearance decay
        const decayFactor = Math.exp(-6 * (progress - 0.4));
        dayInfest = Math.min(92, Math.max(3, Math.round(82 * decayFactor)));
        avgTemp = Math.round((28.0 + 6.2 * decayFactor) * 10) / 10;
        avgHum = Math.round((55.0 + 12.5 * decayFactor) * 10) / 10;
        acousticPowerDb = Math.round(-78 + 46 * decayFactor);
        peakFreqHz = dayInfest >= 36 ? 3840 : 130;
        dominantSpecies = dayInfest >= 36 ? "Sitophilus oryzae (Bukbok)" : "Clean Milled Rice (Sterilized)";
        detectedPestEvents = Math.round(160 * decayFactor);
        criticalCount = dayInfest >= 70 ? 4 : 0;
        moderateCount = dayInfest >= 36 ? 3 : (dayInfest >= 15 ? 1 : 0);
        safeCount = totalFleet - criticalCount - moderateCount;
      }
    } else if (scenario === 'monsoon_ingress') {
      // Prolonged high humidity > 70% RH causing mold & secondary pest boom
      const ingress = 1 / (1 + Math.exp(-8 * (progress - 0.4)));
      dayInfest = Math.min(96, Math.round(15 + 78 * ingress + Math.sin(i) * 2));
      avgTemp = Math.round((29.0 + 4.8 * ingress) * 10) / 10;
      avgHum = Math.round((60.0 + 14.5 * ingress) * 10) / 10;
      acousticPowerDb = Math.round(-72 + 42 * ingress);
      peakFreqHz = dayInfest >= 36 ? 3840 : 140;
      dominantSpecies = dayInfest >= 36 ? "Sitophilus oryzae (Rice Weevil / Bukbok)" : "Clean Milled Rice (Control Baseline)";
      detectedPestEvents = Math.round(dayInfest * 3.6);
      criticalCount = Math.min(totalFleet, Math.floor(dayInfest / 20));
      moderateCount = Math.min(totalFleet - criticalCount, Math.floor(dayInfest / 10));
      safeCount = Math.max(0, totalFleet - criticalCount - moderateCount);
    } else {
      // Default: 'active' scenario - accurately anchored to live warehouse telemetry!
      if (liveAvgInfestation === 0) {
        // Warehouse is clean/blank (0% infestation across nodes)
        dayInfest = 0;
        criticalCount = 0;
        moderateCount = 0;
        safeCount = totalFleet;
        detectedPestEvents = 0;
        avgTemp = Math.round((28.0 + Math.sin(i * 0.4) * 0.3) * 10) / 10;
        avgHum = Math.round((55.0 + Math.cos(i * 0.3) * 0.8) * 10) / 10;
        acousticPowerDb = -82;
        peakFreqHz = 120;
        dominantSpecies = "Clean Milled Rice (Control Baseline)";
      } else {
        // Live warehouse has active infestation telemetry
        if (i === 0) {
          // TODAY (Day 30): EXACT match with live telemetry!
          dayInfest = liveAvgInfestation;
          criticalCount = liveCritical;
          moderateCount = liveModerate;
          safeCount = liveSafe;
          detectedPestEvents = Math.max(livePestEvents, Math.round(liveAvgInfestation * 2.8));
          avgTemp = liveTemp;
          avgHum = liveHum;
          acousticPowerDb = liveDb;
          peakFreqHz = liveCritical > 0 || liveModerate > 0 ? 3840 : 150;
          dominantSpecies = liveCritical > 0 || liveModerate > 0 
            ? "Sitophilus oryzae (Rice Weevil / Bukbok)" 
            : "Clean Milled Rice (Control)";
        } else {
          // Preceding 29 days: biologically modeled logistic trajectory leading to today's level
          const logistic = 1 / (1 + Math.exp(-7 * (progress - 0.58)));
          const baseFrac = 0.08 + 0.92 * logistic;
          dayInfest = Math.min(99, Math.max(0, Math.round(liveAvgInfestation * baseFrac + Math.sin(i * 1.4) * 1.5)));
          
          if (dayInfest >= 70) {
            criticalCount = Math.max(1, Math.min(liveCritical, Math.round(liveCritical * ((dayInfest - 50) / Math.max(1, liveAvgInfestation - 50)))));
            moderateCount = Math.min(totalFleet - criticalCount, Math.max(1, liveModerate));
          } else if (dayInfest >= 36) {
            criticalCount = Math.min(liveCritical, Math.floor((dayInfest - 36) / 15));
            moderateCount = Math.min(totalFleet - criticalCount, Math.max(1, Math.round((dayInfest / 60) * Math.max(1, liveModerate))));
          } else {
            criticalCount = 0;
            moderateCount = Math.min(totalFleet, Math.round((dayInfest / 36) * Math.max(1, liveModerate)));
          }
          safeCount = Math.max(0, totalFleet - criticalCount - moderateCount);

          detectedPestEvents = Math.round(Math.max(0, dayInfest * 2.6 + Math.sin(i) * 2.5));
          avgTemp = Math.round((28.2 + (liveTemp - 28.2) * logistic + Math.sin(i) * 0.15) * 10) / 10;
          avgHum = Math.round((56.0 + (liveHum - 56.0) * logistic + Math.cos(i) * 0.25) * 10) / 10;
          acousticPowerDb = Math.round(-78 + (liveDb - (-78)) * logistic);
          peakFreqHz = dayInfest >= 36 ? Math.round(3840 + Math.sin(i) * 50) : 140;
          dominantSpecies = dayInfest >= 36 
            ? "Sitophilus oryzae (Rice Weevil / Bukbok)" 
            : "Clean Milled Rice (Control)";
        }
      }
    }

    // Determine risk category and prescriptive action
    let riskCategory = "Safe";
    let recommendedAction = "Routine passive bio-acoustic surveillance. Maintain warehouse ventilation.";

    if (dayInfest >= 70) {
      riskCategory = "Critical";
      recommendedAction = "Immediate Phosphine (AlP) fumigation (1.5-2.0 g/m³); quarantine affected bins.";
    } else if (dayInfest >= 36) {
      riskCategory = "Moderate";
      recommendedAction = "Initiate forced-air aeration fans; schedule manual probe sample in 48h.";
    }

    days.push({
      date: dateStr,
      isoDate,
      dayIndex: 30 - i,
      avgInfestationPct: dayInfest,
      criticalNodes: criticalCount,
      moderateNodes: moderateCount,
      safeNodes: safeCount,
      detectedPestEvents: Math.max(0, detectedPestEvents),
      avgTemp,
      avgHumidity: avgHum,
      avgAcousticPowerDb: acousticPowerDb,
      peakFreqHz,
      dominantSpecies,
      riskCategory,
      recommendedAction,
      grainMoistureEst: Math.round((11.5 + (avgHum - 50) * 0.18) * 10) / 10
    });
  }

  return days;
}
