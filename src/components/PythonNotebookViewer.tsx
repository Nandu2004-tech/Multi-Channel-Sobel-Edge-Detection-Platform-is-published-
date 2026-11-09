import React, { useState } from 'react';
import { 
  PYTHON_CODE_SOBEL_MULTICHANNEL, 
  PYTHON_EVALUATE_SCRIPT, 
  REQUIREMENTS_TXT, 
  generateJupyterNotebookJson 
} from '../utils/pythonCodeTemplates';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  BookOpen, 
  Terminal,
  HelpCircle
} from 'lucide-react';

export const PythonNotebookViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'sobel' | 'evaluate' | 'requirements' | 'notebook'>('sobel');
  const [copied, setCopied] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCodeContent = () => {
    if (activeFile === 'sobel') return PYTHON_CODE_SOBEL_MULTICHANNEL;
    if (activeFile === 'evaluate') return PYTHON_EVALUATE_SCRIPT;
    if (activeFile === 'requirements') return REQUIREMENTS_TXT;
    return generateJupyterNotebookJson();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
              <Code2 className="w-4 h-4" />
              <span>Production Python Codebase</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Runnable Python, OpenCV & Jupyter Notebook</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clean, modular Python code adhering to PEP 8 with line-by-line pedagogical breakdown, ready to execute locally or in Google Colab.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(getCodeContent())}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                if (activeFile === 'sobel') downloadFile('sobel_multichannel.py', PYTHON_CODE_SOBEL_MULTICHANNEL);
                else if (activeFile === 'evaluate') downloadFile('evaluate.py', PYTHON_EVALUATE_SCRIPT);
                else if (activeFile === 'requirements') downloadFile('requirements.txt', REQUIREMENTS_TXT);
                else downloadFile('tutorial.ipynb', generateJupyterNotebookJson(), 'application/json');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
          {[
            { id: 'sobel', label: 'src/sobel_multichannel.py', icon: <FileCode className="w-4 h-4 text-cyan-400" /> },
            { id: 'evaluate', label: 'src/evaluate.py', icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
            { id: 'notebook', label: 'notebooks/tutorial.ipynb', icon: <BookOpen className="w-4 h-4 text-yellow-400" /> },
            { id: 'requirements', label: 'requirements.txt', icon: <Code2 className="w-4 h-4 text-purple-400" /> },
          ].map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFile(file.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeFile === file.id
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {file.icon}
              <span>{file.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Line-by-line Educational Annotations Bar */}
      {activeFile === 'sobel' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Line-by-Line Architecture Breakdown</span>
            </div>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              {showAnnotations ? 'Collapse Annotations' : 'Expand Annotations'}
            </button>
          </div>

          {showAnnotations && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-300 font-mono">1. Kernels (Kx, Ky)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Defines standard 3x3 float32 matrices combining smoothing [1, 2, 1] and differentiation [-1, 0, 1].
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-emerald-300 font-mono">2. compute_single_channel_sobel</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Applies <code className="text-slate-300">cv2.filter2D</code> with reflected boundary conditions, computing magnitude and angle atan2(Gy, Gx).
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-indigo-300 font-mono">3. multichannel_sobel</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Computes 6 derivatives across R, G, B channels and calculates Di Zenzo metric tensor eigenvalues (λ_max).
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="font-bold text-amber-300 font-mono">4. visualize_comparison</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Generates an 8-panel Matplotlib figure comparing RGB, Grayscale, traditional Sobel, channel edges, and diff heatmap.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Code Display Area */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-slate-300 text-xs font-semibold ml-2">
              {activeFile === 'sobel' ? 'sobel_multichannel.py' :
               activeFile === 'evaluate' ? 'evaluate.py' :
               activeFile === 'requirements' ? 'requirements.txt' : 'tutorial.ipynb'}
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            {activeFile === 'notebook' ? 'Jupyter Notebook JSON (RFC 4180)' : 'Python 3.9+ / OpenCV / NumPy'}
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] text-slate-200 leading-relaxed scrollbar-thin">
          <pre className="whitespace-pre">
            {getCodeContent()}
          </pre>
        </div>
      </div>
    </div>
  );
};
