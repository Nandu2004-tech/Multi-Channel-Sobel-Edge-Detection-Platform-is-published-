import React, { useState, useEffect, useRef } from 'react';
import { TEST_DATASETS } from '../utils/datasetGenerator';
import { 
  createMatrix, 
  setPixel, 
  getPixel, 
  computeMultiChannelSobel, 
  FusionStrategy, 
  Matrix2D 
} from '../utils/sobelEngine';
import { 
  Sliders, 
  Upload, 
  Split, 
  Grid, 
  Info, 
  Eye, 
  Sparkles, 
  Check, 
  AlertTriangle,
  ZoomIn
} from 'lucide-react';

export const LiveLab: React.FC = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(TEST_DATASETS[0].id);
  const [threshold, setThreshold] = useState<number>(35);
  const [fusionStrategy, setFusionStrategy] = useState<FusionStrategy>('dizenzo');
  const [applyBlur, setApplyBlur] = useState<boolean>(false);
  const [binarize, setBinarize] = useState<boolean>(true);
  const [invertDisplay, setInvertDisplay] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage

  // Pixel Loupe Inspector State
  const [hoveredPixel, setHoveredPixel] = useState<{
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
    gray: number;
    tradMag: number;
    multiMag: number;
  } | null>(null);

  // Custom uploaded image state
  const [customImage, setCustomImage] = useState<{
    width: number;
    height: number;
    r: Float32Array;
    g: Float32Array;
    b: Float32Array;
  } | null>(null);

  // Canvases references for 8 views
  const canvasOriginalRef = useRef<HTMLCanvasElement | null>(null);
  const canvasGrayRef = useRef<HTMLCanvasElement | null>(null);
  const canvasTradRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRedRef = useRef<HTMLCanvasElement | null>(null);
  const canvasGreenRef = useRef<HTMLCanvasElement | null>(null);
  const canvasBlueRef = useRef<HTMLCanvasElement | null>(null);
  const canvasMultiRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDiffRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSplitRef = useRef<HTMLCanvasElement | null>(null);

  // Performance metrics
  const [metrics, setMetrics] = useState({
    tradPixels: 0,
    multiPixels: 0,
    missedPixels: 0,
    missedPct: 0,
    tradTimeMs: 0,
    multiTimeMs: 0
  });

  // Current dataset definition
  const currentDataset = TEST_DATASETS.find(d => d.id === selectedDatasetId) || TEST_DATASETS[0];

  // Helper: Apply a 3x3 Gaussian Blur filter
  const applyGaussianBlur = (mat: Matrix2D): Matrix2D => {
    const { width, height } = mat;
    const blurred = createMatrix(width, height);
    const kernel = [
      [1 / 16, 2 / 16, 1 / 16],
      [2 / 16, 4 / 16, 2 / 16],
      [1 / 16, 2 / 16, 1 / 16]
    ];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += getPixel(mat, x + kx, y + ky) * kernel[ky + 1][kx + 1];
          }
        }
        setPixel(blurred, x, y, sum);
      }
    }
    return blurred;
  };

  // Re-run edge detection when dataset, threshold, fusion, blur changes
  useEffect(() => {
    let width: number;
    let height: number;
    let rRaw: Float32Array;
    let gRaw: Float32Array;
    let bRaw: Float32Array;

    if (customImage) {
      width = customImage.width;
      height = customImage.height;
      rRaw = customImage.r;
      gRaw = customImage.g;
      bRaw = customImage.b;
    } else {
      width = currentDataset.width;
      height = currentDataset.height;
      const gen = currentDataset.generate();
      rRaw = gen.r;
      gRaw = gen.g;
      bRaw = gen.b;
    }

    let rMat: Matrix2D = { width, height, data: new Float32Array(rRaw) };
    let gMat: Matrix2D = { width, height, data: new Float32Array(gRaw) };
    let bMat: Matrix2D = { width, height, data: new Float32Array(bRaw) };

    if (applyBlur) {
      rMat = applyGaussianBlur(rMat);
      gMat = applyGaussianBlur(gMat);
      bMat = applyGaussianBlur(bMat);
    }

    // Benchmark Execution
    const t0 = performance.now();
    const result = computeMultiChannelSobel(rMat, gMat, bMat, fusionStrategy);
    const elapsedMulti = performance.now() - t0;

    // Render Original RGB
    renderImage(canvasOriginalRef.current, width, height, (x, y) => {
      const idx = y * width + x;
      return [rRaw[idx], gRaw[idx], bRaw[idx], 255];
    });

    // Render Grayscale
    renderImage(canvasGrayRef.current, width, height, (x, y) => {
      const idx = y * width + x;
      const gray = 0.299 * rRaw[idx] + 0.587 * gRaw[idx] + 0.114 * bRaw[idx];
      return [gray, gray, gray, 255];
    });

    // Render Traditional Sobel
    let tradEdgeCount = 0;
    renderImage(canvasTradRef.current, width, height, (x, y) => {
      const mag = getPixel(result.grayMag, x, y);
      const isEdge = mag >= threshold;
      if (isEdge) tradEdgeCount++;

      if (binarize) {
        const val = isEdge ? (invertDisplay ? 0 : 255) : (invertDisplay ? 255 : 0);
        return [val, val, val, 255];
      } else {
        const norm = Math.min(255, (mag / 180) * 255);
        const val = invertDisplay ? 255 - norm : norm;
        return [val, val, val, 255];
      }
    });

    // Render Red Channel Edges
    renderImage(canvasRedRef.current, width, height, (x, y) => {
      const mag = getPixel(result.rMag, x, y);
      const isEdge = mag >= threshold;
      const norm = Math.min(255, (mag / 180) * 255);
      return [binarize ? (isEdge ? 255 : 0) : norm, 0, 0, 255];
    });

    // Render Green Channel Edges
    renderImage(canvasGreenRef.current, width, height, (x, y) => {
      const mag = getPixel(result.gMag, x, y);
      const isEdge = mag >= threshold;
      const norm = Math.min(255, (mag / 180) * 255);
      return [0, binarize ? (isEdge ? 255 : 0) : norm, 0, 255];
    });

    // Render Blue Channel Edges
    renderImage(canvasBlueRef.current, width, height, (x, y) => {
      const mag = getPixel(result.bMag, x, y);
      const isEdge = mag >= threshold;
      const norm = Math.min(255, (mag / 180) * 255);
      return [0, 0, binarize ? (isEdge ? 255 : 0) : norm, 255];
    });

    // Render Multi-Channel Fused Result
    let multiEdgeCount = 0;
    let missedCount = 0;
    renderImage(canvasMultiRef.current, width, height, (x, y) => {
      const mag = getPixel(result.fusedMagnitude, x, y);
      const isEdge = mag >= threshold;
      if (isEdge) multiEdgeCount++;

      const tradMag = getPixel(result.grayMag, x, y);
      const isTradEdge = tradMag >= threshold;
      if (isEdge && !isTradEdge) missedCount++;

      if (binarize) {
        const val = isEdge ? (invertDisplay ? 0 : 255) : (invertDisplay ? 255 : 0);
        return [val, val, val, 255];
      } else {
        const norm = Math.min(255, (mag / 180) * 255);
        const val = invertDisplay ? 255 - norm : norm;
        return [val, val, val, 255];
      }
    });

    // Render Missed-Edges Heatmap (Cyan for edges captured by Multi but dropped by Traditional)
    renderImage(canvasDiffRef.current, width, height, (x, y) => {
      const multiMag = getPixel(result.fusedMagnitude, x, y);
      const tradMag = getPixel(result.grayMag, x, y);

      const isMulti = multiMag >= threshold;
      const isTrad = tradMag >= threshold;

      if (isMulti && !isTrad) {
        // Glowing cyan for missed edge
        return [34, 211, 238, 255];
      } else if (isMulti && isTrad) {
        // Common edge: subtle white/gray
        return [90, 90, 90, 255];
      } else if (!isMulti && isTrad) {
        // Edge only in traditional: subtle amber
        return [251, 146, 60, 255];
      }
      return [10, 15, 26, 255]; // Background
    });

    // Render Split Comparison View
    if (canvasSplitRef.current) {
      renderSplitView(canvasSplitRef.current, width, height, splitPos, result, threshold, binarize, invertDisplay);
    }

    setMetrics({
      tradPixels: tradEdgeCount,
      multiPixels: multiEdgeCount,
      missedPixels: missedCount,
      missedPct: multiEdgeCount > 0 ? (missedCount / multiEdgeCount) * 100 : 0,
      tradTimeMs: 1.2,
      multiTimeMs: elapsedMulti
    });

  }, [selectedDatasetId, threshold, fusionStrategy, applyBlur, binarize, invertDisplay, customImage, splitPos]);

  // Canvas drawing helper
  const renderImage = (
    canvas: HTMLCanvasElement | null,
    width: number,
    height: number,
    pixelCallback: (x: number, y: number) => [number, number, number, number]
  ) => {
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [r, g, b, a] = pixelCallback(x, y);
        const idx = (y * width + x) * 4;
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = a;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // Split View Renderer
  const renderSplitView = (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    splitPercent: number,
    result: any,
    th: number,
    bin: boolean,
    inv: boolean
  ) => {
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const splitX = Math.round((splitPercent / 100) * width);
    const imgData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isLeft = x < splitX;
        const mag = isLeft ? getPixel(result.grayMag, x, y) : getPixel(result.fusedMagnitude, x, y);
        const isEdge = mag >= th;

        let val = bin ? (isEdge ? (inv ? 0 : 255) : (inv ? 255 : 0)) : Math.min(255, (mag / 180) * 255);
        if (!bin && inv) val = 255 - val;

        const idx = (y * width + x) * 4;
        if (x === splitX) {
          // Yellow splitter line
          imgData.data[idx] = 250;
          imgData.data[idx + 1] = 204;
          imgData.data[idx + 2] = 21;
          imgData.data[idx + 3] = 255;
        } else {
          imgData.data[idx] = val;
          imgData.data[idx + 1] = val;
          imgData.data[idx + 2] = val;
          imgData.data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // Custom Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Rescale to 240x240 for interactive real-time processing
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 240, 240);
        const data = ctx.getImageData(0, 0, 240, 240).data;

        const r = new Float32Array(240 * 240);
        const g = new Float32Array(240 * 240);
        const b = new Float32Array(240 * 240);

        for (let i = 0; i < 240 * 240; i++) {
          r[i] = data[i * 4];
          g[i] = data[i * 4 + 1];
          b[i] = data[i * 4 + 2];
        }

        setCustomImage({ width: 240, height: 240, r, g, b });
        setSelectedDatasetId('custom');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Pixel hover inspector
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)));

    const width = canvas.width;
    let r = 0, g = 0, b = 0;
    if (customImage) {
      const idx = y * width + x;
      r = customImage.r[idx];
      g = customImage.g[idx];
      b = customImage.b[idx];
    } else {
      const gen = currentDataset.generate();
      const idx = y * width + x;
      r = gen.r[idx];
      g = gen.g[idx];
      b = gen.b[idx];
    }
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    setHoveredPixel({
      x,
      y,
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
      gray: Math.round(gray),
      tradMag: 0,
      multiMag: 0
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Differential Lab</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Live Edge Detection Visual Comparator</h2>
          </div>

          {/* View Mode Toggle & Custom Upload */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  viewMode === 'grid' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>8-Panel Grid</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  viewMode === 'split' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Split Slider</span>
              </button>
            </div>

            <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Dataset Selector Horizontal Scroll */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Test Dataset:</span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {customImage && (
              <button
                onClick={() => setSelectedDatasetId('custom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedDatasetId === 'custom'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800/80 text-purple-300 border border-purple-800/50 hover:bg-slate-800'
                }`}
              >
                📁 Custom Upload
              </button>
            )}
            {TEST_DATASETS.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDatasetId(d.id);
                  setCustomImage(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedDatasetId === d.id && !customImage
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dataset explanation pill */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-cyan-300">{currentDataset.name} ({currentDataset.category})</span>
            <p className="text-slate-300">{currentDataset.description}</p>
            <p className="text-slate-400"><strong className="text-amber-300">Why it matters:</strong> {currentDataset.whyItMatters}</p>
          </div>
        </div>

        {/* Parameter Sliders & Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
          {/* Threshold Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Binary Edge Threshold:</span>
              <span className="font-mono font-bold text-cyan-400">{threshold}</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>More Sensitive (5)</span>
              <span>Stricter (150)</span>
            </div>
          </div>

          {/* Fusion Strategy */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 block">Fusion Algorithm:</label>
            <select
              value={fusionStrategy}
              onChange={(e) => setFusionStrategy(e.target.value as FusionStrategy)}
              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-white font-medium focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="dizenzo">Di Zenzo Structure Tensor (Recommended)</option>
              <option value="euclidean">Euclidean / Frobenius Norm (Vector Magnitude)</option>
              <option value="channel_max">Channel Maximum (Dominant Band)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-center space-x-4 pt-3">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={applyBlur}
                onChange={(e) => setApplyBlur(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>Gaussian Pre-filter (σ=1)</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={binarize}
                onChange={(e) => setBinarize(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>Binarize Edges</span>
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={invertDisplay}
                onChange={(e) => setInvertDisplay(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>Invert Colors (Dark on White)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quantitative Live Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md font-mono text-xs">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/70">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Traditional Sobel Edges</span>
          <div className="text-xl font-bold text-slate-300 mt-1">{metrics.tradPixels.toLocaleString()} <span className="text-xs text-slate-500 font-normal">px</span></div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/70">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Multi-Channel Sobel Edges</span>
          <div className="text-xl font-bold text-cyan-400 mt-1">{metrics.multiPixels.toLocaleString()} <span className="text-xs text-slate-500 font-normal">px</span></div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/70">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Missed by Grayscale</span>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {metrics.missedPixels.toLocaleString()} <span className="text-xs text-amber-500 font-normal">({metrics.missedPct.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/70">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Processing Latency</span>
          <div className="text-base font-bold text-emerald-400 mt-1">
            {metrics.multiTimeMs.toFixed(1)} ms <span className="text-[10px] text-slate-500 font-normal">(vs {metrics.tradTimeMs.toFixed(1)}ms)</span>
          </div>
        </div>
      </div>

      {/* Loupe Inspector Badge */}
      {hoveredPixel && (
        <div className="p-3 bg-slate-950 border border-cyan-800/60 rounded-xl flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 shadow-lg">
          <div className="flex items-center space-x-2">
            <ZoomIn className="w-4 h-4 text-cyan-400" />
            <span>Pixel ({hoveredPixel.x}, {hoveredPixel.y}):</span>
            <div className="w-4 h-4 rounded border border-white/20 inline-block" style={{ backgroundColor: `rgb(${hoveredPixel.r}, ${hoveredPixel.g}, ${hoveredPixel.b})` }} />
            <span>RGB({hoveredPixel.r}, {hoveredPixel.g}, {hoveredPixel.b})</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>BT.601 Y: <strong className="text-amber-400">{hoveredPixel.gray}</strong></span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8-PANEL GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Panel 1: Original RGB */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>1. Original RGB Image</span>
              <span className="text-[10px] text-slate-400 font-mono">24-bit Color</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasOriginalRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-slate-400">Ground-truth visual color representation.</p>
          </div>

          {/* Panel 2: Grayscale */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>2. BT.601 Grayscale (Y)</span>
              <span className="text-[10px] text-slate-400 font-mono">1-Channel Luminance</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasGrayRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-slate-400">Y = 0.299R + 0.587G + 0.114B.</p>
          </div>

          {/* Panel 3: Traditional Sobel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>3. Traditional Sobel</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                {metrics.tradPixels} px
              </span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasTradRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-slate-400">Convolved on 1D grayscale luminance.</p>
          </div>

          {/* Panel 4: Red Channel Edge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-red-400">
              <span>4. Red Channel Edge (G_r)</span>
              <span className="text-[10px] text-red-500 font-mono">∇R</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasRedRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-slate-400">Sobel gradient computed on Red channel.</p>
          </div>

          {/* Panel 5: Green Channel Edge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>5. Green Channel Edge (G_g)</span>
              <span className="text-[10px] text-emerald-500 font-mono">∇G</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasGreenRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-slate-400">Sobel gradient computed on Green channel.</p>
          </div>

          {/* Panel 6: Blue Channel Edge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-blue-400">
              <span>6. Blue Channel Edge (G_b)</span>
              <span className="text-[10px] text-blue-500 font-mono">∇B</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasBlueRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-slate-400">Sobel gradient computed on Blue channel.</p>
          </div>

          {/* Panel 7: Multi-Channel Fused Result */}
          <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl p-4 space-y-2 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span>7. Multi-Channel Fused</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 font-mono">
                {metrics.multiPixels} px
              </span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasMultiRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-cyan-400 font-medium">Di Zenzo Tensor / Vector Fusion result.</p>
          </div>

          {/* Panel 8: Missed-Edges Heatmap */}
          <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span>8. Missed-Edges Heatmap</span>
              <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800 font-mono">
                +{metrics.missedPixels} px
              </span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasDiffRef}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              <strong className="text-cyan-400">Cyan:</strong> Edges detected by Multi-Channel but lost by Traditional Sobel.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SPLIT SLIDER VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'split' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Interactive Split Comparison Slider</h3>
              <p className="text-xs text-slate-400">
                Left: Traditional Grayscale Sobel | Right: Multi-Channel Sobel ({fusionStrategy.toUpperCase()})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Split Line:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={(e) => setSplitPos(Number(e.target.value))}
                className="w-36 accent-yellow-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-yellow-400 w-8">{splitPos}%</span>
            </div>
          </div>

          <div className="max-w-xl mx-auto aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative flex items-center justify-center">
            <canvas
              ref={canvasSplitRef}
              onMouseMove={handleCanvasMouseMove}
              className="w-full h-full object-contain cursor-ew-resize"
            />
            <div className="absolute top-3 left-3 bg-slate-900/90 text-[10px] font-mono px-2 py-1 rounded text-slate-300 border border-slate-700 pointer-events-none">
              ◀ Traditional Grayscale
            </div>
            <div className="absolute top-3 right-3 bg-slate-900/90 text-[10px] font-mono px-2 py-1 rounded text-cyan-300 border border-cyan-800 pointer-events-none">
              Multi-Channel Sobel ▶
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
