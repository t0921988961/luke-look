import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";
import { LINKS } from "@/lib/site";
import { CookieSettingsButton } from "@/components/islands/CookieSettingsButton";
import { MotionToggle } from "@/components/islands/MotionToggle";
import { NoTrackDot } from "@/components/islands/NoTrackDot";
import { PrivacyDetails } from "@/components/sections/PrivacyDetails";
import { LazyHorizon } from "@/components/islands/LazyHorizon";
import { ArrowUpRight, MailIcon } from "@/components/ui/Icons";
import { SplitWords } from "@/components/ui/SplitWords";

const PRIMARY_LINKS = [
  { label: "LinkedIn", href: LINKS.linkedin, method: "linkedin" },
  { label: "CakeResume", href: LINKS.cake, method: "cakeresume" },
] as const;

/** The closing card: the Contact section plus the page footer, which share one surface. */
export function ContactFooter({
  t,
  locale,
  motion,
  privacy,
  settings,
  notrack,
  translationNote,
}: {
  t: Dict["contact"];
  locale: Locale;
  motion: { pause: string; play: string };
  privacy: { title: string; paragraphs: string[] };
  settings: string;
  notrack: string;
  translationNote: string;
}) {
  return (
    <footer id="site-footer" className="px-2 pb-2 md:px-4 md:pb-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-deep text-white md:rounded-[40px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 [background:radial-gradient(80%_60%_at_75%_100%,rgb(255_150_110/0.28),transparent_60%),radial-gradient(70%_70%_at_10%_0%,rgb(90_140_255/0.45),transparent_60%),linear-gradient(180deg,var(--deep),var(--deep-2))]"
        />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[62%]">
          <LazyHorizon variant="contact" className="h-full w-full" />
        </div>

        <div className="mx-auto max-w-[1440px] px-5 pt-20 pb-8 md:px-10 md:pt-32 xl:px-16">
          <div className="mx-auto max-w-[1312px]">
            <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs tracking-[0.16em] text-sky">(06)</span>
                <span data-line className="h-px flex-1 origin-left bg-white/20" />
                <span className="font-mono text-xs tracking-[0.16em] text-white/70 uppercase">{t.eyebrow}</span>
              </div>

              <h2 id="contact-title" data-split className="display mt-10 text-[clamp(3rem,10vw,9.5rem)] text-white md:mt-14">
                <SplitWords text={t.title} locale={locale} />
              </h2>
              <p data-reveal className="pretty mt-6 max-w-xl text-base text-white/80 md:text-lg">
                {t.body}
              </p>

              <ul data-reveal className="mt-12 flex flex-wrap gap-3 md:mt-16">
                {PRIMARY_LINKS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="contact_click"
                      data-param-method={l.method}
                      data-param-location="contact"
                      className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-deep transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {l.label}
                      <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </li>
                ))}
              </ul>

              <div data-reveal className="mt-8 flex flex-col gap-4">
                <button
                  type="button"
                  data-email-toggle=""
                  aria-expanded="false"
                  aria-controls="email-reveal"
                  data-reveal-label={t.reveal}
                  data-hide-label={t.hide}
                  data-copy-label={t.copy}
                  data-copied-label={t.copied}
                  data-send-label={t.send}
                  className="inline-flex h-12 w-fit items-center gap-2 rounded-full border border-white/30 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white"
                >
                  <MailIcon className="text-[17px] text-sky" />
                  <span data-email-label="">{t.reveal}</span>
                </button>
                <noscript>
                  <p className="text-sm text-white/75">{t.noscript}</p>
                </noscript>
                <div id="email-reveal" aria-live="polite" />
              </div>
            </section>

            {translationNote && <p className="mt-16 max-w-xl text-sm text-white/60">{translationNote}</p>}
            <div className="mt-10">
              <PrivacyDetails title={privacy.title} paragraphs={privacy.paragraphs} settings={settings} />
            </div>
            <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
                <p>{t.rights}</p>
                <NoTrackDot label={notrack} />
                <CookieSettingsButton label={settings} />
              </div>
              <MotionToggle pause={motion.pause} play={motion.play} variant="text" />
              <a
                href="#top"
                className="inline-flex items-center gap-2 self-start text-white/80 transition-colors hover:text-white md:self-auto"
              >
                {t.backToTop}
                <ArrowUpRight className="-rotate-45" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
