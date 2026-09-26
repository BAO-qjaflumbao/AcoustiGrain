import React, { useState, useEffect, useRef } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  Box, 
  Layers, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  Cpu, 
  AlertTriangle,
  Flame,
  Thermometer,
  Droplets,
  Volume2,
  Maximize2,
  RefreshCw,
  MapPin,
  Move
} from 'lucide-react';

export default function WarehouseHeatmap3D() {
  const { nodes, selectedNode, setSelectedNodeId, metrics } = useTelemetry();
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState('isometric'); // 'isometric', 'topdown'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [rotationAngle, setRotationAngle] = useState(0); // 0, 90, 180, 270 degrees
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredZone, setHoveredZone] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, text: '' });

  const stacksList = [
    { id: 'stack-a1', zone: 'Bin A1', gx: -4, gy: -3 },
    { id: 'stack-b1', zone: 'Bin B1', gx: -1.5, gy: -3 },
    { id: 'stack-c1', zone: 'Bin C1', gx: 1, gy: -3 },
    { id: 'stack-d1', zone: 'Bin D1', gx: 3.5, gy: -3 },

    { id: 'stack-a2', zone: 'Bin A2', gx: -4, gy: 0 },
    { id: 'stack-b2', zone: 'Bin B2', gx: -1.5, gy: 0 },
    { id: 'stack-c2', zone: 'Bin C2', gx: 1, gy: 0 },
    { id: 'stack-d2', zone: 'Bin D2', gx: 3.5, gy: 0 },

    { id: 'stack-a3', zone: 'Bin A3', gx: -4, gy: 3 },
    { id: 'stack-b3', zone: 'Bin B3', gx: -1.5, gy: 3 },
    { id: 'stack-c3', zone: 'Bin C3', gx: 1, gy: 3 },
    { id: 'stack-d3', zone: 'Bin D3', gx: 3.5, gy: 3 },
  ];

  // Canvas-based interactive 3D / Isometric render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background floor (warm husk color)
      ctx.fillStyle = '#F7F5F0';
      ctx.fillRect(0, 0, width, height);

      // Floor grid lines
      ctx.strokeStyle = '#E7E4DE';
      ctx.lineWidth = 1;
      const originX = width / 2;
      const originY = height / 3.5;

      if (viewMode === 'isometric') {
        // Draw Isometric Warehouse Floor Grid
        for (let x = -6; x <= 6; x++) {
          ctx.beginPath();
          const p1 = isoToScreen(x, -6, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          const p2 = isoToScreen(x, 6, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        for (let y = -6; y <= 6; y++) {
          ctx.beginPath();
          const p1 = isoToScreen(-6, y, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          const p2 = isoToScreen(6, y, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Render Stack Blocks (Kamadas) in 3D Isometric View
        stacksList.forEach(stk => {
          const stkNodes = nodes.filter(n => n.zone === stk.zone);
          const maxStatus = stkNodes.some(n => n.status === 'Critical') ? 'Critical' :
                          stkNodes.some(n => n.status === 'Moderate') ? 'Moderate' : 'Safe';
          const isSelectedZone = selectedNode.zone === stk.zone;
          const isHovered = hoveredZone === stk.zone;

          const colorMap = {
            Critical: { top: '#C0392B', left: '#A52A1C', right: '#8E2115' },
            Moderate: { top: '#C97A1F', left: '#AF6716', right: '#93530E' },
            Safe: { top: '#1E8E5A', left: '#177448', right: '#125B37' }
          };
          let colors = colorMap[maxStatus];

          if (isSelectedZone || isHovered) {
            colors = {
              top: isSelectedZone ? '#AC7F35' : colors.top,
              left: isSelectedZone ? '#8C6529' : colors.left,
              right: isSelectedZone ? '#6B4C1F' : colors.right
            };
          }

          drawIsoBlock(ctx, stk.gx, stk.gy, 0, 1.8, 1.8, 2.2, colors, originX, originY, zoomLevel, stk.zone, isSelectedZone || isHovered, panOffset.x, panOffset.y, rotationAngle);

          // Draw wedge probes inside stack layers
          stkNodes.forEach(node => {
            const probeZ = node.depthCm === 15 ? 1.8 : node.depthCm === 45 ? 1.1 : 0.4;
            const probePos = isoToScreen(stk.gx + 0.9, stk.gy + 0.9, probeZ, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);

            ctx.fillStyle = node.id === selectedNode.id ? '#FBF7ED' : '#FFFFFF';
            ctx.beginPath();
            ctx.arc(probePos.x, probePos.y, (node.id === selectedNode.id ? 7 : 5) * zoomLevel, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1A1712';
            ctx.lineWidth = node.id === selectedNode.id ? 2.5 : 1.5;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#1A1712';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillText(node.id, probePos.x + 8, probePos.y + 3);
          });
        });

      } else {
        // Top Down 2D Floorplan Mode
        stacks2D(ctx, width, height, nodes, selectedNode, hoveredZone, panOffset.x, panOffset.y, zoomLevel);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [viewMode, zoomLevel, panOffset, rotationAngle, nodes, selectedNode, hoveredZone]);

  // Handle Drag to Pan & Hover
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Hover hit test
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 3.5;

    let foundZone = null;

    if (viewMode === 'isometric') {
      for (let stk of stacksList) {
        const center = isoToScreen(stk.gx + 0.9, stk.gy + 0.9, 1.1, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
        const dist = Math.hypot(mouseX - center.x, mouseY - center.y);
        if (dist < 42 * zoomLevel) {
          foundZone = stk.zone;
          setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 30,
            visible: true,
            text: `${stk.zone} (Click to select)`
          });
          break;
        }
      }
    } else {
      const cols = 4;
      const rows = 3;
      const marginX = 80 + panOffset.x;
      const marginY = 60 + panOffset.y;
      const blockW = ((width - 160) / cols) * zoomLevel;
      const blockH = ((height - 120) / rows) * zoomLevel;

      const zones = [
        ['Bin A1', 'Bin B1', 'Bin C1', 'Bin D1'],
        ['Bin A2', 'Bin B2', 'Bin C2', 'Bin D2'],
        ['Bin A3', 'Bin B3', 'Bin C3', 'Bin D3']
      ];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = marginX + c * (blockW + 30 * zoomLevel);
          const y = marginY + r * (blockH + 30 * zoomLevel);
          if (mouseX >= x && mouseX <= x + blockW && mouseY >= y && mouseY <= y + blockH) {
            foundZone = zones[r][c];
            setTooltipPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top - 30,
              visible: true,
              text: `${foundZone} (Click to select)`
            });
            break;
          }
        }
      }
    }

    setHoveredZone(foundZone);
    if (!foundZone) {
      setTooltipPos(prev => ({ ...prev, visible: false }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e) => {
    if (!hoveredZone) return;
    const targetNode = nodes.find(n => n.zone === hoveredZone) || nodes[0];
    if (targetNode) {
      setSelectedNodeId(targetNode.id);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
    } else {
      setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    }
  };

  const handleResetView = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    setRotationAngle(0);
    setViewMode('isometric');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white">
      {/* Top Header & View Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-paper p-4 rounded-xl border border-ink-100 shadow-card">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
            <Box className="w-5 h-5 text-grain-500" />
            <span>Interactive 3D Rice Stack Map</span>
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Click &amp; drag anywhere on the 3D map to pan/move. Click any stack to inspect readings.
          </p>
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-husk p-1 rounded-md border border-ink-100 text-xs">
            <button
              onClick={() => setViewMode('isometric')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                viewMode === 'isometric' ? 'bg-grain-500 text-white font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode('topdown')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                viewMode === 'topdown' ? 'bg-grain-500 text-white font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Flat 2D View
            </button>
          </div>

          <div className="flex items-center bg-husk p-1 rounded-md border border-ink-100 text-xs">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))} 
              className="p-1.5 text-ink-600 hover:text-ink-900 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-ink-400 font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))} 
              className="p-1.5 text-ink-600 hover:text-ink-900 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setRotationAngle(prev => (prev + 90) % 360)} 
              className="p-1.5 text-ink-600 hover:text-ink-900 border-l border-ink-100 ml-1 cursor-pointer flex items-center space-x-1"
              title="Rotate 3D Floor 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={handleResetView} 
              className="p-1.5 text-ink-600 hover:text-ink-900 border-l border-ink-100 ml-1 cursor-pointer"
              title="Reset View Position"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas + Side Detail Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Viewport Canvas (2 Cols) */}
        <div className="lg:col-span-2 bg-paper border border-ink-100 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[460px] shadow-card">
          <canvas 
            ref={canvasRef} 
            width={720} 
            height={440} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            onMouseLeave={() => { setIsDragging(false); setHoveredZone(null); setTooltipPos(prev => ({ ...prev, visible: false })); }}
            className={`w-full h-full rounded-lg border border-ink-100 ${isDragging ? 'cursor-grabbing' : hoveredZone ? 'cursor-pointer' : 'cursor-grab'}`}
          />

          {/* Canvas Hover Floating Tooltip */}
          {tooltipPos.visible && (
            <div 
              className="absolute z-20 bg-ink-900 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
              style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
            >
              {tooltipPos.text}
            </div>
          )}

          {/* Legend Overlay & Movement Guide */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-husk p-3 rounded-lg border border-ink-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-safe" />
                <span className="text-ink-800 font-medium">Safe</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-moderate" />
                <span className="text-ink-800 font-medium">Warning</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-critical pulse-dot" />
                <span className="text-critical font-bold">Action Needed</span>
              </div>
            </div>

            <span className="text-[11px] font-mono text-grain-700 font-semibold flex items-center space-x-1">
              <Move className="w-3.5 h-3.5 text-grain-500" />
              <span>Click &amp; Drag to Move Floor &bull; Scroll to Zoom</span>
            </span>
          </div>
        </div>

        {/* Selected Sensor Node Detail Sidecard */}
        <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-5 shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <div>
              <span className="font-mono text-xs text-grain-600 font-bold uppercase tracking-wider">
                {selectedNode.id} &bull; {selectedNode.zone}
              </span>
              <h3 className="font-display text-base font-bold text-ink-900">{selectedNode.name}</h3>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              selectedNode.status === 'Critical' ? 'bg-critical/10 text-critical border border-critical/30' :
              selectedNode.status === 'Moderate' ? 'bg-moderate/10 text-moderate border border-moderate/30' :
              'bg-safe/10 text-safe border border-safe/30'
            }`}>
              {selectedNode.status === 'Critical' ? 'Action Needed' : selectedNode.status}
            </span>
          </div>

          {/* Core Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-husk p-3 rounded-lg border border-ink-100">
              <div className="flex items-center space-x-1.5 text-ink-400 text-xs mb-1">
                <Flame className="w-3.5 h-3.5 text-moderate" />
                <span>Pest Threat Score</span>
              </div>
              <div className="font-display text-xl font-bold text-ink-900">
                {selectedNode.infestationLevel}%
              </div>
              <div className="w-full bg-ink-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    selectedNode.infestationLevel > 70 ? 'bg-critical' :
                    selectedNode.infestationLevel > 40 ? 'bg-moderate' : 'bg-safe'
                  }`}
                  style={{ width: `${selectedNode.infestationLevel}%` }}
                />
              </div>
            </div>

            <div className="bg-husk p-3 rounded-lg border border-ink-100">
              <div className="flex items-center space-x-1.5 text-ink-400 text-xs mb-1">
                <Volume2 className="w-3.5 h-3.5 text-safe" />
                <span>Sound Frequency</span>
              </div>
              <div className="font-display text-xl font-bold text-safe">
                {selectedNode.peakFreqHz > 1000 ? `${(selectedNode.peakFreqHz/1000).toFixed(1)} kHz` : `${selectedNode.peakFreqHz} Hz`}
              </div>
              <div className="text-[10px] text-ink-400 mt-1 font-mono">
                {selectedNode.peakFreqHz >= 3000 ? 'Bukbok Chewing' : 'Normal Ambient'}
              </div>
            </div>
          </div>

          {/* Environmental & Bag Depth Info in Plain English */}
          <div className="space-y-2 text-xs bg-husk p-3.5 rounded-lg border border-ink-100 font-mono">
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-400">Sensor Insertion Depth:</span>
              <span className="text-ink-800 font-semibold">{selectedNode.depthCm} cm deep in stack</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-400">Temp &amp; Air Moisture:</span>
              <span className="text-ink-800 font-semibold">{selectedNode.temperature}&deg;C &bull; {selectedNode.humidity}% RH</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-400">Wireless Signal:</span>
              <span className="text-ink-800 font-semibold">{selectedNode.rssi} dBm (Good)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-400">Est. Insects / Sack:</span>
              <span className={`font-bold ${selectedNode.weevilCountEst > 20 ? 'text-critical' : 'text-ink-800'}`}>
                ~{selectedNode.weevilCountEst} active / sack
              </span>
            </div>
          </div>

          {/* Select Other Nodes List */}
          <div>
            <label className="font-mono text-[11px] font-semibold text-ink-400 uppercase tracking-wider block mb-2">
              Quick Select Bin Stack:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {nodes.filter(n => n.id !== 'DEV-015').slice(0, 9).map(n => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold border text-center transition cursor-pointer ${
                    n.id === selectedNode.id 
                      ? 'bg-grain-500 text-white border-grain-500 shadow-card' 
                      : n.status === 'Critical'
                      ? 'bg-critical/10 text-critical border-critical/30 hover:bg-critical/20'
                      : 'bg-husk text-ink-800 border-ink-100 hover:bg-paper'
                  }`}
                >
                  {n.zone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Isometric Projection Math Helper
function isoToScreen(gx, gy, gz, originX, originY, scale, panX = 0, panY = 0, rotDeg = 0) {
  let rx = gx;
  let ry = gy;
  if (rotDeg === 90) {
    rx = -gy; ry = gx;
  } else if (rotDeg === 180) {
    rx = -gx; ry = -gy;
  } else if (rotDeg === 270) {
    rx = gy; ry = -gx;
  }

  const tileW = 32 * scale;
  const tileH = 16 * scale;
  const screenX = originX + panX + (rx - ry) * tileW;
  const screenY = originY + panY + (rx + ry) * tileH - gz * (24 * scale);
  return { x: screenX, y: screenY };
}

// Draw 3D Isometric Block
function drawIsoBlock(ctx, gx, gy, gz, w, h, depthZ, colors, originX, originY, scale, label, isHighlighted, panX = 0, panY = 0, rotDeg = 0) {
  const p1 = isoToScreen(gx, gy, gz + depthZ, originX, originY, scale, panX, panY, rotDeg);
  const p2 = isoToScreen(gx + w, gy, gz + depthZ, originX, originY, scale, panX, panY, rotDeg);
  const p3 = isoToScreen(gx + w, gy + h, gz + depthZ, originX, originY, scale, panX, panY, rotDeg);
  const p4 = isoToScreen(gx, gy + h, gz + depthZ, originX, originY, scale, panX, panY, rotDeg);

  const b1 = isoToScreen(gx, gy, gz, originX, originY, scale, panX, panY, rotDeg);
  const b2 = isoToScreen(gx + w, gy, gz, originX, originY, scale, panX, panY, rotDeg);
  const b3 = isoToScreen(gx + w, gy + h, gz, originX, originY, scale, panX, panY, rotDeg);
  const b4 = isoToScreen(gx, gy + h, gz, originX, originY, scale, panX, panY, rotDeg);

  // Top Face
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = isHighlighted ? '#AC7F35' : '#FFFFFF';
  ctx.lineWidth = isHighlighted ? 2.5 : 1;
  ctx.stroke();

  // Left Face
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(b3.x, b3.y);
  ctx.lineTo(b4.x, b4.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Face
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(b2.x, b2.y);
  ctx.lineTo(b3.x, b3.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text label on top face
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText(label, p1.x + 8, p1.y + 18);
}

// 2D Floorplan rendering
function stacks2D(ctx, width, height, nodes, selectedNode, hoveredZone, panX = 0, panY = 0, scale = 1) {
  const cols = 4;
  const rows = 3;
  const marginX = 80 + panX;
  const marginY = 60 + panY;
  const blockW = ((width - 160) / cols) * scale;
  const blockH = ((height - 120) / rows) * scale;

  const zones = [
    ['Bin A1', 'Bin B1', 'Bin C1', 'Bin D1'],
    ['Bin A2', 'Bin B2', 'Bin C2', 'Bin D2'],
    ['Bin A3', 'Bin B3', 'Bin C3', 'Bin D3']
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const zName = zones[r][c];
      const zNodes = nodes.filter(n => n.zone === zName);
      const isCrit = zNodes.some(n => n.status === 'Critical');
      const isMod = zNodes.some(n => n.status === 'Moderate');
      const isSelected = selectedNode.zone === zName;
      const isHovered = hoveredZone === zName;

      const x = marginX + c * (blockW + 30 * scale);
      const y = marginY + r * (blockH + 30 * scale);

      ctx.fillStyle = isSelected 
        ? 'rgba(172, 127, 53, 0.25)' 
        : isCrit ? 'rgba(192, 57, 43, 0.15)' : isMod ? 'rgba(201, 122, 31, 0.15)' : 'rgba(30, 142, 90, 0.15)';
      ctx.strokeStyle = isSelected 
        ? '#AC7F35' 
        : isHovered ? '#6B4C1F' : isCrit ? '#C0392B' : isMod ? '#C97A1F' : '#1E8E5A';
      ctx.lineWidth = isSelected || isHovered ? 2.5 : 1.5;

      ctx.fillRect(x, y, blockW, blockH);
      ctx.strokeRect(x, y, blockW, blockH);

      ctx.fillStyle = '#1A1712';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(zName, x + 15, y + 25);

      const maxLevel = Math.max(...zNodes.map(n => n.infestationLevel), 0);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = isCrit ? '#C0392B' : isMod ? '#C97A1F' : '#1E8E5A';
      ctx.fillText(`Pests: ${maxLevel}%`, x + 15, y + 45);
    }
  }
}
