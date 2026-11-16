/** A highlighted run inside the hero title. */
export type Seg = string | { hl: string };

export type Dict = {
  langLabel: string;
  langShort: string;
  meta: {
    title: string;
    description: string;
  };
  nav: {
    about: string;
    experience: string;
    work: string;
    approach: string;
    skills: string;
    contact: string;
    primary: string;
    menu: string;
    close: string;
    theme: string;
    language: string;
    /** Accessible name of the language button; starts with its visible text. */
    languageButton: string;
    light: string;
    dark: string;
    system: string;
    skip: string;
    pause: string;
    play: string;
  };
  hero: {
    eyebrow: string;
    greeting: string;
    title: Seg[][];
    intro: string;
    ctaPrimary: string;
    ctaSecondary: string;
    nowLabel: string;
    now: string;
    stackLabel: string;
    stack: string;
    scroll: string;
    localTime: string;
  };
  about: {
    title: string;
    lead: string;
    body: string;
    stats: { prefix?: string; value: number; suffix?: string; label: string }[];
  };
  experience: {
    title: string;
    intro: string;
    present: string;
    more: string;
    less: string;
    tech: string;
    items: {
      company: string;
      role: string;
      summary: string;
      bullets: string[];
    }[];
  };
  work: {
    title: string;
    intro: string;
    featuredTag: string;
    illustrationNote: string;
    scaleLabel: string;
    featured: {
      title: string;
      org: string;
      desc: string;
      facts: string[];
      scale: string;
    };
    privateNote: string;
    items: { title: string; org: string; desc: string; private?: boolean }[];
  };
  approach: {
    title: string;
    intro: string;
    steps: { title: string; body: string }[];
  };
  skills: {
    title: string;
    intro: string;
    groups: string[];
    eduTitle: string;
    school: string;
    dept: string;
    langTitle: string;
    langs: { name: string; level: string }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    reveal: string;
    hide: string;
    copy: string;
    copied: string;
    send: string;
    noscript: string;
    backToTop: string;
    rights: string;
  };
};
