import type { Locale } from "./content";

const CLOSING = /^[，。、；：！？）」』》〉…%,.;:!?)\]]$/;
const OPENING = /^[（「『《〈(\[]$/;
const LATIN = /^[A-Za-z0-9.+\-/#&]$/;

function isCjk(locale: Locale) {
  return locale === "zh-TW" || locale === "ja";
}

/** Splits text into reveal tokens: words for spaced scripts, characters for zh/ja (keeping Latin runs and punctuation attached). */
export function tokenize(text: string, locale: Locale): string[] {
  if (!isCjk(locale)) return text.split(/(\s+)/).filter(Boolean);

  const chars = Array.from(text);
  const tokens: string[] = [];
  let pendingOpen = "";
  for (const ch of chars) {
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

export function SplitWords({ text, locale }: { text: string; locale: Locale }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {tokenize(text, locale).map((tok, i) =>
          /^\s+$/.test(tok) ? (
            " "
          ) : (
            <span key={i} className="word inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
              <span className="word-inner inline-block will-change-transform">{tok}</span>
            </span>
          ),
        )}
      </span>
    </>
  );
}
