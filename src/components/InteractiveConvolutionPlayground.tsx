import React, { useState } from 'react';
import { SOBEL_KX, SOBEL_KY, rgbToGrayscaleBT601 } from '../utils/sobelEngine';
import { Cpu, RefreshCw, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface PixelRGB {
  r: number;
  g: number;
  b: number;
}

export const InteractiveConvolutionPlayground: React.FC = () => {
  // 3x3 patch state
  const [pixels, setPixels] = useState<PixelRGB[][]>([
    [{ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 0, g: 130, b: 0 }],
    [{ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 0, g: 130, b: 0 }],
    [{ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 0, g: 130, b: 0 }]
  ]);

  const [activeChannel, setActiveChannel] = useState<'r' | 'g' | 'b' | 'gray'>('gray');

  // Presets
  const loadPreset = (preset: string) => {
    if (preset === 'isoluminant') {
      // Pure Red (255, 0, 0) vs Green (0, 130, 0) - BT.601 luminance ~ 76.3
      setPixels([
        [{ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 0, g: 130, b: 0 }],
        [{ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 0, g: 130, b: 0 }],
        [{ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 0, g: 130, b: 0 }]
      ]);
    } else if (preset === 'vertical-gray') {
      // Black to White vertical edge
      setPixels([
        [{ r: 20, g: 20, b: 20 }, { r: 20, g: 20, b: 20 }, { r: 220, g: 220, b: 220 }],
        [{ r: 20, g: 20, b: 20 }, { r: 20, g: 20, b: 20 }, { r: 220, g: 220, b: 220 }],
        [{ r: 20, g: 20, b: 20 }, { r: 20, g: 20, b: 20 }, { r: 220, g: 220, b: 220 }]
      ]);
    } else if (preset === 'horizontal-step') {
      // Horizontal color edge (Yellow top, Blue bottom)
      setPixels([
        [{ r: 230, g: 230, b: 30 }, { r: 230, g: 230, b: 30 }, { r: 230, g: 230, b: 30 }],
        [{ r: 230, g: 230, b: 30 }, { r: 230, g: 230, b: 30 }, { r: 230, g: 230, b: 30 }],
        [{ r: 30, g: 60, b: 220 }, { r: 30, g: 60, b: 220 }, { r: 30, g: 60, b: 220 }]
      ]);
    } else if (preset === 'diagonal-corner') {
      // Diagonal corner
      setPixels([
        [{ r: 240, g: 50, b: 50 }, { r: 240, g: 50, b: 50 }, { r: 30, g: 180, b: 220 }],
        [{ r: 240, g: 50, b: 50 }, { r: 30, g: 180, b: 220 }, { r: 30, g: 180, b: 220 }],
        [{ r: 30, g: 180, b: 220 }, { r: 30, g: 180, b: 220 }, { r: 30, g: 180, b: 220 }]
      ]);
    } else if (preset === 'flat') {
      // Flat uniform color
      setPixels([
        [{ r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }],
        [{ r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }],
        [{ r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }, { r: 120, g: 120, b: 120 }]
      ]);
    }
  };

  const updatePixel = (rIdx: number, cIdx: number, channel: 'r' | 'g' | 'b', value: number) => {
    const val = Math.max(0, Math.min(255, value));
    const next = pixels.map((row, ri) =>
      row.map((col, ci) => {
        if (ri === rIdx && ci === cIdx) {
          return { ...col, [channel]: val };
        }
        return col;
      })
    );
    setPixels(next);
  };

  // Extract channel matrices
  const rMat = pixels.map(row => row.map(p => p.r));
  const gMat = pixels.map(row => row.map(p => p.g));
  const bMat = pixels.map(row => row.map(p => p.b));
  const grayMat = pixels.map(row => row.map(p => rgbToGrayscaleBT601(p.r, p.g, p.b)));

  // Convolution helper for 3x3 center pixel
  const convolveCenter = (mat: number[][], kernel: number[][]) => {
    let sum = 0;
    const terms: { k: number; p: number; prod: number }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const k = kernel[r][c];
        const p = mat[r][c];
        const prod = k * p;
        sum += prod;
        terms.push({ k, p, prod });
      }
    }
    return { sum, terms };
  };

  // Calculations
  const rGx = convolveCenter(rMat, SOBEL_KX);
  const rGy = convolveCenter(rMat, SOBEL_KY);
  const rMag = Math.sqrt(rGx.sum * rGx.sum + rGy.sum * rGy.sum);

  const gGx = convolveCenter(gMat, SOBEL_KX);
  const gGy = convolveCenter(gMat, SOBEL_KY);
  const gMag = Math.sqrt(gGx.sum * gGx.sum + gGy.sum * gGy.sum);

  const bGx = convolveCenter(bMat, SOBEL_KX);
  const bGy = convolveCenter(bMat, SOBEL_KY);
  const bMag = Math.sqrt(bGx.sum * bGx.sum + bGy.sum * bGy.sum);

  const grayGx = convolveCenter(grayMat, SOBEL_KX);
  const grayGy = convolveCenter(grayMat, SOBEL_KY);
  const grayMag = Math.sqrt(grayGx.sum * grayGx.sum + grayGy.sum * grayGy.sum);

  // Di Zenzo Tensor
  const gxx = rGx.sum * rGx.sum + gGx.sum * gGx.sum + bGx.sum * bGx.sum;
  const gyy = rGy.sum * rGy.sum + gGy.sum * gGy.sum + bGy.sum * bGy.sum;
  const gxy = rGx.sum * rGy.sum + gGx.sum * gGy.sum + bGx.sum * bGy.sum;

  const disc = Math.sqrt((gxx - gyy) * (gxx - gyy) + 4 * gxy * gxy);
  const lambdaMax = 0.5 * (gxx + gyy + disc);
  const diZenzoMag = Math.sqrt(lambdaMax / 3);
  const diZenzoDir = (0.5 * Math.atan2(2 * gxy, gxx - gyy) * 180) / Math.PI;

  // Euclidean & Max
  const euclideanMag = Math.sqrt((rMag * rMag + gMag * gMag + bMag * bMag) / 3);
  const maxMag = Math.max(rMag, gMag, bMag);

  const activeChannelData = 
    activeChannel === 'r' ? { name: 'Red Channel', mat: rMat, gx: rGx, gy: rGy, mag: rMag } :
    activeChannel === 'g' ? { name: 'Green Channel', mat: gMat, gx: gGx, gy: gGy, mag: gMag } :
    activeChannel === 'b' ? { name: 'Blue Channel', mat: bMat, gx: bGx, gy: bGy, mag: bMag } :
    { name: 'BT.601 Grayscale (Y = 0.299R + 0.587G + 0.114B)', mat: grayMat, gx: grayGx, gy: grayGy, mag: grayMag };

  const isIsoluminantFailure = diZenzoMag > 60 && grayMag < 10;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
              <Cpu className="w-4 h-4" />
              <span>Interactive Kernel & Tensor Sandbox</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">3×3 Sobel Convolution & Di Zenzo Tensor Simulator</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Directly edit pixel RGB numbers or load test cases to inspect manual convolution arithmetic, metric tensors, and eigenvalues live.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Presets:</span>
            <button
              onClick={() => loadPreset('isoluminant')}
              className="px-2.5 py-1 text-xs rounded-lg bg-red-950/80 text-red-300 border border-red-800/80 hover:bg-red-900 transition-all font-medium cursor-pointer"
            >
              Isoluminant Red-Green
            </button>
            <button
              onClick={() => loadPreset('vertical-gray')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all font-medium cursor-pointer"
            >
              Vertical Edge
            </button>
            <button
              onClick={() => loadPreset('horizontal-step')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all font-medium cursor-pointer"
            >
              Horizontal Step
            </button>
            <button
              onClick={() => loadPreset('diagonal-corner')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all font-medium cursor-pointer"
            >
              Diagonal
            </button>
            <button
              onClick={() => loadPreset('flat')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all font-medium cursor-pointer"
            >
              Flat
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3x3 Pixel Patch Editor (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">3×3 Pixel Matrix</h3>
            <span className="text-[11px] text-slate-400">Click & edit R, G, B [0-255]</span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            {pixels.map((row, rIdx) =>
              row.map((pixel, cIdx) => {
                const grayVal = rgbToGrayscaleBT601(pixel.r, pixel.g, pixel.b);
                const isCenter = rIdx === 1 && cIdx === 1;
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`rounded-xl p-2 flex flex-col justify-between transition-all border ${
                      isCenter
                        ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/10'
                        : 'border-slate-800'
                    }`}
                    style={{
                      backgroundColor: `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`,
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono px-1 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs mb-1.5">
                      <span>({rIdx},{cIdx})</span>
                      {isCenter && <span className="text-cyan-300 font-bold uppercase">Center</span>}
                    </div>

                    <div className="space-y-1 bg-black/80 backdrop-blur-xs p-1.5 rounded-lg text-[11px] font-mono">
                      <div className="flex items-center justify-between text-red-400">
                        <span>R:</span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={pixel.r}
                          onChange={(e) => updatePixel(rIdx, cIdx, 'r', parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-red-900/60 rounded px-1 text-right text-white font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>G:</span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={pixel.g}
                          onChange={(e) => updatePixel(rIdx, cIdx, 'g', parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-emerald-900/60 rounded px-1 text-right text-white font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between text-blue-400">
                        <span>B:</span>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={pixel.b}
                          onChange={(e) => updatePixel(rIdx, cIdx, 'b', parseInt(e.target.value) || 0)}
                          className="w-12 bg-slate-900 border border-blue-900/60 rounded px-1 text-right text-white font-bold"
                        />
                      </div>
                      <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-300 flex justify-between">
                        <span>Y (Gray):</span>
                        <span className="font-bold text-amber-300">{grayVal.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick channel tabs */}
          <div className="flex items-center space-x-1 pt-2">
            {(['gray', 'r', 'g', 'b'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                  activeChannel === ch
                    ? ch === 'r' ? 'bg-red-600 text-white' :
                      ch === 'g' ? 'bg-emerald-600 text-white' :
                      ch === 'b' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ch === 'gray' ? 'Grayscale Y' : `${ch.toUpperCase()} Channel`}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Step-by-Step Convolution & Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Edge Detection Comparison Alert */}
          {isIsoluminantFailure ? (
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl flex items-start space-x-3 text-red-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">⚠️ Isoluminance Collapse Detected!</span>
                <p className="text-xs text-red-300 mt-0.5 leading-relaxed">
                  Traditional Grayscale Sobel magnitude is <strong>{grayMag.toFixed(1)}</strong> (virtually 0, missed edge!).
                  Meanwhile, Multi-Channel Di Zenzo Sobel detects a massive magnitude of <strong>{diZenzoMag.toFixed(1)}</strong>!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
              <span>Both algorithms detect valid gradients on this patch.</span>
              <span className="text-cyan-400 font-mono">Di Zenzo: {diZenzoMag.toFixed(1)} | Gray: {grayMag.toFixed(1)}</span>
            </div>
          )}

          {/* Detailed Calculations for Active Channel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-cyan-300">
                Convolution Math for: <span className="text-white">{activeChannelData.name}</span>
              </h4>
              <span className="font-mono text-xs text-slate-400">
                Gx = <strong className="text-cyan-300">{activeChannelData.gx.sum.toFixed(1)}</strong> | 
                Gy = <strong className="text-cyan-300 ml-1">{activeChannelData.gy.sum.toFixed(1)}</strong>
              </span>
            </div>

            {/* Arithmetic product walkthrough */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="text-cyan-400 font-bold flex items-center justify-between">
                  <span>Horizontal Gradient Gx</span>
                  <span>∑ (Kx · P) = {activeChannelData.gx.sum.toFixed(1)}</span>
                </div>
                <div className="text-[11px] text-slate-400 max-h-28 overflow-y-auto space-y-0.5">
                  {activeChannelData.gx.terms.filter(t => t.k !== 0).map((t, i) => (
                    <div key={i} className="flex justify-between">
                      <span>({t.k > 0 ? `+${t.k}` : t.k} × {t.p.toFixed(0)})</span>
                      <span className={t.prod > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {t.prod > 0 ? `+${t.prod.toFixed(1)}` : t.prod.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="text-cyan-400 font-bold flex items-center justify-between">
                  <span>Vertical Gradient Gy</span>
                  <span>∑ (Ky · P) = {activeChannelData.gy.sum.toFixed(1)}</span>
                </div>
                <div className="text-[11px] text-slate-400 max-h-28 overflow-y-auto space-y-0.5">
                  {activeChannelData.gy.terms.filter(t => t.k !== 0).map((t, i) => (
                    <div key={i} className="flex justify-between">
                      <span>({t.k > 0 ? `+${t.k}` : t.k} × {t.p.toFixed(0)})</span>
                      <span className={t.prod > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {t.prod > 0 ? `+${t.prod.toFixed(1)}` : t.prod.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Magnitude & Orientation Output */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400">Gradient Magnitude:</span>
                <div className="text-base font-bold text-white mt-0.5">
                  √({activeChannelData.gx.sum.toFixed(1)}² + {activeChannelData.gy.sum.toFixed(1)}²) ={' '}
                  <span className="text-cyan-400">{activeChannelData.mag.toFixed(1)}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Orientation θ:</span>
                <div className="text-base font-bold text-white mt-0.5">
                  atan2(Gy, Gx) ={' '}
                  <span className="text-cyan-400">
                    {((Math.atan2(activeChannelData.gy.sum, activeChannelData.gx.sum) * 180) / Math.PI).toFixed(1)}°
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Di Zenzo Tensor Output Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-900/40 rounded-2xl p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2">
              <span className="text-sm font-bold text-indigo-300">Di Zenzo Metric Tensor JᵀJ</span>
              <span className="text-[11px] text-indigo-400">First Fundamental Form</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-indigo-950">
                <div className="text-[10px] text-slate-400">g_xx (Rx² + Gx² + Bx²)</div>
                <div className="text-sm font-bold text-cyan-300 mt-1">{gxx.toFixed(0)}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-indigo-950">
                <div className="text-[10px] text-slate-400">g_yy (Ry² + Gy² + By²)</div>
                <div className="text-sm font-bold text-cyan-300 mt-1">{gyy.toFixed(0)}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-indigo-950">
                <div className="text-[10px] text-slate-400">g_xy (RxRy + GxGy + BxBy)</div>
                <div className="text-sm font-bold text-cyan-300 mt-1">{gxy.toFixed(0)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Di Zenzo Tensor Mag:</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">{diZenzoMag.toFixed(1)}</div>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Euclidean Norm Mag:</span>
                <div className="text-base font-bold text-indigo-400 mt-0.5">{euclideanMag.toFixed(1)}</div>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Channel Max Mag:</span>
                <div className="text-base font-bold text-amber-400 mt-0.5">{maxMag.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
