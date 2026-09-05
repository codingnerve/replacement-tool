/**
 * Unicode normalization utilities for phone number extraction.
 * Handles fullwidth, mathematical bold/script/double-struck, circled,
 * combining underlines, overlays, and obfuscated Unicode characters.
 */

// Map specific Unicode digit representations to standard ASCII digits 0-9
const CIRCLED_DIGITS_MAP: Record<string, string> = {
  '⓪': '0', '①': '1', '②': '2', '③': '3', '④': '4',
  '⑤': '5', '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9',
  '⓿': '0', '❶': '1', '❷': '2', '❸': '3', '❹': '4',
  '❺': '5', '❻': '6', '❼': '7', '❽': '8', '❾': '9',
  '🅀': '0', '🅁': '1', '🅂': '2', '🅃': '3', '🅄': '4',
  '🅅': '5', '🅆': '6', '🅇': '7', '🅈': '8', '🅉': '9'
};

/**
 * Normalizes a single character or string to standard ASCII characters.
 * Converts mathematical unicode digits, circled digits, fullwidth characters,
 * and strips combining underline/overlay diacritics.
 */
export function normalizeUnicodeText(text: string): string {
  if (!text) return '';

  // 1. Replace explicitly mapped circled / enclosed characters using codePoint iteration
  let normalized = text;
  for (const [key, val] of Object.entries(CIRCLED_DIGITS_MAP)) {
    if (normalized.includes(key)) {
      normalized = normalized.replaceAll(key, val);
    }
  }

  // 2. Apply Unicode NFKD normalization (decomposes font variants, fullwidth, etc.)
  normalized = normalized.normalize('NFKD');

  // 3. Remove combining diacritical marks (underlines, overlays, strikethroughs, e.g. U+0300 to U+036F)
  normalized = normalized.replace(/[\u0300-\u036f]/g, '');

  return normalized;
}

/**
 * Extract only raw digit characters from a string (after unicode normalization).
 */
export function extractDigits(text: string): string {
  const normalized = normalizeUnicodeText(text);
  return normalized.replace(/\D/g, '');
}
