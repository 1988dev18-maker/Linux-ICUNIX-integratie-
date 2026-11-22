import React from 'react';
import { TabType } from '../types';
import { Play, Download } from 'lucide-react';

interface TopBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onRunPipeline: () => void;
  isPipelineRunning: boolean;
  onDownloadZip: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onRunPipeline,
  isPipelineRunning,
  onDownloadZip,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800 print:hidden">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('progress');
        }}
        className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-blue-400 transition-colors"
      >
        Veiligweb Linux Mobile
      </a>

      {/* Zone 2: Single-line navigation links */}
      <nav className="hidden 2xl:flex items-center gap-5 text-xs font-medium text-slate-400">
        <button
          onClick={() => onTabChange('terminal_vm')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'terminal_vm' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Terminal VM (Opstart)
        </button>
        <button
          onClick={() => onTabChange('progress')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'progress' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Productie Voortgang %
        </button>
        <button
          onClick={() => onTabChange('genesis')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'genesis' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          IP-Genesis Anker
        </button>
        <button
          onClick={() => onTabChange('test_report')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'test_report' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Testrapport V1.1
        </button>
        <button
          onClick={() => onTabChange('backup')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'backup' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Backup & FTPS (.cl)
        </button>
        <button
          onClick={() => onTabChange('investigation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'investigation' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Onderzoek 18 Nov
        </button>
        <button
          onClick={() => onTabChange('core_v1_1')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'core_v1_1' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          C++23 Kern V1.1
        </button>
        <button
          onClick={() => onTabChange('pipeline')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pipeline' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Pipeline Visualizer
        </button>
        <button
          onClick={() => onTabChange('tests')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'tests' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Automated Test Runner
        </button>
        <button
          onClick={() => onTabChange('workflow')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'workflow' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Workflow Editor
        </button>
        <button
          onClick={() => onTabChange('security')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'security' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Security Matrix
        </button>
        <button
          onClick={() => onTabChange('exporter')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'exporter' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Project & Export
        </button>
      </nav>

      {/* Overflow Navigation for mid/tablet viewports */}
      <div className="flex 2xl:hidden items-center gap-2 overflow-x-auto text-xs font-medium text-slate-400 py-1">
        <button
          onClick={() => onTabChange('terminal_vm')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'terminal_vm' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Terminal VM
        </button>
        <button
          onClick={() => onTabChange('progress')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'progress' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Productie %
        </button>
        <button
          onClick={() => onTabChange('genesis')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'genesis' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Genesis Anker
        </button>
        <button
          onClick={() => onTabChange('test_report')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'test_report' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Testrapport
        </button>
        <button
          onClick={() => onTabChange('backup')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'backup' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Backup & FTPS
        </button>
        <button
          onClick={() => onTabChange('investigation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'investigation' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Onderzoek 18 Nov
        </button>
        <button
          onClick={() => onTabChange('core_v1_1')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'core_v1_1' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          C++23 Kern
        </button>
        <button
          onClick={() => onTabChange('pipeline')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pipeline' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Pipeline
        </button>
        <button
          onClick={() => onTabChange('tests')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'tests' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Tests
        </button>
        <button
          onClick={() => onTabChange('exporter')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'exporter' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Export
        </button>
      </div>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {activeTab === 'exporter' || activeTab === 'backup' ? (
          <button
            onClick={onDownloadZip}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all shadow-sm shadow-blue-500/20 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>
        ) : (
          <button
            onClick={onRunPipeline}
            disabled={isPipelineRunning}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-all whitespace-nowrap shrink-0 ${
              isPipelineRunning
                ? 'bg-slate-700 text-slate-300 cursor-not-allowed opacity-80'
                : 'bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-500/25 active:scale-[0.98]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isPipelineRunning ? 'animate-spin' : ''}`} />
            <span>{isPipelineRunning ? 'Pipeline Draait...' : 'Pipeline Uitvoeren'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
