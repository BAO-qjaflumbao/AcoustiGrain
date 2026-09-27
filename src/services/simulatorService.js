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

// Generate historical 30-day data points for charts
export function generateHistoricalTrendData() {
  const days = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const baseRisk = 12 + Math.sin(i / 5) * 8 + (29 - i) * 1.4;
    const criticalCount = Math.floor(baseRisk / 18);
    const moderateCount = Math.floor(baseRisk / 10);
    const safeCount = Math.max(0, 14 - criticalCount - moderateCount);
    
    days.push({
      date: dateStr,
      avgInfestationPct: Math.min(95, Math.round(baseRisk)),
      criticalNodes: criticalCount,
      moderateNodes: moderateCount,
      safeNodes: safeCount,
      avgTemp: Math.round((28 + (29 - i) * 0.2) * 10) / 10,
      detectedPestEvents: Math.round(baseRisk * 3.2)
    });
  }
  
  return days;
}
