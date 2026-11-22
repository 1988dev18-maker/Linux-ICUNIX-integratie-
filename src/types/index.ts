export type TabType = 'terminal_vm' | 'progress' | 'genesis' | 'test_report' | 'backup' | 'investigation' | 'core_v1_1' | 'pipeline' | 'tests' | 'workflow' | 'security' | 'exporter';

export type JobStatus = 'idle' | 'queued' | 'running' | 'success' | 'failure';

export interface PipelineStep {
  id: string;
  name: string;
  command: string;
  status: JobStatus;
  durationMs?: number;
  logs: string[];
}

export interface PipelineJob {
  id: string;
  name: string;
  runner: string;
  category: 'host' | 'android' | 'audit' | 'package';
  status: JobStatus;
  durationMs?: number;
  dependsOn?: string[];
  steps: PipelineStep[];
}

export interface TestCaseAssertion {
  description: string;
  passed: boolean;
  actual?: string;
  expected?: string;
}

export interface TestCase {
  id: string;
  name: string;
  functionName: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs: number;
  description: string;
  assertions: TestCaseAssertion[];
  stdout?: string;
}

export interface IntegrationTestSuite {
  id: string;
  name: string;
  module: string;
  filePath: string;
  description: string;
  cases: TestCase[];
}

export interface ProjectFile {
  path: string;
  name: string;
  category: 'workflow' | 'cmake' | 'native_headers' | 'native_src' | 'tests' | 'android_app' | 'gradle' | 'scripts' | 'audit_doc' | 'config';
  language: 'yaml' | 'cmake' | 'cpp' | 'java' | 'xml' | 'groovy' | 'bash' | 'markdown' | 'json';
  description: string;
  content: string;
}

export interface WorkflowConfig {
  cxxStandard: 'c++23' | 'c++20';
  ndkVersion: string;
  cmakeVersion: string;
  apiLevels: number[];
  abiTargets: string[];
  enableHostTests: boolean;
  enableIntegrationTests: boolean;
  failFast: boolean;
  ctestOutputOnFailure: boolean;
  compilerWarningsAsErrors: boolean;
}

export interface SecurityBoundaryItem {
  id: string;
  module: string;
  statusV1: 'Geïmplementeerd' | 'In ontwerpfase' | 'Nog niet geïmplementeerd' | 'Gepland V2.0';
  isolationType: 'User-space read-only' | 'JNI ABI sandbox' | 'Android VpnService vereist' | 'Android Keystore / TEE' | 'RFC / NIST standaard';
  description: string;
  boundaryRule: string;
  verifiedInCI: boolean;
}

export interface CoreProtocolItem {
  name: string;
  layer: 'application' | 'security' | 'transport' | 'naming' | 'identity' | 'post-quantum' | 'tunnel';
  status: 'design_scope' | 'planned' | 'forbidden';
  reference: string;
  pqcReady?: boolean;
}

export interface CoreNetworkIface {
  name: string;
  loopback: boolean;
  up: boolean;
  running: boolean;
  ipv4Address: string;
  netmask: string;
  mtu: number;
  readOnlyEnforced: boolean;
  ipv6Address?: string;
  macAddress?: string;
  isPromiscuous?: boolean;
  isPointToPoint?: boolean;
  carrier?: boolean;
  missingStatus?: 'active' | 'missing' | 'bound_virtual' | 'down';
}

export type CoreErrorCode = 
  | 'success'
  | 'protocol_not_found'
  | 'legacy_protocol_forbidden'
  | 'empty_protocol_name'
  | 'getifaddrs_failed'
  | 'interface_not_found'
  | 'buffer_overflow'
  | 'permission_denied';

export interface IPChainBlock {
  blockNumber: number;
  timestamp: string;
  blockType: 'GENESIS' | 'INTERFACE_AUDIT' | 'PROTOCOL_BASELINE' | 'SECURITY_SEAL';
  title: string;
  description: string;
  payloadHash: string;
  previousHash: string;
  blockHash: string;
  signatory: string;
  signature: string;
}

export interface GenesisAnchorData {
  rootHash: string;
  payloadHash: string;
  previousHash: string;
  timestamp: string;
  signatory: string;
  role: string;
  signature: string;
  algorithm: string;
  dossierRef: string;
  status: string;
}

export interface InvestigationDossierData {
  dossierNumber: string;
  title: string;
  timestamp: string;
  auditor: string;
  role: string;
  organization: string;
  status: 'VERZEGELD' | 'IN_BEHANDELING' | 'AFGEROND';
  scope: string;
  executiveSummary: string;
  interfacesAudited: {
    name: string;
    type: string;
    ip: string;
    flags: string;
    complianceStatus: 'CONFORM' | 'NIET_CONFORM';
    auditNote: string;
  }[];
  baselineChecks: {
    check: string;
    requirement: string;
    result: 'VOLDAAN' | 'GEFAALD';
    evidence: string;
  }[];
  ipChain: IPChainBlock[];
}

export interface BackupServerConfig {
  host: string;
  port: number;
  protocol: 'ftps' | 'sftp';
  tlsVersion: '1.3' | '1.2';
  remoteDir: string;
  username: string;
  authMethod: 'password' | 'ssh_key' | 'tls_cert';
  enableCompression: boolean;
  archiveFormat: 'tar.gz' | 'zip';
  includeAuditDossier: boolean;
  includeSourceCode: boolean;
  includeBuildArtifacts: boolean;
}

export interface BackupTransferProgress {
  status: 'idle' | 'preparing' | 'compressing' | 'connecting' | 'uploading' | 'verifying' | 'completed' | 'failed';
  percentage: number;
  transferredBytes: number;
  totalBytes: number;
  transferSpeedMBs: number;
  elapsedSeconds: number;
  sha256Checksum?: string;
  logs: string[];
}

export type ProgressTaskCategory = 
  | 'core_cpp'
  | 'cicd_pipeline'
  | 'forensic_ip'
  | 'security_sandbox'
  | 'backup_ftps'
  | 'qa_test';

export interface ProgressTask {
  id: string;
  title: string;
  description: string;
  category: ProgressTaskCategory;
  pillarName: string;
  weight: number;
  completed: boolean;
  ruleReference?: string;
  codeReference?: string;
  auditMilestone?: string;
  linesOfCodeEstimated?: number;
}

export interface PillarProgress {
  id: ProgressTaskCategory;
  name: string;
  weightPercentage: number;
  description: string;
  iconName: string;
}

export interface HANode {
  id: string;
  name: string;
  ip: string;
  port: number;
  role: 'primary' | 'secondary';
  status: 'active_master' | 'standby_mirror' | 'offline_failed';
  health: 'healthy' | 'degraded' | 'unreachable';
  tlsVersion: string;
  passivePortRange: string;
  lastHeartbeatMs: number;
  syncLagSeconds: number;
}

export interface HAClusterConfig {
  virtualIp: string;
  vipInterface: string;
  vipPort: number;
  primaryNode: HANode;
  secondaryNode: HANode;
  activeNodeId: string;
  healthCheckIntervalSec: number;
  failoverThresholdFails: number;
  inotifyWatchDir: string;
  inotifyDebounceMs: number;
  sharedTlsCertFingerprint: string;
  autoFailback: boolean;
}

export interface InotifySyncEvent {
  id: string;
  timestamp: string;
  file: string;
  eventType: 'IN_CLOSE_WRITE' | 'IN_MOVED_TO' | 'IN_DELETE';
  sourceNode: string;
  targetNode: string;
  durationMs: number;
  sizeBytes: number;
  status: 'synced' | 'syncing' | 'failed';
  sha256: string;
}

