/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabId } from './types/sobel';
import { Header } from './components/Header';
import { MentorshipGuide } from './components/MentorshipGuide';
import { InteractiveConvolutionPlayground } from './components/InteractiveConvolutionPlayground';
import { LiveLab } from './components/LiveLab';
import { BenchmarkDashboard } from './components/BenchmarkDashboard';
import { PythonNotebookViewer } from './components/PythonNotebookViewer';
import { ProjectDocumentation } from './components/ProjectDocumentation';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('mentor');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Navigation Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'mentor' && (
          <MentorshipGuide onNavigateTab={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'playground' && (
          <InteractiveConvolutionPlayground />
        )}
        {activeTab === 'lab' && (
          <LiveLab />
        )}
        {activeTab === 'benchmark' && (
          <BenchmarkDashboard />
        )}
        {activeTab === 'code' && (
          <PythonNotebookViewer />
        )}
        {activeTab === 'docs' && (
          <ProjectDocumentation />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Multi-Channel Sobel Edge Detection Platform • Computer Vision Research Lab</span>
          <span className="font-mono text-[11px] text-slate-600">OpenCV • NumPy • Di Zenzo Tensor • MIT License</span>
        </div>
      </footer>
    </div>
  );
}
