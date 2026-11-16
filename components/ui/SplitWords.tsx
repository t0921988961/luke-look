import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import { tokenize } from "@/lib/tokenize";

/** Visually split text for reveal animations, with one intact copy for assistive tech. */
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
              <span className="word-inner inline-block will-change-transform" style={{ "--i": i } as CSSProperties}>
                {tok}
              </span>
            </span>
          ),
        )}
      </span>
    </>
  );
}
