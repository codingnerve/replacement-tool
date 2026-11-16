import {
  buildNormalizedTextWithMap,
  normalizeUnicodeText,
  extractDigits,
} from './unicode-utils';

export interface PhoneReplacementRule {
  id: string;
  name: string;
  prefixOrPattern: string; // e.g. "1", "+1", "52", "+52", "56"
  replacementNumber: string;
  enabled: boolean;
}

export interface TextReplacementRule {
  id: string;
  findText: string;
  replaceWith: string;
  caseSensitive: boolean;
  enabled: boolean;
}

export interface SpanMatch {
  id: number;
  type: 'PHONE' | 'TEXT';
  originalText: string;
  normalizedText: string;
  category: string;
  replacementText: string;
  start: number;
  end: number;
  digitCount?: number;
}

export interface ReplaceResult {
  output: string;
  totalSpansReplaced: number;
  totalDigitsReplaced: number;
  textReplacementsCount: number;
  ruleStats: Record<string, number>;
  spans: SpanMatch[];
  /** The full output split into pieces; `changed` pieces are replacements. */
  segments: { text: string; changed: boolean }[];
}

type Range = [number, number];

/**
 * Checks if a phone number span matches a specific prefix rule.
 */
export function matchesRule(rawText: string, digits: string, prefixOrPattern: string): boolean {
  if (!prefixOrPattern) return false;
  const cleanPrefix = prefixOrPattern.trim().replace(/[^\d+]/g, '');
  const norm = normalizeUnicodeText(rawText).trim();

  if (cleanPrefix.startsWith('+')) {
    if (norm.startsWith(cleanPrefix) || norm.startsWith(cleanPrefix.slice(1))) {
      return true;
    }
  }

  const digitPrefix = cleanPrefix.replace(/\D/g, '');
  if (digitPrefix && digits.startsWith(digitPrefix)) {
    return true;
  }

  return false;
}

/**
 * Main phone number & text replacement algorithm.
 * Replaces phone numbers in any unicode format (fullwidth digits, fullwidth plus/dashes, mathematical bold, spaces between digits, parens) and arbitrary text strings.
 */
