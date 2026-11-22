import { HAClusterConfig, InotifySyncEvent } from '../types';

export const initialHAClusterConfig: HAClusterConfig = {
  virtualIp: '192.168.1.250',
  vipInterface: 'eth0:1',
  vipPort: 21,
  activeNodeId: 'node-a',
  healthCheckIntervalSec: 2,
  failoverThresholdFails: 3,
  inotifyWatchDir: '/srv/backups/veiligweb/v1.1/',
  inotifyDebounceMs: 250,
  sharedTlsCertFingerprint: 'SHA256:8F:90:C4:2A:A6:89:D0:01:B9:7E:55:10:2A:7B:8E:90:01:BA:88:29',
  autoFailback: false,
  primaryNode: {
    id: 'node-a',
    name: 'Node A (Primair Master)',
    ip: '192.168.1.200',
    port: 21,
    role: 'primary',
    status: 'active_master',
    health: 'healthy',
    tlsVersion: '1.3',
    passivePortRange: '50000-50100',
    lastHeartbeatMs: 24,
    syncLagSeconds: 0,
  },
  secondaryNode: {
    id: 'node-b',
    name: 'Node B (Secundair Mirror)',
    ip: '192.168.1.201',
    port: 21,
    role: 'secondary',
    status: 'standby_mirror',
    health: 'healthy',
    tlsVersion: '1.3',
    passivePortRange: '50000-50100',
    lastHeartbeatMs: 31,
    syncLagSeconds: 0.04,
  },
};

export const initialSyncEvents: InotifySyncEvent[] = [
  {
    id: 'sync-ev-104',
    timestamp: '2026-11-18T08:00:02.110Z',
    file: 'veiligweb_backup_20261118080000.tar.gz',
    eventType: 'IN_CLOSE_WRITE',
    sourceNode: 'Node A (192.168.1.200)',
    targetNode: 'Node B (192.168.1.201)',
    durationMs: 42,
    sizeBytes: 2840500,
    status: 'synced',
    sha256: '8e4f1029ba88019e9177a4421b0984cb9128004aa9128910ec88cb1024aa8910',
  },
  {
    id: 'sync-ev-103',
    timestamp: '2026-11-18T08:00:01.850Z',
    file: 'genesis_root_anchor.json',
    eventType: 'IN_CLOSE_WRITE',
    sourceNode: 'Node A (192.168.1.200)',
    targetNode: 'Node B (192.168.1.201)',
    durationMs: 12,
    sizeBytes: 1240,
    status: 'synced',
    sha256: '7b22d109f63567882e38c9509df636e2f1cf57b98ec36081492a4060875b42d1',
  },
  {
    id: 'sync-ev-102',
    timestamp: '2026-11-18T07:55:00.012Z',
    file: 'ip_chain_manifest.json',
    eventType: 'IN_CLOSE_WRITE',
    sourceNode: 'Node A (192.168.1.200)',
    targetNode: 'Node B (192.168.1.201)',
    durationMs: 16,
    sizeBytes: 3150,
    status: 'synced',
    sha256: 'a10982bb90146e29801cb9928374109ab772899011883746610092837466180a',
  },
];

export const haClusterConfigCl = `# ==============================================================================
# VEILIGWEB HA FTPS CLUSTER & FAILOVER CONFIGURATIE (.cl)
# Specificatie: High-Availability Failover & Inotify Synchronisatiedaemon
# Normering: Proceduren 1.0dev (500-regel conform, < 500 regels)
# ==============================================================================

[cluster]
cluster_id = "veiligweb-ha-backup-01"
virtual_ip = "192.168.1.250"
vip_interface = "eth0:1"
vip_netmask = "255.255.255.0"
service_port = 21
gratuitous_arp_count = 5
arping_interface = "eth0"

[primary_node]
node_id = "node-a"
hostname = "ftps-primary.veiligweb.internal"
ip_address = "192.168.1.200"
control_port = 21
passive_ports = "50000-50100"
role = "master"
storage_path = "/srv/backups/veiligweb/v1.1/"

[secondary_node]
node_id = "node-b"
hostname = "ftps-secondary.veiligweb.internal"
ip_address = "192.168.1.201"
control_port = 21
passive_ports = "50000-50100"
role = "backup_mirror"
storage_path = "/srv/backups/veiligweb/v1.1/"

[health_check]
interval_seconds = 2
timeout_seconds = 1
max_consecutive_failures = 3
check_type = "tls_handshake"
check_tls_version = "1.3"
check_command = "curl --silent --insecure --ssl-reqd --tlsv1.3 ftp://%IP%:21/"

[failover_policy]
preempt = false
auto_failback = false
notify_script = "/usr/local/bin/veiligweb_cluster_notify.sh"
split_brain_prevention = "quorum_ping_gateway"
gateway_ip = "192.168.1.1"

[synchronization]
daemon_type = "inotify_delta"
watch_directory = "/srv/backups/veiligweb/v1.1/"
watch_events = "IN_CLOSE_WRITE,IN_MOVED_TO,IN_DELETE"
debounce_ms = 250
sync_protocol = "ftps_tls1_3"
checksum_verify = true
checksum_algorithm = "SHA-256"
preserve_permissions = true

[security_tls]
enforce_tls = "1.3"
ciphers = "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256"
shared_certificate_path = "/etc/ssl/certs/veiligweb_ha_ftps.crt"
shared_private_key_path = "/etc/ssl/private/veiligweb_ha_ftps.key"
cert_fingerprint = "SHA256:8F:90:C4:2A:A6:89:D0:01:B9:7E:55:10:2A:7B:8E:90:01:BA:88:29"
`;

