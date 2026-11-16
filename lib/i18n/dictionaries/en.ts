import type { Dict } from "../types";

const dict = {
  langLabel: "English",
  langShort: "EN",
  meta: {
    title: "Luke Cheng (鄭宏璋) — Front-end Engineer in Taipei",
    description:
      "Luke Cheng is a front-end engineer in Taipei with seven years of experience in Vue 3, Angular and TypeScript, mostly building B2B and IoT admin consoles and data dashboards.",
  },
  nav: {
    about: "About",
    experience: "Experience",
    work: "Work",
    approach: "Approach",
    skills: "Skills",
    contact: "Contact",
    primary: "Primary",
    menu: "Menu",
    close: "Close",
    theme: "Theme",
    language: "Language",
    languageButton: "EN, change language",
    light: "Light",
    dark: "Dark",
    system: "System",
    skip: "Skip to main content",
  },
  hero: {
    eyebrow: "Front-end engineer · Taipei",
    greeting: "Hi, I’m Luke Cheng.",
    title: [["Making complex systems"], ["feel ", { hl: "clear" }, " and easy to use."]],
    intro:
      "Seven years of front-end development with Vue 3 and Angular (TypeScript + RxJS), mostly building B2B and IoT admin consoles and data dashboards.",
    ctaPrimary: "Get in touch",
    ctaSecondary: "See experience",
    nowLabel: "Currently",
    now: "Front-end engineer at MiTAC",
    stackLabel: "Main stack",
    stack: "Vue 3 · Angular · TypeScript",
    scroll: "Scroll",
    localTime: "Taipei time",
  },
  about: {
    title: "About",
    lead: "I build admin consoles and data dashboards for B2B and IoT products.",
    body: "At MiTAC I am the main front-end developer of a subscription-based fleet management platform. I led the upgrade of two front-end projects to Vue 3, work with four back-end engineers and two UI/UX designers, build from functional specifications, and keep code quality in check with Vitest unit tests and SonarQube.",
    stats: [
      { value: 7, suffix: "yrs", label: "of front-end development" },
      { prefix: "~", value: 20, label: "platform modules I work on" },
      { value: 9, label: "languages supported, incl. Hebrew RTL" },
      { prefix: "~", value: 100, label: "Vitest unit test files" },
    ],
  },
  experience: {
    title: "Experience",
    intro:
      "From web design to front-end engineering: campaign sites, a website migration, internal systems and a subscription platform.",
    present: "Present",
    more: "Details",
    less: "Hide",
    tech: "Tech used",
    items: [
      {
        company: "MiTAC",
        role: "Front-end Engineer",
        summary: "Main front-end developer of the VisionMax subscription fleet management platform.",
        bullets: [
          "Develop and maintain the front end of VisionMax, a subscription fleet management platform with around 20 modules (events, trips, vehicles, drivers, reports and more), plus a separate device management console. Work with four back-end engineers (Server, AI Server, PHP).",
          "Led the upgrade of two front-end projects to Vue 3 and restructured the code (shared components, state management, style variables), making sure existing features kept working.",
          "During my time on the team, platform subscriptions grew from about 500 to over 10,000; I kept supporting new features and launches in multiple markets.",
          "Set up a workflow with two UI/UX designers, using shared components and a Dark / Light color-variable system to implement designs.",
          "Support 9 languages (including Hebrew RTL) with vue-i18n; locale files are exported from Google Sheets by a script and kept in sync across two systems.",
          "Wrote unit tests with Vitest (about 100 test files) and check code quality with SonarQube.",
          "Set up a documentation flow for functional specs and development plans, with Claude Code, Cursor and Copilot sharing one set of development rules.",
          "Features include live video, map event markers and ECharts data charts.",
        ],
      },
      {
        company: "坤侑科技",
        role: "Front-end Engineer",
        summary: "Front end for internal systems, including forensic and ankle-monitor systems.",
        bullets: [
          "Built and maintained internal system front ends, integrating RESTful APIs and SignalR real-time push.",
          "Forensic system: create forensic records and track progress, with signature pads and document cameras.",
          "Monitoring system: integrated a Taiwan map service to show wearer locations and alert zones in real time.",
        ],
      },
      {
        company: "New Kinpo Group (Kinpo Electronics)",
        role: "Front-end Engineer",
        summary: "Smart-factory war room visualization and the XYZprinting website migration.",
        bullets: [
          "Developed data visualization UI for a smart-factory war room and maintained a smart-building war room system.",
          "Migrated the XYZprinting website from Play Framework (Java) to Angular 9, with ngx-translate for multiple languages, and maintained it afterwards.",
          "Packaged Angular projects with Docker.",
          "Coached engineers on the Philippine team on front-end concepts and tools.",
        ],
      },
      {
        company: "巧禾數位",
        role: "Front-end Engineer",
        summary: "Responsive campaign sites and interactive effects for financial clients.",
        bullets: [
          "Built and maintained campaign sites with Vue.js / Nuxt.js, connected back-end data, and implemented LINE / Facebook login.",
          "Made responsive campaign sites and interactive effects (CSS animation, Canvas) for clients including Bank SinoPac, Taishin Richart, Fubon, Prudential, Amundi, Neuberger Berman, Fidelity and StockFeel.",
        ],
      },
      {
        company: "佳因企業",
        role: "Web Designer",
        summary: "Mobile redesign of the company website and site analytics.",
        bullets: [
          "Maintained the company website and redesigned it for mobile (RWD), using Google Analytics, Google Tag Manager and Hotjar for analysis.",
          "Handled social media, video and product photo editing, and print design such as flyers and posters.",
        ],
      },
    ],
  },
  work: {
    title: "Work",
    intro: "Projects I have worked on. Some are internal systems and can only be described in words.",
    featuredTag: "Main project",
    illustrationNote: "Illustrative animation, not real product UI",
    scaleLabel: "Product scale",
    featured: {
      title: "VisionMax Fleet Management",
      org: "MiTAC · B2B subscription",
      desc: "A subscription platform that helps dealers keep track of their fleets. Main front-end developer; completed the Vue 3 upgrade.",
      facts: ["~20 modules", "9 languages incl. Hebrew RTL", "Dark / Light themes", "Vue 3 upgrade"],
      scale: "Subscriptions: ~500 → 10,000+",
    },
    privateNote: "Internal system, cannot be shown",
    items: [
      {
        title: "Forensic System",
        org: "坤侑科技",
        desc: "Create forensic records and track progress, with signature pads and document cameras.",
        private: true,
      },
      {
        title: "Ankle Monitor System",
        org: "坤侑科技",
        desc: "Shows wearer locations and alert zones on a map.",
        private: true,
      },
      { title: "IoT Smart Factory War Room", org: "Kinpo Electronics", desc: "Data visualization dashboard for factory data." },
      {
        title: "XYZprinting Website Migration",
        org: "Kinpo Electronics",
        desc: "Migrated from Play Framework to Angular 9 with multi-language support.",
      },
      {
        title: "Financial Campaign Sites",
        org: "巧禾數位",
        desc: "Responsive campaign pages and interactive effects for Bank SinoPac, Taishin Richart, Fubon, Fidelity and others.",
      },
    ],
  },
  approach: {
    title: "Approach",
    intro: "How I keep things steady inside a team.",
    steps: [
      {
        title: "Start from the spec",
        body: "A documentation flow for functional specs and development plans; API contracts agreed with the back end in Jira, and changes managed through merge requests.",
      },
      {
        title: "Shared components, two themes",
        body: "A working rhythm with UI/UX designers: shared components and a Dark / Light color-variable system keep the interface consistent.",
      },
      {
        title: "Many languages, RTL included",
        body: "9 languages with vue-i18n, including Hebrew RTL. Locale files are exported from Google Sheets by a script and kept in sync across two systems.",
      },
      {
        title: "Tests and quality",
        body: "Unit tests with Vitest and quality checks with SonarQube. Claude Code, Cursor and Copilot share one set of development rules.",
      },
    ],
  },
  skills: {
    title: "Skills",
    intro: "The frameworks, tools and workflow I use day to day.",
    groups: ["Frameworks & languages", "UI & styling", "Internationalization", "Testing & quality", "Tools & workflow"],
    eduTitle: "Education",
    school: "Hwa Hsia University of Technology",
    dept: "Electronic Engineering",
    langTitle: "Languages",
    langs: [
      { name: "Mandarin", level: "Native" },
      { name: "English", level: "Can read English technical and API documentation" },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Let’s talk.",
    body: "Feel free to reach me on LinkedIn, CakeResume or by email.",
    reveal: "Show email",
    hide: "Hide email",
    copy: "Copy",
    copied: "Copied",
    send: "Send email",
    noscript: "Please reach me on LinkedIn or CakeResume.",
    backToTop: "Back to top",
    rights: "© 2026 Luke Cheng (鄭宏璋)",
  },
} satisfies Dict;

export default dict;
