'use client';

import React from 'react';
import { X, CheckCircle2, Sparkles, FileText, Tag } from 'lucide-react';
import { ReplaceResult } from '../lib/phone-replacer';

interface HighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ReplaceResult | null;
}

export function HighlightModal({ isOpen, onClose, result }: HighlightModalProps) {
  if (!isOpen || !result) return null;

  const getRuleBadgeStyle = (category: string) => {
    if (category.startsWith('Text:')) {
      return 'bg-blue-500/15 text-blue-300 border-blue-500/40 hover:bg-blue-500/25';
    }
    if (category === 'DEFAULT') {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25';
    }
    if (category.toLowerCase().includes('usa') || category.includes('+1')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25';
    }
    if (category.toLowerCase().includes('mexico') || category.includes('52')) {
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/25';
    }
    return 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#12141d]/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#161824]/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Highlight Visual Diff
              </h2>
              <p className="text-xs text-zinc-400">
                Interactive preview of replaced phone numbers & text strings
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

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-white/5 bg-[#0f1118]/80 px-6 py-3 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-indigo-400" /> Active Rules Applied:
          </span>
          {Object.entries(result.ruleStats).map(([ruleName, count]) => (
            <div key={ruleName} className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              <span className="font-semibold text-zinc-200">{ruleName}:</span>
              <span className="text-indigo-400 font-mono font-bold">{count}</span>
            </div>
          ))}
        </div>

        {/* Highlight Content Container */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap selection:bg-indigo-500/30">
          {result.segments.map((segment, idx) => {
            if (!segment.match) {
              return <span key={idx}>{segment.text}</span>;
            }

            const m = segment.match;
            const style = getRuleBadgeStyle(m.category);

            return (
              <span
                key={idx}
                className={`group relative inline-block mx-0.5 px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide border transition-all shadow-sm ${style}`}
                title={`Rule: [${m.category}] | "${m.originalText}" ➜ "${m.replacementText}"`}
              >
                <span className="line-through opacity-60 mr-1.5">{m.originalText}</span>
                <span className="underline decoration-wavy font-bold">➜ {m.replacementText}</span>
                <span className="ml-1.5 text-[9px] opacity-80 uppercase px-1 rounded bg-black/30">
                  {m.category}
                </span>
              </span>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#161824]/90 px-6 py-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">{result.spans.length} total replacements highlighted</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-semibold text-white hover:from-indigo-500 hover:to-purple-500 shadow-md transition-all active:scale-95"
          >
            Done Viewing
          </button>
        </div>
      </div>
    </div>
  );
}
