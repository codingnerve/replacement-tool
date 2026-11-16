'use client';

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Copy, Check, Upload, Plus, Trash2, Eraser, Wand2 } from 'lucide-react';
import {
  replacePhoneNumbers,
  PhoneReplacementRule,
  TextReplacementRule,
} from '@/lib/phone-replacer';

const STORAGE_KEY = 'replacer-settings-v2';

const INITIAL_PHONE_RULES: PhoneReplacementRule[] = [
  { id: 'rule-usa', name: 'USA', prefixOrPattern: '+1', replacementNumber: '18664808426', enabled: true },
  { id: 'rule-mexico', name: 'Mexico', prefixOrPattern: '+52', replacementNumber: '52-800-461-0242', enabled: true },
  { id: 'rule-chile', name: 'Chile', prefixOrPattern: '+56', replacementNumber: '56-800-002-294', enabled: true },
];

const INITIAL_TEXT_RULES: TextReplacementRule[] = [
  { id: 'text-1', findText: '{us}', replaceWith: '[USA]', caseSensitive: false, enabled: true },
  { id: 'text-2', findText: '{mx}', replaceWith: '[MEXICO]', caseSensitive: false, enabled: true },
];

const EXAMPLE_TEXT = `Call us today at +1-844-354-0215 {us} or in Mexico at +52-800-461-0(242) {mx}.
Fancy digits work too: 𝟏-𝟖𝟒𝟒-𝟑𝟓𝟒-𝟎𝟐𝟏𝟓 and ＋５６－８００－００２－２９４.
Any other number, like 020 7946 0958, gets the default number.`;

const inputClass =
  'w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200';

const secondaryButton =
  'inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-base font-semibold text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-200';

const primaryButton =
  'inline-flex min-h-12 items-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-lg font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-slate-400';

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-slate-900 sm:text-2xl">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-lg text-white"
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

type Saved = {
  defaultReplacement?: string;
  minDigits?: number;
  phoneRules?: PhoneReplacementRule[];
  textRules?: TextReplacementRule[];
};

// Saved settings are optional; anything unreadable is ignored.
function readSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : {};
  } catch {
    return {};
  }
}

const subscribeNothing = () => () => {};

// Only draw the tool in the browser, so saved settings are there from the first paint.
export default function Home() {
  const isBrowser = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  );
  return isBrowser ? <Replacer /> : null;
}

