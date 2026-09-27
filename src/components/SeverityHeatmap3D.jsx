import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, ChevronUp, ChevronDown, RotateCw,
  Radio, Activity, Layers, Play, Pause,
  AlertTriangle
} from 'lucide-react';

// Balingbing et al. (2024) Acoustic Pest Profiles
const TEST_SIGNALS = [
  { id: 'bukbok', name: 'Bukbok Spike', severity: 88, freq: 3450, desc: 'High acoustic chewing burst (R. dominica / Sitophilus spp.)' },
  { id: 'borer', name: 'Grain Borer', severity: 58, freq: 2200, desc: 'Moderate internal larvae grain feeding activity' },
  { id: 'beetle', name: 'Flour Beetle', severity: 38, freq: 1750, desc: 'Low-to-moderate ambient crawling / husk rubbing' },
  { id: 'clean', name: 'Clean Control', severity: 12, freq: 420, desc: 'Clean grain baseline ambient noise' }
];

export default function SeverityHeatmap3D({
  stacks = [],
  gridCols = 6,
  gridRows = 5,
  nodes = [],
  activeZ = 0,
  setActiveZ = () => {},
  selectedZone = '',
  setSelectedZone = () => {},
  setSelectedNodeId = () => {},
  activeWarehouse = ''
}) {
  const canvasRef = useRef(null);

  // Camera & Orbit States (360 degrees yaw, pitch 15-80 deg)
  const [yaw, setYaw] = useState(45); // degrees 0-360
  const [pitch, setPitch] = useState(38); // degrees 15-80
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(false);

  // Height and Severity Features
  const [dataSource, setDataSource] = useState('live'); // 'live' | 'test'
  const [activeTestSignal, setActiveTestSignal] = useState(TEST_SIGNALS[0]);
  const [testSeverity, setTestSeverity] = useState(88);
  const [heightMultiplier, setHeightMultiplier] = useState(1.2); // 1.0x, 1.5x, 2.0x
  const [isolateLevel, setIsolateLevel] = useState(true); // strict z-plane isolation (no greyed-out bins)
  const [hoveredStack, setHoveredStack] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, stack: null, node: null, severity: 0 });

  // Auto-rotate 360 degree turntable loop
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setYaw(prev => (prev + 0.6) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Compute severity and metrics for each stack
  const stackDataList = useMemo(() => {
    return (stacks || []).map(stk => {
      if (!stk) return null;
      const node = (nodes || []).find(n => n && n.zone === stk.zone);

      let severity = 0;
      let freq = 0;
      let status = 'Safe';

      if (dataSource === 'live') {
        if (node) {
          severity = Number(node.infestationLevel) || 0;
          freq = Number(node.peakFreqHz) || 0;
          status = node.status || (severity > 70 ? 'Critical' : severity > 30 ? 'Moderate' : 'Safe');
        } else {
          // Unassigned fallback baseline
          severity = 10;
          freq = 400;
          status = 'Safe';
        }
      } else {
        // Test Signal mode: if this stack is selected, use test slider; else vary slightly by coordinate for realistic heatmap
        const isTarget = selectedZone ? stk.zone === selectedZone : (stk.x === 0 && stk.y === 0);
        if (isTarget) {
          severity = testSeverity;
          freq = activeTestSignal.freq;
        } else {
          // Coordinated spatial attenuation from target
          const dist = Math.sqrt(Math.pow(stk.x, 2) + Math.pow(stk.y, 2));
          severity = Math.max(10, Math.round(testSeverity * Math.exp(-dist * 0.35)));
          freq = Math.round(activeTestSignal.freq * (severity / 100));
        }
        status = severity > 70 ? 'Critical' : severity > 30 ? 'Moderate' : 'Safe';
      }

      return {
        ...stk,
        node,
        severity,
        freq,
        status
      };
    }).filter(Boolean);
  }, [stacks, nodes, dataSource, testSeverity, activeTestSignal, selectedZone]);

  // Filter stacks strictly by Z-plane level if isolateLevel is true (No greyed-out bins from other levels)
  const renderedStacks = useMemo(() => {
    if (isolateLevel) {
      return stackDataList.filter(s => (s.z || 0) === activeZ);
    }
    return stackDataList;
  }, [stackDataList, isolateLevel, activeZ]);

  // Count bins on active Z level
  const activeLevelCount = useMemo(() => {
    return stackDataList.filter(s => (s.z || 0) === activeZ).length;
  }, [stackDataList, activeZ]);

  // Quick reset view to front-diagonal perspective
  const handleResetCamera = () => {
    setYaw(45);
    setPitch(38);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // 3D Math & Projection Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Warehouse Floor Background
      ctx.fillStyle = '#F4F2EC';
      ctx.fillRect(0, 0, width, height);

      const originX = width / 2 + pan.x;
      const originY = height / 2 + pan.y + 40;

      // 360 degree trigonometry
      const yawRad = (yaw * Math.PI) / 180;
      const pitchRad = (pitch * Math.PI) / 180;
      const cosYaw = Math.cos(yawRad);
      const sinYaw = Math.sin(yawRad);
      const cosPitch = Math.cos(pitchRad);
      const sinPitch = Math.sin(pitchRad);

      const centerGridX = gridCols / 2;
      const centerGridY = gridRows / 2;
      const tileSize = 38 * zoom;

      // 3D Point to Screen Projection
      const project = (gx, gy, gz) => {
        const dx = (gx - centerGridX) * tileSize;
        const dy = (gy - centerGridY) * tileSize;
        const dz = gz * (tileSize * 0.9 * heightMultiplier);

        // Yaw Rotation around vertical Z axis
        const rx = dx * cosYaw - dy * sinYaw;
        const ry = dx * sinYaw + dy * cosYaw;

        // Pitch Tilt (Isometric / Dimetric projection)
        const sx = originX + rx;
        const sy = originY + (ry * sinPitch) - (dz * cosPitch);
        const depth = ry * cosPitch + dz * sinPitch;

        return { x: sx, y: sy, depth };
      };

      // 1. Draw 3D Base Grid Floor
      ctx.strokeStyle = '#DFDCD4';
      ctx.lineWidth = 1;

      for (let x = 0; x <= gridCols; x++) {
        const p1 = project(x, 0, 0);
        const p2 = project(x, gridRows, 0);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      for (let y = 0; y <= gridRows; y++) {
        const p1 = project(0, y, 0);
        const p2 = project(gridCols, y, 0);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 2. Draw Floor Boundary Frame
      const b0 = project(0, 0, 0);
      const b1 = project(gridCols, 0, 0);
      const b2 = project(gridCols, gridRows, 0);
      const b3 = project(0, gridRows, 0);

      ctx.strokeStyle = '#BDB6A6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(b3.x, b3.y);
      ctx.closePath();
      ctx.stroke();

      // 3. Depth-sort Stacks for accurate occlusion in 360-degree rotation
      const sorted = [...renderedStacks].sort((a, b) => {
        const pA = project(a.x + 0.5, a.y + 0.5, a.z || 0);
        const pB = project(b.x + 0.5, b.y + 0.5, b.z || 0);
        return pA.depth - pB.depth;
      });

      // 4. Render 3D Extruded Severity Columns
      sorted.forEach(stk => {
        const isSelected = selectedZone === stk.zone;
        const isHovered = hoveredStack && hoveredStack.x === stk.x && hoveredStack.y === stk.y && hoveredStack.z === stk.z;

        // Base height 0.6 units + severity extrusion up to 1.6 units
        const sevFrac = Math.min(Math.max(stk.severity / 100, 0), 1);
        const colHeight = 0.6 + sevFrac * 1.5;
        const baseZ = (isolateLevel ? 0 : stk.z || 0) * 1.2;
        const topZ = baseZ + colHeight;

        const w = 0.82;
        const h = 0.82;
        const x0 = stk.x + 0.09;
        const y0 = stk.y + 0.09;
        const x1 = x0 + w;
        const y1 = y0 + h;

        // 8 Corners of the 3D Box
        const pBottom = [
          project(x0, y0, baseZ),
          project(x1, y0, baseZ),
          project(x1, y1, baseZ),
          project(x0, y1, baseZ)
        ];

        const pTop = [
          project(x0, y0, topZ),
          project(x1, y0, topZ),
          project(x1, y1, topZ),
          project(x0, y1, topZ)
        ];

        // Dynamic Color Gradient by Severity
        // Safe (Green) -> Moderate (Amber) -> Critical (Red)
        let colorPalette;
        if (stk.severity > 70) {
          colorPalette = {
            top: '#EF4444',
            left: '#DC2626',
            right: '#B91C1C',
            glow: 'rgba(239, 68, 68, 0.45)',
            border: '#991B1B'
          };
        } else if (stk.severity > 30) {
          colorPalette = {
            top: '#F59E0B',
            left: '#D97706',
            right: '#B45309',
            glow: 'rgba(245, 158, 11, 0.35)',
            border: '#92400E'
          };
        } else {
          colorPalette = {
            top: '#10B981',
            left: '#059669',
            right: '#047857',
            glow: 'rgba(16, 185, 129, 0.25)',
            border: '#065F46'
          };
        }

        // Draw Shadow on Floor
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.moveTo(pBottom[0].x, pBottom[0].y);
        ctx.lineTo(pBottom[1].x, pBottom[1].y);
        ctx.lineTo(pBottom[2].x, pBottom[2].y);
        ctx.lineTo(pBottom[3].x, pBottom[3].y);
        ctx.closePath();
        ctx.fill();

        // Critical Pulse / Warning Aura
        if (stk.severity > 70) {
          const pulse = (Math.sin(Date.now() / 250) + 1) / 2;
          ctx.strokeStyle = colorPalette.glow;
          ctx.lineWidth = 4 + pulse * 4;
          ctx.beginPath();
          ctx.moveTo(pBottom[0].x, pBottom[0].y);
          ctx.lineTo(pBottom[1].x, pBottom[1].y);
          ctx.lineTo(pBottom[2].x, pBottom[2].y);
          ctx.lineTo(pBottom[3].x, pBottom[3].y);
          ctx.closePath();
          ctx.stroke();
        }

        // Draw Lateral Faces depending on view angle (Yaw)
        // Sides: 0->1 (North), 1->2 (East), 2->3 (South), 3->0 (West)
        const drawFace = (i0, i1, fillColor, borderColor) => {
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.moveTo(pTop[i0].x, pTop[i0].y);
          ctx.lineTo(pTop[i1].x, pTop[i1].y);
          ctx.lineTo(pBottom[i1].x, pBottom[i1].y);
          ctx.lineTo(pBottom[i0].x, pBottom[i0].y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = isSelected ? 2.5 : 1;
          ctx.stroke();
        };

        // Render back faces then front faces based on camera view angle
        // Face normal check with 2D cross product for front-face culling
        const isFaceVisible = (v0, v1, v2) => {
          return ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x)) < 0;
        };

        const sides = [
          { i0: 0, i1: 1, c: colorPalette.right }, // top edge
          { i0: 1, i1: 2, c: colorPalette.left },  // right edge
          { i0: 2, i1: 3, c: colorPalette.right }, // bottom edge
          { i0: 3, i1: 0, c: colorPalette.left }   // left edge
        ];

        sides.forEach(s => {
          if (isFaceVisible(pTop[s.i0], pTop[s.i1], pBottom[s.i1])) {
            drawFace(s.i0, s.i1, s.c, isSelected ? '#3B82F6' : colorPalette.border);
          }
        });

        // Top Roof Face
        ctx.fillStyle = colorPalette.top;
        ctx.beginPath();
        ctx.moveTo(pTop[0].x, pTop[0].y);
        ctx.lineTo(pTop[1].x, pTop[1].y);
        ctx.lineTo(pTop[2].x, pTop[2].y);
        ctx.lineTo(pTop[3].x, pTop[3].y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#3B82F6' : (isHovered ? '#FFFFFF' : colorPalette.border);
        ctx.lineWidth = isSelected ? 3.5 : (isHovered ? 2.5 : 1.2);
        ctx.stroke();

        // Top Face Information Badge (Zone name + Severity %)
        const centerTopX = (pTop[0].x + pTop[1].x + pTop[2].x + pTop[3].x) / 4;
        const centerTopY = (pTop[0].y + pTop[1].y + pTop[2].y + pTop[3].y) / 4;

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = `bold ${Math.round(11 * zoom)}px Inter, sans-serif`;
        const zoneShort = stk.zone ? stk.zone.replace('Bin ', '') : `B${stk.x}${stk.y}`;
        ctx.fillText(zoneShort, centerTopX, centerTopY - 7 * zoom);

        ctx.font = `bold ${Math.round(10 * zoom)}px monospace`;
        ctx.fillText(`${stk.severity}%`, centerTopX, centerTopY + 7 * zoom);

        // Selection Marker (Floating Pin / Ring)
        if (isSelected) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerTopX, centerTopY - 20 * zoom, 7 * zoom, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#3B82F6';
          ctx.beginPath();
          ctx.arc(centerTopX, centerTopY - 20 * zoom, 3.5 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Draw Compass Orientation Indicator at bottom-left
      const compX = 45;
      const compY = height - 45;
      const compR = 24;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(compX, compY, compR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // North Needle pointing relative to Yaw
      const needleAngle = -yawRad;
      const nx = compX + Math.sin(needleAngle) * (compR - 6);
      const ny = compY - Math.cos(needleAngle) * (compR - 6);

      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(compX, compY);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', nx, ny - 6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [yaw, pitch, zoom, pan, renderedStacks, selectedZone, hoveredStack, heightMultiplier, isolateLevel, gridCols, gridRows]);

  // Mouse Interaction: Click & Drag to Orbit 360 Degrees
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (e.shiftKey) {
        // Shift + Drag to Pan
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      } else {
        // Drag to Orbit 360° Yaw and Pitch
        setYaw(prev => {
          let next = (prev + dx * 0.6) % 360;
          return next < 0 ? next + 360 : next;
        });
        setPitch(prev => Math.min(80, Math.max(15, prev - dy * 0.4)));
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Hit testing for hover / tooltip
      detectStackHover(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => Math.min(2.2, Math.max(0.6, prev + zoomDelta)));
  };

  // Stack Selection / Hit Testing on Click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const hit = findStackAtPoint(clickX, clickY, canvas.width, canvas.height);
    if (hit) {
      setSelectedZone(hit.zone);
      const node = (nodes || []).find(n => n && n.zone === hit.zone);
      if (node) {
        setSelectedNodeId(node.id);
      }
    }
  };

  const detectStackHover = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = findStackAtPoint(x, y, canvas.width, canvas.height);
    if (hit) {
      setHoveredStack(hit);
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 15,
        stack: hit,
        node: hit.node,
        severity: hit.severity
      });
    } else {
      setHoveredStack(null);
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  // Point-in-polygon / distance hit testing helper
  const findStackAtPoint = (px, py, width, height) => {
    const originX = width / 2 + pan.x;
    const originY = height / 2 + pan.y + 40;
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const cosYaw = Math.cos(yawRad);
    const sinYaw = Math.sin(yawRad);
    const cosPitch = Math.cos(pitchRad);
    const sinPitch = Math.sin(pitchRad);
    const centerGridX = gridCols / 2;
    const centerGridY = gridRows / 2;
    const tileSize = 38 * zoom;

    // Iterate top-down (frontmost first)
    const reversed = [...renderedStacks].reverse();
    for (const stk of reversed) {
      const sevFrac = Math.min(Math.max(stk.severity / 100, 0), 1);
      const colHeight = 0.6 + sevFrac * 1.5;
      const baseZ = (isolateLevel ? 0 : stk.z || 0) * 1.2;
      const topZ = baseZ + colHeight;

      const dx = (stk.x + 0.5 - centerGridX) * tileSize;
      const dy = (stk.y + 0.5 - centerGridY) * tileSize;
      const dz = topZ * (tileSize * 0.9 * heightMultiplier);

      const rx = dx * cosYaw - dy * sinYaw;
      const ry = dx * sinYaw + dy * cosYaw;

      const sx = originX + rx;
      const sy = originY + (ry * sinPitch) - (dz * cosPitch);

      const dist = Math.hypot(px - sx, py - sy);
      if (dist < 24 * zoom) {
        return stk;
      }
    }
    return null;
  };

  return (
    <div className="relative w-full h-[450px] rounded-lg overflow-hidden border border-ink-100 bg-[#F4F2EC] flex flex-col justify-between select-none">
      
      {/* Top Overlay Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Synchronized Z-Plane Stepper & Recenter (Transparent styling) */}
        <div className="flex items-center space-x-2 bg-paper/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-ink-200/80 shadow-sm pointer-events-auto">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-mono font-bold text-ink-500 uppercase tracking-wider">Z-Plane:</span>
            <div className="flex items-center bg-husk rounded-md border border-ink-200 px-1">
              <button
                onClick={() => setActiveZ(z => Math.max(0, z - 1))}
                className="p-1 hover:text-ink-900 text-ink-600 transition cursor-pointer"
                title="Level Down (Z-)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-ink-900 px-1.5">
                Lvl {activeZ}
              </span>
              <button
                onClick={() => setActiveZ(z => z + 1)}
                className="p-1 hover:text-ink-900 text-ink-600 transition cursor-pointer"
                title="Level Up (Z+)"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-px h-4 bg-ink-200"></div>

          {/* Level Isolation Toggle */}
          <button
            onClick={() => setIsolateLevel(prev => !prev)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer flex items-center space-x-1 ${
              isolateLevel 
                ? 'bg-grain-500 text-white shadow-xs' 
                : 'bg-husk text-ink-600 hover:text-ink-900 border border-ink-200'
            }`}
            title={isolateLevel ? "Currently showing ONLY bins on this Z level (no greyed out bins)" : "Show all levels"}
          >
            <Layers className="w-3 h-3" />
            <span>{isolateLevel ? `Only Lvl ${activeZ}` : 'All Levels'}</span>
          </button>

          {/* Recenter Button with Green Dot */}
          <button
            onClick={handleResetCamera}
            className="w-6 h-6 rounded-full bg-husk hover:bg-ink-100 border border-ink-300 flex items-center justify-center transition cursor-pointer group"
            title="Recenter Camera & Reset 360 Orbit"
          >
            <span className="w-2 h-2 rounded-full bg-safe shadow-[0_0_5px_rgba(30,142,90,0.8)] group-hover:scale-125 transition-transform" />
          </button>

          {activeWarehouse && (
            <span className="text-[10px] font-mono font-medium text-ink-500 hidden xl:inline border-l border-ink-200 pl-2 max-w-[140px] truncate" title={activeWarehouse}>
              {activeWarehouse.replace('NFA Warehouse #', 'WH#')}
            </span>
          )}
        </div>

        {/* Right: Telemetry Feed Selector (Live vs Test Signal) */}
        <div className="flex items-center space-x-2 bg-paper/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-ink-200/80 shadow-sm pointer-events-auto">
          <div className="flex bg-husk p-0.5 rounded-md border border-ink-200 text-xs">
            <button
              onClick={() => setDataSource('live')}
              className={`px-2 py-1 rounded font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                dataSource === 'live' ? 'bg-grain-500 text-white font-bold shadow-xs' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Radio className={`w-3 h-3 ${dataSource === 'live' ? 'animate-pulse' : ''}`} />
              <span>Live Telemetry</span>
            </button>
            <button
              onClick={() => setDataSource('test')}
              className={`px-2 py-1 rounded font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                dataSource === 'test' ? 'bg-grain-500 text-white font-bold shadow-xs' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Test Signal</span>
            </button>
          </div>

          {/* 360 Auto-Rotate Turntable Toggle */}
          <button
            onClick={() => setAutoRotate(prev => !prev)}
            className={`p-1.5 rounded-md border transition cursor-pointer flex items-center space-x-1 text-xs ${
              autoRotate ? 'bg-safe text-white border-safe shadow-xs' : 'bg-husk text-ink-600 hover:text-ink-900 border-ink-200'
            }`}
            title="Toggle 360-Degree Continuous Turntable Orbit"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-mono font-bold hidden sm:inline">360&deg; Orbit</span>
          </button>
        </div>
      </div>

      {/* Floating Alert when current Z-Plane is Empty */}
      {activeLevelCount === 0 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-paper/95 backdrop-blur-xs px-4 py-2 rounded-xl border border-moderate/40 shadow-lg text-xs flex items-center space-x-3 pointer-events-auto">
          <AlertTriangle className="w-4 h-4 text-moderate shrink-0" />
          <span className="text-ink-700">
            No grain bins mapped on <strong className="font-mono text-ink-900">Z-Plane Level {activeZ}</strong>.
          </span>
          <button
            onClick={() => setActiveZ(0)}
            className="px-2 py-1 bg-grain-500 text-white font-bold rounded hover:bg-grain-600 cursor-pointer transition text-[11px]"
          >
            Go to Level 0
          </button>
        </div>
      )}

      {/* 3D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={720}
        height={450}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseLeave={() => { setIsDragging(false); setHoveredStack(null); setTooltip(p => ({ ...p, visible: false })); }}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : hoveredStack ? 'cursor-pointer' : 'cursor-grab'}`}
      />

      {/* Tooltip on Stack Hover */}
      {tooltip.visible && tooltip.stack && (
        <div 
          className="absolute z-30 bg-ink-900/95 text-white text-[11px] font-mono p-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 border border-ink-700 backdrop-blur-xs"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y - 45}px` }}
        >
          <div className="flex items-center space-x-1.5 font-bold border-b border-ink-700 pb-1 mb-1">
            <span className={tooltip.severity > 70 ? 'text-critical' : tooltip.severity > 30 ? 'text-amber-400' : 'text-emerald-400'}>
              &bull;
            </span>
            <span>{tooltip.stack.zone}</span>
            <span className="text-ink-400 font-normal">[{tooltip.stack.x},{tooltip.stack.y},L{tooltip.stack.z || 0}]</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <span className="text-ink-300">Infestation:</span>
            <span className={`font-bold ${tooltip.severity > 70 ? 'text-critical' : tooltip.severity > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {tooltip.severity}%
            </span>
            <span className="text-ink-300">Peak Sound:</span>
            <span className="text-ink-100">{tooltip.stack.freq > 1000 ? `${(tooltip.stack.freq / 1000).toFixed(1)} kHz` : `${tooltip.stack.freq} Hz`}</span>
            <span className="text-ink-300">Height Extrusion:</span>
            <span className="text-ink-100">{(0.6 + (tooltip.severity / 100) * 1.5 * heightMultiplier).toFixed(2)}m</span>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar: Angle Quick Buttons, Height Scaling & Test Slider */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Quick 360° Angle Views */}
        <div className="flex items-center space-x-1 bg-paper/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-ink-200/80 shadow-sm pointer-events-auto text-xs font-mono">
          <div className="flex items-center space-x-1 pr-1.5 border-r border-ink-200 text-grain-700">
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-bold">{Math.round(yaw)}&deg;</span>
          </div>
          <button 
            onClick={() => { setYaw(0); setPitch(35); }} 
            className={`px-1.5 py-0.5 rounded text-[11px] transition cursor-pointer ${Math.round(yaw) === 0 ? 'bg-ink-800 text-white font-bold' : 'text-ink-700 hover:bg-husk'}`}
          >
            0&deg; Front
          </button>
          <button 
            onClick={() => { setYaw(90); setPitch(35); }} 
            className={`px-1.5 py-0.5 rounded text-[11px] transition cursor-pointer ${yaw === 90 ? 'bg-ink-800 text-white font-bold' : 'text-ink-700 hover:bg-husk'}`}
          >
            90&deg; East
          </button>
          <button 
            onClick={() => { setYaw(180); setPitch(35); }} 
            className={`px-1.5 py-0.5 rounded text-[11px] transition cursor-pointer ${yaw === 180 ? 'bg-ink-800 text-white font-bold' : 'text-ink-700 hover:bg-husk'}`}
          >
            180&deg; Back
          </button>
          <button 
            onClick={() => { setYaw(270); setPitch(35); }} 
            className={`px-1.5 py-0.5 rounded text-[11px] transition cursor-pointer ${yaw === 270 ? 'bg-ink-800 text-white font-bold' : 'text-ink-700 hover:bg-husk'}`}
          >
            270&deg; West
          </button>
          <button 
            onClick={() => { setYaw(45); setPitch(82); }} 
            className={`px-1.5 py-0.5 rounded text-[11px] transition cursor-pointer ${pitch >= 80 ? 'bg-ink-800 text-white font-bold' : 'text-ink-700 hover:bg-husk'}`}
          >
            Top
          </button>
        </div>

        {/* Height Extrusion Multiplier & Test Signal Slider */}
        <div className="flex items-center space-x-2 bg-paper/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-ink-200/80 shadow-sm pointer-events-auto">
          {/* Height Scale */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-[10px] font-mono text-ink-500 font-bold">Height:</span>
            {[1.0, 1.4, 1.8].map(mult => (
              <button
                key={mult}
                onClick={() => setHeightMultiplier(mult)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                  heightMultiplier === mult ? 'bg-grain-500 text-white' : 'bg-husk text-ink-600 hover:text-ink-900 border border-ink-200'
                }`}
              >
                {mult.toFixed(1)}x
              </button>
            ))}
          </div>

          {/* Test Signal Controller when in 'test' mode */}
          {dataSource === 'test' && (
            <>
              <div className="w-px h-4 bg-ink-200"></div>
              <div className="flex items-center space-x-2">
                <select
                  value={activeTestSignal.id}
                  onChange={(e) => {
                    const found = TEST_SIGNALS.find(s => s.id === e.target.value);
                    if (found) {
                      setActiveTestSignal(found);
                      setTestSeverity(found.severity);
                    }
                  }}
                  className="bg-husk border border-ink-200 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-800 outline-none cursor-pointer"
                >
                  {TEST_SIGNALS.map(sig => (
                    <option key={sig.id} value={sig.id}>{sig.name} ({sig.severity}%)</option>
                  ))}
                </select>

                <div className="flex items-center space-x-1.5">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={testSeverity}
                    onChange={(e) => setTestSeverity(Number(e.target.value))}
                    className="w-16 h-1.5 bg-ink-200 rounded-lg appearance-none cursor-pointer accent-grain-500"
                    title={`Severity: ${testSeverity}%`}
                  />
                  <span className="font-mono text-[11px] font-bold text-ink-800 w-7 text-right">{testSeverity}%</span>
                </div>
              </div>
            </>
          )}

          {/* Zoom controls */}
          <div className="w-px h-4 bg-ink-200"></div>
          <div className="flex items-center space-x-1 text-ink-600">
            <button 
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))} 
              className="p-1 hover:text-ink-900 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-ink-400">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(2.2, z + 0.15))} 
              className="p-1 hover:text-ink-900 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
