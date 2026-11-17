import type { Locale } from "@/lib/i18n/config";
import { getDictionary, getLanguageLabels } from "@/lib/i18n/get-dictionary";
import { vercelAnalyticsEnabled } from "@/lib/analytics";
import { buildStructuredData } from "@/lib/jsonld";
import { AnalyticsLoader } from "@/components/islands/AnalyticsLoader";
import { ConsentLoader } from "@/components/islands/ConsentLoader";
import { SiteHeader } from "@/components/islands/SiteHeader";
import { MotionLoader } from "@/components/motion/MotionLoader";
import { About } from "@/components/sections/About";
import { Approach } from "@/components/sections/Approach";
import { ContactFooter } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const gaEnabled = process.env.VERCEL_ENV === "production" || process.env.ANALYTICS_FORCE === "1";
  const vercelEnabled = vercelAnalyticsEnabled();
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[70] -translate-y-20 rounded-full bg-primary px-4 py-2 text-sm text-primary-ink focus:translate-y-0"
      >
        {t.nav.skip}
      </a>
      <ConsentLoader labels={t.consent} />
      <SiteHeader locale={locale} labels={t.nav} languageLabels={getLanguageLabels()} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero t={t.hero} locale={locale} />
        <About t={t.about} locale={locale} />
        <Experience t={t.experience} locale={locale} />
        <Work t={t.work} locale={locale} />
        <Approach t={t.approach} locale={locale} />
        <Skills t={t.skills} locale={locale} translationNote={t.translationNote} />
      </main>
      <ContactFooter
        t={t.contact}
        locale={locale}
        motion={t.nav}
        privacy={t.privacy}
        settings={t.consent.settings}
        notrack={t.consent.notrack}
        translationNote={t.translationNote}
      />
      <MotionLoader />
      <AnalyticsLoader gaEnabled={gaEnabled} vercelEnabled={vercelEnabled} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData(locale)).replace(/</g, "\\u003c") }}
      />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
