import { Fragment, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";

const HAN = /([\u3400-\u9fff\uf900-\ufaff]+)/;

/**
 * Marks Han runs on en/ja/ko without letting `lang` pick a different face.
 * The Chinese page is already `zh-Hant-TW`, so the string is left as text.
 */
export function HanRun({ text, locale }: { text: string; locale: Locale }): ReactNode {
  if (locale === "zh-TW" || !HAN.test(text)) return text;
  return text.split(HAN).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} lang="zh-Hant-TW" className="han-name">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
