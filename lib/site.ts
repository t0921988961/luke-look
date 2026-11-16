import type { Locale } from "./i18n/config";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://luke-look.vercel.app").replace(/\/$/, "");

export const PERSON = {
  name: "Luke Cheng",
  nativeName: "鄭宏璋",
};

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/hung-chang-cheng-3a376ab6/",
  cake: "https://www.cake.me/s--W8ucQu2nIh5Wzl6VurfmXw--/t0921988961",
} as const;

/** Résumé PDF per locale. The download button appears only when a path is set. */
export const RESUME: Record<Locale, string | null> = {
  "zh-TW": null,
  en: null,
  ja: null,
  ko: null,
};

export const SECTIONS = ["about", "experience", "work", "approach", "skills", "contact"] as const;
export type SectionId = (typeof SECTIONS)[number];

export const PERIODS = [
  { from: "2023/05", to: null },
  { from: "2022/03", to: "2023/05" },
  { from: "2019/07", to: "2022/03" },
  { from: "2018/08", to: "2019/07" },
  { from: "2015/10", to: "2018/04" },
] as const;

export const EXPERIENCE_TECH = [
  ["Vue 3", "Pinia", "Ant Design Vue", "vue-i18n", "ECharts", "Tailwind CSS", "Less", "Vite", "Vitest"],
  ["Angular 11", "TypeScript", "RxJS", "PrimeNG", "ECharts", "Bootstrap 4", "SCSS"],
  ["Angular 9 / 11", "TypeScript", "RxJS", "Angular Material", "Chart.js", "ngx-translate", "SCSS", "Docker"],
  ["Vue.js", "Nuxt.js", "CSS Animation", "Canvas"],
  ["Google Analytics", "Google Tag Manager", "Hotjar"],
];

export const FEATURED_TECH = ["Vue 3", "Pinia", "Ant Design Vue", "vue-i18n", "ECharts", "Vitest"];

export const WORK_TECH = [
  ["Angular 11", "TypeScript", "RxJS", "PrimeNG"],
  ["Angular 11", "TypeScript", "PrimeNG", "SignalR"],
  ["Angular 11", "TypeScript", "RxJS", "Angular Material", "Chart.js"],
  ["Angular 9", "ngx-translate", "TypeScript"],
  ["Vue.js", "Nuxt.js", "RWD", "Canvas"],
];

export const SKILL_GROUPS = [
  ["Vue 3", "Pinia", "Nuxt.js", "Angular (9 / 11)", "RxJS", "TypeScript", "JavaScript (ES6+)", "HTML5"],
  ["Ant Design Vue", "PrimeNG", "Angular Material", "Tailwind CSS", "SCSS", "Less", "RWD", "ECharts", "Chart.js"],
  ["vue-i18n", "ngx-translate", "RTL"],
  ["Vitest", "SonarQube"],
  ["Git", "GitHub / GitLab", "Vite", "Docker", "Jira", "Postman", "Chrome DevTools", "RESTful API", "SignalR", "WebRTC"],
];

export const MARQUEE = [
  "Vue 3",
  "Angular",
  "TypeScript",
  "RxJS",
  "Pinia",
  "ECharts",
  "vue-i18n",
  "Vitest",
  "Tailwind CSS",
  "Vite",
  "Nuxt.js",
  "SonarQube",
];
