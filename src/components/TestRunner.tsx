import React, { useState } from 'react';
import { IntegrationTestSuite, TestCase } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  Cpu, 
  Network, 
  FileCode2, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface TestRunnerProps {
  testSuites: IntegrationTestSuite[];
  isRunning: boolean;
  onRunAllTests: () => void;
  onRunSuite: (suiteId: string) => void;
  onRunSingleTestCase: (suiteId: string, caseId: string) => void;
  onResetTests: () => void;
  simulationFailMode: boolean;
  onToggleFailMode: () => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  testSuites,
  isRunning,
  onRunAllTests,
  onRunSuite,
  onRunSingleTestCase,
  onResetTests,
  simulationFailMode,
  onToggleFailMode,
}) => {
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({
    'tc-proto-legacy-rejection': true,
    'tc-net-readonly-integrity': true,
  });

  const toggleExpand = (caseId: string) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const getSuiteIcon = (module: string) => {
    switch (module) {
      case 'protocol_registry':
        return <FileCode2 className="w-4 h-4 text-blue-400" />;
      case 'network_inspector':
        return <Network className="w-4 h-4 text-emerald-400" />;
      case 'jni_bridge':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'security_core':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <FileCode2 className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filter test suites
  const filteredSuites = testSuites
    .filter((suite) => selectedSuiteId === 'all' || suite.id === selectedSuiteId)
    .map((suite) => ({
      ...suite,
      cases: suite.cases.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.functionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((suite) => suite.cases.length > 0);

  // Compute metrics
  const allCases = testSuites.flatMap((s) => s.cases);
  const totalCasesCount = allCases.length;
  const passedCasesCount = allCases.filter((c) => c.status === 'passed').length;
  const failedCasesCount = allCases.filter((c) => c.status === 'failed').length;
  const totalDuration = allCases.reduce((acc, c) => acc + (c.status !== 'idle' ? c.durationMs : 0), 0);

  return (
    <div className="space-y-6">
      {/* Test Execution Header & Stats */}
      <div className="p-5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Geautomatiseerde Integratietests Runner (CTest & C++23)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Harnas: <span className="font-mono text-slate-300">native/tests/integration_tests.cpp</span></span>
              <span aria-hidden="true">·</span>
              <span>Modules: <span className="font-mono text-slate-300">Protocol Registry, Network Inspector, JNI, Security Core</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleFailMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                simulationFailMode
                  ? 'bg-rose-950/50 text-rose-300 border-rose-800'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-300 border-slate-700'
              }`}
              title="Simuleer een lek of foutieve legacy SSL-toelating om CTest falen te demonstreren"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simuleer Fout: {simulationFailMode ? 'AAN' : 'UIT'}</span>
            </button>

            <button
              onClick={onResetTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onRunAllTests}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all shadow-sm ${
                isRunning
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Tests Uitvoeren...' : 'Alle Integratietests Uitvoeren'}</span>
            </button>
          </div>
        </div>

        {/* Metric indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80">
            <div className="text-xs text-slate-400">Totaal Testcases</div>
            <div className="text-lg font-mono font-bold text-white tabular-nums mt-0.5">
              {totalCasesCount}
            </div>
          </div>
          <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80">
            <div className="text-xs text-slate-400">Geslaagd</div>
            <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums mt-0.5">
              {passedCasesCount}
            </div>
          </div>
          <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80">
            <div className="text-xs text-slate-400">Gefaald</div>
            <div className={`text-lg font-mono font-bold tabular-nums mt-0.5 ${failedCasesCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {failedCasesCount}
            </div>
          </div>
          <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800/80">
            <div className="text-xs text-slate-400">Totale CTest Duur</div>
            <div className="text-lg font-mono font-bold text-blue-400 tabular-nums mt-0.5">
              {totalDuration.toFixed(1)} ms
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented controls for suites */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setSelectedSuiteId('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedSuiteId === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Alle Suites ({testSuites.length})
          </button>
          {testSuites.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSuiteId(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedSuiteId === s.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.module}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Zoek testcase of functie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Test Suites Accordion / Details */}
      <div className="space-y-4">
        {filteredSuites.map((suite) => {
          const suiteCases = suite.cases;
          const passedInSuite = suiteCases.filter((c) => c.status === 'passed').length;
          const failedInSuite = suiteCases.filter((c) => c.status === 'failed').length;

          return (
            <div
              key={suite.id}
              className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-sm"
            >
              {/* Suite header */}
              <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg border border-slate-700/60">
                    {getSuiteIcon(suite.module)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      {suite.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono text-slate-300">{suite.filePath}</span>
                      <span aria-hidden="true">·</span>
                      <span>{suite.description}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-400">
                    <span className="text-emerald-400">{passedInSuite} OK</span>
                    {failedInSuite > 0 && <span className="text-rose-400">{failedInSuite} FAIL</span>}
                    <span className="text-slate-500">/ {suiteCases.length}</span>
                  </div>

                  <button
                    onClick={() => onRunSuite(suite.id)}
                    disabled={isRunning}
                    className="px-2.5 py-1 text-xs font-medium text-blue-400 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 rounded-md transition-colors"
                  >
                    Suite Draaien
                  </button>
                </div>
              </div>

              {/* Suite test cases list */}
              <div className="divide-y divide-slate-800/80">
                {suiteCases.map((tc: TestCase) => {
                  const isExpanded = expandedCases[tc.id] ?? false;

                  return (
                    <div key={tc.id} className="p-4 hover:bg-slate-850/40 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => toggleExpand(tc.id)}
                          className="flex items-start gap-2.5 cursor-pointer flex-1"
                        >
                          <div className="mt-0.5 text-slate-400">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-200">
                                {tc.name}
                              </span>
                              <span className="text-[11px] font-mono text-blue-400">
                                {tc.functionName}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {tc.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-mono tabular-nums text-slate-400">
                            {tc.status !== 'idle' ? `${tc.durationMs.toFixed(1)} ms` : '—'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {tc.status === 'passed' && (
                              <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>PASS</span>
                              </span>
                            )}
                            {tc.status === 'failed' && (
                              <span className="flex items-center gap-1 text-xs font-mono text-rose-400">
                                <XCircle className="w-4 h-4" />
                                <span>FAIL</span>
                              </span>
                            )}
                            {tc.status === 'running' && (
                              <span className="flex items-center gap-1 text-xs font-mono text-blue-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>RUN</span>
                              </span>
                            )}
                            {tc.status === 'idle' && (
                              <span className="text-xs font-mono text-slate-500">IDLE</span>
                            )}
                          </div>

                          <button
                            onClick={() => onRunSingleTestCase(suite.id, tc.id)}
                            disabled={isRunning}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                            title="Voer individuele testcase uit"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Assertions table */}
                      {isExpanded && (
                        <div className="mt-3 ml-6 pl-3 border-l border-slate-700/60 space-y-2">
                          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                            CTest Asserties & Verwachting
                          </div>

                          <div className="bg-slate-900/90 rounded-lg border border-slate-800 divide-y divide-slate-800 text-xs">
                            {tc.assertions.map((assertion, aIdx) => (
                              <div
                                key={aIdx}
                                className="p-2.5 flex items-center justify-between gap-3 font-mono"
                              >
                                <div className="flex items-center gap-2">
                                  {assertion.passed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                  )}
                                  <span className={assertion.passed ? 'text-slate-300' : 'text-rose-300'}>
                                    {assertion.description}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                                  {assertion.expected && (
                                    <span>Verwacht: <span className="text-slate-200">{assertion.expected}</span></span>
                                  )}
                                  {assertion.actual && (
                                    <span>Actueel: <span className={assertion.passed ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>{assertion.actual}</span></span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
