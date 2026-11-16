import type { Locale } from "./i18n/config";

const CLOSING = /^[，。、；：！？）」』》〉…%,.;:!?)\]]$/;
const OPENING = /^[（「『《〈(\[]$/;
const LATIN = /^[A-Za-z0-9.+\-/#&]$/;

function splitsByCharacter(locale: Locale) {
  return locale === "zh-TW" || locale === "ja";
}

/**
 * Splits text into reveal tokens: words for spaced scripts, characters for
 * zh/ja, keeping Latin runs together and punctuation attached so a line never
 * starts with a closing mark.
 */
export function tokenize(text: string, locale: Locale): string[] {
  if (!splitsByCharacter(locale)) return text.split(/(\s+)/).filter(Boolean);

  const tokens: string[] = [];
  let pendingOpen = "";
  for (const ch of Array.from(text)) {
    if (/\s/.test(ch)) {
      tokens.push(ch);
      continue;
    }
    if (OPENING.test(ch)) {
      pendingOpen += ch;
      continue;
    }
    const prev = tokens[tokens.length - 1];
    if (CLOSING.test(ch) && prev && !/^\s+$/.test(prev)) {
      tokens[tokens.length - 1] = prev + ch;
      continue;
    }
    if (LATIN.test(ch) && !pendingOpen && prev && LATIN.test(prev.slice(-1))) {
      tokens[tokens.length - 1] = prev + ch;
      continue;
    }
    tokens.push(pendingOpen + ch);
    pendingOpen = "";
  }
  if (pendingOpen) tokens.push(pendingOpen);
  return tokens;
}
