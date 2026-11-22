import React, { useState } from 'react';
import { genesisAnchorData, genesisCppCode, genesisJsonAnchor } from '../data/genesisData';
import { investigationDossierData } from '../data/investigationData';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Key, 
  GitBranch, 
  FileCode, 
  FileJson, 
  Search, 
  ExternalLink,
  Lock,
  Cpu
} from 'lucide-react';

export const GenesisAnchorView: React.FC = () => {
  const [copiedRoot, setCopiedRoot] = useState<boolean>(false);
  const [copiedSig, setCopiedSig] = useState<boolean>(false);
  const [candidateHash, setCandidateHash] = useState<string>(genesisAnchorData.rootHash);
  const [activeCodeTab, setActiveCodeTab] = useState<'cpp' | 'json'>('cpp');
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number>(0);

  const handleCopy = (text: string, type: 'root' | 'sig') => {
    navigator.clipboard.writeText(text);
    if (type === 'root') {
      setCopiedRoot(true);
      setTimeout(() => setCopiedRoot(false), 2000);
    } else {
      setCopiedSig(true);
      setTimeout(() => setCopiedSig(false), 2000);
    }
  };

  // Verificatie logica
  const cleanCandidate = candidateHash.trim().toLowerCase();
  const isExactMatch = cleanCandidate === genesisAnchorData.rootHash.toLowerCase();
  const isHexOnly = /^[0-9a-f]+$/.test(cleanCandidate);
  const isLength64 = cleanCandidate.length === 64;

  const handleDownloadJson = () => {
    const blob = new Blob([genesisJsonAnchor], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'genesis_root_anchor.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# CRYPTOGRAFISCH GENESIS ROOT CERTIFICAAT
**Project:** Veiligweb Linux Mobile V1.1
**Dossier:** ${genesisAnchorData.dossierRef}
**Status:** ${genesisAnchorData.status}
**Autoriteit:** ${genesisAnchorData.signatory} (${genesisAnchorData.role})
**Datum:** ${genesisAnchorData.timestamp}

---

## 1. Verankerde Root Parameters
- **IP-Genesis Root Hash (SHA-256):**
  \`${genesisAnchorData.rootHash}\`
- **Payload Hash:**
  \`${genesisAnchorData.payloadHash}\`
- **Previous Hash (Zero Vector):**
  \`${genesisAnchorData.previousHash}\`
- **Algoritme:**
  ${genesisAnchorData.algorithm}
- **Handtekening:**
  \`${genesisAnchorData.signature}\`

---

## 2. C++23 Formele Verankering
Header: \`native/include/veiligweb/genesis.hpp\`
Geverifieerd via ISO C++23 \`constexpr\` en \`static_assert\`.
`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GENESIS_ROOT_CERTIFICAAT.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ipChain = investigationDossierData.ipChain;
  const currentBlock = ipChain[selectedBlockIdx] || ipChain[0];

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>CRYPTOGRAFISCH ROOT-ANKER · DOSSIER {genesisAnchorData.dossierRef}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            IP-Genesis Hash Verankering
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permanente, onveranderbare cryptografische oorsprong van de Veiligweb Linux Mobile IP-Chain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Anchor JSON</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Certificaat (MD)</span>
          </button>
        </div>
      </div>

      {/* Hero Anker Verzegelingskaart */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/30 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                IMMUTABLE ROOT ANCHOR
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Block #0 · ISO 8601: {genesisAnchorData.timestamp}
              </span>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Vastgelegde IP-Genesis Root Hash (SHA-256)
              </div>
              <div className="flex items-center gap-2 p-3 bg-black/60 rounded-lg border border-amber-500/25 font-mono text-xs sm:text-sm text-amber-200 select-all overflow-x-auto">
                <span className="font-semibold text-white tracking-wide">
                  {genesisAnchorData.rootHash}
                </span>
                <button
                  onClick={() => handleCopy(genesisAnchorData.rootHash, 'root')}
                  title="Kopieer Root Hash"
                  className="ml-auto p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  {copiedRoot ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Metagegevens rij conform zero-pill discipline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 mb-0.5">Autoriteit & Onderzoeker</div>
                <div className="font-semibold text-slate-200">{genesisAnchorData.signatory}</div>
                <div className="text-[11px] text-slate-400">{genesisAnchorData.role}</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 mb-0.5">Payload Hash (Initieel Leeg)</div>
                <div className="font-mono text-slate-300 truncate" title={genesisAnchorData.payloadHash}>
                  {genesisAnchorData.payloadHash}
                </div>
                <div className="text-[11px] text-slate-400">SHA-256 Vector: Lege Payload</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 sm:col-span-2 lg:col-span-1">
                <div className="text-slate-400 mb-0.5">Cryptografische Zegel</div>
                <div className="font-mono text-slate-300 truncate" title={genesisAnchorData.signature}>
                  {genesisAnchorData.signature}
                </div>
                <div className="text-[11px] text-slate-400">Ed25519 Forensische Handtekening</div>
              </div>
            </div>
          </div>

          {/* C++23 Compile-Time Badge */}
          <div className="lg:w-72 bg-black/40 border border-slate-800 p-4 rounded-lg flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>C++23 Native Invarianten</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span><code className="text-blue-300">constexpr std::string_view</code> (Zero heap overhead)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span><code className="text-blue-300">static_assert</code> compile-time integriteitscheck</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>Onveranderbare root voor blocks #1, #2 en #3</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
              Header: native/include/veiligweb/genesis.hpp
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Validatietool & Lineage DAG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom 1: Interactieve Validatietool */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Live Integriteit- & Validatietool</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">C++23 Validator Simulator</span>
          </div>

          <p className="text-xs text-slate-400">
            Verifieer willekeurige kandidaat-hashes tegen de verankerde IP-Genesis Root via de native <code className="text-blue-300">verify_genesis_root()</code> invariant.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Kandidaat SHA-256 Hash:</label>
            <input
              type="text"
              value={candidateHash}
              onChange={(e) => setCandidateHash(e.target.value)}
              placeholder="Voer 64-karakter SHA-256 hash in..."
              className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Snelknoppen voor scenario's */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 py-1 text-[11px]">Snelkeuze:</span>
            <button
              onClick={() => setCandidateHash(genesisAnchorData.rootHash)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-mono transition-colors"
            >
              Exacte Root Hash
            </button>
            <button
              onClick={() => setCandidateHash(ipChain[1].blockHash)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-mono transition-colors"
            >
              Block #1 Child Hash
            </button>
            <button
              onClick={() => setCandidateHash('bad000000000000000000000000000000000000000000000000000000000dead')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-mono transition-colors"
            >
              Ongeldige Hash
            </button>
          </div>

          {/* Validatieresultaten paneel */}
          <div className={`p-4 rounded-lg border transition-all ${
            isExactMatch
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 mb-2 font-medium text-xs">
              {isExactMatch ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">VERIFICATIE GESLAAGD — EXACTE ROOT OVEREENKOMST</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400 font-bold">VERIFICATIE AFGEWEZEN — ONGEAUTORISEERDE MUTATIE</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400">Lengte (64 tekens): </span>
                <span className={isLength64 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {cleanCandidate.length} / 64 {isLength64 ? '✓' : '✗'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Hex-tekenreeks: </span>
                <span className={isHexOnly ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {isHexOnly ? 'Conform [0-9a-f] ✓' : 'Niet conform ✗'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">C++23 verify_genesis_root(): </span>
                <span className={isExactMatch ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {isExactMatch ? 'true (constexpr noexcept)' : 'false (unexpected: hash_mismatch)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 2: IP-Chain Afstammingsgrafiek (DAG) */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">IP-Chain Lineage & Afstamming</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">4 Verankerde Blokken</span>
          </div>

          <p className="text-xs text-slate-400">
            De Genesis Root Hash vormt de onveranderbare basis van opeenvolgende auditblokken in het forensisch register.
          </p>

          <div className="space-y-2">
            {ipChain.map((block, idx) => {
              const isSelected = selectedBlockIdx === idx;
              const isGenesis = block.blockType === 'GENESIS';

              return (
                <div
                  key={block.blockNumber}
                  onClick={() => setSelectedBlockIdx(idx)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all text-xs ${
                    isSelected
                      ? isGenesis
                        ? 'bg-amber-950/30 border-amber-500/50 text-white'
                        : 'bg-blue-950/30 border-blue-500/50 text-white'
                      : 'bg-black/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isGenesis 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        #{block.blockNumber} {block.blockType}
                      </span>
                      <span className="font-semibold">{block.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {block.timestamp.slice(11, 23)}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[260px]">
                      Hash: <span className="text-slate-200">{block.blockHash.slice(0, 16)}...</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Parent: {block.previousHash.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailweergave geselecteerd blok */}
          <div className="p-3 bg-black/60 rounded-lg border border-slate-800 text-[11px] space-y-1.5 font-mono">
            <div className="text-slate-400 font-sans font-semibold text-xs border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Detail Block #{currentBlock.blockNumber}: {currentBlock.blockType}</span>
              <span className="text-amber-400 font-mono text-[10px]">{currentBlock.signatory}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Volledige Hash: </span>
              <span className="text-amber-300 break-all">{currentBlock.blockHash}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Previous Hash: </span>
              <span className="break-all">{currentBlock.previousHash}</span>
            </div>
            <div className="text-slate-400 font-sans text-xs pt-1">
              {currentBlock.description}
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer: C++23 Header & JSON Manifest */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('cpp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCodeTab === 'cpp'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>native/include/veiligweb/genesis.hpp (C++23)</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCodeTab === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>audit/genesis_root_anchor.json</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(activeCodeTab === 'cpp' ? genesisCppCode : genesisJsonAnchor, 'sig')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copiedSig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Kopieer code</span>
          </button>
        </div>

        <div className="p-4 bg-black/80 font-mono text-xs overflow-x-auto max-h-96">
          <pre className="text-slate-300 whitespace-pre leading-relaxed">
            {activeCodeTab === 'cpp' ? genesisCppCode : genesisJsonAnchor}
          </pre>
        </div>
      </div>
    </div>
  );
};
