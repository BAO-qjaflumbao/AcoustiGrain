// Simulator & Dataset Service for AcoustiGrain IoT Telemetry & Bio-Acoustic Signal Processing
// Includes Balingbing et al. (2024) Ground-Truth Research Dataset Profiles

// Completely dynamic live sensor node store — pops up ONLY when physical sensors connect / transmit telemetry
export const INITIAL_NODES = [];

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
