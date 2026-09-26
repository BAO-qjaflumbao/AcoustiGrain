import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { BALINGBING_DATASET_PROFILES, generateFFTSpectrum } from '../services/simulatorService';
import { 
  AudioWaveform, 
  Volume2, 
  Play, 
  Square,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Database,
  Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

export default function FFTSignalSimulator() {
  const { selectedNode, nodes, setSelectedNodeId } = useTelemetry();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMode, setAudioMode] = useState('weevil'); // 'weevil' or 'ambient'
  const [datasetMode, setDatasetMode] = useState('live'); // 'live', 'sitophilus', 'rhyzopertha', 'tribolium', 'clean_control'

  const activeSpectrum = generateFFTSpectrum(selectedNode, datasetMode);
  const isBalingbingDataset = datasetMode !== 'live';
  const balingbingProfile = BALINGBING_DATASET_PROFILES[datasetMode];

  // Web Audio API Sound Synthesizer for demoing insect chewing clicks vs warehouse noise
  const toggleAudioSynthesis = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();

      if (audioMode === 'weevil') {
        let clickCount = 0;
        const interval = setInterval(() => {
          if (clickCount > 15) {
            clearInterval(interval);
            setIsPlayingAudio(false);
            return;
          }

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(3800 + Math.random() * 400, ctx.currentTime);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.05);

          clickCount++;
        }, 180);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
          setIsPlayingAudio(false);
        }, 3000);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
      setIsPlayingAudio(false);
    }
  };

  const currentMaxDb = isBalingbingDataset ? balingbingProfile.maxDbFS : selectedNode.amplitudeDb;
  const isThresholdBreached = currentMaxDb > -60;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-paper p-5 rounded-xl border border-ink-100 shadow-card">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
            <AudioWaveform className="w-5 h-5 text-grain-500" />
            <span>Pest Audio &amp; Chewing Sound Scanner</span>
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Analyzes tiny feeding sounds inside 50kg rice sacks to isolate <em>Bukbok (Weevils)</em> from normal warehouse noise.
          </p>
        </div>

        {/* Audio Synthesis Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-husk p-1 rounded-md border border-ink-100 text-xs">
            <button
              onClick={() => setAudioMode('weevil')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                audioMode === 'weevil' ? 'bg-grain-500 text-white font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Bukbok Chewing Sound
            </button>
            <button
              onClick={() => setAudioMode('ambient')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                audioMode === 'ambient' ? 'bg-grain-500 text-white font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Background Noise
            </button>
          </div>

          <button
            onClick={toggleAudioSynthesis}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition shadow-card cursor-pointer ${
              isPlayingAudio 
                ? 'bg-critical text-white animate-pulse' 
                : 'bg-grain-500 hover:bg-grain-600 text-white'
            }`}
          >
            {isPlayingAudio ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingAudio ? 'Stop Sound' : 'Play Sound Sample'}</span>
          </button>
        </div>
      </div>

      {/* Dataset Source Selector Bar */}
      <div className="bg-paper p-4 rounded-xl border border-ink-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-card">
        <div className="flex items-center space-x-2 text-xs font-bold text-ink-900">
          <Database className="w-4 h-4 text-grain-500" />
          <span>Select Audio Source:</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setDatasetMode('live')}
            className={`px-3 py-1.5 rounded-md font-bold border transition cursor-pointer ${
              datasetMode === 'live'
                ? 'bg-grain-500 text-white border-grain-500 shadow-card'
                : 'bg-husk text-ink-700 border-ink-100 hover:bg-paper'
            }`}
          >
            📡 Live Warehouse Sensor
          </button>

          <button
            onClick={() => setDatasetMode('sitophilus')}
            className={`px-3 py-1.5 rounded-md font-bold border transition cursor-pointer ${
              datasetMode === 'sitophilus'
                ? 'bg-grain-500 text-white border-grain-500 shadow-card'
                : 'bg-husk text-ink-700 border-ink-100 hover:bg-paper'
            }`}
          >
            🌾 Rice Weevil (Bukbok) Sample
          </button>

          <button
            onClick={() => setDatasetMode('rhyzopertha')}
            className={`px-3 py-1.5 rounded-md font-bold border transition cursor-pointer ${
              datasetMode === 'rhyzopertha'
                ? 'bg-grain-500 text-white border-grain-500 shadow-card'
                : 'bg-husk text-ink-700 border-ink-100 hover:bg-paper'
            }`}
          >
            🐛 Grain Beetle Sample
          </button>

          <button
            onClick={() => setDatasetMode('clean_control')}
            className={`px-3 py-1.5 rounded-md font-bold border transition cursor-pointer ${
              datasetMode === 'clean_control'
                ? 'bg-grain-500 text-white border-grain-500 shadow-card'
                : 'bg-husk text-ink-700 border-ink-100 hover:bg-paper'
            }`}
          >
            ✨ Clean Rice (No Pests)
          </button>
        </div>
      </div>

      {/* Main FFT Spectrum Graph & Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FFT Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-paper border border-ink-100 rounded-xl p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <div>
              <span className="font-mono text-xs font-bold text-grain-600">
                {isBalingbingDataset ? 'Balingbing et al. (2024) Verified Insect Dataset' : `${selectedNode.id} • ${selectedNode.zone}`}
              </span>
              <h3 className="font-display text-base font-bold text-ink-900">Sound Frequency Chart (0 – 8,000 Hz)</h3>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-moderate font-semibold bg-moderate/10 px-2.5 py-1 rounded-md border border-moderate/20 font-mono">
                <span className="w-2 h-2 rounded-full bg-moderate" />
                <span>Bukbok Band: 3.0 – 5.0 kHz</span>
              </span>
            </div>
          </div>

          {/* Recharts Area Graph */}
          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSpectrum} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="spectrumGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isThresholdBreached ? "#C0392B" : "#1E8E5A"} stopOpacity={0.7}/>
                    <stop offset="95%" stopColor={isThresholdBreached ? "#C0392B" : "#1E8E5A"} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="freqLabel" stroke="#736A5E" tick={{ fontSize: 11 }} />
                <YAxis domain={[-90, -10]} stroke="#736A5E" tick={{ fontSize: 11 }} unit="dB" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E7E4DE', borderRadius: '8px', fontSize: '12px', color: '#1A1712' }} 
                  formatter={(val) => [`${val} dBFS`, 'Sound Energy']}
                  labelFormatter={(label) => `Frequency: ${label}Hz`}
                />
                
                {/* Dynamic Noise Floor Threshold (-60 dBFS) */}
                <ReferenceLine y={-60} stroke="#C0392B" strokeDasharray="4 4" label={{ value: 'Pest Threshold Line', fill: '#C0392B', fontSize: 11 }} />
                
                <Area 
                  type="monotone" 
                  dataKey="powerDb" 
                  stroke={isThresholdBreached ? "#C0392B" : "#1E8E5A"} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#spectrumGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Inspector Simple Explanation */}
          <div className="p-3.5 bg-husk rounded-lg border border-ink-100 text-xs text-ink-600 space-y-1">
            <div className="font-bold text-ink-900 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-grain-500" />
              <span>Inspector Guide: How to read this chart</span>
            </div>
            <p className="text-[11px] text-ink-700 leading-relaxed">
              When insects chew inside rice grains, they produce sharp sound spikes between <strong>3,000 Hz and 5,000 Hz</strong>. If the graph rises above the red dashed line, pests are actively feeding in the stack.
            </p>
          </div>
        </div>

        {/* Hardware & Sensor Info Sidecard */}
        <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-5 shadow-card">
          <h3 className="font-display text-base font-bold text-ink-900 border-b border-ink-100 pb-3">
            Sensor Info &amp; Settings
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-husk p-3 rounded-lg border border-ink-100 flex justify-between items-center">
              <span className="text-ink-400">Sensor Device:</span>
              <span className="font-bold text-safe">XIAO ESP32-S3</span>
            </div>

            <div className="bg-husk p-3 rounded-lg border border-ink-100 flex justify-between items-center">
              <span className="text-ink-400">Audio Microphone:</span>
              <span className="font-bold text-ink-800">INMP441 MEMS Probe</span>
            </div>

            <div className="bg-husk p-3 rounded-lg border border-ink-100 flex justify-between items-center">
              <span className="text-ink-400">Target Pest Sound:</span>
              <span className="font-bold text-moderate">3,000 – 5,000 Hz</span>
            </div>

            <div className="bg-husk p-3 rounded-lg border border-ink-100 flex justify-between items-center">
              <span className="text-ink-400">Danger Threshold:</span>
              <span className="font-bold text-critical">-60 dBFS</span>
            </div>
          </div>

          {/* Selected Node Picker */}
          <div>
            <label className="font-mono text-[11px] font-semibold text-ink-400 uppercase tracking-wider block mb-2">
              Select Sensor to Inspect:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {nodes.filter(n => n.id !== 'DEV-015').slice(0, 6).map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    setDatasetMode('live');
                    setSelectedNodeId(n.id);
                  }}
                  className={`p-2 rounded-md text-xs font-mono border text-left transition cursor-pointer ${
                    n.id === selectedNode.id && datasetMode === 'live'
                      ? 'bg-grain-500 text-white border-grain-500 font-bold shadow-card' 
                      : 'bg-husk border-ink-100 text-ink-700 hover:bg-paper'
                  }`}
                >
                  <div className="font-bold">{n.id}</div>
                  <div className="text-[10px] text-ink-400 font-sans">{n.zone}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
