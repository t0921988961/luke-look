"use client";

import { LINKS } from "./content";
import { EmailReveal } from "./EmailReveal";
import { HorizonCanvas } from "./HorizonCanvas";
import { ArrowUpRight } from "./Icons";
import { useSite } from "./site-context";
import { SplitWords } from "./Split";

export function Contact() {
  const { t, locale, reducedMotion, scrollTo } = useSite();

  const links = [
    { label: "LinkedIn", href: LINKS.linkedin },
    { label: "CakeResume", href: LINKS.cake },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 px-2 pb-2 md:px-4 md:pb-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-deep text-white md:rounded-[40px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 [background:radial-gradient(80%_60%_at_75%_100%,rgb(255_150_110/0.28),transparent_60%),radial-gradient(70%_70%_at_10%_0%,rgb(90_140_255/0.45),transparent_60%),linear-gradient(180deg,var(--deep),var(--deep-2))]"
        />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[62%]">
          <HorizonCanvas variant="contact" reducedMotion={reducedMotion} className="h-full w-full" />
        </div>

        <div className="mx-auto max-w-[1440px] px-5 pt-20 pb-8 md:px-10 md:pt-32 xl:px-16">
          <div className="mx-auto max-w-[1312px]">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs tracking-[0.16em] text-sky">(06)</span>
              <span data-line className="h-px flex-1 origin-left bg-white/20" />
              <span className="font-mono text-xs tracking-[0.16em] text-white/60 uppercase">{t.contact.eyebrow}</span>
            </div>

            <h2 id="contact-title" data-split className="display mt-10 text-[clamp(3rem,10vw,9.5rem)] text-white md:mt-14">
              <SplitWords text={t.contact.title} locale={locale} />
            </h2>
            <p data-reveal className="pretty mt-6 max-w-xl text-base text-white/75 md:text-lg">
              {t.contact.body}
            </p>

            <ul data-reveal className="mt-12 flex flex-wrap gap-3 md:mt-16">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-deep transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {l.label}
                    <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>

            <div data-reveal className="mt-8">
              <EmailReveal labels={t.contact} />
            </div>

            <footer className="mt-40 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-white/60 md:mt-56 md:flex-row md:items-center md:justify-between">
              <p>{t.contact.rights}</p>
              <p className="text-xs">{t.contact.note}</p>
              <button
                type="button"
                onClick={() => scrollTo(0)}
                className="inline-flex items-center gap-2 self-start text-white/80 transition-colors hover:text-white md:self-auto"
              >
                {t.contact.backToTop}
                <ArrowUpRight className="-rotate-45" />
              </button>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
