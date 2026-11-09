import React, { useState } from 'react';
import { TabId } from '../types/sobel';
import { 
  BookOpen, 
  Layers, 
  Cpu, 
  BarChart3, 
  Code2, 
  FileText, 
  Download, 
  Sparkles,
  Check
} from 'lucide-react';
import { createProjectZip } from '../utils/pythonCodeTemplates';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zipBlob = await createProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'multichannel_sobel_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'mentor', label: '1. Mentorship & Fundamentals', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'playground', label: '2. 3×3 Kernel Simulator', icon: <Cpu className="w-4 h-4" /> },
    { id: 'lab', label: '3. Live Algorithm Lab', icon: <Layers className="w-4 h-4" />, badge: 'Realtime' },
    { id: 'benchmark', label: '4. 10-Dataset Evaluation', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'code', label: '5. Python & Colab Code', icon: <Code2 className="w-4 h-4" /> },
    { id: 'docs', label: '6. Research Report & Repo', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Multi-Channel Sobel
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-medium">
                  CV Research
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Di Zenzo Tensor & Vector Gradient vs Grayscale Sobel
              </p>
            </div>
          </div>

          {/* Quick Download Button */}
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Download full project repository with Python scripts, notebook, and README"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Downloaded .ZIP</span>
              </>
            ) : downloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Python ZIP</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