function Replacer() {
  const [saved] = useState(readSaved);
  const [inputText, setInputText] = useState('');
  const [defaultReplacement, setDefaultReplacement] = useState(
    typeof saved.defaultReplacement === 'string' ? saved.defaultReplacement : '56-800-002-294'
  );
  const [minDigits, setMinDigits] = useState(typeof saved.minDigits === 'number' ? saved.minDigits : 10);
  const [phoneRules, setPhoneRules] = useState<PhoneReplacementRule[]>(
    Array.isArray(saved.phoneRules) ? saved.phoneRules : INITIAL_PHONE_RULES
  );
  const [textRules, setTextRules] = useState<TextReplacementRule[]>(
    Array.isArray(saved.textRules) ? saved.textRules : INITIAL_TEXT_RULES
  );

  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Remember the rules so people never have to re-enter them.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ defaultReplacement, minDigits, phoneRules, textRules })
      );
    } catch {
      // Storage may be blocked (private mode); the tool still works.
    }
  }, [defaultReplacement, minDigits, phoneRules, textRules]);

  // The result is always calculated from what is on screen, so it can never be out of date.
  const { result, error } = useMemo(() => {
    try {
      return {
        result: replacePhoneNumbers(inputText, {
          defaultReplacementNumber: defaultReplacement,
          minDigits: Math.max(1, Math.floor(minDigits) || 1),
          rules: phoneRules,
          textRules,
        }),
        error: '',
      };
    } catch {
      return { result: null, error: 'Something went wrong while replacing. Please check your rules.' };
    }
  }, [inputText, defaultReplacement, minDigits, phoneRules, textRules]);

  const output = result?.output ?? '';
  const phoneCount = result?.totalSpansReplaced ?? 0;
  const wordCount = result?.textReplacementsCount ?? 0;
  const changes = result?.spans ?? [];

  const updatePhoneRule = (id: string, fields: Partial<PhoneReplacementRule>) =>
    setPhoneRules((rules) => rules.map((r) => (r.id === id ? { ...r, ...fields } : r)));
  const updateTextRule = (id: string, fields: Partial<TextReplacementRule>) =>
    setTextRules((rules) => rules.map((r) => (r.id === id ? { ...r, ...fields } : r)));

  const addPhoneRule = () =>
    setPhoneRules((rules) => [
      ...rules,
      { id: `rule-${Date.now()}`, name: '', prefixOrPattern: '', replacementNumber: '', enabled: true },
    ]);
  const addTextRule = () =>
    setTextRules((rules) => [
      ...rules,
      { id: `text-${Date.now()}`, findText: '', replaceWith: '', caseSensitive: false, enabled: true },
    ]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    setTimeout(() => setCopyState('idle'), 2500);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setUploadError('');
    const isText = file.type.startsWith('text/') || /\.(txt|csv|md)$/i.test(file.name);
    if (!isText) {
      setUploadError('Please choose a plain text file (.txt). For other files, copy the text and paste it above.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setInputText(String(reader.result ?? ''));
    reader.onerror = () => setUploadError('That file could not be read. Please try another one.');
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Phone Number Replacer</h1>
          <p className="mt-2 text-lg text-slate-700">
            Paste your text, and every phone number is swapped for the one you choose.
            Everything stays in your browser — nothing is uploaded.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:py-8">
        {/* STEP 1 */}
        <Step number={1} title="Paste your text">
          <label htmlFor="input" className="sr-only">
            Text to change
          </label>
          <textarea
            id="input"
            rows={9}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your text here…"
            className={`${inputClass} resize-y leading-relaxed`}
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className={secondaryButton} onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-5 w-5" aria-hidden="true" /> Open a .txt file
            </button>
            <button type="button" className={secondaryButton} onClick={() => setInputText(EXAMPLE_TEXT)}>
              <Wand2 className="h-5 w-5" aria-hidden="true" /> Try an example
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setInputText('');
                setUploadError('');
              }}
              disabled={!inputText}
            >
              <Eraser className="h-5 w-5" aria-hidden="true" /> Clear
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.md,text/plain"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
          {uploadError && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-base font-medium text-red-800">
              {uploadError}
            </p>
          )}
        </Step>

        {/* STEP 2 */}
        <Step number={2} title="Choose what to replace">
          <h3 className="text-lg font-bold">Phone numbers</h3>
          <p className="mb-3 text-slate-700">
            A number is changed when it starts with the code on the left. Switch a row off to skip it.
          </p>

          <ul className="flex flex-col gap-3">
            {phoneRules.map((rule) => (
              <li
                key={rule.id}
                className={`rounded-xl border-2 p-3 ${
                  rule.enabled ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex min-h-11 items-center gap-2 text-base font-semibold">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => updatePhoneRule(rule.id, { enabled: e.target.checked })}
                      className="h-6 w-6 accent-blue-700"
                    />
                    On
                  </label>
                  <div className="w-28">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Starts with</label>
                    <input
                      type="text"
                      value={rule.prefixOrPattern}
                      onChange={(e) => updatePhoneRule(rule.id, { prefixOrPattern: e.target.value })}
                      placeholder="+1"
                      className={inputClass}
                    />
                  </div>
                  <div className="min-w-48 flex-1">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Replace with number</label>
                    <input
                      type="text"
                      value={rule.replacementNumber}
                      onChange={(e) => updatePhoneRule(rule.id, { replacementNumber: e.target.value })}
                      placeholder="1-800-555-0100"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoneRules((rules) => rules.filter((r) => r.id !== rule.id))}
                    className={`${secondaryButton} px-3 text-red-700`}
                    aria-label={`Remove rule for numbers starting with ${rule.prefixOrPattern || 'this code'}`}
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button type="button" className={`${secondaryButton} mt-3`} onClick={addPhoneRule}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Add another country
          </button>

          <div className="mt-5 rounded-xl bg-blue-50 p-4">
            <label htmlFor="default" className="mb-1 block text-base font-bold">
              Every other phone number becomes
            </label>
            <input
              id="default"
              type="text"
              value={defaultReplacement}
              onChange={(e) => setDefaultReplacement(e.target.value)}
              placeholder="1-800-555-0100"
              className={`${inputClass} sm:max-w-sm`}
            />
            {!defaultReplacement.trim() && (
              <p className="mt-2 font-medium text-amber-800">
                This is empty, so other phone numbers will be removed.
              </p>
            )}
          </div>

          <details className="mt-3">
            <summary className="min-h-11 cursor-pointer py-2 text-base font-semibold text-blue-800">
              More options
            </summary>
            <div className="mt-1 max-w-sm">
              <label htmlFor="min" className="mb-1 block text-base font-semibold">
                Only change numbers with at least this many digits
              </label>
              <input
                id="min"
                type="number"
                inputMode="numeric"
                min={1}
                max={30}
                value={minDigits}
                onChange={(e) => setMinDigits(Number(e.target.value))}
                className={`${inputClass} w-28`}
              />
            </div>
          </details>

          <hr className="my-6 border-slate-200" />

          <h3 className="text-lg font-bold">Words and tags</h3>
          <p className="mb-3 text-slate-700">
            Find a word or tag and swap it for something else. Leave the second box empty to delete it.
          </p>

          <ul className="flex flex-col gap-3">
            {textRules.map((rule) => (
              <li
                key={rule.id}
                className={`rounded-xl border-2 p-3 ${
                  rule.enabled ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex min-h-11 items-center gap-2 text-base font-semibold">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => updateTextRule(rule.id, { enabled: e.target.checked })}
                      className="h-6 w-6 accent-blue-700"
                    />
                    On
                  </label>
                  <div className="min-w-36 flex-1">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Find</label>
                    <input
                      type="text"
                      value={rule.findText}
                      onChange={(e) => updateTextRule(rule.id, { findText: e.target.value })}
                      placeholder="{us}"
                      className={inputClass}
                    />
                  </div>
                  <div className="min-w-36 flex-1">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Replace with</label>
                    <input
                      type="text"
                      value={rule.replaceWith}
                      onChange={(e) => updateTextRule(rule.id, { replaceWith: e.target.value })}
                      placeholder="(nothing)"
                      className={inputClass}
                    />
                  </div>
                  <label className="flex min-h-11 items-center gap-2 text-base">
                    <input
                      type="checkbox"
                      checked={rule.caseSensitive}
                      onChange={(e) => updateTextRule(rule.id, { caseSensitive: e.target.checked })}
                      className="h-6 w-6 accent-blue-700"
                    />
                    Match capitals exactly
                  </label>
                  <button
                    type="button"
                    onClick={() => setTextRules((rules) => rules.filter((r) => r.id !== rule.id))}
                    className={`${secondaryButton} px-3 text-red-700`}
                    aria-label={`Remove rule for ${rule.findText || 'this word'}`}
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button type="button" className={`${secondaryButton} mt-3`} onClick={addTextRule}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Add a word
          </button>
        </Step>

        {/* STEP 3 */}
        <Step number={3} title="Copy your result">
          <div role="status" aria-live="polite" className="mb-3 text-lg font-semibold">
            {error ? (
              <span className="text-red-700">{error}</span>
            ) : !inputText ? (
              <span className="text-slate-600">Paste some text in step 1 and the result appears here.</span>
            ) : phoneCount + wordCount === 0 ? (
              <span className="text-amber-800">Nothing needed changing in this text.</span>
            ) : (
              <span className="text-emerald-800">
                ✓ Done: {phoneCount} phone {phoneCount === 1 ? 'number' : 'numbers'} and {wordCount}{' '}
                {wordCount === 1 ? 'word' : 'words'} replaced.
              </span>
            )}
          </div>

          {/* Shows the whole result at full height (no inner scrolling); replaced parts are highlighted. */}
          <div
            id="output"
            role="region"
            aria-label="Result"
            tabIndex={0}
            className="min-h-48 whitespace-pre-wrap break-words rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-base leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            {output ? (
              result?.segments.map((seg, i) =>
                seg.changed ? (
                  <mark key={i} className="rounded bg-yellow-200 px-0.5 font-semibold text-slate-900">
                    {seg.text}
                  </mark>
                ) : (
                  <React.Fragment key={i}>{seg.text}</React.Fragment>
                )
              )
            ) : (
              <span className="text-slate-400">Your result will appear here.</span>
            )}
          </div>
          {output && (
            <p className="mt-2 text-base text-slate-600">
              <mark className="rounded bg-yellow-200 px-1 font-semibold text-slate-900">Yellow</mark> shows what was
              replaced. The copied text is plain, without highlighting.
            </p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <button type="button" className={primaryButton} onClick={handleCopy} disabled={!output}>
              {copyState === 'copied' ? (
                <Check className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Copy className="h-6 w-6" aria-hidden="true" />
              )}
              {copyState === 'copied' ? 'Copied!' : 'Copy result'}
            </button>
            {copyState === 'failed' && (
              <span role="alert" className="font-medium text-red-700">
                Couldn&apos;t copy automatically. Select the text above and press Ctrl+C.
              </span>
            )}
          </div>

          {changes.length > 0 && (
            <details className="mt-4">
              <summary className="min-h-11 cursor-pointer py-2 text-base font-semibold text-blue-800">
                See what changed ({changes.length})
              </summary>
              <ul className="mt-1 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {changes.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3 text-base">
                    <span className="break-all rounded bg-red-50 px-2 py-0.5 text-red-800 line-through">
                      {c.originalText}
                    </span>
                    <span aria-label="changed to">→</span>
                    <span className="break-all rounded bg-emerald-50 px-2 py-0.5 text-emerald-900">
                      {c.replacementText || '(removed)'}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Step>
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-10 text-center text-slate-600">
        Your text and settings never leave this device.
      </footer>
    </div>
  );
}