export const haSyncScriptSh = `#!/usr/bin/env bash
# ==============================================================================
# VEILIGWEB HA FTPS FAILOVER & INOTIFY SYNC DAEMON
# Bestand: scripts/ftps_failover_sync.sh
# Conformiteit: Proceduren 1.0dev (< 500 regels, modulaire isolatie)
# ==============================================================================

set -euo pipefail

CONFIG_FILE="\${1:-config/ftp_server_failover.cl}"
WATCH_DIR="/srv/backups/veiligweb/v1.1"
VIP="192.168.1.250"
PRIMARY_IP="192.168.1.200"
SECONDARY_IP="192.168.1.201"
LOG_TAG="veiligweb-ha-sync"

log_info()  { logger -t "\$LOG_TAG" "[INFO]  \$*"; echo "[INFO] \$*"; }
log_warn()  { logger -t "\$LOG_TAG" "[WARN]  \$*"; echo "[WARN] \$*" >&2; }
log_error() { logger -t "\$LOG_TAG" "[ERROR] \$*"; echo "[ERROR] \$*" >&2; }

# 1. Valideer aanwezigheid van benodigde tools
check_prerequisites() {
    for cmd in inotifywait curl arping lftp sha256sum; do
        if ! command -v "\$cmd" &>/dev/null; then
            log_warn "Commando \$cmd niet direct gevonden. Verifieer pakketinstallatie."
        fi
    done
}

# 2. Virtueel IP (VIP) beheer via Gratuitous ARP
take_vip() {
    local iface="\${1:-eth0}"
    log_info "VIP \$VIP overnemen op \$iface..."
    if command -v ip &>/dev/null; then
        ip addr add "\$VIP/24" dev "\$iface" label "\$iface:1" || true
        arping -U -c 5 -I "\$iface" "\$VIP" || true
    fi
    log_info "Gratuitous ARP verstuurd voor \$VIP. Verkeer gemigreerd."
}

release_vip() {
    local iface="\${1:-eth0}"
    log_info "VIP \$VIP vrijgeven op \$iface..."
    if command -v ip &>/dev/null; then
        ip addr del "\$VIP/24" dev "\$iface" || true
    fi
}

# 3. Health-check van de primaire node
check_primary_health() {
    local target_ip="\$1"
    if curl --silent --insecure --ssl-reqd --tlsv1.3 --max-time 2 "ftp://\$target_ip:21/" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# 4. Inotify Delta Synchronisatieloop
run_inotify_sync_loop() {
    local source_dir="\$1"
    local remote_host="\$2"

    log_info "Start inotify bestandswacht op \$source_dir..."
    
    # Bewaak CLOSE_WRITE en MOVED_TO events
    inotifywait -m -r -e close_write,moved_to --format '%w%f' "\$source_dir" 2>/dev/null | while read -r filepath; do
        if [[ -f "\$filepath" ]]; then
            local filename
            filename="$(basename "\$filepath")"
            local checksum
            checksum="$(sha256sum "\$filepath" | awk '{print \$1}')"

            log_info "Inotify event: \$filename (SHA-256: \${checksum:0:16}...)"
            
            # Delta sync via lftp over FTPS met TLS 1.3
            lftp -u veiligweb_backup,dummy -e "
                set ssl:verify-certificate no;
                set ftp:ssl-force yes;
                set ftp:ssl-protect-data yes;
                put -O /srv/backups/veiligweb/v1.1/ '\$filepath';
                quit;
            " "ftps://\$remote_host:21" &>/dev/null || log_warn "Replicatie van \$filename naar \$remote_host vereist retry."

            log_info "Delta-sync voltooid voor \$filename"
        fi
    done
}

main() {
    log_info "Veiligweb HA FTPS Failover & Sync Daemon geinitialiseerd."
    check_prerequisites

    # Indien lokaal secundair is, start monitoring loop
    local role="\${ROLE:-secondary}"
    if [[ "\$role" == "secondary" ]]; then
        local consecutive_fails=0
        while true; do
            if ! check_primary_health "\$PRIMARY_IP"; then
                consecutive_fails=\$((consecutive_fails + 1))
                log_warn "Primaire FTPS node (\$PRIMARY_IP) reageert niet (\${consecutive_fails}/3)"
                if [[ \$consecutive_fails -ge 3 ]]; then
                    log_error "Failover drempel bereikt! Schakel over naar Secundaire Node..."
                    take_vip "eth0"
                    break
                fi
            else
                consecutive_fails=0
            fi
            sleep 2
        done
    fi

    # Voer continue inotify replicatie uit
    run_inotify_sync_loop "\$WATCH_DIR" "\$SECONDARY_IP"
}

if [[ "\${BASH_SOURCE[0]}" == "\${0}" ]]; then
    main "\$@"
fi
`;

export const haSystemdService = `[Unit]
Description=Veiligweb HA FTPS Failover & Inotify Sync Daemon
After=network.target vsftpd.service
Requires=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/ftps_failover_sync.sh config/ftp_server_failover.cl
Restart=always
RestartSec=3s
LimitNOFILE=65536
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;
