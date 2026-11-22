import React, { useState, useMemo } from 'react';
import { ProgressTask, ProgressTaskCategory } from '../types';
import { initialPillars, initialProgressTasks } from '../data/progressData';
import { 
  CheckCircle2, 
  Circle, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Filter, 
  Cpu, 
  GitMerge, 
  ShieldCheck, 
  Lock, 
  Server, 
  FileCheck,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Check
} from 'lucide-react';

export const ProductionProgressDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<ProgressTask[]>(initialProgressTasks);
  const [selectedCategory, setSelectedCategory] = useState<ProgressTaskCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'open'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [only500Rule, setOnly500Rule] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  // Toggle taakstatus
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Reset naar initiële baseline
  const handleResetBaseline = () => {
    setTasks(initialProgressTasks);
  };

  // Vink alles af voor 100% productie simulatie
  const handleCompleteAll = () => {
    setTasks((prev) => prev.map((t) => ({ ...t, completed: true })));
  };

  // Pijler scores en totaal percentage berekening
  const { pillarStats, totalPercentage, totalTasksCount, completedTasksCount, totalLoc } = useMemo(() => {
    const stats: Record<ProgressTaskCategory, {
      totalWeight: number;
      completedWeight: number;
      taskCount: number;
      completedCount: number;
      percentage: number;
    }> = {
      core_cpp: { totalWeight: 0, completedWeight: 0, taskCount: 0, completedCount: 0, percentage: 0 },
      cicd_pipeline: { totalWeight: 0, completedWeight: 0, taskCount: 0, completedCount: 0, percentage: 0 },
      forensic_ip: { totalWeight: 0, completedWeight: 0, taskCount: 0, completedCount: 0, percentage: 0 },
      security_sandbox: { totalWeight: 0, completedWeight: 0, taskCount: 0, completedCount: 0, percentage: 0 },
      backup_ftps: { totalWeight: 0, completedWeight: 0, taskCount: 0, completedCount: 0, percentage: 0 },
      qa_test: { totalWeight: 0, completedWeight: 0, taskCount: 0, completedCount: 0, percentage: 0 },
    };

    let locSum = 0;
    let completedCount = 0;

    tasks.forEach((task) => {
      locSum += task.linesOfCodeEstimated || 0;
      const cat = stats[task.category];
      if (cat) {
        cat.totalWeight += task.weight;
        cat.taskCount += 1;
        if (task.completed) {
          cat.completedWeight += task.weight;
          cat.completedCount += 1;
          completedCount += 1;
        }
      }
    });

    let overallSum = 0;
    initialPillars.forEach((pillar) => {
      const cat = stats[pillar.id];
      if (cat && cat.totalWeight > 0) {
        // Bereken bijdrage van deze pijler conform zijn toegewezen gewicht
        const ratio = cat.completedWeight / cat.totalWeight;
        const pillarScore = ratio * pillar.weightPercentage;
        cat.percentage = Math.round(ratio * 100);
        overallSum += pillarScore;
      }
    });

    return {
      pillarStats: stats,
      totalPercentage: Math.min(100, Math.max(0, parseFloat(overallSum.toFixed(1)))),
      totalTasksCount: tasks.length,
      completedTasksCount: completedCount,
      totalLoc: locSum,
    };
  }, [tasks]);

  // Gefilterde takenlijst
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      if (statusFilter === 'completed' && !task.completed) {
        return false;
      }
      if (statusFilter === 'open' && task.completed) {
        return false;
      }
      if (only500Rule && !task.ruleReference?.toLowerCase().includes('500-regel')) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description.toLowerCase().includes(query);
        const matchCode = task.codeReference?.toLowerCase().includes(query) || false;
        const matchMilestone = task.auditMilestone?.toLowerCase().includes(query) || false;
        return matchTitle || matchDesc || matchCode || matchMilestone;
      }
      return true;
    });
  }, [tasks, selectedCategory, statusFilter, only500Rule, searchQuery]);

  // Export rapport Markdown
  const handleExportMarkdown = () => {
    const md = `# VEILIGWEB LINUX MOBILE - VOORTGANGSRAPPORT CONCEPT TOT 100% PRODUCTIE
**Mijlpaal:** LS.1.0 PROJECT NR.13 - 80:09  
**Procedure:** Proceduren 1.0dev (500-regel normering)  
**Datum:** ${new Date().toISOString()}  
**Totaal Productiepercentage:** ${totalPercentage}%  
**Status:** ${totalPercentage === 100 ? '100% PRODUCTIE GEREED' : totalPercentage >= 75 ? 'RELEASE CANDIDATE (RC)' : 'BETA FASE'}

---

## 1. Gewogen Pijlerscore Overzicht
${initialPillars.map((p) => {
  const stat = pillarStats[p.id];
  return `- **${p.name}** (Gewicht: ${p.weightPercentage}%): **${stat?.percentage || 0}%** voltooid (${stat?.completedCount}/${stat?.taskCount} taken)`;
}).join('\n')}

---

## 2. Voltooid & Openstaand Takenregister (Log.L 1.0 Database)
| ID | Taak | Pijler | Norm / Referentie | Status |
|:---|:-----|:-------|:------------------|:-------|
${tasks.map((t) => `| \`${t.id}\` | ${t.title} | ${t.pillarName} | ${t.ruleReference || '-'} | ${t.completed ? 'VOLTOOID (100%)' : 'OPENSTAAND'} |`).join('\n')}

