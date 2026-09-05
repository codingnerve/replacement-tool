'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Eye,
  Bug,
  RefreshCw,
  Trash2,
  Upload,
  Plus,
  ShieldCheck,
  Tag,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Type,
  Phone,
  FileText,
  CheckCircle2,
  Flame,
  Binary,
  Terminal,
  Activity,
} from 'lucide-react';
import {
  replacePhoneNumbers,
  ReplaceResult,
  PhoneReplacementRule,
  TextReplacementRule,
} from '@/lib/phone-replacer';
import { HighlightModal } from '@/components/HighlightModal';
import { DebugLogModal } from '@/components/DebugLogModal';
import { PipelineGraphic } from '@/components/PipelineGraphic';

const INITIAL_PHONE_RULES: PhoneReplacementRule[] = [
  {
    id: 'rule-usa',
    name: 'US / USA Numbers (+1 / 1-xxx)',
    prefixOrPattern: '+1',
    replacementNumber: '18664808426',
    enabled: true,
  },
  {
    id: 'rule-mexico',
    name: 'Mexico Numbers (+52)',
    prefixOrPattern: '+52',
    replacementNumber: '52-800-461-0242',
    enabled: true,
  },
  {
    id: 'rule-chile',
    name: 'Chile Numbers (+56)',
    prefixOrPattern: '+56',
    replacementNumber: '56-800-002-294',
    enabled: true,
  },
];

const INITIAL_TEXT_RULES: TextReplacementRule[] = [
  {
    id: 'text-1',
    findText: '{us}',
    replaceWith: '[USA]',
    caseSensitive: false,
    enabled: true,
  },
  {
    id: 'text-2',
    findText: '{mx}',
    replaceWith: '[MEXICO]',
    caseSensitive: false,
    enabled: true,
  },
];

const SAMPLE_TEXT = `marcando +1-844-354-0215 {us} 📌 , o al 📱 +52-800-461-0(242) {mx} (MX) [mx] o +52-800-461-0(242) {mx} (CDMX) , +52-800-461-0(242) {mx} (MX) ] . ¿Puedo modificar mi reserva
por México? Sí, llama al +1-844-354-0215 {us} 📌 , o al 📱 +52-800-461-0(242) {mx} (MX) [mx] o +52-800-461-0(242) {mx} (CDMX) , +52-800-461-0(242) {mx} (MX) ] y un asesor te ayudará con cambios de fecha o correcciones. ¿Cómo hablar con personas en LATAM Chile ? Hablar con personas reales en LATAM Chile es posible llamando al +1-844-354-0215 {us} 📌 , o al 📱 +52-800-461-0(242) {mx} (MX) [mx] o +52-800-461-0(242) {mx} (EE.UU)(CDMX) , +52-800-461-0(242) {mx} (ES) 📌 ]. Paso a paso, elige opciones como cambios de vuelo o problemas con reservaciones. ya que estas se

contactar a LATAM Chile en México | LATAM Chile México Oficial y Soporte ＋５２－８００－４６１－０２４２ {mx} ] (MX) Usa LATAM Chile LATAM Chile México para LATAM Chile Airlines . Llama al 📱 𝟏-𝟖𝟒𝟒-𝟑𝟓𝟒-𝟎𝟐𝟏𝟓 (US) [us] o ①-⑧₀₀-④⑥①-⓪②④② {mx} (CDMX) , +56-800-002-2(94) {mx} (MX) ] o 📱 +56-800-002-2(94) {mx} (MX) [mx] o +56-800-002-2(94) {mx} (CDMX) , +56-800-002-2(94) {mx} (MX) ] o +56-800-002-2(94) {mx} ] o - 📱 1̲8̲4̲4̲3̲5̲4̲0̲2̲1̲5̲ {mx} (MX) [mx] o +56-800-002-2(94) {mx} (CDMX) , +56-800-002-2(94) {mx} (MX) ] para LATAM Chile . 📱 4 horas.
El +56-800-002-2(94) {mx} o +56-800-002-2(94) {mx} (MX) (MX) conecta. 📱 LATAM Chile LATAM Chile México + +56-800-002-2(94) {mx} ](MX) El LATAM Chile LATAM Chile México conecta directamente con la atención humana ¿Cómo puedo hablar con un asesor de LATAM Chile ? Para`;

