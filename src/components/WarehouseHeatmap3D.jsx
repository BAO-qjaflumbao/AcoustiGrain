import React, { useState, useEffect, useRef } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { subscribeToLocationLayout, syncLocationLayoutToFirebase, subscribeToPresets, saveLayoutPreset } from '../services/firebaseService';
import { 
  Box, RotateCw, ZoomIn, ZoomOut, RefreshCw, Move,
  ChevronUp, ChevronDown, Edit3, MousePointer2,
  Flame, Volume2, MapPin, Save, Bookmark, BookmarkPlus,
  AlertTriangle
} from 'lucide-react';

const DEFAULT_PRESETS = [
  {
    id: 'preset-4', name: '4 Kabana with walkways', cols: 8, rows: 5,
    stacks: [
      {x: 0, y: 0, z: 0, zone: 'Bin A1'}, {x: 0, y: 1, z: 0, zone: 'Bin A2'}, {x: 0, y: 3, z: 0, zone: 'Bin B1'}, {x: 0, y: 4, z: 0, zone: 'Bin B2'},
      {x: 2, y: 0, z: 0, zone: 'Bin C1'}, {x: 2, y: 1, z: 0, zone: 'Bin C2'}, {x: 2, y: 3, z: 0, zone: 'Bin D1'}, {x: 2, y: 4, z: 0, zone: 'Bin D2'},
      {x: 5, y: 0, z: 0, zone: 'Bin E1'}, {x: 5, y: 1, z: 0, zone: 'Bin E2'}, {x: 5, y: 3, z: 0, zone: 'Bin F1'}, {x: 5, y: 4, z: 0, zone: 'Bin F2'},
      {x: 7, y: 0, z: 0, zone: 'Bin G1'}, {x: 7, y: 1, z: 0, zone: 'Bin G2'}, {x: 7, y: 3, z: 0, zone: 'Bin H1'}, {x: 7, y: 4, z: 0, zone: 'Bin H2'}
    ]
  },
  {
    id: 'preset-6', name: '6 Kabana Warehouse', cols: 6, rows: 5,
    stacks: [
      {x: 0, y: 0, z: 0, zone: 'Bin A1'}, {x: 0, y: 1, z: 0, zone: 'Bin A2'}, {x: 0, y: 3, z: 0, zone: 'Bin B1'}, {x: 0, y: 4, z: 0, zone: 'Bin B2'},
      {x: 2, y: 0, z: 0, zone: 'Bin C1'}, {x: 2, y: 1, z: 0, zone: 'Bin C2'}, {x: 2, y: 3, z: 0, zone: 'Bin D1'}, {x: 2, y: 4, z: 0, zone: 'Bin D2'},
      {x: 4, y: 0, z: 0, zone: 'Bin E1'}, {x: 4, y: 1, z: 0, zone: 'Bin E2'}, {x: 4, y: 3, z: 0, zone: 'Bin F1'}, {x: 4, y: 4, z: 0, zone: 'Bin F2'}
    ]
  },
  {
    id: 'preset-8', name: '8 Kabana Warehouse Layout Preset', cols: 8, rows: 5,
    stacks: [
      {x: 0, y: 0, z: 0, zone: 'Bin A1'}, {x: 0, y: 1, z: 0, zone: 'Bin A2'}, {x: 0, y: 3, z: 0, zone: 'Bin B1'}, {x: 0, y: 4, z: 0, zone: 'Bin B2'},
      {x: 2, y: 0, z: 0, zone: 'Bin C1'}, {x: 2, y: 1, z: 0, zone: 'Bin C2'}, {x: 2, y: 3, z: 0, zone: 'Bin D1'}, {x: 2, y: 4, z: 0, zone: 'Bin D2'},
      {x: 4, y: 0, z: 0, zone: 'Bin E1'}, {x: 4, y: 1, z: 0, zone: 'Bin E2'}, {x: 4, y: 3, z: 0, zone: 'Bin F1'}, {x: 4, y: 4, z: 0, zone: 'Bin F2'},
      {x: 6, y: 0, z: 0, zone: 'Bin G1'}, {x: 6, y: 1, z: 0, zone: 'Bin G2'}, {x: 6, y: 3, z: 0, zone: 'Bin H1'}, {x: 6, y: 4, z: 0, zone: 'Bin H2'}
    ]
  }
];