---
*Gegenereerd door Veiligweb Voortgangsmatrix & Audit Monitor.*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRODUCTIE_VOORTGANG_LS1_0_${totalPercentage}PCT.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export rapport JSON
  const handleExportJson = () => {
    const payload = {
      milestone: 'LS.1.0 PROJECT NR.13 - 80:09',
      procedure: 'Proceduren 1.0dev',
      timestamp: new Date().toISOString(),
      overallProgressPercentage: totalPercentage,
      completedTasks: completedTasksCount,
      totalTasks: totalTasksCount,
      pillars: initialPillars.map((p) => ({
        id: p.id,
        name: p.name,
        assignedWeightPercentage: p.weightPercentage,
        pillarProgressPercentage: pillarStats[p.id]?.percentage || 0,
        tasksCompleted: `${pillarStats[p.id]?.completedCount}/${pillarStats[p.id]?.taskCount}`,
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        weight: t.weight,
        completed: t.completed,
        ruleReference: t.ruleReference,
        codeReference: t.codeReference,
        auditMilestone: t.auditMilestone,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productie_matrix_ls1_0.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPillarIcon = (catId: ProgressTaskCategory) => {
    switch (catId) {
      case 'core_cpp': return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'cicd_pipeline': return <GitMerge className="w-4 h-4 text-emerald-400" />;
      case 'forensic_ip': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'security_sandbox': return <Lock className="w-4 h-4 text-purple-400" />;
      case 'backup_ftps': return <Server className="w-4 h-4 text-cyan-400" />;
      case 'qa_test': return <FileCheck className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LS.1.0 PROJECT NR.13 - 80:09 · PROCEDUREN 1.0DEV (500-REGEL)</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Concept (0%) naar 100% Productie Voortgang
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gewogen volwassenheidsanalyse over alle 6 projectpijlers met interactieve afvinklijst en audit-database registratie.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetBaseline}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title="Herstel naar geverifieerde codebase baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Herstel Baseline</span>
          </button>
          <button
            onClick={handleCompleteAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 rounded-lg transition-colors"
            title="Simuleer 100% Productie Oplevering"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simuleer 100%</span>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm shadow-blue-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Rapport (MD)</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Matrix JSON</span>
          </button>
        </div>
      </div>

      {/* Hero: Voortgangspercentage Meter & Fasering */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-950/25 via-slate-900 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase ${
                totalPercentage === 100
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : totalPercentage >= 75
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {totalPercentage === 100 ? '100% Productie Gereed' : totalPercentage >= 75 ? 'Release Candidate (RC)' : 'Beta Fase'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {completedTasksCount} van {totalTasksCount} taken voltooid
              </span>
            </div>

            {/* Groot percentage */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                {totalPercentage.toFixed(1)}%
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Totale Gewogen Productiescore
              </span>
            </div>

            {/* Voortgangsbalk met fasen */}
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    totalPercentage === 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                      : totalPercentage >= 75
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-sm shadow-blue-500/30'
                      : 'bg-gradient-to-r from-amber-600 to-amber-400'
                  }`}
                  style={{ width: `${totalPercentage}%` }}
                />
              </div>

              {/* Fasemarkeringen */}
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>0% Concept</span>
                <span>25% Alpha (C++ Kern)</span>
                <span>50% Beta (CI/CD)</span>
                <span>75% RC (Forensisch)</span>
                <span className={totalPercentage === 100 ? 'text-emerald-400 font-bold' : ''}>100% Productie</span>
              </div>
            </div>
          </div>

          {/* Substatistieken in zero-pill discipline */}
          <div className="grid grid-cols-2 gap-3 lg:w-72 shrink-0 text-xs">
            <div className="bg-black/40 border border-slate-800 p-3 rounded-lg">
              <div className="text-slate-400 text-[11px] mb-0.5">500-Regel Invariant</div>
              <div className="text-emerald-400 font-mono font-bold text-sm">100% Conform</div>
              <div className="text-[10px] text-slate-400 font-mono">Max &lt; 500 regels/bestand</div>
            </div>

            <div className="bg-black/40 border border-slate-800 p-3 rounded-lg">
              <div className="text-slate-400 text-[11px] mb-0.5">CTest Assertions</div>
              <div className="text-blue-400 font-mono font-bold text-sm">42 / 42 Pass</div>
              <div className="text-[10px] text-slate-400 font-mono">100% Matrix Slaging</div>
            </div>

            <div className="bg-black/40 border border-slate-800 p-3 rounded-lg">
              <div className="text-slate-400 text-[11px] mb-0.5">IP-Genesis Root</div>
              <div className="text-amber-400 font-mono font-bold text-sm">Verankerd</div>
              <div className="text-[10px] text-slate-400 font-mono truncate" title="7b22d109f6356788...">
                7b22d109...
              </div>
            </div>

            <div className="bg-black/40 border border-slate-800 p-3 rounded-lg">
              <div className="text-slate-400 text-[11px] mb-0.5">Geauditeerde Regels</div>
              <div className="text-slate-200 font-mono font-bold text-sm">{totalLoc.toLocaleString()} LOC</div>
              <div className="text-[10px] text-slate-400 font-mono">C++23 &amp; Scripts</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Gewogen Pijlers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialPillars.map((pillar) => {
          const stat = pillarStats[pillar.id];
          const isPillarSelected = selectedCategory === pillar.id;

          return (
            <div
              key={pillar.id}
              onClick={() => setSelectedCategory(isPillarSelected ? 'all' : pillar.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all text-xs ${
                isPillarSelected
                  ? 'bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-[#0e1424] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-black/40 border border-slate-800">
                    {getPillarIcon(pillar.id)}
                  </div>
                  <h3 className="font-semibold text-slate-200 text-xs truncate max-w-[170px]">
                    {pillar.name}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-white tabular-nums">
                  {stat?.percentage || 0}%
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
                {pillar.description}
              </p>

              {/* Pijler Voortgangsbalk */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${stat?.percentage || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Gewicht: {pillar.weightPercentage}%</span>
                  <span>{stat?.completedCount} / {stat?.taskCount} taken</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Takenlijst Besturing & Filters */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Deliverables &amp; 500-Regel Checklist (Log.L 1.0)
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ({filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'})
            </span>
          </div>

          {/* Zoekbalk */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek taak, code of norm..."
              className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filterknoppen */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Voltooid
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === 'open'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              Openstaand
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnly500Rule((prev) => !prev)}
              className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
                only500Rule
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-black/40 border-slate-700 text-slate-400 hover:text-slate-300'
              }`}
            >
              {only500Rule ? '✓ Alleen 500-Regel Proceduren' : 'Filter: 500-Regel'}
            </button>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Wis pijlerfilter
              </button>
            )}
          </div>
        </div>

        {/* Takenlijst items */}
        <div className="space-y-2 pt-1">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-black/20 rounded-lg border border-slate-800">
              Geen taken gevonden die voldoen aan de geselecteerde filters.
            </div>
          ) : (
            filteredTasks.map((task) => {
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-lg border transition-all text-xs flex items-start gap-3.5 ${
                    task.completed
                      ? 'bg-slate-900/50 border-slate-800/90 text-slate-200'
                      : 'bg-amber-950/15 border-amber-500/30 text-amber-100'
                  }`}
                >
                  {/* Interactieve checkbox */}
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    title={task.completed ? 'Markeer als openstaand' : 'Markeer als voltooid'}
                    className="mt-0.5 text-slate-400 hover:text-white transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-amber-400 hover:text-amber-300" />
                    )}
                  </button>

                  {/* Taakdetails */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${task.completed ? 'text-white' : 'text-amber-200'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          +{task.weight}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        {task.ruleReference && (
                          <span className="text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                            {task.ruleReference}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          task.completed 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {task.completed ? 'VOLTOOID' : 'OPENSTAAND'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {task.description}
                    </p>

                    {/* Metadata regel conform zero-pill discipline */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
                      <span>Pijler: {task.pillarName}</span>
                      <span aria-hidden="true">·</span>
                      {task.codeReference && (
                        <span>Code: <code className="text-blue-300">{task.codeReference}</code></span>
                      )}
                      {task.linesOfCodeEstimated && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{task.linesOfCodeEstimated} LOC</span>
                        </>
                      )}
                      {task.auditMilestone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400/90">{task.auditMilestone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
