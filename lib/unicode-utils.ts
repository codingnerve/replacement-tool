/**
 * Unicode normalization utilities for phone number extraction.
 * Normalizes fullwidth digits, mathematical bold/script/double-struck, circled,
 * subscript, superscript, Arabic-Indic, Indic, AND fullwidth/fancy punctuation
 * (fullwidth plus ＋, fullwidth dash －, em-dash —, fullwidth parens （）, fullwidth dot ．, fullwidth spaces).
 */

// Map specific enclosed/circled characters & fancy punctuation
const CHARACTER_MAP: Record<string, string> = {
  // Circled / Enclosed Digits
  '⓪': '0', '①': '1', '②': '2', '③': '3', '④': '4',
  '⑤': '5', '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9',
  '⓿': '0', '❶': '1', '❷': '2', '❸': '3', '❹': '4',
  '❺': '5', '❻': '6', '❼': '7', '❽': '8', '❾': '9',
  '🅀': '0', '🅁': '1', '🅂': '2', '🅃': '3', '🅄': '4',
  '🅅': '5', '🅆': '6', '🅇': '7', '🅈': '8', '🅉': '9',
  '⑴': '1', '⑵': '2', '⑶': '3', '⑷': '4', '⑸': '5',
  '⑹': '6', '⑺': '7', '⑻': '8', '⑼': '9',

  // Fancy Plus Signs
  '＋': '+', '﹢': '+', '➕': '+',

  // Fancy Dashes & Minuses
  '－': '-', '‐': '-', '‑': '-', '‒': '-', '–': '-',
  '—': '-', '―': '-', '﹣': '-', '➖': '-', '−': '-',

  // Fancy Dots
  '．': '.', '․': '.', '•': '.', '･': '.', '⋅': '.',

  // Fancy Parens & Brackets
  '（': '(', '❨': '(', '⁽': '(', '₍': '(',
  '）': ')', '❩': ')', '⁾': ')', '₎': ')',
  '［': '[', '【': '[', '〔': '[',
  '］': ']', '】': ']', '〕': ']',
  '｛': '{', '｝': '}',

  // Fancy Slashes
  '／': '/', '⁄': '/',

  // Fancy Spaces
  '　': ' ', '\u00A0': ' ', '\u2000': ' ', '\u2001': ' ',
  '\u2002': ' ', '\u2003': ' ', '\u2004': ' ', '\u2005': ' ',
  '\u2006': ' ', '\u2007': ' ', '\u2008': ' ', '\u2009': ' ',
  '\u200A': ' ', '\u200B': ' '
};

/**
 * Normalizes any single Unicode character (digit or punctuation symbol) to standard ASCII.
 */
