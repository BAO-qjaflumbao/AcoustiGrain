import React, { useState } from 'react';
import { DEFAULT_FIREBASE_CONFIG, getSavedFirebaseConfig, saveFirebaseConfig } from '../services/firebaseService';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Shield,
  Key,
  Server
} from 'lucide-react';

export default function FirebaseModal({ isOpen, onClose }) {
  const savedConfig = getSavedFirebaseConfig() || DEFAULT_FIREBASE_CONFIG;
  const [config, setConfig] = useState(savedConfig);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveFirebaseConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const restApiUrl = `${config.databaseURL}/nodes/DEV-003.json`;

  const copyRestUrl = () => {
    navigator.clipboard.writeText(restApiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-grain-500 selection:text-white">
      <div className="bg-paper border border-ink-100 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-husk px-6 py-4 border-b border-ink-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-grain-100 text-grain-700 rounded-xl border border-grain-200">
              <Database className="w-5 h-5 text-grain-600" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">Firebase Realtime Database Cloud Sync</h3>
              <p className="text-xs text-ink-400">Connect AcoustiGrain Web Dashboard &amp; ESP32 hardware to Firebase Cloud.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-paper transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          {saveSuccess && (
            <div className="p-3 bg-safe/10 text-safe border border-safe/20 rounded-xl flex items-center space-x-2 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Firebase credentials saved! Realtime sync active.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-800 font-bold mb-1.5 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-grain-500" />
                <span>Firebase API Key:</span>
              </label>
              <input
                type="text"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-husk border border-ink-100 rounded-md px-3 py-2 text-ink-900 font-mono text-xs focus:border-grain-500 outline-none"
                placeholder="AIzaSy..."
              />
            </div>

            <div>
              <label className="block text-ink-800 font-bold mb-1.5 flex items-center space-x-1">
                <Server className="w-3.5 h-3.5 text-safe" />
                <span>Realtime Database URL:</span>
              </label>
              <input
                type="text"
                value={config.databaseURL}
                onChange={(e) => setConfig({ ...config, databaseURL: e.target.value })}
                className="w-full bg-husk border border-ink-100 rounded-md px-3 py-2 text-ink-900 font-mono text-xs focus:border-grain-500 outline-none"
                placeholder="https://your-app-default-rtdb.firebaseio.com"
              />
            </div>

            <div>
              <label className="block text-ink-800 font-bold mb-1.5">Project ID:</label>
              <input
                type="text"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="w-full bg-husk border border-ink-100 rounded-md px-3 py-2 text-ink-900 font-mono text-xs focus:border-grain-500 outline-none"
                placeholder="acoustigrain-nfa"
              />
            </div>

            <div>
              <label className="block text-ink-800 font-bold mb-1.5">Auth Domain:</label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                className="w-full bg-husk border border-ink-100 rounded-md px-3 py-2 text-ink-900 font-mono text-xs focus:border-grain-500 outline-none"
                placeholder="acoustigrain-nfa.firebaseapp.com"
              />
            </div>
          </div>

          {/* Hardware REST API Endpoint Box */}
          <div className="bg-husk p-4 rounded-xl border border-ink-100 space-y-2">
            <div className="flex items-center justify-between text-ink-900 font-bold">
              <span>Hardware / Gateway Direct HTTP REST Endpoint:</span>
              <button
                type="button"
                onClick={copyRestUrl}
                className="flex items-center space-x-1 text-grain-600 hover:text-grain-800 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-safe" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied URL' : 'Copy Endpoint'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-grain-700 bg-paper p-2.5 rounded border border-ink-100 break-all font-semibold">
              PUT {restApiUrl}
            </div>
            <p className="text-[11px] text-ink-400">
              ESP32-S3 or LoRa Gateway can send telemetry JSON directly to this URL using HTTP PUT/POST!
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-husk hover:bg-paper text-ink-700 rounded-md font-bold border border-ink-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-grain-500 hover:bg-grain-600 text-white rounded-md font-bold shadow-card transition cursor-pointer"
            >
              Save &amp; Activate Firebase Sync
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
