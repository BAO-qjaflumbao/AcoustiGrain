import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  Cpu, 
  BatteryCharging, 
  Wifi, 
  Clock, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Usb,
  Radio,
  RadioTower
} from 'lucide-react';

export default function DeviceFleetPanel() {
  const { activeNodes, setSelectedNodeId, setActiveTab, changeNodeZone, isAdmin, connectPhysicalHardware, isHardwareConnected, triggerOutbreak } = useTelemetry();

  const availableZones = [
    'Bin A1', 'Bin B1', 'Bin C1', 'Bin D1',
    'Bin A2', 'Bin B2', 'Bin C2', 'Bin D2',
    'Bin A3', 'Bin B3', 'Bin C3', 'Bin D3'
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper p-5 rounded-xl border border-ink-100 shadow-card">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-grain-500" />
            <span>Warehouse Sensor &amp; Device Network</span>
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Monitors battery levels, wireless signal, and designated Rice Bins for active Seeed Studio XIAO ESP32-S3 sensor probes.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 bg-husk rounded-md border border-ink-100 text-ink-800 font-medium font-mono">
            Active Sensors: <span className="text-grain-600 font-bold">{activeNodes.length}</span>
          </div>
        </div>
      </div>

      {/* Fleet Table or Empty State */}
      {activeNodes.length === 0 ? (
        <div className="p-12 text-center space-y-4 bg-paper border border-ink-100 rounded-xl shadow-card">
          <div className="p-4 bg-husk rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-ink-100">
            <RadioTower className="w-8 h-8 text-grain-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900 text-base">No Sensors Currently Connected</h3>
            <p className="text-xs text-ink-400 max-w-md mx-auto mt-1">
              Sensors will automatically pop up here when connected via USB COM4 hardware, Firebase cloud sync, or when telemetry data is received.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={connectPhysicalHardware}
                className="flex items-center space-x-1.5 px-4 py-2 bg-grain-500 hover:bg-grain-600 text-white text-xs font-bold rounded-md shadow-card transition cursor-pointer"
              >
                <Usb className="w-4 h-4" />
                <span>Connect Hardware Sensor (COM4)</span>
              </button>
              <button
                onClick={() => triggerOutbreak('Bin B1')}
                className="px-4 py-2 bg-husk hover:bg-paper text-ink-800 text-xs font-bold rounded-md border border-ink-100 shadow-card transition cursor-pointer"
              >
                Test Sensor Signal (Bin B1)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-paper border border-ink-100 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-husk text-ink-400 font-mono uppercase tracking-widest text-[11px] border-b border-ink-100">
                <tr>
                  <th className="py-3.5 px-4">Sensor ID &amp; Name</th>
                  <th className="py-3.5 px-4">Designated Storage Bin</th>
                  <th className="py-3.5 px-4">Insertion Depth</th>
                  <th className="py-3.5 px-4">Battery Health</th>
                  <th className="py-3.5 px-4">Wireless Signal</th>
                  <th className="py-3.5 px-4">Pest Threat Level</th>
                  <th className="py-3.5 px-4">Power Status</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-100">
                {activeNodes.map(node => (
                  <tr 
                    key={node.id}
                    className="hover:bg-husk/50 transition text-ink-800"
                  >
                    {/* ID & Name */}
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-900">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          node.status === 'Critical' ? 'bg-critical pulse-dot' :
                          node.status === 'Moderate' ? 'bg-moderate' : 'bg-safe'
                        }`} />
                        <div>
                          <div>{node.id} {node.id === 'DEV-003' && isHardwareConnected && <span className="text-[10px] text-grain-600 font-bold">(COM4 USB)</span>}</div>
                          <div className="text-[10px] text-ink-400 font-sans font-normal">{node.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Designated Bin Dropdown / Reassign */}
                    <td className="py-3.5 px-4 font-medium">
                      {isAdmin ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-grain-500 shrink-0" />
                          <select
                            value={node.zone}
                            onChange={(e) => changeNodeZone(node.id, e.target.value)}
                            className="bg-husk border border-ink-100 rounded px-2 py-1 text-xs font-bold text-ink-900 focus:border-grain-500 outline-none transition cursor-pointer"
                            title="Reassign this sensor to a different storage bin"
                          >
                            {availableZones.map(z => (
                              <option key={z} value={z}>{z}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="font-bold text-ink-900">{node.zone}</span>
                      )}
                    </td>

                    {/* Sack Depth */}
                    <td className="py-3.5 px-4 text-ink-600 font-mono">
                      {node.depthCm > 0 ? `${node.depthCm} cm deep` : 'Gateway Base'}
                    </td>

                    {/* Battery */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-ink-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              node.battery > 50 ? 'bg-safe' : node.battery > 20 ? 'bg-moderate' : 'bg-critical'
                            }`}
                            style={{ width: `${node.battery}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs font-mono">{node.battery}%</span>
                      </div>
                    </td>

                    {/* LoRa Signal */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1">
                        <Wifi className="w-3.5 h-3.5 text-safe" />
                        <span>{node.rssi} dBm</span>
                        <span className="text-[10px] text-ink-400">({node.snr} dB)</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        node.status === 'Critical' ? 'bg-critical/10 text-critical border border-critical/30' :
                        node.status === 'Moderate' ? 'bg-moderate/10 text-moderate border border-moderate/30' :
                        'bg-safe/10 text-safe border border-safe/30'
                      }`}>
                        {node.status === 'Critical' ? 'Action Needed' : node.status} ({node.infestationLevel}%)
                      </span>
                    </td>

                    {/* Power Mode */}
                    <td className="py-3.5 px-4 text-[11px] text-ink-400 font-mono">
                      {node.powerMode}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          setActiveTab('fft');
                        }}
                        className="px-2.5 py-1 bg-grain-50 hover:bg-grain-100 text-grain-700 hover:text-grain-900 rounded border border-grain-200 transition text-[11px] font-semibold cursor-pointer shadow-card"
                      >
                        Check Audio
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
