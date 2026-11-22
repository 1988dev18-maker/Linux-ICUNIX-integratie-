import React, { useState } from 'react';
import { SecurityBoundaryItem } from '../types';
import { ShieldCheck, Lock, AlertCircle, FileLock2, KeyRound, Network, Cpu, ArrowUpRight } from 'lucide-react';

interface SecurityMatrixProps {
  items: SecurityBoundaryItem[];
}

export const SecurityMatrix: React.FC<SecurityMatrixProps> = ({ items }) => {
  const [filter, setFilter] = useState<'all' | 'v1' | 'roadmap'>('all');

  const filteredItems = items.filter((item) => {
    if (filter === 'v1') return item.statusV1 === 'Geïmplementeerd';
    if (filter === 'roadmap') return item.statusV1 !== 'Geïmplementeerd';
    return true;
  });

  const getStatusBadge = (status: SecurityBoundaryItem['statusV1']) => {
    switch (status) {
      case 'Geïmplementeerd':
        return (
          <span className="text-xs font-medium text-emerald-400">
            Geïmplementeerd in V1.0
          </span>
        );
      case 'In ontwerpfase':
        return (
          <span className="text-xs font-medium text-amber-400">
            In ontwerpfase
          </span>
        );
      case 'Gepland V2.0':
        return (
          <span className="text-xs font-medium text-blue-400">
            Gepland V2.0
          </span>
        );
      case 'Nog niet geïmplementeerd':
      default:
        return (
          <span className="text-xs font-medium text-slate-500">
            Nog niet geïmplementeerd
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Veiligweb Beveiligingsgrenzen & Architectuurmatrix
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Principes: <span className="font-mono text-slate-300">Read-Only Netwerkinspectie · Non-Root · Android Sandbox</span></span>
              <span aria-hidden="true">·</span>
              <span>Koppeling: <span className="font-mono text-slate-300">ICUNIX / SCV7 / IP-Chain</span></span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alle Modules ({items.length})
            </button>
            <button
              onClick={() => setFilter('v1')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'v1' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              V1.0 Actief ({items.filter((i) => i.statusV1 === 'Geïmplementeerd').length})
            </button>
            <button
              onClick={() => setFilter('roadmap')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'roadmap' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Roadmap ({items.filter((i) => i.statusV1 !== 'Geïmplementeerd').length})
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Let op met betrekking tot het Android OS beveiligingsmodel:</strong> Android is geen onbeperkte Linux-rootomgeving. Een reguliere app kan niet zomaar kernelregels, firewallconfiguraties of andere apps beheren. Voor VPN-functionaliteit is Android <code className="font-mono text-amber-100">VpnService</code> met expliciete gebruikerstoestemming verplicht. Voor sleutelbeheer hoort <code className="font-mono text-amber-100">Android Keystore</code> te worden gebruikt. De native netwerkinspectie van V1.0 is bewust strikt read-only.
          </div>
        </div>
      </div>

      {/* Table of Modules */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Onderdeel & Module</th>
                <th className="py-3 px-4">Status V1.0</th>
                <th className="py-3 px-4">Isolatieniveau</th>
                <th className="py-3 px-4">Beveiligingsgrens & Regel</th>
                <th className="py-3 px-4 text-right">CI Validatie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{item.module}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                      {item.description}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(item.statusV1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                    {item.isolationType}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 leading-relaxed max-w-md">
                    {item.boundaryRule}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                    {item.verifiedInCI ? (
                      <span className="text-emerald-400 font-medium">
                        CTest Verified
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        In backlog
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Three Deep-Dive Architectural Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Network className="w-4 h-4 text-blue-400" />
            <span>Passieve Inspectie (getifaddrs)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            De netwerkinspecteur analyseert uitsluitend lokale interfacetoestanden (<code className="font-mono text-slate-300">IFF_UP</code>, <code className="font-mono text-slate-300">IFF_LOOPBACK</code>) zonder routingtabellen of firewallregels te manipuleren. Dit beschermt de integriteit van het host-besturingssysteem.
          </p>
        </div>

        <div className="p-5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Post-Quantum & RFC Baseline</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Het protocolregister handhaaft RFC 9112/9113/9114, TLS 1.3 (RFC 8446) en reserveert NIST FIPS 203 (ML-KEM) en FIPS 204 (ML-DSA) voor post-quantum cryptografie. Onveilige legacy protocollen worden direct afgewezen.
          </p>
        </div>

        <div className="p-5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileLock2 className="w-4 h-4 text-amber-400" />
            <span>Menselijke Goedkeuring & Audit</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integratie met de Veiligweb uitbreidingslaag koppelt de native engine aan ICUNIX, SCV7 en IP-Chain, met een menselijke goedkeuringsstap voor iedere wijziging van het beveiligingsbeleid conform compliance standaarden.
          </p>
        </div>
      </div>
    </div>
  );
};
