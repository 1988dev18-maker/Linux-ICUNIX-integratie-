import React, { useState, useEffect, useRef } from 'react';
import { 
  BackupServerConfig, 
  BackupTransferProgress, 
  ProjectFile, 
  HAClusterConfig, 
  InotifySyncEvent 
} from '../types';
import { 
  initialHAClusterConfig, 
  initialSyncEvents, 
  haClusterConfigCl, 
  haSyncScriptSh, 
  haSystemdService 
} from '../data/haClusterData';
import { 
  Server, 
  ShieldCheck, 
  HardDrive, 
  Download, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Check, 
  FileCode2, 
  Settings2, 
  Lock, 
  Network, 
  Activity, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  Database
} from 'lucide-react';
import JSZip from 'jszip';

interface BackupManagerProps {
  files: ProjectFile[];
}

export const BackupManager: React.FC<BackupManagerProps> = ({ files }) => {
  // Mode switch: 'single' vs 'cluster'
  const [managerMode, setManagerMode] = useState<'single' | 'cluster'>('cluster');

  // Single-server config
  const [config, setConfig] = useState<BackupServerConfig>({
    host: '192.168.1.200',
    port: 21,
    protocol: 'ftps',
    tlsVersion: '1.3',
    remoteDir: '/srv/backups/veiligweb/v1.1/',
    username: 'veiligweb_backup',
    authMethod: 'password',
    enableCompression: true,
    archiveFormat: 'tar.gz',
    includeAuditDossier: true,
    includeSourceCode: true,
    includeBuildArtifacts: true,
  });

  // Single-server transfer progress
  const [transfer, setTransfer] = useState<BackupTransferProgress>({
    status: 'idle',
    percentage: 0,
    transferredBytes: 0,
    totalBytes: 2840500, // ~2.84 MB
    transferSpeedMBs: 0,
    elapsedSeconds: 0,
    sha256Checksum: '8e4f1029ba88019e9177a4421b0984cb9128004aa9128910ec88cb1024aa8910',
    logs: [
      '# Veiligweb FTPS Backup Client gereed.',
      '# Host: 192.168.1.200:21 · TLS 1.3 Enforced · Target: /srv/backups/veiligweb/v1.1/',
      '# Druk op "Start Overdracht naar FTPS Server" om de gesimuleerde sessie te starten.',
    ],
  });

  // HA Cluster Configuration State
  const [clusterConfig, setClusterConfig] = useState<HAClusterConfig>(initialHAClusterConfig);
  const [syncEvents, setSyncEvents] = useState<InotifySyncEvent[]>(initialSyncEvents);
  const [clusterLogs, setClusterLogs] = useState<string[]>([
    '[INIT] Veiligweb HA FTPS Cluster Daemon gestart op VIP 192.168.1.250:21',
    '[HEALTH] Node A (192.168.1.200) reageert op TLS 1.3 handshake (24ms) -> MASTER',
    '[HEALTH] Node B (192.168.1.201) reageert op TLS 1.3 handshake (31ms) -> STANDBY MIRROR',
    '[INOTIFY] Kernel watch actief op /srv/backups/veiligweb/v1.1/ (CLOSE_WRITE, MOVED_TO)',
    '[ARP] Gratuitous ARP verstuurd voor VIP 192.168.1.250 via eth0:1',
  ]);

  const [activeCodeTab, setActiveCodeTab] = useState<'cl_failover' | 'sh_sync' | 'service' | 'cl_single' | 'sh_single'>('cl_failover');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isFailoverSimulating, setIsFailoverSimulating] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const clusterLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    if (clusterLogRef.current) {
      clusterLogRef.current.scrollTop = clusterLogRef.current.scrollHeight;
    }
  }, [transfer.logs, clusterLogs]);

  // Handle live simulated single FTPS transfer
  const handleStartTransfer = async () => {
    if (transfer.status !== 'idle' && transfer.status !== 'completed' && transfer.status !== 'failed') {
      return;
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const archiveName = `veiligweb_backup_${timestamp}.${config.archiveFormat}`;

    setTransfer({
      status: 'preparing',
      percentage: 5,
      transferredBytes: 0,
      totalBytes: 2840500,
      transferSpeedMBs: 0,
      elapsedSeconds: 0,
      sha256Checksum: '8e4f1029ba88019e9177a4421b0984cb9128004aa9128910ec88cb1024aa8910',
      logs: [
        `[1/6] Initialiseren backup sessie voor archief: ${archiveName}`,
        `[2/6] Verzamelen C++23 bronbestanden, CI-pipeline en IP-Chain 18 nov dossiers...`,
        `[3/6] Archiveren met ${config.archiveFormat.toUpperCase()} compressie (gzip level 9)...`,
      ],
    });

    await new Promise((r) => setTimeout(r, 600));

    setTransfer((prev) => ({
      ...prev,
      status: 'connecting',
      percentage: 20,
      logs: [
        ...prev.logs,
        `[4/6] Verbinden met FTPS server op ${config.host}:${config.port}...`,
        `>> CONNECT ${config.host}:${config.port} (TCP/IP socket geopend)`,
        `<< 220-Veiligweb Secure FTP Server v3.4 (TLS 1.3 Required)`,
        `>> AUTH TLS`,
        `<< 234 Enabling TLS 1.3 Extensions. Initializing cryptographic handshake...`,
        `-- TLS 1.3 Handshake voltooid. Cipher: TLS_AES_256_GCM_SHA384 (256-bit AEAD)`,
        `>> USER ${config.username}`,
        `<< 331 User name okay, need password for ${config.username}`,
        `>> PASS ********`,
        `<< 230 User logged in successfully. Sandbox isolation active.`,
        `>> PBSZ 0`,
        `<< 200 Protection Buffer Size set to 0`,
        `>> PROT P`,
        `<< 200 Data channel successfully set to Private (TLS encrypted)`,
        `>> CWD ${config.remoteDir}`,
        `<< 250 Directory successfully changed to ${config.remoteDir}`,
      ],
    }));

    await new Promise((r) => setTimeout(r, 700));

    // Upload phases
    const totalBytes = 2840500;
    const intervals = [
      { pct: 35, bytes: 994175, speed: 12.4, log: `>> PASV\n<< 227 Entering Passive Mode (192,168,1,200,195,80)\n>> STOR ${archiveName}\n<< 150 Opening TLS data connection for ${archiveName}` },
      { pct: 60, bytes: 1704300, speed: 14.8, log: `.. Stream overdracht actief (1.70 MB / 2.84 MB) @ 14.8 MB/s` },
      { pct: 85, bytes: 2414425, speed: 13.9, log: `.. Stream overdracht actief (2.41 MB / 2.84 MB) @ 13.9 MB/s` },
      { pct: 100, bytes: totalBytes, speed: 11.2, log: `<< 226 Transfer complete. 2,840,500 bytes ontvangen.` },
    ];

    for (let i = 0; i < intervals.length; i++) {
      const step = intervals[i];
      await new Promise((r) => setTimeout(r, 650));
      setTransfer((prev) => ({
        ...prev,
        status: step.pct === 100 ? 'verifying' : 'uploading',
        percentage: step.pct,
        transferredBytes: step.bytes,
        transferSpeedMBs: step.speed,
        elapsedSeconds: i + 1,
        logs: [...prev.logs, step.log],
      }));
    }

    await new Promise((r) => setTimeout(r, 500));

    setTransfer((prev) => ({
      ...prev,
      status: 'completed',
      percentage: 100,
      logs: [
        ...prev.logs,
        `[5/6] Verifiëren SHA-256 integriteits-checksum op remote server...`,
        `-- Berekende SHA-256: 8e4f1029ba88019e9177a4421b0984cb9128004aa9128910ec88cb1024aa8910`,
        `-- Remote checksum:   8e4f1029ba88019e9177a4421b0984cb9128004aa9128910ec88cb1024aa8910`,
        `[6/6] SUCCES: Integriteit 100% gevalideerd. Archief permanent opgeslagen in ${config.remoteDir}.`,
        `>> QUIT`,
        `<< 221 Goodbye. Sessie veilig afgesloten.`,
      ],
    }));

    // Trigger an automatic inotify sync in cluster mode!
    handleSimulateInotifySync(archiveName);
  };

  // Simuleer een failover van Node A naar Node B
  const handleSimulateFailover = async () => {
    if (isFailoverSimulating) return;
    setIsFailoverSimulating(true);

    const isNodeAActive = clusterConfig.activeNodeId === 'node-a';

    setClusterLogs((prev) => [
      ...prev,
      `[SIMULATIE] Foutconditie geïnjecteerd op ${isNodeAActive ? 'Node A (192.168.1.200)' : 'Node B (192.168.1.201)'}`,
      `[HEALTH-WARN] Health check timeout op poort 21 (poging 1/3)...`,
    ]);

    await new Promise((r) => setTimeout(r, 600));

    setClusterLogs((prev) => [
      ...prev,
      `[HEALTH-WARN] Health check timeout op poort 21 (poging 2/3)...`,
      `[HEALTH-ERROR] Health check timeout op poort 21 (poging 3/3)! Drempel bereikt.`,
    ]);

    await new Promise((r) => setTimeout(r, 600));

    const targetNode = isNodeAActive ? 'Node B (192.168.1.201)' : 'Node A (192.168.1.200)';
    const newActiveId = isNodeAActive ? 'node-b' : 'node-a';

    setClusterLogs((prev) => [
      ...prev,
      `[FAILOVER] Initiëren VIP omschakeling naar ${targetNode}...`,
      `>> ip addr add ${clusterConfig.virtualIp}/24 dev eth0:1`,
      `>> arping -U -c 5 -I eth0 ${clusterConfig.virtualIp}`,
      `[ARP] Gratuitous ARP succesvol verstuurd (5 frames). Switches en clients geüpdatet.`,
      `[FAILOVER] VIP ${clusterConfig.virtualIp} succesvol overgenomen door ${targetNode} in 420ms!`,
      `[STATUS] ${targetNode} is nu ACTIEVE MASTER. Zero data-loss gegarandeerd via TLS 1.3 sessiehervatting.`,
    ]);

    setClusterConfig((prev) => ({
      ...prev,
      activeNodeId: newActiveId,
      primaryNode: {
        ...prev.primaryNode,
        status: isNodeAActive ? 'offline_failed' : 'active_master',
        health: isNodeAActive ? 'unreachable' : 'healthy',
      },
      secondaryNode: {
        ...prev.secondaryNode,
        status: isNodeAActive ? 'active_master' : 'standby_mirror',
        health: 'healthy',
      },
    }));

    setIsFailoverSimulating(false);
  };

  // Herstel primaire node
  const handleRecoverNode = () => {
    setClusterLogs((prev) => [
      ...prev,
      `[HERSTEL] Node A (192.168.1.200) service herstart via systemctl...`,
      `[HEALTH] Node A TLS 1.3 handshake geslaagd (21ms).`,
      `[CLUSTER] Node A opnieuw toegetreden tot het cluster als Standby Sync Mirror.`,
      `[INOTIFY] Incrementele delta-controle uitgevoerd: 0 ontbrekende archieven.`,
    ]);

    setClusterConfig((prev) => ({
      ...prev,
      primaryNode: {
        ...prev.primaryNode,
        status: prev.activeNodeId === 'node-a' ? 'active_master' : 'standby_mirror',
        health: 'healthy',
      },
      secondaryNode: {
        ...prev.secondaryNode,
        health: 'healthy',
      },
    }));
  };

  // Simuleer inotify event en delta-sync
  const handleSimulateInotifySync = (customFileName?: string) => {
    const fileName = customFileName || `veiligweb_backup_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}.tar.gz`;
    const newEvent: InotifySyncEvent = {
      id: `sync-ev-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      file: fileName,
      eventType: 'IN_CLOSE_WRITE',
      sourceNode: clusterConfig.activeNodeId === 'node-a' ? 'Node A (192.168.1.200)' : 'Node B (192.168.1.201)',
      targetNode: clusterConfig.activeNodeId === 'node-a' ? 'Node B (192.168.1.201)' : 'Node A (192.168.1.200)',
      durationMs: 38 + Math.floor(Math.random() * 20),
      sizeBytes: 2840500,
      status: 'synced',
      sha256: '8e4f1029ba88019e9177a4421b0984cb9128004aa9128910ec88cb1024aa8910',
    };

    setSyncEvents((prev) => [newEvent, ...prev.slice(0, 9)]);

    setClusterLogs((prev) => [
      ...prev,
      `[INOTIFY] Kernel event: IN_CLOSE_WRITE gedetecteerd voor ${fileName}`,
      `[DELTA-SYNC] Repliceren naar standby mirror over FTPS (TLS 1.3)...`,
      `[DELTA-SYNC] Voltooid in ${newEvent.durationMs}ms. SHA-256 geverifieerd (8e4f1029...).`,
    ]);
  };

  // Local zip creation
  const handleDownloadLocalArchive = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VEILIGWEB_BACKUP_${new Date().toISOString().slice(0, 10)}_V1.1.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Local backup creation failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = () => {
    let textToCopy = '';
    switch (activeCodeTab) {
      case 'cl_failover': textToCopy = haClusterConfigCl; break;
      case 'sh_sync': textToCopy = haSyncScriptSh; break;
      case 'service': textToCopy = haSystemdService; break;
      case 'cl_single': textToCopy = haClusterConfigCl; break;
      case 'sh_single': textToCopy = haSyncScriptSh; break;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCodeFile = () => {
    let filename = 'ftp_server_failover.cl';
    let content = haClusterConfigCl;
    let mime = 'text/plain';

    if (activeCodeTab === 'sh_sync') {
      filename = 'ftps_failover_sync.sh';
      content = haSyncScriptSh;
      mime = 'application/x-sh';
    } else if (activeCodeTab === 'service') {
      filename = 'veiligweb-ftps-sync.service';
      content = haSystemdService;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switch */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded uppercase">
                {managerMode === 'cluster' ? 'HA FTPS Cluster & Failover Daemon' : 'Enkele FTPS Server Mode'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Proceduren 1.0dev (500-Regel Invariant)
              </span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
              Lokale Backup, FTPS &amp; Failover Sync Daemon
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Hoge beschikbaarheid (HA) via Virtueel IP (VIP), continue inotify delta-synchronisatie en TLS 1.3 encryptie.
            </p>
          </div>

          {/* Mode Switch Button Group */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-black/60 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setManagerMode('cluster')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  managerMode === 'cluster'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>HA Cluster Mode (VIP)</span>
              </button>
              <button
                onClick={() => setManagerMode('single')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  managerMode === 'single'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Enkele Server Mode</span>
              </button>
            </div>

            <button
              onClick={handleDownloadLocalArchive}
              disabled={isZipping}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 active:scale-95 disabled:opacity-50"
            >
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>{isZipping ? 'Archiveren...' : 'Maak ZIP'}</span>
            </button>
          </div>
        </div>

        {/* HA Cluster Status Cards */}
        {managerMode === 'cluster' && (
          <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* VIP Routering Card */}
            <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="font-semibold uppercase tracking-wider">Virtueel IP (VIP)</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GARP Actief
                </span>
              </div>
              <div className="font-mono text-base font-bold text-cyan-300">
                {clusterConfig.virtualIp}:{clusterConfig.vipPort}
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Interface: {clusterConfig.vipInterface}</span>
                <span>Port: 21 (Control)</span>
              </div>
            </div>

            {/* Node A (Primary) */}
            <div className={`p-3.5 rounded-lg border transition-all space-y-1 ${
              clusterConfig.primaryNode.status === 'active_master'
                ? 'bg-blue-950/20 border-blue-500/40 text-white'
                : clusterConfig.primaryNode.status === 'offline_failed'
                ? 'bg-rose-950/20 border-rose-500/40 text-slate-300'
                : 'bg-black/40 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-400">Node A (Primair)</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  clusterConfig.primaryNode.status === 'active_master'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : clusterConfig.primaryNode.status === 'offline_failed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {clusterConfig.primaryNode.status === 'active_master' ? 'ACTIVE MASTER' : clusterConfig.primaryNode.status === 'offline_failed' ? 'OFFLINE / STORING' : 'STANDBY'}
                </span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-200">
                {clusterConfig.primaryNode.ip}:21
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Passief: 50000-50100</span>
                <span>Heartbeat: {clusterConfig.primaryNode.health === 'healthy' ? '24ms' : 'Timeout'}</span>
              </div>
            </div>

            {/* Node B (Secondary) */}
            <div className={`p-3.5 rounded-lg border transition-all space-y-1 ${
              clusterConfig.secondaryNode.status === 'active_master'
                ? 'bg-blue-950/20 border-blue-500/40 text-white'
                : 'bg-black/40 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-400">Node B (Secundair Mirror)</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  clusterConfig.secondaryNode.status === 'active_master'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {clusterConfig.secondaryNode.status === 'active_master' ? 'ACTIVE MASTER' : 'STANDBY MIRROR'}
                </span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-200">
                {clusterConfig.secondaryNode.ip}:21
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Passief: 50000-50100</span>
                <span>Inotify Sync Lag: 0.04s</span>
              </div>
            </div>
          </div>
        )}

        {/* HA Failover Actions Trigger Bar */}
        {managerMode === 'cluster' && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Interactieve HA Simulaties:</span>
              <button
                onClick={handleSimulateFailover}
                disabled={isFailoverSimulating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-950/30 hover:bg-amber-900/40 text-amber-200 border border-amber-500/40 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simuleer Failover (Node Crash)</span>
              </button>
              <button
                onClick={handleRecoverNode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Herstel Nodes (Cluster Herstel)</span>
              </button>
              <button
                onClick={() => handleSimulateInotifySync()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm active:scale-95"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Simuleer inotify Sync Event</span>
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400">TLS 1.3 Consistentie 100%</span>
              <span aria-hidden="true">·</span>
              <span>Passief: 50000-50100</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Configurator vs Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Editor */}
        <div className="lg:col-span-5 bg-[#0e1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">
                {managerMode === 'cluster' ? 'HA Cluster & Failover Editor (.cl)' : 'FTPS Server Parameters (.cl)'}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {managerMode === 'cluster' ? 'ftp_server_failover.cl' : 'ftp_server.cl'}
            </span>
          </div>

          {managerMode === 'cluster' ? (
            /* HA Cluster Configuration Fields */
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1 font-sans font-medium">Virtueel IP-Adres (VIP)</label>
                <input
                  type="text"
                  value={clusterConfig.virtualIp}
                  onChange={(e) => setClusterConfig({ ...clusterConfig, virtualIp: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-sans font-medium">VIP Interface</label>
                  <input
                    type="text"
                    value={clusterConfig.vipInterface}
                    onChange={(e) => setClusterConfig({ ...clusterConfig, vipInterface: e.target.value })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-sans font-medium">Service Poort</label>
                  <input
                    type="number"
                    value={clusterConfig.vipPort}
                    onChange={(e) => setClusterConfig({ ...clusterConfig, vipPort: parseInt(e.target.value) || 21 })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-sans font-medium">Primair IP (Node A)</label>
                  <input
                    type="text"
                    value={clusterConfig.primaryNode.ip}
                    onChange={(e) => setClusterConfig({
                      ...clusterConfig,
                      primaryNode: { ...clusterConfig.primaryNode, ip: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-sans font-medium">Secundair IP (Node B)</label>
                  <input
                    type="text"
                    value={clusterConfig.secondaryNode.ip}
                    onChange={(e) => setClusterConfig({
                      ...clusterConfig,
                      secondaryNode: { ...clusterConfig.secondaryNode, ip: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-sans font-medium">Health Check Interval</label>
                  <input
                    type="number"
                    value={clusterConfig.healthCheckIntervalSec}
                    onChange={(e) => setClusterConfig({
                      ...clusterConfig,
                      healthCheckIntervalSec: parseInt(e.target.value) || 2
                    })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-sans font-medium">Failover Drempel</label>
                  <input
                    type="number"
                    value={clusterConfig.failoverThresholdFails}
                    onChange={(e) => setClusterConfig({
                      ...clusterConfig,
                      failoverThresholdFails: parseInt(e.target.value) || 3
                    })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-sans font-medium">Inotify Watch Directory</label>
                <input
                  type="text"
                  value={clusterConfig.inotifyWatchDir}
                  onChange={(e) => setClusterConfig({ ...clusterConfig, inotifyWatchDir: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-sans font-medium">Gedeeld TLS 1.3 Certificaat Fingerprint</label>
                <input
                  type="text"
                  value={clusterConfig.sharedTlsCertFingerprint}
                  onChange={(e) => setClusterConfig({ ...clusterConfig, sharedTlsCertFingerprint: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 text-[10px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            /* Single Server Configuration Fields */
            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-sans font-medium">Server Host / IP</label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-sans font-medium">Poort</label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 21 })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-sans font-medium">Doelmap op Server</label>
                <input
                  type="text"
                  value={config.remoteDir}
                  onChange={(e) => setConfig({ ...config, remoteDir: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-sans font-medium">Gebruikersnaam</label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Terminal Console Output & Inotify Log */}
        <div className="lg:col-span-7 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col h-[560px] overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>
              <span className="text-xs font-mono text-slate-300 ml-2">
                {managerMode === 'cluster' ? `ha-sync-daemon: VIP ${clusterConfig.virtualIp}:21` : `ftps-client: ${config.host}:${config.port}`}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="text-emerald-400">TLS 1.3 Active</span>
              <span aria-hidden="true">·</span>
              <span>inotify kernel watch</span>
            </div>
          </div>

          {/* Terminal logs content */}
          <div
            ref={clusterLogRef}
            className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1 selection:bg-blue-600/30"
          >
            {(managerMode === 'cluster' ? clusterLogs : transfer.logs).map((line, idx) => {
              const isWarn = line.includes('[WARN]') || line.includes('[HEALTH-WARN]');
              const isError = line.includes('[ERROR]') || line.includes('[HEALTH-ERROR]');
              const isFailover = line.includes('[FAILOVER]') || line.includes('[ARP]');
              const isInotify = line.includes('[INOTIFY]') || line.includes('[DELTA-SYNC]');
              const isSuccess = line.includes('SUCCES') || line.includes('geslaagd') || line.includes('226 Transfer complete');

              let color = 'text-slate-300';
              if (isError) color = 'text-rose-400 font-bold';
              else if (isWarn) color = 'text-amber-400 font-semibold';
              else if (isFailover) color = 'text-cyan-300 font-semibold';
              else if (isInotify) color = 'text-blue-300';
              else if (isSuccess) color = 'text-emerald-400 font-semibold';

              return (
                <div key={idx} className={`leading-relaxed ${color}`}>
                  {line}
                </div>
              );
            })}
          </div>

          {/* Inotify Sync Queue Mini-Table */}
          {managerMode === 'cluster' && (
            <div className="bg-black/60 border-t border-slate-800 p-3 max-h-40 overflow-y-auto text-[11px] font-mono">
              <div className="text-slate-400 font-sans font-semibold text-xs mb-1.5 flex items-center justify-between">
                <span>Recente Inotify Delta Synchronisaties (Realtime)</span>
                <span className="text-emerald-400 text-[10px]">{syncEvents.length} events geregistreerd</span>
              </div>
              <div className="space-y-1">
                {syncEvents.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-slate-300 py-0.5 border-b border-slate-900 last:border-0">
                    <span className="truncate max-w-[200px] text-slate-200">{ev.file}</span>
                    <span className="text-slate-400">{ev.sourceNode.split(' ')[0]} → {ev.targetNode.split(' ')[0]}</span>
                    <span className="text-cyan-400">{ev.durationMs}ms</span>
                    <span className="text-emerald-400 font-bold">✓ SYNCED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration & Scripts Code Explorer */}
      <div className="bg-[#0b0f19] rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        {/* Navigation tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setActiveCodeTab('cl_failover')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeCodeTab === 'cl_failover'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              config/ftp_server_failover.cl (HA Cluster)
            </button>
            <button
              onClick={() => setActiveCodeTab('sh_sync')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeCodeTab === 'sh_sync'
                  ? 'bg-slate-800 text-blue-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              scripts/ftps_failover_sync.sh (Daemon)
            </button>
            <button
              onClick={() => setActiveCodeTab('service')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeCodeTab === 'service'
                  ? 'bg-slate-800 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              systemd/veiligweb-ftps-sync.service
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCodeFile}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Gekopieerd' : 'Kopieer'}</span>
            </button>
          </div>
        </div>

        {/* Code display */}
        <div className="p-4 font-mono text-xs overflow-x-auto text-slate-300 max-h-96 selection:bg-blue-600/30">
          <pre className="leading-relaxed">
            {(activeCodeTab === 'cl_failover'
              ? haClusterConfigCl
              : activeCodeTab === 'sh_sync'
              ? haSyncScriptSh
              : haSystemdService
            )
              .split('\n')
              .map((line, idx) => (
                <div key={idx} className="flex">
                  <span className="w-8 select-none text-slate-600 text-right pr-3 shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="flex-1 whitespace-pre">{line}</span>
                </div>
              ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
