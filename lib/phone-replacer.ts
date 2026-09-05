import { normalizeUnicodeText, extractDigits } from './unicode-utils';

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
  segments: { text: string; match?: SpanMatch }[];
}

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
 * Replaces both phone numbers (with unicode normalization & rules) and arbitrary text strings.
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
      segments: [{ text: '' }],
    };
  }

  // 1. Find Phone Number candidate spans
  const phonePattern = /(?:\+?\s*)?(?:[\(\{\[]?\s*[\d\uFF10-\uFF19\u1D7CE-\u1D7FF\u2460-\u24ea\u0300-\u036f]+\s*[\)\}\]]?[\s\-\.\/]*){2,}/gu;

  const phoneMatches: { start: number; end: number; raw: string }[] = [];
  let match: RegExpExecArray | null;

  phonePattern.lastIndex = 0;
  while ((match = phonePattern.exec(inputText)) !== null) {
    const raw = match[0];
    const start = match.index;
    const end = start + raw.length;
    const digits = extractDigits(raw);
    if (digits.length >= minDigits) {
      phoneMatches.push({ start, end, raw });
    }
  }

  // Deduplicate phone matches
  const filteredPhoneMatches: { start: number; end: number; raw: string }[] = [];
  for (const m of phoneMatches) {
    if (filteredPhoneMatches.length === 0) {
      filteredPhoneMatches.push(m);
    } else {
      const prev = filteredPhoneMatches[filteredPhoneMatches.length - 1];
      if (m.start < prev.end) {
        if (m.end > prev.end) {
          prev.end = m.end;
          prev.raw = inputText.slice(prev.start, prev.end);
        }
      } else {
        filteredPhoneMatches.push(m);
      }
    }
  }

  // 2. Process phone replacements
  const activePhoneRules = rules.filter((r) => r.enabled);
  const ruleStats: Record<string, number> = { DEFAULT: 0 };
  activePhoneRules.forEach((r) => {
    ruleStats[r.name || r.prefixOrPattern] = 0;
  });

  let phoneOutput = '';
  let lastIndex = 0;
  let totalDigitsReplaced = 0;
  const phoneSpans: SpanMatch[] = [];

  filteredPhoneMatches.forEach((m, idx) => {
    if (m.start > lastIndex) {
      phoneOutput += inputText.slice(lastIndex, m.start);
    }

    const normText = normalizeUnicodeText(m.raw);
    const digits = extractDigits(m.raw);

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
      normalizedText: normText,
      category,
      replacementText,
      start: m.start,
      end: m.end,
      digitCount: digits.length,
    };

    phoneSpans.push(spanMatch);
    phoneOutput += replacementText;
    lastIndex = m.end;
  });

  if (lastIndex < inputText.length) {
    phoneOutput += inputText.slice(lastIndex);
  }

  // 3. Apply Text Replacement Rules to the output text
  let finalOutput = phoneOutput;
  let textReplacementsCount = 0;
  const activeTextRules = textRules.filter((r) => r.enabled && r.findText);

  const textSpans: SpanMatch[] = [];

  activeTextRules.forEach((tRule) => {
    if (!tRule.findText) return;
    const flags = tRule.caseSensitive ? 'g' : 'gi';
    // Escape regex special characters in search string
    const escapedSearch = tRule.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearch, flags);

    let tMatch: RegExpExecArray | null;
    let occurrences = 0;

    while ((tMatch = regex.exec(finalOutput)) !== null) {
      occurrences++;
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

    if (occurrences > 0) {
      textReplacementsCount += occurrences;
      ruleStats[`Text: "${tRule.findText}"`] = occurrences;
      finalOutput = finalOutput.replace(regex, tRule.replaceWith);
    }
  });

  const allSpans = [...phoneSpans, ...textSpans];

  // Re-segment final output for highlighting
  const segments: { text: string; match?: SpanMatch }[] = [{ text: finalOutput }];

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
