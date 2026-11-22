import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { 
  FolderTree, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  FileCheck, 
  Archive, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';

interface ProjectExporterProps {
  files: ProjectFile[];
}

export const ProjectExporter: React.FC<ProjectExporterProps> = ({ files }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('.github/workflows/ci.yml');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all project files into their respective directory structures
      for (const file of files) {
        zip.file(file.path, file.content);
      }

      // Add a README.md with build and test instructions
      const readmeContent = `# Veiligweb Linux Mobile — Android Native V1.0

Automated Build Pipeline & C++23 Integration Test Suite.

## 1. Benodigdheden
- Android SDK Platform 35 & NDK r27b
- CMake 3.22.1+
- JDK 17
- C++23 compiler (GCC 14+ of Clang 18+)

## 2. Lokaal Uitvoeren van de Geautomatiseerde Integratietests
\`\`\`bash
chmod +x scripts/run_integration_tests.sh
./scripts/run_integration_tests.sh
\`\`\`

Of handmatig via CMake & CTest:
\`\`\`bash
cmake -S . -B build-host -DCMAKE_BUILD_TYPE=Release -DVEILIGWEB_BUILD_TESTS=ON -DVEILIGWEB_BUILD_INTEGRATION_TESTS=ON
cmake --build build-host
ctest --test-dir build-host --output-on-failure
\`\`\`

## 3. Android Cross-Compilatie (ARM64)
\`\`\`bash
cmake -S . -B build-android \\
  -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake" \\
  -DANDROID_ABI=arm64-v8a \\
  -DANDROID_PLATFORM=android-26 \\
  -DVEILIGWEB_BUILD_TESTS=OFF \\
  -DCMAKE_BUILD_TYPE=Release

cmake --build build-android --target veiligweb_mobile
\`\`\`

## 4. Android APK Assembleren
\`\`\`bash
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`
`;
      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'VEILIGWEB_LINUX_MOBILE_V1.0_WITH_CI.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getCategoryLabel = (category: ProjectFile['category']) => {
    switch (category) {
      case 'workflow':
        return 'GitHub Actions CI';
      case 'cmake':
        return 'CMake Build';
      case 'tests':
        return 'C++23 Testsuite';
      case 'scripts':
        return 'Shell Scripts';
      case 'native_headers':
        return 'Native Headers';
      case 'native_src':
        return 'Native C++23';
      case 'android_app':
        return 'Android Java/XML';
      case 'gradle':
        return 'Gradle Config';
      default:
        return 'Bestand';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0f172a] rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Projectstructuur & Bestandenexport
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Codebasis: <span className="font-mono text-slate-300">{files.length} bestanden</span></span>
            <span aria-hidden="true">·</span>
            <span>Bundel: <span className="font-mono text-slate-300">Complete Android Native + C++23 + CI Pipeline</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{isZipping ? 'ZIP Genereren...' : 'Download Complete Projectbundel (ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File Tree / File List */}
        <div className="lg:col-span-4 bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Project Bestandenboom</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {files.length} bestanden
            </span>
          </div>

          <div className="p-2 space-y-1 max-h-[580px] overflow-y-auto">
            {files.map((file) => {
              const isSelected = selectedFilePath === file.path;
              return (
                <div
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors text-xs flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="font-mono truncate">{file.path}</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {getCategoryLabel(file.category)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer / File Inspector */}
        <div className="lg:col-span-8 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col h-[630px]">
          {/* Header of code viewer */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-white">
                  {selectedFile.path}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile.description}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Gekopieerd' : 'Kopiëren'}</span>
              </button>

              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                title="Download dit specifieke bestand"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Code content */}
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto overflow-x-auto text-slate-300 selection:bg-blue-600/30">
            <pre className="leading-relaxed">
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="flex">
                  <span className="w-10 select-none text-slate-600 text-right pr-4 shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="flex-1 whitespace-pre">{line}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* Footer stats */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Taal: {selectedFile.language.toUpperCase()}</span>
            <span>Regels: {selectedFile.content.split('\n').length}</span>
            <span>Grootte: {(new Blob([selectedFile.content]).size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
