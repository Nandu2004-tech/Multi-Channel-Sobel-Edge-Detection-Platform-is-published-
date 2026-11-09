import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { TabId } from '../types/sobel';

interface MentorshipGuideProps {
  onNavigateTab: (tab: TabId) => void;
}

export const MentorshipGuide: React.FC<MentorshipGuideProps> = ({ onNavigateTab }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Mentor Intro Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Technical Mentorship Program</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Multi-Channel Sobel Edge Detection
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Welcome! As your technical mentor, I have structured this curriculum from beginner foundations up to rigorous differential geometry tensor mathematics. Proceed through each pedagogical milestone below.
            </p>
          </div>

          {/* Step Progress Pill */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center min-w-[140px]">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Current Step</span>
            <span className="text-2xl font-bold text-cyan-400">
              {currentStep} <span className="text-slate-500 text-lg">/ {totalSteps}</span>
            </span>
            <span className="text-[11px] text-slate-400 text-center mt-1">
              {currentStep === 1 && "Architecture"}
              {currentStep === 2 && "Fundamentals"}
              {currentStep === 3 && "Mathematical Formulations"}
              {currentStep === 4 && "Algorithm Implementation"}
            </span>
          </div>
        </div>

        {/* Step Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-6 border-t border-slate-800">
          {[
            { step: 1, title: '1. Architecture & Plan' },
            { step: 2, title: '2. CV Fundamentals' },
            { step: 3, title: '3. Math & Tensor Proof' },
            { step: 4, title: '4. Algorithm & Pipeline' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                currentStep === item.step
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : currentStep > item.step
                  ? 'bg-slate-800/60 text-emerald-400 border border-emerald-900/40'
                  : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {currentStep > item.step ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className={`w-3.5 h-3.5 rounded-full text-[10px] flex items-center justify-center font-bold ${currentStep === item.step ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                    {item.step}
                  </span>
                )}
                <span className="truncate">{item.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PROJECT ARCHITECTURE & ROADMAP */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Step 1: Project Architecture & Execution Roadmap</h2>
              <p className="text-xs text-slate-400">High-level structure, workflow differences, and repository organization</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Pipeline Diagram */}
            <div className="bg-slate-950/70 border border-red-950/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Traditional Single-Channel Pipeline</span>
                <span className="text-[10px] bg-red-950/80 text-red-400 px-2 py-0.5 rounded border border-red-800/50">Lossy Compression</span>
              </div>
              <div className="font-mono text-xs text-slate-300 bg-slate-900/90 p-4 rounded-lg border border-slate-800 leading-relaxed space-y-1">
                <div className="text-slate-400">Input: RGB Image (H × W × 3)</div>
                <div className="text-amber-400">  │</div>
                <div className="text-red-400 font-semibold">  ▼ [1. Grayscale BT.601] Y = 0.299R + 0.587G + 0.114B</div>
                <div className="text-red-300 text-[11px] pl-4">⚠️ Loss: 3D color manifold collapsed into 1D scalar!</div>
                <div className="text-amber-400">  │</div>
                <div className="text-slate-200">  ▼ [2. Sobel Convolutions] Gx = Y * Kx, Gy = Y * Ky</div>
                <div className="text-amber-400">  │</div>
                <div className="text-slate-200">  ▼ [3. Gradient Magnitude] M = √(Gx² + Gy²)</div>
                <div className="text-amber-400">  │</div>
                <div className="text-slate-200">  ▼ [4. Binary Thresholding] Edge_Map = (M ≥ Threshold)</div>
              </div>
              <p className="text-xs text-slate-400">
                <strong className="text-red-300">Failure mode:</strong> If two neighboring regions have distinct colors but equal luminance (Y1 = Y2), ∂Y/∂x = 0, causing edges to vanish completely!
              </p>
            </div>

            {/* Proposed Multi-Channel Pipeline */}
            <div className="bg-slate-950/70 border border-emerald-950/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Proposed Multi-Channel Pipeline</span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/50">Zero Information Loss</span>
              </div>
              <div className="font-mono text-xs text-slate-300 bg-slate-900/90 p-4 rounded-lg border border-slate-800 leading-relaxed space-y-1">
                <div className="text-slate-400">Input: RGB Image (H × W × 3)</div>
                <div className="text-cyan-400">  │</div>
                <div className="text-emerald-400 font-semibold">  ▼ [1. Channel Separation] Red (H×W), Green (H×W), Blue (H×W)</div>
                <div className="text-cyan-400">  │</div>
                <div className="text-slate-200">  ▼ [2. Independent Sobel] Rx,Ry, Gx,Gy, Bx,By (6 Convolutions)</div>
                <div className="text-cyan-400">  │</div>
                <div className="text-cyan-300 font-semibold">  ▼ [3. Di Zenzo Tensor Fusion] Metric Tensor JᵀJ & Eigenvalues</div>
                <div className="text-cyan-400">  │</div>
                <div className="text-slate-200">  ▼ [4. Fused Magnitude & Angle] M_fuse = √(λ_max / 3)</div>
                <div className="text-cyan-400">  │</div>
                <div className="text-emerald-300 font-semibold">  ▼ [5. Thresholding] Robust Edge Map (Preserves All Color Edges)</div>
              </div>
              <p className="text-xs text-slate-400">
                <strong className="text-emerald-300">Key Advantage:</strong> Any differential in ANY spectral band contributes constructively to the Riemannian metric tensor, capturing 100% of chromatic edges.
              </p>
            </div>
          </div>

          {/* Professional Repository Structure */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Project Directory Layout</h3>
            <div className="font-mono text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/70">
                <div className="text-cyan-400 font-bold">multi_channel_sobel/</div>
                <div className="pl-4 text-slate-400">├── <span className="text-white">dataset/</span> (10 benchmark test cases)</div>
                <div className="pl-4 text-slate-400">├── <span className="text-white">src/</span></div>
                <div className="pl-8 text-slate-300">├── <span className="text-cyan-300">sobel_multichannel.py</span> (Core library)</div>
                <div className="pl-8 text-slate-300">└── <span className="text-cyan-300">evaluate.py</span> (Metrics & benchmark)</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/70">
                <div className="pl-4 text-slate-400">├── <span className="text-white">notebooks/</span></div>
                <div className="pl-8 text-slate-300">└── <span className="text-yellow-300">tutorial.ipynb</span> (Interactive Colab)</div>
                <div className="pl-4 text-slate-400">├── <span className="text-white">results/</span> (Figures & reports)</div>
                <div className="pl-4 text-slate-400">├── <span className="text-purple-300">requirements.txt</span></div>
                <div className="pl-4 text-slate-400">└── <span className="text-emerald-300">README.md</span></div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              <span>Confirm & Proceed to Step 2: Fundamentals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: FUNDAMENTALS */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Step 2: Computer Vision Fundamentals</h2>
              <p className="text-xs text-slate-400">Everything you need to know from the ground up</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Fundamental 1 */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-cyan-300">1. What is an Image and What is an Edge?</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                In digital computer vision, a 2D grayscale image is a discrete function I(x, y) that maps spatial coordinates (x, y) to an intensity value (typically an 8-bit integer [0, 255]). An <strong>edge</strong> is a localized discontinuity or steep gradient in image intensity. Edges correspond to physical surface boundaries, material changes, shadows, and object contours.
              </p>
            </div>

            {/* Fundamental 2 */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-cyan-300">2. What is the Sobel Operator?</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Developed by Irwin Sobel and Gary Feldman in 1968, the <strong>Sobel operator</strong> is a discrete differentiation operator that computes an approximation of the gradient of the image intensity function. It combines Gaussian smoothing with differential differentiation to reduce high-frequency noise sensitivity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center font-mono text-xs">
                  <div className="text-cyan-400 font-semibold mb-2">Horizontal Kernel Kx (Detects Vertical Edges)</div>
                  <div className="p-2 bg-slate-950 rounded text-slate-200">
                    [-1,  0, +1]<br />
                    [-2,  0, +2]<br />
                    [-1,  0, +1]
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Smoothes vertically with [1, 2, 1]ᵀ and differentiates horizontally with [-1, 0, 1].</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center font-mono text-xs">
                  <div className="text-cyan-400 font-semibold mb-2">Vertical Kernel Ky (Detects Horizontal Edges)</div>
                  <div className="p-2 bg-slate-950 rounded text-slate-200">
                    [-1, -2, -1]<br />
                    [ 0,  0,  0]<br />
                    [+1, +2, +1]
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Smoothes horizontally with [1, 2, 1] and differentiates vertically with [-1, 0, 1]ᵀ.</p>
                </div>
              </div>
            </div>

            {/* Fundamental 3 */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-cyan-300">3. RGB Channels and the Fatal &quot;Isoluminant Color Edge&quot; Dilemma</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Color images contain three spectral bands: <strong>Red (R)</strong>, <strong>Green (G)</strong>, and <strong>Blue (B)</strong>. To make edge detection faster, standard libraries apply grayscale conversion:
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-center font-mono text-xs sm:text-sm text-yellow-300 border border-yellow-900/30">
                Y = 0.299 · R + 0.587 · G + 0.114 · B  (ITU-R BT.601)
              </div>

              <div className="mt-3 p-4 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-red-300">The Problem: Isoluminant Color Collapses</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Consider a pixel with pure saturated red: C1 = (255, 0, 0) ⟹ Y1 = 0.299 × 255 = <strong>76.25</strong>.
                    <br />
                    Right next to it, consider a green pixel: C2 = (0, 130, 0) ⟹ Y2 = 0.587 × 130 = <strong>76.31</strong>.
                    <br />
                    To the human eye, the boundary between bright red and rich green is a striking, vivid edge! But in grayscale, Y1 ≈ Y2. The differential ΔY = Y2 - Y1 ≈ 0.06.
                    <strong className="text-red-400"> Grayscale Sobel evaluates this to 0 and completely misses the edge!</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Back to Architecture
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              <span>Confirm & Proceed to Step 3: Math & Proof</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DEEP MATHEMATICAL FORMULATION */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Step 3: Deep Mathematical Formulation & Derivations</h2>
              <p className="text-xs text-slate-400">Exact formulas, step-by-step 3×3 matrix arithmetic, and Di Zenzo tensor proof</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Formula Group 1 */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">A. Single-Channel Gradient Formulas</h3>
              <p className="text-xs text-slate-300">
                For any 2D image matrix I and 3×3 kernel coordinate indices (u, v) ∈ &#123;-1, 0, 1&#125;:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono font-semibold">1. Horizontal Gradient Gx:</span>
                  <div className="text-xs sm:text-sm font-mono text-cyan-300 mt-1">
                    Gx(x, y) = ∑_u ∑_v Kx(u, v) · I(x+u, y+v)
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono font-semibold">2. Vertical Gradient Gy:</span>
                  <div className="text-xs sm:text-sm font-mono text-cyan-300 mt-1">
                    Gy(x, y) = ∑_u ∑_v Ky(u, v) · I(x+u, y+v)
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono font-semibold">3. Gradient Magnitude M:</span>
                  <div className="text-xs sm:text-sm font-mono text-cyan-300 mt-1">
                    M(x, y) = √(Gx(x, y)² + Gy(x, y)²)
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono font-semibold">4. Gradient Orientation θ:</span>
                  <div className="text-xs sm:text-sm font-mono text-cyan-300 mt-1">
                    θ(x, y) = atan2(Gy(x, y), Gx(x, y))
                  </div>
                </div>
              </div>
            </div>

            {/* Numerical Example */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-indigo-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
                  B. Step-by-Step Numerical Example (Concrete Arithmetic)
                </h3>
                <span className="text-[11px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                  Manual Verification
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Consider a 3×3 pixel patch centered at pixel P(x, y) on a vertical step boundary:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-semibold mb-2 text-center">Pixel Intensities I</div>
                  <div className="grid grid-cols-3 gap-1 text-center font-bold">
                    <span className="bg-slate-800 p-1.5 rounded">10</span>
                    <span className="bg-slate-800 p-1.5 rounded">10</span>
                    <span className="bg-slate-800 p-1.5 rounded text-amber-300">90</span>
                    <span className="bg-slate-800 p-1.5 rounded">10</span>
                    <span className="bg-slate-800 p-1.5 rounded text-cyan-300">10</span>
                    <span className="bg-slate-800 p-1.5 rounded text-amber-300">90</span>
                    <span className="bg-slate-800 p-1.5 rounded">10</span>
                    <span className="bg-slate-800 p-1.5 rounded">10</span>
                    <span className="bg-slate-800 p-1.5 rounded text-amber-300">90</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-semibold mb-2 text-center">Kernel Kx</div>
                  <div className="grid grid-cols-3 gap-1 text-center font-bold">
                    <span className="bg-slate-800 p-1.5 rounded text-red-400">-1</span>
                    <span className="bg-slate-800 p-1.5 rounded">0</span>
                    <span className="bg-slate-800 p-1.5 rounded text-emerald-400">+1</span>
                    <span className="bg-slate-800 p-1.5 rounded text-red-400">-2</span>
                    <span className="bg-slate-800 p-1.5 rounded">0</span>
                    <span className="bg-slate-800 p-1.5 rounded text-emerald-400">+2</span>
                    <span className="bg-slate-800 p-1.5 rounded text-red-400">-1</span>
                    <span className="bg-slate-800 p-1.5 rounded">0</span>
                    <span className="bg-slate-800 p-1.5 rounded text-emerald-400">+1</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-semibold mb-2 text-center">Kernel Ky</div>
                  <div className="grid grid-cols-3 gap-1 text-center font-bold">
                    <span className="bg-slate-800 p-1.5 rounded text-red-400">-1</span>
                    <span className="bg-slate-800 p-1.5 rounded text-red-400">-2</span>
                    <span className="bg-slate-800 p-1.5 rounded text-red-400">-1</span>
                    <span className="bg-slate-800 p-1.5 rounded">0</span>
                    <span className="bg-slate-800 p-1.5 rounded">0</span>
                    <span className="bg-slate-800 p-1.5 rounded">0</span>
                    <span className="bg-slate-800 p-1.5 rounded text-emerald-400">+1</span>
                    <span className="bg-slate-800 p-1.5 rounded text-emerald-400">+2</span>
                    <span className="bg-slate-800 p-1.5 rounded text-emerald-400">+1</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs text-slate-300">
                <div className="text-cyan-400 font-bold">Calculating Gx:</div>
                <div>Gx = (-1 × 10) + (0 × 10) + (1 × 90) + (-2 × 10) + (0 × 10) + (2 × 90) + (-1 × 10) + (0 × 10) + (1 × 90)</div>
                <div>Gx = -10 + 0 + 90 - 20 + 0 + 180 - 10 + 0 + 90 = <strong className="text-emerald-400">+320</strong></div>

                <div className="text-cyan-400 font-bold pt-2">Calculating Gy:</div>
                <div>Gy = (-1 × 10) + (-2 × 10) + (-1 × 90) + (0) + (1 × 10) + (2 × 10) + (1 × 90)</div>
                <div>Gy = -10 - 20 - 90 + 10 + 20 + 90 = <strong className="text-amber-400">0</strong> (Because edge is purely vertical!)</div>

                <div className="text-cyan-400 font-bold pt-2">Magnitude & Direction:</div>
                <div>M = √(320² + 0²) = <strong className="text-cyan-300">320</strong></div>
                <div>θ = atan2(0, 320) = <strong className="text-cyan-300">0°</strong> (Normal points along positive X axis)</div>
              </div>
            </div>

            {/* Formula Group 2: Multi-Channel Fusion */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">C. Multi-Channel Fusion Strategies</h3>

              <div className="space-y-4">
                {/* 1. Di Zenzo Tensor */}
                <div className="p-4 bg-slate-900 rounded-lg border border-cyan-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">1. Di Zenzo Tensor Formulation (First Fundamental Form) - RECOMMENDED</span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">Optimal Differential Geometry</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Di Zenzo (1986) formulated multi-spectral edge detection by defining the squared Euclidean distance between two infinitesimally close points on the color manifold:
                  </p>
                  <div className="text-xs font-mono text-cyan-300 p-2 bg-slate-950 rounded">
                    dF² = g_xx · dx² + 2 · g_xy · dx dy + g_yy · dy²
                  </div>
                  <p className="text-xs text-slate-300">Where the Riemannian metric tensor coefficients are:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs text-slate-200">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">g_xx = (∂x R)² + (∂x G)² + (∂x B)²</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">g_yy = (∂y R)² + (∂y G)² + (∂y B)²</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">g_xy = ∂x R · ∂y R + ∂x G · ∂y G + ∂x B · ∂y B</div>
                  </div>
                  <p className="text-xs text-slate-300">
                    The maximum rate of change corresponds to the <strong>maximum eigenvalue (λ_max)</strong>:
                  </p>
                  <div className="text-xs font-mono text-emerald-300 p-2 bg-slate-950 rounded text-center">
                    λ_max = 0.5 · [ (g_xx + g_yy) + √((g_xx - g_yy)² + 4 · g_xy²) ],   M_fused = √(λ_max / 3)
                  </div>
                </div>

                {/* 2. Euclidean Frobenius Vector Norm */}
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-300">2. Euclidean / Frobenius Gradient Norm</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Treats the gradients of R, G, B as a 6-dimensional vector [Rx, Ry, Gx, Gy, Bx, By] and computes its Euclidean norm:
                  </p>
                  <div className="text-xs font-mono text-indigo-300 p-2 bg-slate-950 rounded text-center">
                    M_fused = √[ (M_R² + M_G² + M_B²) / 3 ] = √[ (Rx² + Ry² + Gx² + Gy² + Bx² + By²) / 3 ]
                  </div>
                </div>

                {/* 3. Channel Maximum */}
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-300">3. Channel Maximum Fusion</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Selects the strongest gradient among the three color channels at every pixel:
                  </p>
                  <div className="text-xs font-mono text-amber-300 p-2 bg-slate-950 rounded text-center">
                    M_fused = max( M_R(x, y), M_G(x, y), M_B(x, y) )
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Back to Fundamentals
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              <span>Confirm & Proceed to Step 4: Algorithm Development</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: ALGORITHM DEVELOPMENT */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Step 4: Algorithm Development & Next Steps</h2>
              <p className="text-xs text-slate-400">Synthesis, comparison parameters, and interactive tools ready for testing</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              We have formalized both the traditional and multi-channel formulations. You now have access to four interactive toolsets built specifically for your research:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => onNavigateTab('playground')}
                className="p-4 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">Tool 1: 3×3 Kernel Simulator</span>
                  <Play className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-400">
                  Directly edit 3×3 RGB pixel patches and watch step-by-step convolution products and tensor eigenvalues compute live.
                </p>
              </div>

              <div 
                onClick={() => onNavigateTab('lab')}
                className="p-4 bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">Tool 2: Live Algorithm Lab</span>
                  <Play className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-400">
                  Inspect the 8-panel visual breakdown (RGB, Gray, Traditional, R, G, B, Multi-Channel, Missed-edges heatmap) across 10 preset datasets or upload your own images.
                </p>
              </div>

              <div 
                onClick={() => onNavigateTab('benchmark')}
                className="p-4 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">Tool 3: Quantitative 10-Dataset Evaluation</span>
                  <Play className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-400">
                  Benchmark edge pixel counts, F1-score, Precision, Recall, and processing runtimes across 10 test scenarios.
                </p>
              </div>

              <div 
                onClick={() => onNavigateTab('code')}
                className="p-4 bg-slate-950/70 border border-slate-800 hover:border-yellow-500/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-400 group-hover:text-yellow-300">Tool 4: Python & Colab Codebase</span>
                  <Play className="w-4 h-4 text-yellow-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-400">
                  Download the complete standalone Python codebase (sobel_multichannel.py) and Jupyter Notebook (.ipynb).
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Back to Math
            </button>
            <button
              onClick={() => onNavigateTab('playground')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <span>Launch 3×3 Kernel Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
