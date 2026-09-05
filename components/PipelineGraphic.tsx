'use client';

import React from 'react';
import { FileText, Cpu, Zap, Sparkles, Radio } from 'lucide-react';

export function PipelineGraphic() {
  return (
    <div className="w-full rounded-2xl hud-card p-5 sm:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
      {/* Sci-Fi HUD Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 text-holo-glow">
            QUANTUM REPLACEMENT PIPELINE PROTOCOL v3.0
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30 uppercase tracking-widest">
            CORE STATUS: ONLINE
          </span>
        </div>
      </div>

      {/* Futuristic Graphic + 4 Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
        {/* Left Tech Images Stack */}
        <div className="md:col-span-4 grid grid-cols-2 gap-2">
          <div className="relative group overflow-hidden rounded-xl border border-cyan-500/30 bg-black/60 shadow-lg">
            <img
              src="/images/quantum_core.jpg"
              alt="Holographic Quantum Core"
              className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-transparent to-transparent"></div>
            <div className="absolute bottom-1.5 left-2 text-[9px] font-mono font-bold text-cyan-300">
              ⚡ Quantum Core
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-xl border border-purple-500/30 bg-black/60 shadow-lg">
            <img
              src="/images/engine_chip.jpg"
              alt="Cybernetic Microchip Processor"
              className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-transparent to-transparent"></div>
            <div className="absolute bottom-1.5 left-2 text-[9px] font-mono font-bold text-purple-300">
              ⚙️ Cyber CPU
            </div>
          </div>
        </div>

        {/* Right 4 Pipeline Nodes */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Node 1 */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/40">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400">01</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                Raw Content Stream
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Parses PDF, TXT, or pasted text.
              </p>
            </div>
          </div>

          {/* Node 2 */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/40">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-400">02</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                Unicode Normalizer
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Decomposes bold/circled digits & diacritics.
              </p>
            </div>
          </div>

          {/* Node 3 */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-magenta-500/30 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-500/20 text-fuchsia-300 font-bold text-xs border border-fuchsia-500/40">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-fuchsia-400">03</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                Multi-Rule Matrix
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Matches prefixes & custom find/replace.
              </p>
            </div>
          </div>

          {/* Node 4 */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400">04</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Output & Visual Diff
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Generates diff highlight & debug metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