export default function WarehouseHeatmap3D() {
  const { nodes, selectedNode, setSelectedNodeId, floorMap, setFloorMap, activeWarehouse, setActiveWarehouse } = useTelemetry();
  const canvasRef = useRef(null);
  
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  const [viewMode, setViewMode] = useState('isometric');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [rotationAngle, setRotationAngle] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [selectedZone, setSelectedZone] = useState('Bin A1');
  const [activeZ, setActiveZ] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [initialLayout, setInitialLayout] = useState({ stacks: [], cols: 6, rows: 5 });

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null); 
  const [hoveredAction, setHoveredAction] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, text: '' });

  const [gridCols, setGridCols] = useState(floorMap?.cols || 6);
  const [gridRows, setGridRows] = useState(floorMap?.rows || 5);
  const [inputCols, setInputCols] = useState(floorMap?.cols || 6);
  const [inputRows, setInputRows] = useState(floorMap?.rows || 5);
  const [stacks, setStacks] = useState(floorMap?.stacks || []);
  const [dimensionPrompt, setDimensionPrompt] = useState(null);

  useEffect(() => {
    setInputCols(gridCols);
  }, [gridCols]);

  useEffect(() => {
    setInputRows(gridRows);
  }, [gridRows]);

  useEffect(() => {
    const unsub = subscribeToLocationLayout(activeWarehouse, (layout) => {
      if (layout) {
        const cols = layout.cols !== undefined ? Number(layout.cols) || 6 : 6;
        const rows = layout.rows !== undefined ? Number(layout.rows) || 5 : 5;
        const validStacks = (layout.stacks || []).filter(s => s && s.x >= 0 && s.x < cols && s.y >= 0 && s.y < rows);
        setGridCols(cols);
        setGridRows(rows);
        setStacks(validStacks);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [activeWarehouse]);

  useEffect(() => {
    const unsub = subscribeToPresets((dbPresets) => {
      if (dbPresets && dbPresets.length > 0) {
        setPresets([...DEFAULT_PRESETS, ...dbPresets]);
      } else {
        setPresets(DEFAULT_PRESETS);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    if (!editMode && floorMap) {
      const cols = floorMap.cols || 6;
      const rows = floorMap.rows || 5;
      const validStacks = (floorMap.stacks || []).filter(s => s && s.x >= 0 && s.x < cols && s.y >= 0 && s.y < rows);
      setGridCols(cols);
      setGridRows(rows);
      setStacks(validStacks);
    }
  }, [floorMap, editMode]);

  useEffect(() => {
    if (selectedNode && selectedNode.zone) {
      setSelectedZone(selectedNode.zone);
    }
  }, [selectedNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#F7F5F0';
      ctx.fillRect(0, 0, width, height);

      const originX = width / 2;
      const originY = height / 3.5;

      const offsetX = -gridCols / 2;
      const offsetY = -gridRows / 2;

      if (viewMode === 'isometric') {
        ctx.strokeStyle = '#E7E4DE';
        ctx.lineWidth = 1;

        for (let x = 0; x <= gridCols; x++) {
          ctx.beginPath();
          const p1 = isoToScreen(x + offsetX, offsetY, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          const p2 = isoToScreen(x + offsetX, gridRows + offsetY, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        for (let y = 0; y <= gridRows; y++) {
          ctx.beginPath();
          const p1 = isoToScreen(offsetX, y + offsetY, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          const p2 = isoToScreen(gridCols + offsetX, y + offsetY, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        const sortedStacks = [...(stacks || [])].filter(Boolean).sort((a, b) => {
          if (a.z !== b.z) return (a.z || 0) - (b.z || 0);
          return ((a.x || 0) + (a.y || 0)) - ((b.x || 0) + (b.y || 0));
        });

        sortedStacks.forEach(stk => {
          if (!stk) return;
          const stkNodes = (nodes || []).filter(n => n && n.zone === stk.zone);
          const maxStatus = stkNodes.length > 0 ? (stkNodes.some(n => n.status === 'Critical') ? 'Critical' :
                          stkNodes.some(n => n.status === 'Moderate') ? 'Moderate' : 'Safe') : 'Safe';
                          
          const isSelectedZone = !editMode && selectedZone === stk.zone;
          const isHovered = hoveredCell && hoveredCell.x === stk.x && hoveredCell.y === stk.y && hoveredCell.z === stk.z;

          let colors = {
            Critical: { top: '#C0392B', left: '#A52A1C', right: '#8E2115' },
            Moderate: { top: '#C97A1F', left: '#AF6716', right: '#93530E' },
            Safe: { top: '#1E8E5A', left: '#177448', right: '#125B37' }
          }[maxStatus];

          ctx.globalAlpha = (stk.z === activeZ) ? 1.0 : 0.25;

          const label = stk.zone ? (stk.zone.split(' ')[1] || stk.zone) : '';
          drawIsoBlock(ctx, stk.x + offsetX + 0.1, stk.y + offsetY + 0.1, stk.z, 0.8, 0.8, 0.8, colors, originX, originY, zoomLevel, label, isSelectedZone || (!editMode && isHovered), panOffset.x, panOffset.y, rotationAngle);
        });
        
        ctx.globalAlpha = 1.0;

        if (editMode) {
          if (hoveredCell && hoveredCell.z === activeZ) {
            const colors = hoveredCell.exists 
              ? { top: 'rgba(239, 68, 68, 0.7)', left: 'rgba(185, 28, 28, 0.7)', right: 'rgba(153, 27, 27, 0.7)' } 
              : hoveredCell.valid 
                ? { top: 'rgba(34, 197, 94, 0.7)', left: 'rgba(22, 163, 74, 0.7)', right: 'rgba(21, 128, 61, 0.7)' }
                : { top: 'rgba(156, 163, 175, 0.5)', left: 'rgba(107, 114, 128, 0.5)', right: 'rgba(75, 85, 99, 0.5)' };

            drawIsoBlock(ctx, hoveredCell.x + offsetX + 0.1, hoveredCell.y + offsetY + 0.1, activeZ, 0.8, 0.8, 0.8, colors, originX, originY, zoomLevel, hoveredCell.exists ? 'DEL' : 'ADD', true, panOffset.x, panOffset.y, rotationAngle);
          }

          // Expansion arrows
          const plusXCenter = isoToScreen(gridCols + offsetX + 0.5, offsetY + gridRows / 2, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          drawExpandButton(ctx, plusXCenter.x, plusXCenter.y, hoveredAction === 'expandX', zoomLevel);
          
          const plusYCenter = isoToScreen(offsetX + gridCols / 2, gridRows + offsetY + 0.5, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
          drawExpandButton(ctx, plusYCenter.x, plusYCenter.y, hoveredAction === 'expandY', zoomLevel);
        }

      } else {
        // 2D View
        const marginX = 80 + panOffset.x;
        const marginY = 60 + panOffset.y;
        const blockW = ((width - 160) / gridCols) * zoomLevel;
        const blockH = ((height - 120) / gridRows) * zoomLevel;

        for (let y = 0; y < gridRows; y++) {
          for (let x = 0; x < gridCols; x++) {
            const px = marginX + x * (blockW + 10 * zoomLevel);
            const py = marginY + y * (blockH + 10 * zoomLevel);
            
            ctx.fillStyle = 'rgba(0,0,0,0.03)';
            ctx.strokeStyle = '#E7E4DE';
            ctx.lineWidth = 1;
            ctx.fillRect(px, py, blockW, blockH);
            ctx.strokeRect(px, py, blockW, blockH);

            const stk = (stacks || []).find(s => s && s.x === x && s.y === y && s.z === activeZ);
            
            if (stk) {
              const stkNodes = (nodes || []).filter(n => n && n.zone === stk.zone);
              const maxLevel = stkNodes.length > 0 ? Math.max(...stkNodes.map(n => n.infestationLevel || 0), 0) : 0;
              const isCrit = stkNodes.some(n => n.status === 'Critical');
              const isMod = stkNodes.some(n => n.status === 'Moderate');
              
              const isSelected = !editMode && selectedZone === stk.zone;
              const isHovered = hoveredCell && hoveredCell.x === x && hoveredCell.y === y && hoveredCell.z === activeZ;
              
              ctx.fillStyle = isCrit ? 'rgba(192, 57, 43, 0.85)' : isMod ? 'rgba(201, 122, 31, 0.85)' : 'rgba(30, 142, 90, 0.85)';
              
              if (editMode && isHovered) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
              }

              ctx.fillRect(px, py, blockW, blockH);

              if (isSelected || (!editMode && isHovered)) {
                ctx.strokeStyle = '#3B82F6';
                ctx.lineWidth = 3;
                ctx.strokeRect(px, py, blockW, blockH);
              }
              
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 12px Inter, sans-serif';
              ctx.fillText(stk.zone || '', px + 8, py + 20);
              
              ctx.font = '10px Inter, sans-serif';
              ctx.fillText(`Pests: ${maxLevel}%`, px + 8, py + 35);
            } else if (editMode && hoveredCell && hoveredCell.x === x && hoveredCell.y === y && hoveredCell.z === activeZ) {
              ctx.fillStyle = hoveredCell.valid ? 'rgba(34, 197, 94, 0.5)' : 'rgba(156, 163, 175, 0.5)';
              ctx.fillRect(px, py, blockW, blockH);
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 12px Inter, sans-serif';
              ctx.fillText('ADD', px + 8, py + 20);
            }
            
            const stackBelow = (stacks || []).find(s => s && s.x === x && s.y === y && s.z < activeZ);
            if (!stk && stackBelow) {
              ctx.fillStyle = 'rgba(0,0,0,0.1)';
              ctx.fillRect(px, py, blockW, blockH);
              ctx.fillStyle = '#999';
              ctx.font = '10px Inter, sans-serif';
              ctx.fillText(`${stackBelow.zone || ''} (L${stackBelow.z})`, px + 8, py + 20);
            }
          }
        }

        if (editMode) {
          const plusX_X = marginX + gridCols * (blockW + 10 * zoomLevel) + 20 * zoomLevel;
          const plusX_Y = marginY + (gridRows/2) * (blockH + 10 * zoomLevel);
          drawExpandButton(ctx, plusX_X, plusX_Y, hoveredAction === 'expandX', zoomLevel);

          const plusY_X = marginX + (gridCols/2) * (blockW + 10 * zoomLevel);
          const plusY_Y = marginY + gridRows * (blockH + 10 * zoomLevel) + 20 * zoomLevel;
          drawExpandButton(ctx, plusY_X, plusY_Y, hoveredAction === 'expandY', zoomLevel);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewMode, zoomLevel, panOffset, rotationAngle, nodes, selectedNode, selectedZone, hoveredCell, hoveredAction, stacks, activeZ, editMode, gridCols, gridRows]);

  const handleSaveToFirebase = async () => {
    setIsSaving(true);
    const validStacks = (stacks || []).filter(s => s && s.x >= 0 && s.x < gridCols && s.y >= 0 && s.y < gridRows);
    if (validStacks.length !== stacks.length) {
      setStacks(validStacks);
    }
    const layoutData = { stacks: validStacks, cols: gridCols, rows: gridRows };
    await syncLocationLayoutToFirebase(activeWarehouse, layoutData);
    setFloorMap(layoutData);
    setIsSaving(false);
    setShowSavePrompt(false);
    setEditMode(false);
  };

  const handleSaveCustomPreset = async () => {
    const trimmed = presetNameInput.trim();
    if (!trimmed) return;
    const validStacks = (stacks || []).filter(s => s && s.x >= 0 && s.x < gridCols && s.y >= 0 && s.y < gridRows);
    const maxStackX = validStacks.length > 0 ? Math.max(...validStacks.map(s => s.x)) : -1;
    const maxStackY = validStacks.length > 0 ? Math.max(...validStacks.map(s => s.y)) : -1;
    const properCols = Math.max(gridCols, maxStackX + 1, 1);
    const properRows = Math.max(gridRows, maxStackY + 1, 1);
    const newPreset = {
      name: trimmed,
      cols: properCols,
      rows: properRows,
      stacks: validStacks
    };
    await saveLayoutPreset(newPreset);
    setPresets(prev => [...prev, { ...newPreset, id: `custom-${Date.now()}` }]);
    setShowSavePresetModal(false);
    setPresetNameInput('');
  };

  const requestColsChange = (targetCols) => {
    const newCols = Math.max(1, parseInt(targetCols, 10) || 1);
    if (newCols === gridCols) {
      setInputCols(gridCols);
      return;
    }

    if (newCols > gridCols) {
      setGridCols(newCols);
      setInputCols(newCols);
      setFloorMap({ cols: newCols, rows: gridRows, stacks });
      return;
    }

    // Checking if reducing columns will delete any bins with x >= newCols
    const affected = (stacks || []).filter(s => s && s.x >= newCols);
    if (affected.length > 0) {
      setDimensionPrompt({
        type: 'cols',
        targetVal: newCols,
        affectedStacks: affected
      });
    } else {
      setGridCols(newCols);
      setInputCols(newCols);
      setFloorMap({ cols: newCols, rows: gridRows, stacks });
    }
  };

  const requestRowsChange = (targetRows) => {
    const newRows = Math.max(1, parseInt(targetRows, 10) || 1);
    if (newRows === gridRows) {
      setInputRows(gridRows);
      return;
    }

    if (newRows > gridRows) {
      setGridRows(newRows);
      setInputRows(newRows);
      setFloorMap({ cols: gridCols, rows: newRows, stacks });
      return;
    }

    // Checking if reducing rows will delete any bins with y >= newRows
    const affected = (stacks || []).filter(s => s && s.y >= newRows);
    if (affected.length > 0) {
      setDimensionPrompt({
        type: 'rows',
        targetVal: newRows,
        affectedStacks: affected
      });
    } else {
      setGridRows(newRows);
      setInputRows(newRows);
      setFloorMap({ cols: gridCols, rows: newRows, stacks });
    }
  };

  const handleConfirmDimensionReduction = () => {
    if (!dimensionPrompt) return;
    const { type, targetVal } = dimensionPrompt;

    if (type === 'cols') {
      const nextStacks = (stacks || []).filter(s => s && s.x < targetVal && s.x >= 0 && s.y >= 0 && s.y < gridRows);
      setGridCols(targetVal);
      setInputCols(targetVal);
      setStacks(nextStacks);
      setFloorMap({ cols: targetVal, rows: gridRows, stacks: nextStacks });
    } else if (type === 'rows') {
      const nextStacks = (stacks || []).filter(s => s && s.x >= 0 && s.x < gridCols && s.y < targetVal && s.y >= 0);
      setGridRows(targetVal);
      setInputRows(targetVal);
      setStacks(nextStacks);
      setFloorMap({ cols: gridCols, rows: targetVal, stacks: nextStacks });
    }
    setDimensionPrompt(null);
  };

  const handleCancelDimensionReduction = () => {
    setInputCols(gridCols);
    setInputRows(gridRows);
    setDimensionPrompt(null);
  };

  const handleSelectPreset = (presetId) => {
    const p = presets.find(pr => pr.id === presetId);
    if (!p) return;

    // Dynamically calculate proper dimensions so the preset grid always holds all its bins
    const maxStackX = (p.stacks && p.stacks.length > 0) ? Math.max(...p.stacks.map(s => s.x)) : -1;
    const maxStackY = (p.stacks && p.stacks.length > 0) ? Math.max(...p.stacks.map(s => s.y)) : -1;
    const properCols = Math.max(Number(p.cols) || 1, maxStackX + 1);
    const properRows = Math.max(Number(p.rows) || 1, maxStackY + 1);

    // Filter to guarantee any bin sits at a valid row/column
    const validStacks = (p.stacks || []).filter(s => s && s.x >= 0 && s.x < properCols && s.y >= 0 && s.y < properRows);

    setGridCols(properCols);
    setInputCols(properCols);
    setGridRows(properRows);
    setInputRows(properRows);
    setStacks(validStacks);
    setFloorMap({ cols: properCols, rows: properRows, stacks: validStacks });
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      const hasChanges = JSON.stringify(stacks) !== JSON.stringify(initialLayout.stacks) ||
                         gridCols !== initialLayout.cols ||
                         gridRows !== initialLayout.rows;
      if (hasChanges) {
        setShowSavePrompt(true);
      } else {
        setEditMode(false);
      }
    } else {
      setInitialLayout({ stacks: [...stacks], cols: gridCols, rows: gridRows });
      setEditMode(true);
    }
  };

  const handleMouseDown = (e) => {
    if (editMode && hoveredAction) return; 
    if (editMode && hoveredCell) return;
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

    let foundCell = null;
    let foundAction = null;
    let tooltip = { visible: false, text: '', x: 0, y: 0 };
    const offsetX = -gridCols / 2;
    const offsetY = -gridRows / 2;

    if (viewMode === 'isometric') {
      if (editMode) {
        const plusX = isoToScreen(gridCols + offsetX + 0.5, offsetY + gridRows / 2, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
        const plusY = isoToScreen(offsetX + gridCols / 2, gridRows + offsetY + 0.5, 0, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
        
        if (Math.hypot(mouseX - plusX.x, mouseY - plusX.y) < 20 * zoomLevel) foundAction = 'expandX';
        else if (Math.hypot(mouseX - plusY.x, mouseY - plusY.y) < 20 * zoomLevel) foundAction = 'expandY';
      }

      if (!foundAction) {
        for (let y = 0; y < gridRows; y++) {
          for (let x = 0; x < gridCols; x++) {
            const center = isoToScreen(x + offsetX + 0.5, y + offsetY + 0.5, activeZ + 0.8, originX, originY, zoomLevel, panOffset.x, panOffset.y, rotationAngle);
            const dist = Math.hypot(mouseX - center.x, mouseY - center.y);
            
            if (dist < 25 * zoomLevel) {
              const exists = stacks.some(s => s.x === x && s.y === y && s.z === activeZ);
              const valid = activeZ === 0 || stacks.some(s => s.x === x && s.y === y && s.z === activeZ - 1);
              foundCell = { x, y, z: activeZ, exists, valid };
              
              tooltip = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 30,
                visible: true,
                text: editMode 
                  ? (exists ? 'Click to Delete' : (valid ? 'Click to Add' : 'Cannot place here (No support)'))
                  : (exists ? `Bin ${String.fromCharCode(65 + x)}${y + 1} (L${activeZ})` : 'Empty Space')
              };
              break;
            }
          }
          if (foundCell) break;
        }
      }
    } else {
        const marginX = 80 + panOffset.x;
        const marginY = 60 + panOffset.y;
        const blockW = ((width - 160) / gridCols) * zoomLevel;
        const blockH = ((height - 120) / gridRows) * zoomLevel;

        if (editMode) {
          const plusX_X = marginX + gridCols * (blockW + 10 * zoomLevel) + 20 * zoomLevel;
          const plusX_Y = marginY + (gridRows/2) * (blockH + 10 * zoomLevel);
          const plusY_X = marginX + (gridCols/2) * (blockW + 10 * zoomLevel);
          const plusY_Y = marginY + gridRows * (blockH + 10 * zoomLevel) + 20 * zoomLevel;

          if (Math.hypot(mouseX - plusX_X, mouseY - plusX_Y) < 20 * zoomLevel) foundAction = 'expandX';
          else if (Math.hypot(mouseX - plusY_X, mouseY - plusY_Y) < 20 * zoomLevel) foundAction = 'expandY';
        }

        if (!foundAction) {
          for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridCols; x++) {
              const px = marginX + x * (blockW + 10 * zoomLevel);
              const py = marginY + y * (blockH + 10 * zoomLevel);
              
              if (mouseX >= px && mouseX <= px + blockW && mouseY >= py && mouseY <= py + blockH) {
                const exists = stacks.some(s => s.x === x && s.y === y && s.z === activeZ);
                const valid = activeZ === 0 || stacks.some(s => s.x === x && s.y === y && s.z === activeZ - 1);
                foundCell = { x, y, z: activeZ, exists, valid };
                
                tooltip = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top - 30,
                  visible: true,
                  text: editMode 
                    ? (exists ? 'Click to Delete' : (valid ? 'Click to Add' : 'Cannot place here'))
                    : (exists ? `Bin ${String.fromCharCode(65 + x)}${y + 1}` : 'Empty Space')
                };
                break;
              }
            }
            if (foundCell) break;
          }
        }
    }

    if (foundAction) {
      tooltip = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 30,
        visible: true,
        text: `Expand ${foundAction === 'expandX' ? 'Columns' : 'Rows'}`
      };
    }

    setHoveredCell(foundCell);
    setHoveredAction(foundAction);
    setTooltipPos(tooltip);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (_e) => {
    if (editMode && hoveredAction) {
      if (hoveredAction === 'expandX') {
        requestColsChange(gridCols + 1);
      }
      if (hoveredAction === 'expandY') {
        requestRowsChange(gridRows + 1);
      }
      return;
    }

    if (!hoveredCell) return;
    
    if (editMode) {
      if (hoveredCell.exists) {
        setStacks(prev => {
          const next = prev.filter(s => !(s.x === hoveredCell.x && s.y === hoveredCell.y && s.z >= hoveredCell.z));
          setFloorMap({ cols: gridCols, rows: gridRows, stacks: next });
          return next;
        });
      } else if (hoveredCell.valid) {
        if (hoveredCell.x >= 0 && hoveredCell.x < gridCols && hoveredCell.y >= 0 && hoveredCell.y < gridRows) {
          const zone = `Bin ${String.fromCharCode(65 + hoveredCell.x)}${hoveredCell.y + 1}${hoveredCell.z > 0 ? `-L${hoveredCell.z}` : ''}`;
          setStacks(prev => {
            const next = [...prev, { x: hoveredCell.x, y: hoveredCell.y, z: hoveredCell.z, zone }];
            setFloorMap({ cols: gridCols, rows: gridRows, stacks: next });
            return next;
          });
        }
      }
    } else {
      if (hoveredCell.exists) {
        const stk = stacks.find(s => s.x === hoveredCell.x && s.y === hoveredCell.y && s.z === hoveredCell.z);
        if (stk) {
          setSelectedZone(stk.zone);
          const targetNode = nodes.find(n => n.zone === stk.zone);
          if (targetNode) setSelectedNodeId(targetNode.id);
        }
      }
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
    setActiveZ(0);
  };

  const uniqueZones = Array.from(new Set((stacks || []).map(s => s?.zone).filter(Boolean))).sort((a, b) => 
    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
  );

  const nodeForZone = (nodes || []).find(n => n?.zone === selectedZone);
  const activeSelectedNode = nodeForZone || {
    id: `STACK-${(selectedZone || 'UNASSIGNED').replace(/\s+/g, '')}`,
    name: selectedZone ? `Storage ${selectedZone}` : 'Unassigned Stack Bin',
    zone: selectedZone || 'Unassigned',
    status: 'Safe',
    infestationLevel: 0,
    peakFreqHz: 0,
    depthCm: 0,
    temperature: 0,
    humidity: 0,
    rssi: 0,
    weevilCountEst: 0,
    battery: 0
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto selection:bg-grain-500 selection:text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-paper p-4 rounded-xl border border-ink-100 shadow-card">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center space-x-2">
            <Box className="w-5 h-5 text-grain-500" />
            <span>Interactive 3D Rice Stack Map</span>
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            Click &amp; drag to pan. Use Edit Mode to add/remove bins or expand floor size.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {editMode && (
            <button
              onClick={handleSaveToFirebase}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition border cursor-pointer bg-safe text-white border-safe hover:bg-emerald-600 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save to Firebase'}</span>
            </button>
          )}
          <button
            onClick={handleToggleEditMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition border cursor-pointer ${
              editMode ? 'bg-grain-500 text-white border-grain-500' : 'bg-husk text-ink-700 border-ink-200 hover:bg-grain-50'
            }`}
          >
            {editMode ? <MousePointer2 className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{editMode ? 'Exit Edit Mode' : 'Edit Layout'}</span>
          </button>

          <div className="flex bg-husk p-1 rounded-md border border-ink-100 text-xs">
            <button
              onClick={() => setViewMode('isometric')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                viewMode === 'isometric' ? 'bg-ink-800 text-white font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode('topdown')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                viewMode === 'topdown' ? 'bg-ink-800 text-white font-bold' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Flat 2D View
            </button>
          </div>

          <div className="flex items-center bg-husk p-1 rounded-md border border-ink-100 text-xs">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))} 
              className="p-1.5 text-ink-600 hover:text-ink-900 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-ink-400 font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))} 
              className="p-1.5 text-ink-600 hover:text-ink-900 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setRotationAngle(prev => (prev + 90) % 360)} 
              className="p-1.5 text-ink-600 hover:text-ink-900 border-l border-ink-100 ml-1 cursor-pointer flex items-center space-x-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={handleResetView} 
              className="p-1.5 text-ink-600 hover:text-ink-900 border-l border-ink-100 ml-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-paper border border-ink-100 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[460px] shadow-card">
          
          {showSavePrompt && (
            <div className="absolute inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-paper p-6 rounded-xl border border-ink-200 shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-display font-bold text-lg text-ink-900 mb-2">Save Layout Changes?</h3>
                <p className="text-sm text-ink-600 mb-6">
                  You have unsaved modifications to the floor layout. Do you want to save or discard these changes?
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button 
                    onClick={() => {
                      setStacks(initialLayout.stacks);
                      setGridCols(initialLayout.cols);
                      setGridRows(initialLayout.rows);
                      setInputCols(initialLayout.cols);
                      setInputRows(initialLayout.rows);
                      setFloorMap(initialLayout);
                      setShowSavePrompt(false);
                      setEditMode(false);
                    }}
                    className="px-4 py-2 text-sm font-bold text-ink-600 hover:text-ink-900 bg-husk hover:bg-ink-100 rounded-md transition cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleSaveToFirebase}
                    className="px-4 py-2 text-sm font-bold bg-grain-500 text-white rounded-md hover:bg-grain-600 transition shadow-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSavePresetModal && (
            <div className="absolute inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-paper p-6 rounded-xl border border-ink-200 shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-display font-bold text-lg text-ink-900 mb-2">Save Warehouse Preset</h3>
                <p className="text-xs text-ink-600 mb-4">
                  Enter a name for this custom layout preset (e.g. "10 Kabana High Capacity").
                </p>
                <input
                  type="text"
                  value={presetNameInput}
                  onChange={(e) => setPresetNameInput(e.target.value)}
                  placeholder="e.g. 5 Kabana with Cross-Aisle"
                  className="w-full px-3 py-2 text-xs border border-ink-200 rounded-md bg-husk outline-none focus:border-grain-500 mb-4 font-medium text-ink-900"
                  autoFocus
                />
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => { setShowSavePresetModal(false); setPresetNameInput(''); }}
                    className="px-4 py-2 text-xs font-bold text-ink-600 hover:text-ink-900 bg-husk hover:bg-ink-100 rounded-md transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomPreset}
                    disabled={!presetNameInput.trim()}
                    className="px-4 py-2 text-xs font-bold bg-grain-500 text-white rounded-md hover:bg-grain-600 transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    Save Preset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Internal Canvas Display Viewport */}
          <div className="relative w-full h-[450px] rounded-lg overflow-hidden border border-ink-100 bg-[#F7F5F0]">
            {/* Level Selector with Recenter Button (green dot) underneath - Transparent Container */}
            <div className="absolute top-4 left-4 z-10 flex flex-col items-center bg-transparent p-1 pointer-events-auto select-none">
              <span className="text-[9px] font-bold text-ink-600/80 mb-0.5 tracking-wider drop-shadow-sm">Z-PLANE</span>
              <button 
                onClick={() => setActiveZ(z => z + 1)}
                className="p-1 hover:bg-ink-900/10 text-ink-700 hover:text-ink-900 rounded-md cursor-pointer transition drop-shadow"
                title="Level Up (Z+)"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className="font-mono text-xs font-bold text-ink-900 my-0.5 drop-shadow-sm">
                Lvl {activeZ}
              </span>
              <button 
                onClick={() => setActiveZ(z => Math.max(0, z - 1))}
                className="p-1 hover:bg-ink-900/10 text-ink-700 hover:text-ink-900 rounded-md cursor-pointer transition drop-shadow"
                title="Level Down (Z-)"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              {/* Recenter Button with green dot in the middle - Transparent Container */}
              <button 
                onClick={() => { setPanOffset({ x: 0, y: 0 }); setZoomLevel(1); }}
                className="mt-2 w-7 h-7 rounded-full bg-transparent hover:bg-ink-900/10 border border-ink-400/40 flex items-center justify-center transition cursor-pointer group"
                title="Recenter View & Stacks"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-safe shadow-[0_0_6px_rgba(30,142,90,0.8)] group-hover:scale-125 transition-transform" />
              </button>
            </div>

            {/* In-Display Alert Prompt for Dimension Reduction with Bins */}
            {dimensionPrompt && (
              <div className="absolute inset-0 z-30 bg-ink-900/50 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto">
                <div className="bg-paper p-5 rounded-xl border border-critical/30 shadow-2xl max-w-sm w-full mx-auto animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center space-x-2.5 text-critical mb-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h3 className="font-display font-bold text-base text-ink-900">
                      Delete {dimensionPrompt.type === 'cols' ? 'Column(s)' : 'Row(s)'} &amp; Contents?
                    </h3>
                  </div>
                  <p className="text-xs text-ink-600 mb-3 leading-relaxed">
                    Reducing grid {dimensionPrompt.type === 'cols' ? 'columns (X)' : 'rows (Y)'} to <span className="font-mono font-bold text-ink-900">{dimensionPrompt.targetVal}</span> will permanently remove <span className="font-bold text-critical">{dimensionPrompt.affectedStacks.length} active bin{dimensionPrompt.affectedStacks.length > 1 ? 's' : ''}</span> sitting on those coordinates:
                  </p>
                  <div className="bg-husk p-2.5 rounded-lg border border-ink-100 mb-4 max-h-28 overflow-y-auto flex flex-wrap gap-1.5">
                    {dimensionPrompt.affectedStacks.map((s, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center space-x-1 bg-paper px-2 py-0.5 rounded border border-critical/20 text-critical text-[11px] font-mono font-semibold"
                      >
                        <span>{s.zone || `Bin (${s.x},${s.y})`}</span>
                        <span className="text-[9px] text-ink-400">[{s.x},{s.y}{s.z > 0 ? `,L${s.z}` : ''}]</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-end space-x-2.5">
                    <button
                      onClick={handleCancelDimensionReduction}
                      className="px-3 py-1.5 text-xs font-bold text-ink-600 hover:text-ink-900 bg-husk hover:bg-ink-100 rounded-md transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDimensionReduction}
                      className="px-3.5 py-1.5 text-xs font-bold bg-critical text-white rounded-md hover:bg-red-700 transition shadow-sm cursor-pointer"
                    >
                      Proceed with Deletion
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Dimensions Widget INSIDE the display at bottom-right - Transparent Container */}
            {editMode && (
              <div className="absolute bottom-4 right-4 z-10 bg-transparent p-2 flex flex-col gap-1.5 pointer-events-auto select-none">
                <span className="text-xs font-bold text-ink-800 drop-shadow-sm">Grid Dimensions</span>
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col">
                    <label className="text-[10px] text-ink-600 font-mono font-bold drop-shadow-sm">COLS (X)</label>
                    <div className="flex items-center border border-ink-400/50 rounded bg-transparent">
                       <button 
                         onClick={() => requestColsChange(gridCols - 1)} 
                         className="px-2 hover:bg-ink-900/10 cursor-pointer text-ink-800 font-bold transition"
                         title="Decrease Columns"
                       >-</button>
                       <input 
                         type="number" 
                         value={inputCols} 
                         onChange={e => setInputCols(e.target.value)}
                         onBlur={() => requestColsChange(inputCols)}
                         onKeyDown={e => { if (e.key === 'Enter') requestColsChange(inputCols); }}
                         className="w-10 text-center text-xs outline-none bg-transparent font-mono font-bold text-ink-900" 
                       />
                       <button 
                         onClick={() => requestColsChange(gridCols + 1)} 
                         className="px-2 hover:bg-ink-900/10 cursor-pointer text-ink-800 font-bold transition"
                         title="Increase Columns"
                       >+</button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] text-ink-600 font-mono font-bold drop-shadow-sm">ROWS (Y)</label>
                    <div className="flex items-center border border-ink-400/50 rounded bg-transparent">
                       <button 
                         onClick={() => requestRowsChange(gridRows - 1)} 
                         className="px-2 hover:bg-ink-900/10 cursor-pointer text-ink-800 font-bold transition"
                         title="Decrease Rows"
                       >-</button>
                       <input 
                         type="number" 
                         value={inputRows} 
                         onChange={e => setInputRows(e.target.value)}
                         onBlur={() => requestRowsChange(inputRows)}
                         onKeyDown={e => { if (e.key === 'Enter') requestRowsChange(inputRows); }}
                         className="w-10 text-center text-xs outline-none bg-transparent font-mono font-bold text-ink-900" 
                       />
                       <button 
                         onClick={() => requestRowsChange(gridRows + 1)} 
                         className="px-2 hover:bg-ink-900/10 cursor-pointer text-ink-800 font-bold transition"
                         title="Increase Rows"
                       >+</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <canvas 
              ref={canvasRef} 
              width={720} 
              height={450} 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={handleCanvasClick}
              onWheel={handleWheel}
              onMouseLeave={() => { setIsDragging(false); setHoveredCell(null); setHoveredAction(null); setTooltipPos(prev => ({ ...prev, visible: false })); }}
              className={`w-full h-full ${isDragging ? 'cursor-grabbing' : (hoveredCell || hoveredAction) ? 'cursor-pointer' : 'cursor-grab'}`}
            />

            {tooltipPos.visible && (
              <div 
                className="absolute z-20 bg-ink-900 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
                style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
              >
                {tooltipPos.text}
              </div>
            )}
          </div>

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
              <span>{editMode ? 'Edit Mode Active: Click cells to Add/Remove Bins or use arrows to expand grid' : 'Click & Drag to Move Floor • Scroll to Zoom'}</span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs bg-paper p-3 rounded-lg border border-ink-100 shadow-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-grain-600" />
              <span className="font-bold text-ink-800">Location:</span>
              <select 
                value={activeWarehouse} 
                onChange={(e) => setActiveWarehouse(e.target.value)}
                className="bg-husk border border-ink-200 rounded-md px-2 py-1.5 text-ink-800 outline-none focus:border-grain-500 font-medium cursor-pointer"
              >
                <option value="NFA Warehouse #4 - Quezon City Hub">Warehouse #4 - QC Hub</option>
                <option value="NFA Warehouse #1 - Manila">Warehouse #1 - Manila</option>
                <option value="NFA Warehouse #2 - Cebu">Warehouse #2 - Cebu</option>
              </select>
            </div>
            
            <div className="w-px h-6 bg-ink-200 hidden sm:block"></div>
            
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-grain-600" />
              <span className="font-bold text-ink-800">Layout Preset:</span>
              <select 
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="bg-husk border border-ink-200 rounded-md px-2 py-1.5 text-ink-800 outline-none focus:border-grain-500 font-medium cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Load Preset...</option>
                {presets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* Save Preset Button when edit layout is active */}
              {editMode && (
                <button
                  onClick={() => setShowSavePresetModal(true)}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md font-bold text-xs transition border cursor-pointer bg-grain-500 text-white border-grain-500 hover:bg-grain-600 shadow-sm ml-1"
                  title="Save current layout as a reusable preset"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save Preset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-paper border border-ink-100 rounded-xl p-5 space-y-5 shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <div>
              <span className="font-mono text-xs text-grain-600 font-bold uppercase tracking-wider">
                {activeSelectedNode.id} &bull; {activeSelectedNode.zone}
              </span>
              <h3 className="font-display text-base font-bold text-ink-900">{activeSelectedNode.name}</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              activeSelectedNode.status === 'Critical' ? 'bg-critical/10 text-critical border border-critical/30' :
              activeSelectedNode.status === 'Moderate' ? 'bg-moderate/10 text-moderate border border-moderate/30' :
              'bg-safe/10 text-safe border border-safe/30'
            }`}>
              {activeSelectedNode.status === 'Critical' ? 'Action Needed' : activeSelectedNode.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-husk p-3 rounded-lg border border-ink-100">
              <div className="flex items-center space-x-1.5 text-ink-400 text-xs mb-1">
                <Flame className="w-3.5 h-3.5 text-moderate" />
                <span>Pest Threat Score</span>
              </div>
              <div className="font-display text-xl font-bold text-ink-900">
                {activeSelectedNode.infestationLevel}%
              </div>
              <div className="w-full bg-ink-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    activeSelectedNode.infestationLevel > 70 ? 'bg-critical' :
                    activeSelectedNode.infestationLevel > 40 ? 'bg-moderate' : 'bg-safe'
                  }`}
                  style={{ width: `${activeSelectedNode.infestationLevel}%` }}
                />
              </div>
            </div>

            <div className="bg-husk p-3 rounded-lg border border-ink-100">
              <div className="flex items-center space-x-1.5 text-ink-400 text-xs mb-1">
                <Volume2 className="w-3.5 h-3.5 text-safe" />
                <span>Sound Frequency</span>
              </div>
              <div className="font-display text-xl font-bold text-safe">
                {activeSelectedNode.peakFreqHz > 1000 ? `${(activeSelectedNode.peakFreqHz/1000).toFixed(1)} kHz` : `${activeSelectedNode.peakFreqHz} Hz`}
              </div>
              <div className="text-[10px] text-ink-400 mt-1 font-mono">
                {activeSelectedNode.peakFreqHz >= 3000 ? 'Bukbok Chewing' : activeSelectedNode.peakFreqHz > 0 ? 'Normal Ambient' : 'No Acoustic Sensor'}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs bg-husk p-3.5 rounded-lg border border-ink-100 font-mono">
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-400">Sensor Insertion Depth:</span>
              <span className="text-ink-800 font-semibold">{activeSelectedNode.depthCm} cm deep in stack</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-400">Temp &amp; Air Moisture:</span>
              <span className="text-ink-800 font-semibold">{activeSelectedNode.temperature}&deg;C &bull; {activeSelectedNode.humidity}% RH</span>
            </div>
            <div className="flex justify-between py-1 border-b border-ink-100">
              <span className="text-ink-400">Wireless Signal:</span>
              <span className="text-ink-800 font-semibold">{activeSelectedNode.rssi ? `${activeSelectedNode.rssi} dBm (Good)` : '0 dBm (No Hardware Sensor)'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-400">Est. Insects / Sack:</span>
              <span className={`font-bold ${activeSelectedNode.weevilCountEst > 20 ? 'text-critical' : 'text-ink-800'}`}>
                ~{activeSelectedNode.weevilCountEst} active / sack
              </span>
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-semibold text-ink-400 uppercase tracking-wider block mb-2">
              Quick Select Bin Stack ({uniqueZones.length} Bins):
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {uniqueZones.map(zone => {
                const zoneNode = (nodes || []).find(n => n && n.zone === zone);
                const isSelected = selectedZone === zone;
                const isCrit = zoneNode?.status === 'Critical';
                const isMod = zoneNode?.status === 'Moderate';

                return (
                  <button
                    key={zone}
                    onClick={() => {
                      setSelectedZone(zone);
                      if (zoneNode) setSelectedNodeId(zoneNode.id);
                    }}
                    className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold border text-center transition cursor-pointer ${
                      isSelected 
                        ? 'bg-grain-500 text-white border-grain-500 shadow-card' 
                        : isCrit
                        ? 'bg-critical/10 text-critical border-critical/30 hover:bg-critical/20'
                        : isMod
                        ? 'bg-moderate/10 text-moderate border-moderate/30 hover:bg-moderate/20'
                        : 'bg-husk text-ink-800 border-ink-100 hover:bg-paper'
                    }`}
                  >
                    {zone}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function isoToScreen(x, y, z, originX, originY, scale, panX = 0, panY = 0, rotDeg = 0) {
  let rx = x;
  let ry = y;
  if (rotDeg === 90) {
    rx = -y; ry = x;
  } else if (rotDeg === 180) {
    rx = -x; ry = -y;
  } else if (rotDeg === 270) {
    rx = y; ry = -x;
  }

  const tileW = 34 * scale;
  const tileH = 17 * scale;
  const screenX = originX + panX + (rx - ry) * tileW;
  const screenY = originY + panY + (rx + ry) * tileH - z * (26 * scale);
  return { x: screenX, y: screenY };
}

function drawIsoBlock(ctx, x, y, z, w, h, depthZ, colors, originX, originY, scale, label, isHighlighted, panX = 0, panY = 0, rotDeg = 0) {
  const p1 = isoToScreen(x, y, z + depthZ, originX, originY, scale, panX, panY, rotDeg);
  const p2 = isoToScreen(x + w, y, z + depthZ, originX, originY, scale, panX, panY, rotDeg);
  const p3 = isoToScreen(x + w, y + h, z + depthZ, originX, originY, scale, panX, panY, rotDeg);
  const p4 = isoToScreen(x, y + h, z + depthZ, originX, originY, scale, panX, panY, rotDeg);

  const b1 = isoToScreen(x, y, z, originX, originY, scale, panX, panY, rotDeg);
  const b2 = isoToScreen(x + w, y, z, originX, originY, scale, panX, panY, rotDeg);
  const b3 = isoToScreen(x + w, y + h, z, originX, originY, scale, panX, panY, rotDeg);
  const b4 = isoToScreen(x, y + h, z, originX, originY, scale, panX, panY, rotDeg);

  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = isHighlighted ? '#3B82F6' : '#FFFFFF';
  ctx.lineWidth = isHighlighted ? 3 : 1;
  ctx.stroke();

  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(b3.x, b3.y);
  ctx.lineTo(b4.x, b4.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(b2.x, b2.y);
  ctx.lineTo(b3.x, b3.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (label) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(label, p1.x - 4, p1.y + 12);
  }
}

function drawExpandButton(ctx, x, y, isHovered, zoom) {
  const r = 16 * zoom;
  ctx.fillStyle = isHovered ? '#1E8E5A' : '#E7E4DE';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = isHovered ? '#125B37' : '#C1BCB1';
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  ctx.fillStyle = isHovered ? '#FFFFFF' : '#666666';
  ctx.font = `bold ${18 * zoom}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+', x, y + (1 * zoom));
}
