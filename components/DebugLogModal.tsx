'use client';

import React, { useState } from 'react';
import { X, Bug, Copy, Check, Terminal, FileCode, Search } from 'lucide-react';
import { ReplaceResult } from '../lib/phone-replacer';

interface DebugLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ReplaceResult | null;
}

export function DebugLogModal({ isOpen, onClose, result }: DebugLogModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !result) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result.spans, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSpans = result.spans.filter(
    (s) =>
      s.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.replacementText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#12141d]/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#161824]/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-inner">
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Debug Log & Replacement Inspector
              </h2>
              <p className="text-xs text-zinc-400">
                Inspect matched phone spans, unicode normalization, text replacements & offsets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls & Filter Search */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/5 bg-[#0f1118]/80 px-6 py-3 text-xs gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'table'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Table Inspector ({filteredSpans.length})
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              Raw JSON
            </button>
          </div>

          {activeTab === 'table' && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter matches..."
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 text-zinc-200 hover:bg-white/20 transition-all font-semibold"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied JSON!' : 'Copy JSON'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs">
          {activeTab === 'table' ? (
            filteredSpans.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-sans">
                No matching replacement spans found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0c0e14]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-zinc-400">
                      <th className="py-3 px-4 font-semibold">#</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Category / Rule</th>
                      <th className="py-3 px-4 font-semibold">Original Text</th>
                      <th className="py-3 px-4 font-semibold">Normalized Text</th>
                      <th className="py-3 px-4 font-semibold">Digits Count</th>
                      <th className="py-3 px-4 font-semibold">Replacement Text</th>
                      <th className="py-3 px-4 font-semibold">Offset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {filteredSpans.map((span) => (
                      <tr key={span.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-zinc-500">{span.id}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              span.type === 'PHONE'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {span.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-zinc-200 max-w-[180px] truncate" title={span.category}>
                          {span.category}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-white max-w-[200px] truncate" title={span.originalText}>
                          {span.originalText}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-400 max-w-[200px] truncate" title={span.normalizedText}>
                          {span.normalizedText}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-400 font-bold">
                          {span.digitCount !== undefined ? span.digitCount : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-emerald-400 font-semibold">{span.replacementText}</td>
                        <td className="py-2.5 px-4 text-zinc-500">
                          {span.start}-{span.end}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <pre className="p-4 rounded-xl bg-[#0c0e14] border border-white/10 text-zinc-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(result.spans, null, 2)}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#161824]/90 px-6 py-4 text-xs text-zinc-400">
          <span>{result.spans.length} total replacement items parsed successfully</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-5 py-2 font-semibold text-white hover:bg-white/20 transition-all font-sans"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
