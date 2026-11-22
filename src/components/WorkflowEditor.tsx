import React, { useState } from 'react';
import { WorkflowConfig } from '../types';
import { Settings, Copy, Check, Sliders, FileText, CheckCircle2 } from 'lucide-react';

interface WorkflowEditorProps {
  config: WorkflowConfig;
  onUpdateConfig: (newConfig: Partial<WorkflowConfig>) => void;
  yamlContent: string;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  config,
  onUpdateConfig,
  yamlContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'yaml'>('visual');

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAbi = (abi: string) => {
    const exists = config.abiTargets.includes(abi);
    if (exists && config.abiTargets.length === 1) return; // keep at least one
    const updated = exists
      ? config.abiTargets.filter((a) => a !== abi)
      : [...config.abiTargets, abi];
    onUpdateConfig({ abiTargets: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0f172a] rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            CI/CD Workflow & Matrix Editor
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Configuratie: <span className="font-mono text-slate-300">GitHub Actions NDK Matrix</span></span>
            <span aria-hidden="true">·</span>
            <span>Regeneratie: <span className="font-mono text-slate-300">Realtime YAML generator</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'visual'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Visuele Instellingen</span>
            </button>
            <button
              onClick={() => setActiveTab('yaml')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'yaml'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>YAML Preview</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Gekopieerd' : 'Kopieer YAML'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: C++23 & Toolchain */}
          <div className="p-5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Settings className="w-4 h-4 text-blue-400" />
              <span>C++23 Native Engine & CTest Instellingen</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">C++ ISO Standaard</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateConfig({ cxxStandard: 'c++23' })}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                      config.cxxStandard === 'c++23'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    -std=c++23 (Aanbevolen)
                  </button>
                  <button
                    onClick={() => onUpdateConfig({ cxxStandard: 'c++20' })}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                      config.cxxStandard === 'c++20'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    -std=c++20
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Android NDK Versie</label>
                <select
                  value={config.ndkVersion}
                  onChange={(e) => onUpdateConfig({ ndkVersion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="r27b">NDK r27b (LTS Android Platform 35)</option>
                  <option value="r26d">NDK r26d (Stabiel)</option>
                  <option value="r25c">NDK r25c (Legacy LTS)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.compilerWarningsAsErrors}
                    onChange={(e) => onUpdateConfig({ compilerWarningsAsErrors: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
                  />
                  <span className="text-slate-300">
                    Behandel compiler waarschuwingen als fouten (<code className="font-mono text-blue-300">-Werror</code>)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.ctestOutputOnFailure}
                    onChange={(e) => onUpdateConfig({ ctestOutputOnFailure: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
                  />
                  <span className="text-slate-300">
                    Gedetailleerde CTest logging bij falen (<code className="font-mono text-blue-300">--output-on-failure</code>)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableIntegrationTests}
                    onChange={(e) => onUpdateConfig({ enableIntegrationTests: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
                  />
                  <span className="text-slate-300">
                    Activeer automatische integratietests (<code className="font-mono text-blue-300">VEILIGWEB_BUILD_INTEGRATION_TESTS</code>)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Box 2: Android Target ABIs */}
          <div className="p-5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Android Target ABI Matrix</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Selecteer welke architecturen parallel worden gecompileerd via de GitHub Actions matrix en verpakt in het APK.
            </p>

            <div className="space-y-2">
              {[
                { abi: 'arm64-v8a', label: 'ARM64-v8a (64-bit moderne smartphones)', primary: true },
                { abi: 'x86_64', label: 'x86_64 (Android Studio Emulator & ChromeOS)', primary: true },
                { abi: 'armeabi-v7a', label: 'armeabi-v7a (32-bit legacy ARM)', primary: false },
              ].map((item) => {
                const checked = config.abiTargets.includes(item.abi);
                return (
                  <div
                    key={item.abi}
                    onClick={() => toggleAbi(item.abi)}
                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                      checked
                        ? 'bg-slate-850 border-emerald-500/60 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold font-mono">{item.abi}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.label}</div>
                    </div>
                    {checked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Geselecteerde ABI&apos;s: <span className="font-mono text-slate-200">{config.abiTargets.join(', ')}</span>
            </div>
          </div>
        </div>
      ) : (
        /* YAML Viewer */
        <div className="p-4 bg-[#0b0f19] rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
          <pre className="text-slate-300 leading-relaxed selection:bg-blue-600/30">
            {yamlContent}
          </pre>
        </div>
      )}
    </div>
  );
};