export function normalizeUnicodeChar(char: string): string {
  if (!char) return '';

  // 1. Check explicit map first
  if (CHARACTER_MAP[char]) return CHARACTER_MAP[char];

  const cp = char.codePointAt(0);
  if (!cp) return char;

  // 2. Standard ASCII Digits 0-9
  if (cp >= 0x30 && cp <= 0x39) return char;

  // 3. Fullwidth digits (U+FF10 - U+FF19 -> 0-9)
  if (cp >= 0xff10 && cp <= 0xff19) {
    return String.fromCharCode(cp - 0xff10 + 0x30);
  }

  // 4. Mathematical Digits (U+1D7CE to U+1D7FF)
  // Covers Bold, Double-struck, Sans-serif, Monospace, Script font variants
  if (cp >= 0x1d7ce && cp <= 0x1d7ff) {
    const digit = (cp - 0x1d7ce) % 10;
    return String(digit);
  }

  // 5. Subscript Digits (U+2080 to U+2089 -> 0-9)
  if (cp >= 0x2080 && cp <= 0x2089) {
    return String.fromCharCode(cp - 0x2080 + 0x30);
  }

  // 6. Superscript Digits (U+2070, U+00B9, U+00B2, U+00B3, U+2074..U+2079)
  if (cp === 0x2070) return '0';
  if (cp === 0x00b9) return '1';
  if (cp === 0x00b2) return '2';
  if (cp === 0x00b3) return '3';
  if (cp >= 0x2074 && cp <= 0x2079) {
    return String.fromCharCode(cp - 0x2074 + 0x34);
  }

  // 7. Arabic-Indic Digits (U+0660..U+0669) & Eastern Arabic-Indic (U+06F0..U+06F9)
  if (cp >= 0x0660 && cp <= 0x0669) return String.fromCharCode(cp - 0x0660 + 0x30);
  if (cp >= 0x06f0 && cp <= 0x06f9) return String.fromCharCode(cp - 0x06f0 + 0x30);

  // 8. Indic Digits
  if (cp >= 0x0966 && cp <= 0x096f) return String.fromCharCode(cp - 0x0966 + 0x30);
  if (cp >= 0x09e6 && cp <= 0x09ef) return String.fromCharCode(cp - 0x09e6 + 0x30);
  if (cp >= 0x0a66 && cp <= 0x0a6f) return String.fromCharCode(cp - 0x0a66 + 0x30);
  if (cp >= 0x0ae6 && cp <= 0x0aef) return String.fromCharCode(cp - 0x0ae6 + 0x30);
  if (cp >= 0x0b66 && cp <= 0x0b6f) return String.fromCharCode(cp - 0x0b66 + 0x30);
  if (cp >= 0x0be6 && cp <= 0x0bef) return String.fromCharCode(cp - 0x0be6 + 0x30);
  if (cp >= 0x0c66 && cp <= 0x0c6f) return String.fromCharCode(cp - 0x0c66 + 0x30);
  if (cp >= 0x0ce6 && cp <= 0x0cef) return String.fromCharCode(cp - 0x0ce6 + 0x30);
  if (cp >= 0x0d66 && cp <= 0x0d6f) return String.fromCharCode(cp - 0x0d66 + 0x30);
  if (cp >= 0x0e50 && cp <= 0x0e59) return String.fromCharCode(cp - 0x0e50 + 0x30);
  if (cp >= 0x0ed0 && cp <= 0x0ed9) return String.fromCharCode(cp - 0x0ed0 + 0x30);
  if (cp >= 0x0f20 && cp <= 0x0f29) return String.fromCharCode(cp - 0x0f20 + 0x30);
  if (cp >= 0x1040 && cp <= 0x1049) return String.fromCharCode(cp - 0x1040 + 0x30);
  if (cp >= 0x17e0 && cp <= 0x17e9) return String.fromCharCode(cp - 0x17e0 + 0x30);

  // 9. NFKD fallback + diacritics & enclosing marks stripping
  const nfkd = char.normalize('NFKD').replace(/[\u0300-\u036f\u20d0-\u20ff]/g, '');
  if (CHARACTER_MAP[nfkd]) return CHARACTER_MAP[nfkd];
  if (/\d/.test(nfkd)) {
    return nfkd.replace(/\D/g, '');
  }

  return char;
}

/**
 * Normalizes full text string while building an index map from normalized positions to original raw string positions.
 */
export function buildNormalizedTextWithMap(inputText: string): {
  normalizedText: string;
  mapNormToRawIndex: number[];
} {
  const mapNormToRawIndex: number[] = [];
  let normalizedText = '';
  let rawIdx = 0;

  while (rawIdx < inputText.length) {
    const codePoint = inputText.codePointAt(rawIdx)!;
    const char = String.fromCodePoint(codePoint);
    const codePointLen = char.length;

    // Accumulate combining diacritics & enclosing marks attached to char
    let combinedChar = char;
    let nextIdx = rawIdx + codePointLen;
    while (nextIdx < inputText.length) {
      const nextCp = inputText.codePointAt(nextIdx)!;
      if ((nextCp >= 0x0300 && nextCp <= 0x036f) || (nextCp >= 0x20d0 && nextCp <= 0x20ff)) {
        combinedChar += String.fromCodePoint(nextCp);
        nextIdx += String.fromCodePoint(nextCp).length;
      } else {
        break;
      }
    }

    const normChar = normalizeUnicodeChar(combinedChar);

    for (let i = 0; i < normChar.length; i++) {
      mapNormToRawIndex.push(rawIdx);
      normalizedText += normChar[i];
    }

    rawIdx = nextIdx;
  }

  mapNormToRawIndex.push(inputText.length);

  return { normalizedText, mapNormToRawIndex };
}

/**
 * Normalize text to standard ASCII representation.
 */
export function normalizeUnicodeText(text: string): string {
  const { normalizedText } = buildNormalizedTextWithMap(text);
  return normalizedText;
}

/**
 * Extract only raw digit characters from a string (after unicode normalization).
 */
export function extractDigits(text: string): string {
  const normalized = normalizeUnicodeText(text);
  return normalized.replace(/\D/g, '');
}
