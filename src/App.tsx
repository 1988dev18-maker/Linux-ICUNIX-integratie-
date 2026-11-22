import { useState, useMemo } from 'react';
import { TabType, PipelineJob, IntegrationTestSuite, WorkflowConfig, ProjectFile } from './types';
import { initialPipelineJobs, initialTestSuites, securityBoundaryItems } from './data/testSuites';
import { initialProjectFiles } from './data/projectFiles';
import { investigationDossierData } from './data/investigationData';
import { TopBar } from './components/TopBar';
import { TerminalVMView } from './components/TerminalVMView';
import { ProductionProgressDashboard } from './components/ProductionProgressDashboard';
import { GenesisAnchorView } from './components/GenesisAnchorView';
import { TestReportView } from './components/TestReportView';
import { BackupManager } from './components/BackupManager';
import { InvestigationDossier } from './components/InvestigationDossier';
import { CoreV1_1Explorer } from './components/CoreV1_1Explorer';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { TestRunner } from './components/TestRunner';
import { WorkflowEditor } from './components/WorkflowEditor';
import { SecurityMatrix } from './components/SecurityMatrix';
import { ProjectExporter } from './components/ProjectExporter';
import JSZip from 'jszip';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('terminal_vm');
  const [jobs, setJobs] = useState<PipelineJob[]>(initialPipelineJobs);
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [testSuites, setTestSuites] = useState<IntegrationTestSuite[]>(initialTestSuites);
  const [isTestsRunning, setIsTestsRunning] = useState<boolean>(false);
  const [simulationFailMode, setSimulationFailMode] = useState<boolean>(false);
  const [files] = useState<ProjectFile[]>(initialProjectFiles);

  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>({
    cxxStandard: 'c++23',
    ndkVersion: 'r27b',
    cmakeVersion: '3.22.1',
    apiLevels: [26, 35],
    abiTargets: ['arm64-v8a', 'x86_64', 'armeabi-v7a'],
    enableHostTests: true,
    enableIntegrationTests: true,
    failFast: false,
    ctestOutputOnFailure: true,
    compilerWarningsAsErrors: true,
  });

  // Dynamically generate the GitHub Actions YAML content based on workflowConfig
  const generatedYaml = useMemo(() => {
    return `name: Veiligweb Linux Mobile CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-format:
    name: C++23 Formatting & Static Analysis
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4

      - name: Install Clang-Tidy & Clang-Format
        run: |
          sudo apt-get update
          sudo apt-get install -y clang-format-18 clang-tidy-18

      - name: Verify Code Style (clang-format)
        run: |
          find native/ -name "*.hpp" -o -name "*.cpp" | xargs clang-format-18 --dry-run --Werror

  host-integration-tests:
    name: Host Tests (${workflowConfig.cxxStandard.toUpperCase()} & CTest Matrix)
    runs-on: ubuntu-24.04
    strategy:
      fail-fast: ${workflowConfig.failFast}
      matrix:
        compiler: [ { cxx: g++-14, cc: gcc-14 }, { cxx: clang++-18, cc: clang-18 } ]
        build_type: [ Debug, Release ]

    steps:
      - uses: actions/checkout@v4

      - name: Install Toolchain
        run: |
          sudo apt-get update
          sudo apt-get install -y \${{ matrix.compiler.cc }} \${{ matrix.compiler.cxx }} cmake ninja-build

      - name: Configure CMake with ${workflowConfig.cxxStandard.toUpperCase()} & Integration Tests
        env:
          CC: \${{ matrix.compiler.cc }}
          CXX: \${{ matrix.compiler.cxx }}
        run: |
          cmake -B build-host -G Ninja \\
            -DCMAKE_BUILD_TYPE=\${{ matrix.build_type }} \\
            -DVEILIGWEB_BUILD_TESTS=${workflowConfig.enableHostTests ? 'ON' : 'OFF'} \\
            -DVEILIGWEB_BUILD_INTEGRATION_TESTS=${workflowConfig.enableIntegrationTests ? 'ON' : 'OFF'} \\
            -DCMAKE_CXX_STANDARD=${workflowConfig.cxxStandard === 'c++23' ? '23' : '20'} \\
            -DCMAKE_CXX_STANDARD_REQUIRED=ON

      - name: Build Native Targets
        run: |
          cmake --build build-host --target veiligweb_tests veiligweb_core_v1_1_tests veiligweb_integration_tests

      - name: Run CTest Automated Integration Test Suite
        run: |
          ctest --test-dir build-host \\
            ${workflowConfig.ctestOutputOnFailure ? '--output-on-failure \\' : ''}
            --parallel 4 \\
            --timeout 30

  android-ndk-build:
    name: Android NDK Cross-Compile Matrix
    runs-on: ubuntu-24.04
    strategy:
      matrix:
        abi: [ ${workflowConfig.abiTargets.join(', ')} ]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android NDK ${workflowConfig.ndkVersion}
        uses: nttld/setup-ndk@v1
        with:
          ndk-version: ${workflowConfig.ndkVersion}

      - name: Cross-compile veiligweb_mobile (\${{ matrix.abi }})
        run: |
          cmake -S . -B build-android-\${{ matrix.abi }} \\
            -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake" \\
            -DANDROID_ABI=\${{ matrix.abi }} \\
            -DANDROID_PLATFORM=android-26 \\
            -DVEILIGWEB_BUILD_TESTS=OFF \\
            -DCMAKE_BUILD_TYPE=Release

          cmake --build build-android-\${{ matrix.abi }} --target veiligweb_mobile

      - name: Verify JNI Exported Symbols & Hardening
        run: |
          SO_PATH="build-android-\${{ matrix.abi }}/libveiligweb_mobile.so"
          test -f "$SO_PATH"
          nm -D "$SO_PATH" | grep -F "Java_org_veiligweb_mobile_MainActivity_nativeStatus"

  assemble-apk:
    name: Assemble Android APK & Validate Package
    needs: [ host-integration-tests, android-ndk-build ]
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK 35
        uses: android-actions/setup-android@v3

      - name: Setup Android NDK ${workflowConfig.ndkVersion}
        uses: nttld/setup-ndk@v1
        with:
          ndk-version: ${workflowConfig.ndkVersion}

      - name: Assemble Debug APK with Gradle
        run: |
          chmod +x gradlew || true
          ./gradlew assembleDebug --stacktrace

      - name: Archive APK
        uses: actions/upload-artifact@v4
        with:
          name: app-debug.apk
          path: app/build/outputs/apk/debug/app-debug.apk
`;
  }, [workflowConfig]);

  // Handle pipeline execution simulation
  const handleRunPipeline = async () => {
    if (isPipelineRunning) return;
    setIsPipelineRunning(true);

    setJobs((prev) =>
      prev.map((job) => ({
        ...job,
        status: 'queued',
        durationMs: undefined,
        steps: job.steps.map((s) => ({ ...s, status: 'queued', durationMs: undefined })),
      }))
    );

    for (let j = 0; j < jobs.length; j++) {
      const currentJobId = jobs[j].id;

      setJobs((prev) =>
        prev.map((job) => (job.id === currentJobId ? { ...job, status: 'running' } : job))
      );

      const currentJob = jobs[j];
      let jobDuration = 0;

      for (let s = 0; s < currentJob.steps.length; s++) {
        const stepId = currentJob.steps[s].id;

        setJobs((prev) =>
          prev.map((job) =>
            job.id === currentJobId
              ? {
                  ...job,
                  steps: job.steps.map((st) => (st.id === stepId ? { ...st, status: 'running' } : st)),
                }
              : job
          )
        );

        const stepTime = 550 + Math.random() * 350;
        await new Promise((res) => setTimeout(res, stepTime));
        jobDuration += stepTime;

        setJobs((prev) =>
          prev.map((job) =>
            job.id === currentJobId
              ? {
                  ...job,
                  steps: job.steps.map((st) =>
                    st.id === stepId ? { ...st, status: 'success', durationMs: stepTime } : st
                  ),
                }
              : job
          )
        );
      }

      setJobs((prev) =>
        prev.map((job) =>
          job.id === currentJobId
            ? { ...job, status: 'success', durationMs: jobDuration }
            : job
        )
      );
    }

    setIsPipelineRunning(false);
  };

  const handleRunSingleJob = async (jobId: string) => {
    if (isPipelineRunning) return;
    setIsPipelineRunning(true);

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: 'running',
              durationMs: undefined,
              steps: job.steps.map((s) => ({ ...s, status: 'running', durationMs: undefined })),
            }
          : job
      )
    );

    const jobIndex = jobs.findIndex((j) => j.id === jobId);
    if (jobIndex >= 0) {
      let jobDuration = 0;
      const targetJob = jobs[jobIndex];

      for (let s = 0; s < targetJob.steps.length; s++) {
        const stepId = targetJob.steps[s].id;
        const stepTime = 450 + Math.random() * 300;
        await new Promise((res) => setTimeout(res, stepTime));
        jobDuration += stepTime;

        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  steps: job.steps.map((st) =>
                    st.id === stepId ? { ...st, status: 'success', durationMs: stepTime } : st
                  ),
                }
              : job
          )
        );
      }

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: 'success', durationMs: jobDuration } : job
        )
      );
    }

    setIsPipelineRunning(false);
  };

  const handleResetPipeline = () => {
    setJobs(initialPipelineJobs);
  };

  // Automated Integration Tests execution handlers
  const handleRunAllTests = async () => {
    if (isTestsRunning) return;
    setIsTestsRunning(true);

    setTestSuites((prev) =>
      prev.map((suite) => ({
        ...suite,
        cases: suite.cases.map((c) => ({ ...c, status: 'running' })),
      }))
    );

    for (let s = 0; s < testSuites.length; s++) {
      const suite = testSuites[s];
      for (let c = 0; c < suite.cases.length; c++) {
        const tc = suite.cases[c];
        await new Promise((res) => setTimeout(res, 60));

        const shouldFail = simulationFailMode && tc.id === 'tc-proto-legacy-rejection';

        setTestSuites((prev) =>
          prev.map((curSuite) =>
            curSuite.id === suite.id
              ? {
                  ...curSuite,
                  cases: curSuite.cases.map((curCase) =>
                    curCase.id === tc.id
                      ? {
                          ...curCase,
                          status: shouldFail ? 'failed' : 'passed',
                          durationMs: 0.8 + Math.random() * 2.5,
                          assertions: curCase.assertions.map((a) =>
                            shouldFail && a.description.includes('SSLv3')
                              ? { ...a, passed: false, actual: 'false (toegestaan in regressor)', expected: 'true' }
                              : { ...a, passed: true }
                          ),
                        }
                      : curCase
                  ),
                }
              : curSuite
          )
        );
      }
    }

    setIsTestsRunning(false);
  };

  const handleRunSuite = async (suiteId: string) => {
    if (isTestsRunning) return;
    setIsTestsRunning(true);

    setTestSuites((prev) =>
      prev.map((suite) =>
        suite.id === suiteId
          ? { ...suite, cases: suite.cases.map((c) => ({ ...c, status: 'running' })) }
          : suite
      )
    );

    const suite = testSuites.find((s) => s.id === suiteId);
    if (suite) {
      for (const tc of suite.cases) {
        await new Promise((res) => setTimeout(res, 75));
        const shouldFail = simulationFailMode && tc.id === 'tc-proto-legacy-rejection';

        setTestSuites((prev) =>
          prev.map((curSuite) =>
            curSuite.id === suiteId
              ? {
                  ...curSuite,
                  cases: curSuite.cases.map((curCase) =>
                    curCase.id === tc.id
                      ? {
                          ...curCase,
                          status: shouldFail ? 'failed' : 'passed',
                          durationMs: 1.0 + Math.random() * 2.4,
                          assertions: curCase.assertions.map((a) =>
                            shouldFail && a.description.includes('SSLv3')
                              ? { ...a, passed: false, actual: 'false (foutief)', expected: 'true' }
                              : { ...a, passed: true }
                          ),
                        }
                      : curCase
                  ),
                }
              : curSuite
          )
        );
      }
    }

    setIsTestsRunning(false);
  };

  const handleRunSingleTestCase = async (suiteId: string, caseId: string) => {
    if (isTestsRunning) return;

    setTestSuites((prev) =>
      prev.map((suite) =>
        suite.id === suiteId
          ? {
              ...suite,
              cases: suite.cases.map((c) => (c.id === caseId ? { ...c, status: 'running' } : c)),
            }
          : suite
      )
    );

    await new Promise((res) => setTimeout(res, 140));
    const shouldFail = simulationFailMode && caseId === 'tc-proto-legacy-rejection';

    setTestSuites((prev) =>
      prev.map((suite) =>
        suite.id === suiteId
          ? {
              ...suite,
              cases: suite.cases.map((c) =>
                c.id === caseId
                  ? {
                      ...c,
                      status: shouldFail ? 'failed' : 'passed',
                      durationMs: 1.2 + Math.random() * 1.8,
                      assertions: c.assertions.map((a) =>
                        shouldFail && a.description.includes('SSLv3')
                          ? { ...a, passed: false, actual: 'false (foutief)', expected: 'true' }
                          : { ...a, passed: true }
                      ),
                    }
                  : c
              ),
            }
          : suite
      )
    );
  };

  const handleResetTests = () => {
    setTestSuites(initialTestSuites);
  };

  const handleToggleFailMode = () => {
    setSimulationFailMode((prev) => !prev);
  };

  // ZIP download handler
  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VEILIGWEB_PROJECT_V1.1_COMPLETE.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download ZIP error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Bar strictly conforming to Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunPipeline={handleRunPipeline}
        isPipelineRunning={isPipelineRunning}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'terminal_vm' && (
          <TerminalVMView />
        )}

        {activeTab === 'progress' && (
          <ProductionProgressDashboard />
        )}

        {activeTab === 'genesis' && (
          <GenesisAnchorView />
        )}

        {activeTab === 'test_report' && (
          <TestReportView
            testSuites={testSuites}
            onRerunAllTests={handleRunAllTests}
            isRunning={isTestsRunning}
          />
        )}

        {activeTab === 'backup' && (
          <BackupManager files={files} />
        )}

        {activeTab === 'investigation' && (
          <InvestigationDossier dossier={investigationDossierData} />
        )}

        {activeTab === 'core_v1_1' && (
          <CoreV1_1Explorer />
        )}

        {activeTab === 'pipeline' && (
          <PipelineVisualizer
            jobs={jobs}
            isPipelineRunning={isPipelineRunning}
            onRunPipeline={handleRunPipeline}
            onRunSingleJob={handleRunSingleJob}
            onResetPipeline={handleResetPipeline}
          />
        )}

        {activeTab === 'tests' && (
          <TestRunner
            testSuites={testSuites}
            isRunning={isTestsRunning}
            onRunAllTests={handleRunAllTests}
            onRunSuite={handleRunSuite}
            onRunSingleTestCase={handleRunSingleTestCase}
            onResetTests={handleResetTests}
            simulationFailMode={simulationFailMode}
            onToggleFailMode={handleToggleFailMode}
          />
        )}

        {activeTab === 'workflow' && (
          <WorkflowEditor
            config={workflowConfig}
            onUpdateConfig={(newConf) => setWorkflowConfig((prev) => ({ ...prev, ...newConf }))}
            yamlContent={generatedYaml}
          />
        )}

        {activeTab === 'security' && (
          <SecurityMatrix items={securityBoundaryItems} />
        )}

        {activeTab === 'exporter' && (
          <ProjectExporter files={files} />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 bg-[#090d16] text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div>
          Veiligweb Linux Mobile — Concept (0%) naar 100% Productie · Mijlpaal LS.1.0 PROJ-NR.13 (80:09) · Proceduren 1.0dev
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-400">500-Regel Conform</span>
          <span aria-hidden="true">·</span>
          <span>42/42 CTest Pass</span>
          <span aria-hidden="true">·</span>
          <span className="text-blue-400">C++23 -Werror</span>
          <span aria-hidden="true">·</span>
          <span>NDK r27b</span>
        </div>
      </footer>
    </div>
  );
}
