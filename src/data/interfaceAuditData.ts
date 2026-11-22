export interface AuditedInterfaceItem {
  id: string;
  name: string;
  category: 'physical' | 'virtual' | 'missing_required' | 'missing_optional';
  status: 'active' | 'down' | 'missing' | 'bound_virtual';
  typeLabel: string;
  ipV4: string;
  ipV6?: string;
  macAddress?: string;
  netmask: string;
  mtu: number;
  flags: string[];
  isPromiscuous: boolean;
  isPointToPoint: boolean;
  isLoopback: boolean;
  carrier: boolean;
  description: string;
  gapReason?: string;
  remediation?: string;
  securityImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface InterfaceGapAnalysis {
  investigationDossier: string;
  timestamp: string;
  leadAuditor: string;
  totalInterfacesEvaluated: number;
  activeCount: number;
  missingCount: number;
  virtualCount: number;
  downCount: number;
  summary: string;
  interfaces: AuditedInterfaceItem[];
  missingStructuralAttributes: {
    attribute: string;
    description: string;
    currentLimitation: string;
    proposedFix: string;
    impact: 'Laag' | 'Gemiddeld' | 'Hoog';
  }[];
  criticalFindings: {
    id: string;
    title: string;
    severity: 'KRITIEK' | 'HOOG' | 'AANDACHTSPUNT';
    detail: string;
    solution: string;
  }[];
}

export const interfaceAuditData: InterfaceGapAnalysis = {
  investigationDossier: 'VW-INV-20261118-0800-MB',
  timestamp: '2026-11-18T08:00:00+01:00',
  leadAuditor: 'Michel Bruining',
  totalInterfacesEvaluated: 7,
  activeCount: 3,
  missingCount: 2,
  virtualCount: 1,
  downCount: 1,
  summary:
    'Forensisch onderzoek naar netwerkinterfaces toont aan dat de 3 basisinterfaces (lo, wlan0, rmnet_data0) operationeel en read-only zijn. Er ontbreken echter 2 cruciale functionele interfaces (tun0 voor WireGuard/VPN en p2p0 voor Wi-Fi Direct sync), terwijl de virtuele failover interface eth0:1 nog niet formeel is geïntegreerd in de C++23 baseline structuur.',
  interfaces: [
    {
      id: 'iface-lo',
      name: 'lo',
      category: 'physical',
      status: 'active',
      typeLabel: 'Loopback Host Adapter',
      ipV4: '127.0.0.1',
      ipV6: '::1/128',
      macAddress: '00:00:00:00:00:00',
      netmask: '255.0.0.0 (/8)',
      mtu: 65536,
      flags: ['IFF_UP', 'IFF_LOOPBACK', 'IFF_RUNNING'],
      isPromiscuous: false,
      isPointToPoint: false,
      isLoopback: true,
      carrier: true,
      description: 'Lokale interne loopback interface. Geïsoleerd binnen de non-root Android/Linux sandbox (UID 10142).',
      securityImpact: 'none',
    },
    {
      id: 'iface-wlan0',
      name: 'wlan0',
      category: 'physical',
      status: 'active',
      typeLabel: 'Wi-Fi 802.11ac Draadloos',
      ipV4: '192.168.1.142',
      ipV6: 'fe80::4a21:92ff:fe31:a1b2/64',
      macAddress: '48:21:92:31:a1:b2',
      netmask: '255.255.255.0 (/24)',
      mtu: 1500,
      flags: ['IFF_UP', 'IFF_BROADCAST', 'IFF_MULTICAST', 'IFF_RUNNING'],
      isPromiscuous: false,
      isPointToPoint: false,
      isLoopback: false,
      carrier: true,
      description: 'Primaire lokale draadloze verbinding naar LAN. Read-only getifaddrs() inspectie geverifieerd (0 ioctl mutaties).',
      securityImpact: 'none',
    },
    {
      id: 'iface-rmnet0',
      name: 'rmnet_data0',
      category: 'physical',
      status: 'active',
      typeLabel: 'Cellular 5G / LTE (Qualcomm RIL)',
      ipV4: '10.84.192.12',
      ipV6: '2001:db8:85a3::8a2e:370:7334/64',
      macAddress: 'none (Point-to-Point)',
      netmask: '255.255.255.240 (/28)',
      mtu: 1420,
      flags: ['IFF_UP', 'IFF_POINTOPOINT', 'IFF_RUNNING', 'IFF_NOARP'],
      isPromiscuous: false,
      isPointToPoint: true,
      isLoopback: false,
      carrier: true,
      description: 'Mobiele dataverbinding via radio interface layer. Geen socket leaks buiten sandbox aangetroffen.',
      securityImpact: 'none',
    },
    {
      id: 'iface-eth0',
      name: 'eth0',
      category: 'physical',
      status: 'down',
      typeLabel: 'Vaste Ethernet Poort (RJ45)',
      ipV4: 'Geen IP toegewezen',
      netmask: '0.0.0.0',
      macAddress: '52:54:00:12:34:56',
      mtu: 1500,
      flags: ['IFF_BROADCAST', 'IFF_MULTICAST'],
      isPromiscuous: false,
      isPointToPoint: false,
      isLoopback: false,
      carrier: false,
      description: 'Fysieke Ethernet controller. Momenteel down (geen kabel aangesloten / no carrier).',
      gapReason: 'Interface is niet UP. Wordt in stand-alone modus gebruikt voor HA FTPS cluster koppeling.',
      remediation: 'Activeer interface via `ip link set eth0 up` zodra HA FTPS clusterkabel aangesloten is.',
      securityImpact: 'low',
    },
    {
      id: 'iface-eth0-vip',
      name: 'eth0:1 (VIP)',
      category: 'virtual',
      status: 'bound_virtual',
      typeLabel: 'HA Failover Virtueel IP (VIP)',
      ipV4: '192.168.1.250',
      netmask: '255.255.255.0 (/24)',
      macAddress: '52:54:00:12:34:56 (Gedeeld met eth0)',
      mtu: 1500,
      flags: ['IFF_UP', 'IFF_BROADCAST', 'IFF_RUNNING'],
      isPromiscuous: false,
      isPointToPoint: false,
      isLoopback: false,
      carrier: true,
      description: 'Virtueel IP alias voor FTPS High-Availability failover daemon (GARP broadcast).',
      gapReason: 'Aanwezig in failover scripts, maar ontbreekt als expliciete entiteit in de C++23 NetworkInterface struct.',
      remediation: 'Voeg virtuele interface parsing toe in C++23 getifaddrs() enumerator met type-tag `virtual_alias`.',
      securityImpact: 'medium',
    },
    {
      id: 'iface-tun0',
      name: 'tun0',
      category: 'missing_required',
      status: 'missing',
      typeLabel: 'Veiligweb WireGuard / VPN Tunnel',
      ipV4: '10.200.0.2 (Verwacht / Niet Gekoppeld)',
      netmask: '255.255.255.0 (/24)',
      mtu: 1420,
      flags: ['IFF_UP', 'IFF_POINTOPOINT', 'IFF_RUNNING'],
      isPromiscuous: false,
      isPointToPoint: true,
      isLoopback: false,
      carrier: false,
      description: 'Beveiligde versleutelde tunnelinterface voor internetverkeer conform het Veiligweb privacybeleid.',
      gapReason: 'ONTBREEKT: De Android VpnService of WireGuard kernel module is momenteel niet geïnitialiseerd.',
      remediation: 'Roep `veiligweb_vpn_init()` aan via de JNI Native Bridge of koppel WireGuard interface wg0.',
      securityImpact: 'high',
    },
    {
      id: 'iface-p2p0',
      name: 'p2p0',
      category: 'missing_optional',
      status: 'missing',
      typeLabel: 'Wi-Fi Direct P2P Device Mesh',
      ipV4: '192.168.49.1 (Verwacht bij Direct Sync)',
      netmask: '255.255.255.0 (/24)',
      mtu: 1500,
      flags: ['IFF_BROADCAST', 'IFF_MULTICAST'],
      isPromiscuous: false,
      isPointToPoint: false,
      isLoopback: false,
      carrier: false,
      description: 'Peer-to-peer Wi-Fi interface voor directe lokale FTPS bestandssynchronisatie tussen twee apparaten zonder router.',
      gapReason: 'ONTBREEKT: Wi-Fi P2P daemon is inactief. Wordt pas geactiveerd bij ad-hoc mobiele replicatie.',
      remediation: 'Start wpa_supplicant met p2p_interface configuratie voor offline veldsynchronisatie.',
      securityImpact: 'medium',
    },
  ],
  missingStructuralAttributes: [
    {
      attribute: 'IPv6 Dual-Stack Ondersteuning',
      description: 'Opslag en weergave van IPv6 Global en Link-Local adressering per interface',
      currentLimitation: 'C++ struct bevat slechts 1 veld `ip_address` (string), waardoor IPv6 wordt overschreven of weggelaten.',
      proposedFix: 'Voeg `std::string ipv6_address{};` of `std::vector<std::string> addresses;` toe aan `NetworkInterface`.',
      impact: 'Hoog',
    },
    {
      attribute: 'Promiscuous Mode Detectie (IFF_PROMISC)',
      description: 'Auditvlag om packet-sniffing en onveilige promiscuous netwerkkaarten te detecteren',
      currentLimitation: 'Inspecteur evalueert alleen `IFF_UP`, `IFF_LOOPBACK` en `IFF_RUNNING`. `IFF_PROMISC` ontbreekt.',
      proposedFix: 'Voeg `bool is_promiscuous = (ifa_flags & IFF_PROMISC) != 0;` toe in C++ netwerkinspecteur.',
      impact: 'Hoog',
    },
    {
      attribute: 'Hardware MAC-adres (Layer-2)',
      description: 'Link-layer adres verificatie voor ARP-spoofing en NIC validatie',
      currentLimitation: 'C++23 gebruikt alleen `AF_INET`/`AF_INET6`. `AF_PACKET` (sockaddr_ll) of sysfs MAC ontbreekt.',
      proposedFix: 'Lees `/sys/class/net/<iface>/address` of inspecteer `AF_PACKET` sockaddr_ll struct.',
      impact: 'Gemiddeld',
    },
    {
      attribute: 'Carrier & Link State Detectie (IFF_LOWER_UP)',
      description: 'Fysieke kabel/signaal detectie ter onderscheid van een geconfigureerde maar losgekoppelde poort',
      currentLimitation: 'Interface flags reflecteren alleen administratieve status, niet de fysieke carrier staat.',
      proposedFix: 'Lees `/sys/class/net/<iface>/carrier` of `IFF_LOWER_UP` flag.',
      impact: 'Gemiddeld',
    },
    {
      attribute: 'Realtime Interface Hotplug Monitoring (Netlink)',
      description: 'Dynamische detectie van aangesloten/verwijderde netwerkinterfaces',
      currentLimitation: 'getifaddrs() is een statische snapshot; vereist herhaalde polling voor interface-wijzigingen.',
      proposedFix: 'Implementeer Netlink `NETLINK_ROUTE` socket met `RTM_NEWLINK` en `RTM_DELLINK` event listener.',
      impact: 'Gemiddeld',
    },
  ],
  criticalFindings: [
    {
      id: 'FINDING-IFACE-001',
      title: 'Beveiligde VPN Interface "tun0" Ontbreekt in Actieve Runtime',
      severity: 'KRITIEK',
      detail:
        'Het Veiligweb platform belooft volledige netwerkisolatie en versleuteling. Echter, in de actieve kernel-omgeving is géén actieve `tun0` (WireGuard of OpenVPN) interface gebonden. Hierdoor loopt lokaal verkeer over de onbeveiligde `wlan0` interface.',
      solution: 'Initialiseer de native WireGuard client of Android VpnService tunnel vóór het openen van sockets.',
    },
    {
      id: 'FINDING-IFACE-002',
      title: 'HA Failover Virtueel IP (VIP) "eth0:1" Is Niet Gereflecteerd in C++ Kern Audit',
      severity: 'HOOG',
      detail:
        'De FTPS failover daemon bindt succesvol op 192.168.1.250:21 via `eth0:1`, maar de C++ inspectiemodule `list_network_interfaces()` aggregeert sub-interfaces zonder alias-tag waardoor de VIP niet direct traceerbaar is in de C++23 foutdomein asserts.',
      solution: 'Breid de interface-parser uit met alias-herkenning (gescheiden op de dubbele punt `:`) en koppel VIP-status.',
    },
    {
      id: 'FINDING-IFACE-003',
      title: 'Ontbreken van Promiscuous Mode Audit (`IFF_PROMISC`)',
      severity: 'AANDACHTSPUNT',
      detail:
        'Zonder controle op de `IFF_PROMISC` vlag kan een kwaadaardige app of gecompromitteerde container op hetzelfde netwerk verkeer afluisteren zonder dat de Veiligweb engine alarm slaat.',
      solution: 'Voeg `(ifa_flags & IFF_PROMISC)` toe aan de passieve getifaddrs() controle en genereer een waarschuwing indien actief.',
    },
  ],
};
