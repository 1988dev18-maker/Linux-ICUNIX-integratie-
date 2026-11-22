import React, { useState, useEffect, useRef } from 'react';
import { PipelineJob, PipelineStep } from '../types';
import { 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  Terminal, 
  RefreshCw, 
  ChevronRight, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

interface PipelineVisualizerProps {
  jobs: PipelineJob[];
  isPipelineRunning: boolean;
  onRunPipeline: () => void;
  onRunSingleJob: (jobId: string) => void;
  onResetPipeline: () => void;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  jobs,
  isPipelineRunning,
  onRunPipeline,
  onRunSingleJob,
  onResetPipeline,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('job-host-tests');
  const [selectedStepId, setSelectedStepId] = useState<string>('step-ctest-run');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const selectedStep = selectedJob.steps.find((s) => s.id === selectedStepId) || selectedJob.steps[0];

  // Auto-scroll terminal when running
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [selectedStep?.logs, isPipelineRunning]);

  const handleCopyLogs = () => {
    if (!selectedStep) return;
    navigator.clipboard.writeText(selectedStep.logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getJobIcon = (category: PipelineJob['category']) => {
    switch (category) {
      case 'host':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'android':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'audit':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'package':
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0f172a] rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Geautomatiseerde CI/CD Build Pipeline (GitHub Actions & NDK)
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Workflow: <span className="font-mono text-slate-300">.github/workflows/ci.yml</span></span>
            <span aria-hidden="true">·</span>
            <span>Toolchain: <span className="font-mono text-slate-300">C++23 / NDK r27b / CMake 3.22</span></span>
            <span aria-hidden="true">·</span>
            <span>Target: <span className="font-mono text-slate-300">Android SDK 35 (API 26+)</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetPipeline}
            disabled={isPipelineRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/60"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetten</span>
          </button>
          <button
            onClick={onRunPipeline}
            disabled={isPipelineRunning}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all shadow-sm ${
              isPipelineRunning
                ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95'
            }`}
          >
            <CircleDashed className={`w-3.5 h-3.5 ${isPipelineRunning ? 'animate-spin' : ''}`} />
            <span>{isPipelineRunning ? 'Uitvoeren...' : 'Volledige Pipeline Starten'}</span>
          </button>
        </div>
      </div>

      {/* DAG Workflow Pipeline Visualizer Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
          <span>Pipeline Uitvoeringsgraaf (DAG Stages)</span>
          <span>Klik op een stage om stappen en consolelogs te inspecteren</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {jobs.map((job, index) => {
            const isSelected = selectedJobId === job.id;
            const completedSteps = job.steps.filter((s) => s.status === 'success').length;
            const totalSteps = job.steps.length;

            return (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJobId(job.id);
                  setSelectedStepId(job.steps[0]?.id || '');
                }}
                className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500/80 ring-1 ring-blue-500/30 shadow-lg shadow-blue-950/40'
                    : 'bg-[#0f172a] border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Arrow connector between stages */}
                {index < jobs.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-slate-800/80 rounded-md border border-slate-700/50">
                    {getJobIcon(job.category)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {job.status === 'running' && (
                      <span className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-blue-400">
                        <CircleDashed className="w-3 h-3 animate-spin" />
                        <span>Draait</span>
                      </span>
                    )}
                    {job.status === 'success' && (
                      <span className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Geslaagd</span>
                      </span>
                    )}
                    {job.status === 'failure' && (
                      <span className="text-[11px] font-mono tabular-nums text-rose-400 font-semibold">
                        Gefaald
                      </span>
                    )}
                    {job.status === 'idle' && (
                      <span className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Wacht</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                  {job.name}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                  <span>Stappen: {completedSteps}/{totalSteps}</span>
                  {job.durationMs ? (
                    <span>{(job.durationMs / 1000).toFixed(1)}s</span>
                  ) : (
                    <span>—</span>
                  )}
                </div>

                {/* Micro progress bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      job.status === 'success'
                        ? 'bg-emerald-500'
                        : job.status === 'running'
                        ? 'bg-blue-500 animate-pulse'
                        : job.status === 'failure'
                        ? 'bg-rose-500'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Pane: Job Steps & Live Terminal Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Steps in Selected Job */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-300">
              Stappen in: <strong className="text-white font-semibold">{selectedJob.name}</strong>
            </span>
            <button
              onClick={() => onRunSingleJob(selectedJob.id)}
              disabled={isPipelineRunning}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              Stage Uitvoeren
            </button>
          </div>

          <div className="space-y-2">
            {selectedJob.steps.map((step: PipelineStep) => {
              const isStepSelected = selectedStep?.id === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isStepSelected
                      ? 'bg-slate-800 border-blue-500/80 text-white'
                      : 'bg-[#0f172a] border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{step.name}</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                      {step.status === 'success' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {step.status === 'running' && (
                        <CircleDashed className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      )}
                      {step.status === 'idle' && (
                        <span className="text-slate-500">Wacht</span>
                      )}
                      {step.durationMs ? (
                        <span className="text-slate-400">{(step.durationMs / 1000).toFixed(2)}s</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-1.5 text-[11px] font-mono text-slate-400 truncate bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                    $ {step.command}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Run Invarianten</div>
            <p className="leading-relaxed">
              Elke stage enforceert C++23 standaarden, strikte compiler vlaggen (<code className="text-slate-300">-Werror</code>), CTest time-outs en JNI symbol check vóór packaging.
            </p>
          </div>
        </div>

        {/* Right: Terminal Console Output */}
        <div className="lg:col-span-7 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col h-[460px]">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>
              <span className="text-xs font-mono text-slate-300 ml-2">
                console: {selectedStep?.name || 'terminal'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors"
                title="Kopieer console logs"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Gekopieerd' : 'Kopiëren'}</span>
              </button>
            </div>
          </div>

          {/* Terminal content */}
          <div
            ref={logContainerRef}
            className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 selection:bg-blue-600/30"
          >
            <div className="text-slate-500">
              # Actieve stap: {selectedStep?.name}
            </div>
            <div className="text-blue-400 font-semibold mb-2">
              $ {selectedStep?.command}
            </div>

            {selectedStep && selectedStep.logs.length > 0 ? (
              selectedStep.logs.map((line: string, i: number) => {
                const isPass = line.includes('Passed') || line.includes('OK') || line.includes('SUCCESS');
                const isWarn = line.includes('warning') || line.includes('Notice');
                const isCmd = line.startsWith('$') || line.startsWith('--');
                const isTarget = line.startsWith('[');

                let colorClass = 'text-slate-300';
                if (isPass) colorClass = 'text-emerald-400';
                else if (isWarn) colorClass = 'text-amber-400';
                else if (isCmd) colorClass = 'text-sky-300';
                else if (isTarget) colorClass = 'text-blue-300';

                return (
                  <div key={i} className={`leading-relaxed ${colorClass}`}>
                    {line}
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500 italic py-8 text-center">
                Wacht op uitvoer... Druk op &quot;Volledige Pipeline Starten&quot; om de logs live te genereren.
              </div>
            )}
          </div>

          {/* Terminal footer status */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Regels: {selectedStep?.logs.length || 0}</span>
            <span className="tabular-nums">Exit code: {selectedStep?.status === 'success' ? '0 (OK)' : selectedStep?.status === 'failure' ? '1 (FAIL)' : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