export function replacePhoneNumbers(
  inputText: string,
  options: {
    defaultReplacementNumber: string;
    minDigits: number;
    rules: PhoneReplacementRule[];
    textRules?: TextReplacementRule[];
  }
): ReplaceResult {
  const { defaultReplacementNumber, minDigits, rules, textRules = [] } = options;

  if (!inputText) {
    return {
      output: '',
      totalSpansReplaced: 0,
      totalDigitsReplaced: 0,
      textReplacementsCount: 0,
      ruleStats: {},
      spans: [],
      segments: [],
    };
  }

  // 1. Universal Normalization (Digits + Fullwidth Punctuation) with Index Mapping
  const { normalizedText, mapNormToRawIndex } = buildNormalizedTextWithMap(inputText);

  // 2. Scan candidate phone spans on normalizedText
  const phonePattern = /(?:[\(\{\[]\s*)?(?:\+\s*)?\d(?:[\s\-\.\/()\[\]{},;:~_*#\u00A0\u2000-\u200B\u3000]*\d)+/gu;

  const phoneMatches: { start: number; end: number; raw: string; norm: string }[] = [];
  let match: RegExpExecArray | null;

  phonePattern.lastIndex = 0;
  while ((match = phonePattern.exec(normalizedText)) !== null) {
    let normMatchStr = match[0];
    const normStart = match.index;
    let normEnd = normStart + normMatchStr.length;

    // A number like "+52-800-461-0(242)" ends with its closing bracket; keep it with the number.
    for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}']]) {
      const opens = normMatchStr.split(open).length - 1;
      const closes = normMatchStr.split(close).length - 1;
      if (opens > closes && normalizedText[normEnd] === close) {
        normEnd += 1;
        normMatchStr = normalizedText.slice(normStart, normEnd);
        phonePattern.lastIndex = normEnd;
      }
    }

    // Map back to original raw input offsets
    const rawStart = mapNormToRawIndex[normStart];
    const rawEnd = mapNormToRawIndex[normEnd];
    const rawText = inputText.slice(rawStart, rawEnd);

    const digits = normMatchStr.replace(/\D/g, '');
    if (digits.length >= minDigits) {
      phoneMatches.push({ start: rawStart, end: rawEnd, raw: rawText, norm: normMatchStr });
    }
  }

  // Deduplicate overlapping phone matches
  const filteredPhoneMatches: { start: number; end: number; raw: string; norm: string }[] = [];
  for (const m of phoneMatches) {
    if (filteredPhoneMatches.length === 0) {
      filteredPhoneMatches.push(m);
    } else {
      const prev = filteredPhoneMatches[filteredPhoneMatches.length - 1];
      if (m.start < prev.end) {
        if (m.end > prev.end) {
          prev.end = m.end;
          prev.raw = inputText.slice(prev.start, prev.end);
          prev.norm = normalizedText.slice(m.start, m.end);
        }
      } else {
        filteredPhoneMatches.push(m);
      }
    }
  }

  // 3. Process phone replacements
  const activePhoneRules = rules.filter((r) => r.enabled);
  const ruleStats: Record<string, number> = { DEFAULT: 0 };
  activePhoneRules.forEach((r) => {
    ruleStats[r.name || r.prefixOrPattern] = 0;
  });

  let phoneOutput = '';
  // Parts of the output that were replaced (kept in step with the output string).
  let changedRanges: Range[] = [];
  let lastIndex = 0;
  let totalDigitsReplaced = 0;
  const phoneSpans: SpanMatch[] = [];

  filteredPhoneMatches.forEach((m, idx) => {
    if (m.start > lastIndex) {
      phoneOutput += inputText.slice(lastIndex, m.start);
    }

    const digits = m.norm.replace(/\D/g, '');

    let matchedRule: PhoneReplacementRule | null = null;
    for (const rule of activePhoneRules) {
      if (matchesRule(m.raw, digits, rule.prefixOrPattern)) {
        matchedRule = rule;
        break;
      }
    }

    const category = matchedRule ? matchedRule.name || matchedRule.prefixOrPattern : 'DEFAULT';
    const replacementText = matchedRule
      ? matchedRule.replacementNumber || defaultReplacementNumber
      : defaultReplacementNumber;

    ruleStats[category] = (ruleStats[category] || 0) + 1;
    totalDigitsReplaced += digits.length;

    const spanMatch: SpanMatch = {
      id: idx + 1,
      type: 'PHONE',
      originalText: m.raw,
      normalizedText: m.norm,
      category,
      replacementText,
      start: m.start,
      end: m.end,
      digitCount: digits.length,
    };

    phoneSpans.push(spanMatch);
    changedRanges.push([phoneOutput.length, phoneOutput.length + replacementText.length]);
    phoneOutput += replacementText;
    lastIndex = m.end;
  });

  if (lastIndex < inputText.length) {
    phoneOutput += inputText.slice(lastIndex);
  }

  // 4. Apply Text Replacement Rules to the output text
  let finalOutput = phoneOutput;
  let textReplacementsCount = 0;
  const activeTextRules = textRules.filter((r) => r.enabled && r.findText);

  const textSpans: SpanMatch[] = [];

  activeTextRules.forEach((tRule) => {
    if (!tRule.findText) return;
    const flags = tRule.caseSensitive ? 'g' : 'gi';
    const escapedSearch = tRule.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearch, flags);


    const matches: { index: number; length: number }[] = [];
    let tMatch: RegExpExecArray | null;
    while ((tMatch = regex.exec(finalOutput)) !== null) {
      matches.push({ index: tMatch.index, length: tMatch[0].length });
      textSpans.push({
        id: phoneSpans.length + textSpans.length + 1,
        type: 'TEXT',
        originalText: tMatch[0],
        normalizedText: tMatch[0],
        category: `Text: "${tRule.findText}"`,
        replacementText: tRule.replaceWith,
        start: tMatch.index,
        end: tMatch.index + tMatch[0].length,
      });
    }

    if (matches.length === 0) return;

    textReplacementsCount += matches.length;
    ruleStats[`Text: "${tRule.findText}"`] = matches.length;

    // Build the new text, remembering where each replacement landed.
    const edits: { oldStart: number; oldEnd: number; newStart: number; newEnd: number }[] = [];
    let next = '';
    let cursor = 0;
    for (const m of matches) {
      next += finalOutput.slice(cursor, m.index);
      const newStart = next.length;
      next += tRule.replaceWith;
      edits.push({ oldStart: m.index, oldEnd: m.index + m.length, newStart, newEnd: next.length });
      cursor = m.index + m.length;
    }
    next += finalOutput.slice(cursor);

    // Move earlier highlights to where that text now sits.
    const mapPos = (pos: number, isEnd: boolean): number => {
      let lo = 0;
      let hi = edits.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (edits[mid].oldEnd <= pos) lo = mid + 1;
        else hi = mid;
      }
      const inside = edits[lo];
      if (inside && pos > inside.oldStart) return isEnd ? inside.newEnd : inside.newStart;
      return lo > 0 ? edits[lo - 1].newEnd + (pos - edits[lo - 1].oldEnd) : pos;
    };
    changedRanges = [
      ...changedRanges.map(([s, e]): Range => [mapPos(s, false), mapPos(e, true)]),
      ...edits.map((e): Range => [e.newStart, e.newEnd]),
    ];
    finalOutput = next;
  });

  const allSpans = [...phoneSpans, ...textSpans];

  // Split the final output into plain and replaced pieces so the page can highlight them.
  const sorted = changedRanges.filter(([s, e]) => e > s).sort((a, b) => a[0] - b[0]);
  const merged: Range[] = [];
  for (const [s, e] of sorted) {
    const last = merged[merged.length - 1];
    if (last && s < last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  const segments: { text: string; changed: boolean }[] = [];
  let pos = 0;
  for (const [s, e] of merged) {
    if (s > pos) segments.push({ text: finalOutput.slice(pos, s), changed: false });
    segments.push({ text: finalOutput.slice(s, e), changed: true });
    pos = e;
  }
  if (pos < finalOutput.length) segments.push({ text: finalOutput.slice(pos), changed: false });

  return {
    output: finalOutput,
    totalSpansReplaced: phoneSpans.length,
    totalDigitsReplaced,
    textReplacementsCount,
    ruleStats,
    spans: allSpans,
    segments,
  };
}