export default function Home() {
  // Config state
  const [defaultReplacement, setDefaultReplacement] = useState('56-800-002-294');
  const [minDigits, setMinDigits] = useState<number>(10);
  const [phoneRules, setPhoneRules] = useState<PhoneReplacementRule[]>(INITIAL_PHONE_RULES);
  const [textRules, setTextRules] = useState<TextReplacementRule[]>(INITIAL_TEXT_RULES);
  const [activeTab, setActiveTab] = useState<'phone' | 'text'>('phone');

  // Input / Output state
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState<ReplaceResult | null>(null);

  // UI Modals & Feedback state
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run replacement engine
  const handleExecuteReplace = () => {
    const res = replacePhoneNumbers(inputText, {
      defaultReplacementNumber: defaultReplacement,
      minDigits: Number(minDigits) || 1,
      rules: phoneRules,
      textRules,
    });
    setResult(res);
  };

  useEffect(() => {
    handleExecuteReplace();
  }, [phoneRules, textRules, defaultReplacement, minDigits]);

  const handleAddPhoneRule = () => {
    const newRule: PhoneReplacementRule = {
      id: `rule-${Date.now()}`,
      name: `Custom Prefix Rule ${phoneRules.length + 1}`,
      prefixOrPattern: '+44',
      replacementNumber: '44-800-123-456',
      enabled: true,
    };
    setPhoneRules([...phoneRules, newRule]);
  };

  const handleUpdatePhoneRule = (id: string, updatedFields: Partial<PhoneReplacementRule>) => {
    setPhoneRules(
      phoneRules.map((rule) => (rule.id === id ? { ...rule, ...updatedFields } : rule))
    );
  };

  const handleRemovePhoneRule = (id: string) => {
    setPhoneRules(phoneRules.filter((rule) => rule.id !== id));
  };

  const handleAddTextRule = () => {
    const newRule: TextReplacementRule = {
      id: `text-${Date.now()}`,
      findText: 'LATAM Chile',
      replaceWith: 'Delta Air',
      caseSensitive: false,
      enabled: true,
    };
    setTextRules([...textRules, newRule]);
  };

  const handleUpdateTextRule = (id: string, updatedFields: Partial<TextReplacementRule>) => {
    setTextRules(
      textRules.map((rule) => (rule.id === id ? { ...rule, ...updatedFields } : rule))
    );
  };

  const handleRemoveTextRule = (id: string) => {
    setTextRules(textRules.filter((rule) => rule.id !== id));
  };

  const handleCopyOutput = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    const res = replacePhoneNumbers(SAMPLE_TEXT, {
      defaultReplacementNumber: defaultReplacement,
      minDigits: Number(minDigits) || 1,
      rules: phoneRules,
      textRules,
    });
    setResult(res);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setInputText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern text-zinc-100 flex flex-col relative selection:bg-cyan-500/30">
      {/* Floating Animated Background Orbs */}
      <div className="bg-aurora">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      {/* Cyberpunk Top Navbar */}
      <nav className="border-b border-cyan-500/20 bg-[#06080e]/90 backdrop-blur-2xl sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-fuchsia-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse">
            <div className="h-full w-full bg-[#06080e] rounded-[10px] flex items-center justify-center text-white font-bold">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white text-base sm:text-xl text-holo-glow bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-transparent">
                ULTRA REPLACER MATRIX
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                v3.0 HYPER-DRIVE
              </span>
            </div>
          </div>
        </div>

        {/* Sci-Fi HUD Readout */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-zinc-400 bg-black/50 px-4 py-1.5 rounded-lg border border-white/10">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="h-3.5 w-3.5" /> SYS: NOMINAL
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-purple-400">LATENCY: 0.1ms</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400">LOCAL BUFFER</span>
          </div>

          <button
            onClick={handleLoadSample}
            className="cyber-btn flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-black text-black hover:brightness-125 transition-all active:scale-95 shadow-lg shadow-cyan-500/20 uppercase tracking-wider"
          >
            <RefreshCw className="h-3.5 w-3.5 text-black" />
            Load Sample
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        {/* Cyberpunk Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          <div className="lg:col-span-7 flex flex-col gap-4 text-center sm:text-left">
            <div className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              <Terminal className="h-4 w-4 text-cyan-400 animate-pulse" /> QUANTUM REPLACEMENT PROTOCOL
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Replace Phone Numbers & Text{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent text-holo-glow">
                In Any Holographic Matrix
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
              Instant client-side normalization for mathematical bold digits, fullwidth numbers, circled digits, combining diacritics, and multi-prefix rules.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
              {['Unicode Digits', 'Combining Underlines', 'Multi-Prefix Rules', 'Text Replacement', 'PDF & TXT Upload'].map(
                (tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono font-medium shadow-sm"
                  >
                    ⚡ {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Holographic Quantum Core Tech Banner Image */}
          <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#06080e] shadow-2xl">
            <img
              src="/images/quantum_core.jpg"
              alt="Holographic Quantum Core AI"
              className="w-full h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono font-bold text-cyan-300 bg-black/70 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/30">
              <span className="flex items-center gap-1.5">
                <Binary className="h-4 w-4 text-cyan-400" /> AI QUANTUM CORE v9.4
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">
                STABLE
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Architecture Graphic */}
        <PipelineGraphic />

        {/* Rule Studio Controls Panel */}
        <section className="hud-card rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('phone')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'phone'
                    ? 'btn-shimmer text-black shadow-lg shadow-cyan-500/30 scale-105 font-black uppercase'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Phone className="h-4 w-4" />
                Phone Number Rules ({phoneRules.length})
              </button>

              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'text'
                    ? 'btn-shimmer text-black shadow-lg shadow-fuchsia-500/30 scale-105 font-black uppercase'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Type className="h-4 w-4" />
                Text Find & Replace ({textRules.length})
              </button>
            </div>

            {activeTab === 'phone' ? (
              <button
                onClick={handleAddPhoneRule}
                className="cyber-btn flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-black text-black hover:brightness-125 active:scale-95 transition-all shadow-md uppercase tracking-wider"
              >
                <Plus className="h-4 w-4" />
                Add Phone Rule
              </button>
            ) : (
              <button
                onClick={handleAddTextRule}
                className="cyber-btn flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-2 text-xs font-black text-white hover:brightness-125 active:scale-95 transition-all shadow-md uppercase tracking-wider"
              >
                <Plus className="h-4 w-4" />
                Add Text Rule
              </button>
            )}
          </div>

          {/* TAB 1: PHONE RULES */}
          {activeTab === 'phone' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    DEFAULT REPLACEMENT NUMBER (FALLBACK)
                  </label>
                  <input
                    type="text"
                    value={defaultReplacement}
                    onChange={(e) => setDefaultReplacement(e.target.value)}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/60 px-4 py-2.5 text-sm text-white font-mono placeholder-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
                    placeholder="e.g. 56-800-002-294"
                  />
                  <span className="text-xs text-zinc-500">
                    Used for phone numbers that don't match any specific country prefix rule below.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    MIN DIGITS THRESHOLD
                  </label>
                  <input
                    type="number"
                    value={minDigits}
                    onChange={(e) => setMinDigits(Number(e.target.value))}
                    className="w-full rounded-xl border border-cyan-500/30 bg-black/60 px-4 py-2.5 text-sm text-white font-mono text-center focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
                    min={1}
                    max={100}
                  />
                  <span className="text-xs text-zinc-500">Min digits to treat as phone span.</span>
                </div>
              </div>

              {/* Prefix rules list */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Country Prefix Rules
                </span>

                <div className="grid grid-cols-1 gap-3">
                  {phoneRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        rule.enabled
                          ? 'border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/5'
                          : 'border-white/5 bg-white/[0.02] opacity-50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdatePhoneRule(rule.id, { enabled: !rule.enabled })}
                        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
                      >
                        {rule.enabled ? (
                          <ToggleRight className="h-6 w-6 text-amber-400" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-zinc-600" />
                        )}
                      </button>

                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => handleUpdatePhoneRule(rule.id, { name: e.target.value })}
                        placeholder="Rule Name (e.g. USA)"
                        className="w-full sm:w-1/4 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white font-semibold focus:border-amber-400 focus:outline-none"
                      />

                      <div className="flex items-center gap-1.5 w-full sm:w-1/4">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Match:</span>
                        <input
                          type="text"
                          value={rule.prefixOrPattern}
                          onChange={(e) =>
                            handleUpdatePhoneRule(rule.id, { prefixOrPattern: e.target.value })
                          }
                          placeholder="Prefix (+1, +52)"
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Replace:</span>
                        <input
                          type="text"
                          value={rule.replacementNumber}
                          onChange={(e) =>
                            handleUpdatePhoneRule(rule.id, { replacementNumber: e.target.value })
                          }
                          placeholder="Replacement Number"
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePhoneRule(rule.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEXT RULES */}
          {activeTab === 'text' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-fuchsia-400 flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" /> String & Tag Find & Replace Rules
              </span>

              <div className="grid grid-cols-1 gap-3">
                {textRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      rule.enabled
                        ? 'border-fuchsia-500/40 bg-fuchsia-500/5 shadow-md shadow-fuchsia-500/5'
                        : 'border-white/5 bg-white/[0.02] opacity-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleUpdateTextRule(rule.id, { enabled: !rule.enabled })}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="h-6 w-6 text-fuchsia-400" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-zinc-600" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5 w-full sm:w-1/3">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Find:</span>
                      <input
                        type="text"
                        value={rule.findText}
                        onChange={(e) => handleUpdateTextRule(rule.id, { findText: e.target.value })}
                        placeholder="Find text (e.g. {us})"
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-fuchsia-300 font-mono font-bold focus:border-fuchsia-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Replace:</span>
                      <input
                        type="text"
                        value={rule.replaceWith}
                        onChange={(e) => handleUpdateTextRule(rule.id, { replaceWith: e.target.value })}
                        placeholder="Replace text"
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:border-fuchsia-400 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none font-semibold">
                      <input
                        type="checkbox"
                        checked={rule.caseSensitive}
                        onChange={(e) =>
                          handleUpdateTextRule(rule.id, { caseSensitive: e.target.checked })
                        }
                        className="rounded border-white/20 text-fuchsia-500 focus:ring-0 bg-black/60"
                      />
                      <span>Match Case</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveTextRule(rule.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Dual Workbench Panel with Laser Scanline Effect */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="hud-card rounded-2xl p-5 flex flex-col gap-3 shadow-xl scanline-container">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <FileText className="h-4 w-4" /> PASTE OR UPLOAD CONTENT
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> Upload PDF / TXT
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,text/plain"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative rounded-xl border transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-cyan-500/20 bg-black/60'
              }`}
            >
              <textarea
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-transparent p-4 text-xs sm:text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none resize-y leading-relaxed"
                placeholder="Paste your content or drag & drop a PDF/TXT file here..."
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-1">
              <span>{inputText.length} CHARACTERS BUFFER</span>
              <button
                onClick={handleClear}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                CLEAR BUFFER
              </button>
            </div>
          </div>

          {/* Right: Output */}
          <div className="hud-card rounded-2xl p-5 flex flex-col gap-3 shadow-xl scanline-container">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> PROCESSED MATRIX OUTPUT
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyOutput}
                  className="cyber-btn flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 text-black text-xs font-black hover:brightness-125 transition-all active:scale-95 shadow uppercase tracking-wider"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-black" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Output'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-black/60 p-4 flex-1 min-h-[260px] max-h-[360px] overflow-y-auto">
              <textarea
                rows={12}
                readOnly
                value={result?.output || ''}
                className="w-full bg-transparent text-xs sm:text-sm font-mono text-zinc-200 focus:outline-none resize-none leading-relaxed"
                placeholder="Replaced output will appear live here..."
              />
            </div>

            {/* Action Triggers */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setIsHighlightModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm active:scale-95"
              >
                <Eye className="h-4 w-4 text-cyan-400" />
                Highlight Visual Diff
              </button>

              <button
                onClick={() => setIsDebugModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-mono font-bold text-fuchsia-300 hover:bg-fuchsia-500/20 transition-all shadow-sm active:scale-95"
              >
                <Bug className="h-4 w-4 text-fuchsia-400" />
                Debug Inspector Log
              </button>
            </div>
          </div>
        </section>

        {/* Metrics Dashboard */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hud-card rounded-2xl p-5 flex flex-col gap-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              TOTAL SPANS REPLACED
            </span>
            <span className="text-3xl font-black text-white font-mono tracking-tight text-holo-glow">
              {result ? result.totalSpansReplaced : 0}
            </span>
          </div>

          <div className="hud-card rounded-2xl p-5 flex flex-col gap-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-fuchsia-400">
              TEXT REPLACEMENTS
            </span>
            <span className="text-3xl font-black text-fuchsia-300 font-mono tracking-tight text-holo-glow">
              {result ? result.textReplacementsCount : 0}
            </span>
          </div>

          <div className="hud-card rounded-2xl p-5 flex flex-col gap-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              DIGITS NORMALIZED
            </span>
            <span className="text-3xl font-black text-emerald-300 font-mono tracking-tight text-holo-glow">
              {result ? result.totalDigitsReplaced : 0}
            </span>
          </div>

          <div className="hud-card rounded-2xl p-5 flex flex-col gap-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              ACTIVE RULE MATCHES
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result &&
                Object.entries(result.ruleStats).map(([ruleName, count]) => (
                  <span
                    key={ruleName}
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"
                  >
                    {ruleName}: {count}
                  </span>
                ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-[#06080e]/90 py-6 px-4 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>ULTRA REPLACER MATRIX v3.0 — 100% CLIENT-SIDE QUANTUM BUFFER. NO SERVER LOGS.</span>
      </footer>

      {/* Highlight View Modal */}
      <HighlightModal
        isOpen={isHighlightModalOpen}
        onClose={() => setIsHighlightModalOpen(false)}
        result={result}
      />

      {/* Debug Log Modal */}
      <DebugLogModal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        result={result}
      />
    </div>
  );
}
