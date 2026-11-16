export const LOCALES = ["zh-TW", "en", "ja", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh-TW";

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/hung-chang-cheng-3a376ab6/",
  cake: "https://www.cake.me/s--W8ucQu2nIh5Wzl6VurfmXw--/t0921988961",
};

type Seg = string | { hl: string };

export type Dict = {
  langLabel: string;
  langShort: string;
  nav: {
    about: string;
    experience: string;
    work: string;
    approach: string;
    skills: string;
    contact: string;
    menu: string;
    close: string;
    theme: string;
    language: string;
    light: string;
    dark: string;
    system: string;
    skip: string;
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
    note: string;
  };
};

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

const zh: Dict = {
  langLabel: "繁體中文",
  langShort: "繁中",
  nav: {
    about: "關於",
    experience: "經歷",
    work: "作品",
    approach: "工作方式",
    skills: "技能",
    contact: "聯絡",
    menu: "選單",
    close: "關閉",
    theme: "主題",
    language: "語言",
    light: "淺色",
    dark: "深色",
    system: "跟隨系統",
    skip: "跳至主要內容",
  },
  hero: {
    eyebrow: "前端工程師 · 台北",
    greeting: "你好，我是鄭宏璋（Luke）。",
    title: [["讓複雜的系統，"], ["變得", { hl: "清楚好用" }, "。"]],
    intro:
      "7 年前端開發經驗，熟悉 Vue 3 與 Angular（TypeScript + RxJS），主要開發 B2B、IoT 類的管理後台與數據儀表板系統。",
    ctaPrimary: "與我聯絡",
    ctaSecondary: "查看經歷",
    nowLabel: "目前任職",
    now: "神達電腦 · 前端工程師",
    stackLabel: "主要技術",
    stack: "Vue 3 · Angular · TypeScript",
    scroll: "向下捲動",
    localTime: "台北時間",
  },
  about: {
    title: "關於我",
    lead: "主要開發 B2B、IoT 類的管理後台與數據儀表板系統。",
    body: "目前在神達電腦擔任訂閱制車隊管理平台的主要前端開發者，主導兩套前端專案升級至 Vue 3，與 4 位後端工程師、2 位 UI/UX 設計師協作，照功能規格書開發，並用 Vitest 單元測試和 SonarQube 維護程式碼品質。",
    stats: [
      { value: 7, suffix: "年", label: "前端開發經驗" },
      { prefix: "約", value: 20, suffix: "個", label: "負責的平台模組" },
      { value: 9, suffix: "種", label: "支援語系，含希伯來文 RTL" },
      { prefix: "約", value: 100, suffix: "個", label: "Vitest 單元測試檔" },
    ],
  },
  experience: {
    title: "工作經歷",
    intro: "從網頁設計到前端工程，一路做過活動網站、官網遷移、內部系統與訂閱制平台。",
    present: "至今",
    more: "展開",
    less: "收合",
    items: [
      {
        company: "神達電腦",
        role: "前端工程師",
        summary: "VisionMax 訂閱制車隊管理平台的主要前端開發者。",
        bullets: [
          "負責 VisionMax 訂閱制車隊管理平台的前端開發與維運，涵蓋事件、行程、車輛、駕駛、報表等約 20 個模組，並維護另一套裝置管理後台；與 4 位後端工程師（Server、AI Server、PHP）協作。",
          "主導兩套前端專案升級至 Vue 3 並重整程式架構（共用元件、狀態管理、樣式變數），升級後確保既有功能正常運作。",
          "任職期間平台訂閱數從約 500 成長至 1 萬以上，持續支援新功能開發與多國市場上線。",
          "與 2 位 UI/UX 設計師建立協作流程，以共用元件與 Dark / Light 雙主題色彩變數系統落實設計稿。",
          "以 vue-i18n 支援 9 種語系（含希伯來文 RTL），語系檔由 Google Sheet 腳本統一轉出，兩套系統同步維護。",
          "以 Vitest 建立單元測試（約 100 個測試檔），搭配 SonarQube 檢查程式碼品質。",
          "建立功能規格書與開發計畫的文件流程，並整合 Claude Code、Cursor、Copilot 共用同一套開發規範。",
          "功能包含即時影像、地圖事件點位、ECharts 數據圖表。",
        ],
      },
      {
        company: "坤侑科技",
        role: "前端工程師",
        summary: "鑑識系統、腳鐐監控系統等內部系統的前端建置與維護。",
        bullets: [
          "負責內部系統的前端建置與維護，串接 RESTful API 與 SignalR 即時推播。",
          "鑑識系統：建立鑑識資料並追蹤處理進度，整合簽名板與高拍儀等周邊設備。",
          "監控系統：整合台灣圖霸地圖，即時顯示配戴者位置與預警範圍。",
        ],
      },
      {
        company: "新金寶集團（金寶電子）",
        role: "前端工程師",
        summary: "智慧工廠戰情室數據視覺化，與 XYZprinting 官網遷移。",
        bullets: [
          "開發智慧工廠戰情室的數據視覺化介面，並維護智慧大樓戰情室系統。",
          "將 XYZprinting 官網從 Play Framework（Java）遷移至 Angular 9，以 ngx-translate 實作多語系，並負責後續維護。",
          "以 Docker 打包 Angular 專案。",
          "指導菲律賓團隊工程師前端觀念與開發工具。",
        ],
      },
      {
        company: "巧禾數位",
        role: "前端工程師",
        summary: "金融業客戶的 RWD 活動網站與互動效果。",
        bullets: [
          "以 Vue.js / Nuxt.js 開發與維護活動網站，串接後端資料，並實作 LINE / Facebook 登入。",
          "為永豐銀行、台新 Richart、富邦投信、保德信投信、鋒裕匯理投信、路博邁、富達、股感等客戶製作 RWD 活動網站與互動效果（CSS 動畫、Canvas 等）。",
        ],
      },
      {
        company: "佳因企業",
        role: "網頁設計師",
        summary: "公司網站行動版改版與網站分析。",
        bullets: [
          "維護公司網站並改版為行動版（RWD），使用 Google Analytics、Google Tag Manager、Hotjar 分析網站。",
          "負責社群經營、影片與產品攝影剪輯，以及 DM、海報等平面設計。",
        ],
      },
    ],
  },
  work: {
    title: "作品",
    intro: "以下為參與過的專案。部分為內部系統，僅能以文字說明。",
    featuredTag: "主要專案",
    illustrationNote: "示意動畫，非實際產品畫面",
    scaleLabel: "產品規模",
    featured: {
      title: "VisionMax 車隊管理平台",
      org: "神達電腦 · B2B 訂閱制",
      desc: "讓經銷商掌握車隊狀況的訂閱制平台。擔任主要前端開發者，並完成 Vue 3 升級。",
      facts: ["約 20 個模組", "9 種語系（含希伯來文 RTL）", "Dark / Light 雙主題", "Vue 3 升級"],
      scale: "平台訂閱數約 500 → 1 萬以上",
    },
    privateNote: "內部系統無法展示",
    items: [
      { title: "鑑識系統", org: "坤侑科技", desc: "建立鑑識資料並追蹤進度，整合簽名板、高拍儀。", private: true },
      { title: "腳鐐監控系統", org: "坤侑科技", desc: "在地圖上顯示配戴者位置與預警範圍。", private: true },
      { title: "IoT 智慧工廠戰情室", org: "金寶電子", desc: "工廠數據視覺化儀表板。" },
      { title: "XYZprinting 官網遷移", org: "金寶電子", desc: "從 Play Framework 遷移至 Angular 9，支援多語系。" },
      {
        title: "金融業活動網站",
        org: "巧禾數位",
        desc: "為永豐銀行、台新 Richart、富邦投信、富達等客戶製作 RWD 活動頁與互動效果。",
      },
    ],
  },
  approach: {
    title: "工作方式",
    intro: "在團隊裡，我習慣這樣把事情做穩。",
    steps: [
      {
        title: "從規格開始",
        body: "建立功能規格書與開發計畫的文件流程；透過 Jira 與後端確認 API 規格，以 Merge Request 管理變更。",
      },
      {
        title: "共用元件與雙主題",
        body: "與 UI/UX 設計師建立協作流程，以共用元件與 Dark / Light 色彩變數系統落實設計稿，讓介面保持一致。",
      },
      {
        title: "多語系與 RTL",
        body: "以 vue-i18n 支援 9 種語系（含希伯來文 RTL），語系檔由 Google Sheet 腳本統一轉出，兩套系統同步維護。",
      },
      {
        title: "測試與品質",
        body: "以 Vitest 建立單元測試，搭配 SonarQube 檢查程式碼品質；Claude Code、Cursor、Copilot 共用同一套開發規範。",
      },
    ],
  },
  skills: {
    title: "技能",
    intro: "日常使用的框架、工具與流程。",
    groups: ["框架與語言", "UI 與樣式", "多語系", "測試與品質", "工具與流程"],
    eduTitle: "學歷",
    school: "華夏科技大學",
    dept: "電子工程系",
    langTitle: "語言",
    langs: [
      { name: "中文", level: "母語" },
      { name: "英文", level: "可閱讀英文技術文件與 API 文件" },
    ],
  },
  contact: {
    eyebrow: "聯絡",
    title: "一起聊聊吧。",
    body: "歡迎透過 LinkedIn、CakeResume 或 Email 與我聯繫。",
    reveal: "顯示 Email",
    hide: "隱藏 Email",
    copy: "複製",
    copied: "已複製",
    send: "寄信",
    noscript: "請透過 LinkedIn 或 CakeResume 與我聯絡。",
    backToTop: "回到頂端",
    rights: "© 2026 鄭宏璋 Luke Cheng",
    note: "設計提案 v1 · 僅供審閱",
  },
};

const en: Dict = {
  langLabel: "English",
  langShort: "EN",
  nav: {
    about: "About",
    experience: "Experience",
    work: "Work",
    approach: "Approach",
    skills: "Skills",
    contact: "Contact",
    menu: "Menu",
    close: "Close",
    theme: "Theme",
    language: "Language",
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
    note: "Design proposal v1 · for review",
  },
};

const ja: Dict = {
  langLabel: "日本語",
  langShort: "日本語",
  nav: {
    about: "プロフィール",
    experience: "経歴",
    work: "実績",
    approach: "仕事の進め方",
    skills: "スキル",
    contact: "連絡先",
    menu: "メニュー",
    close: "閉じる",
    theme: "テーマ",
    language: "言語",
    light: "ライト",
    dark: "ダーク",
    system: "システム",
    skip: "本文へスキップ",
  },
  hero: {
    eyebrow: "フロントエンドエンジニア · 台北",
    greeting: "こんにちは、鄭宏璋（Luke）です。",
    title: [["複雑なシステムを、"], [{ hl: "わかりやすく" }, "使いやすく。"]],
    intro:
      "フロントエンド開発歴 7 年。Vue 3 と Angular（TypeScript + RxJS）を用い、主に B2B・IoT 向けの管理画面やデータダッシュボードを開発しています。",
    ctaPrimary: "連絡する",
    ctaSecondary: "経歴を見る",
    nowLabel: "現在",
    now: "神達電腦（MiTAC）· フロントエンドエンジニア",
    stackLabel: "主な技術",
    stack: "Vue 3 · Angular · TypeScript",
    scroll: "スクロール",
    localTime: "台北時間",
  },
  about: {
    title: "プロフィール",
    lead: "B2B・IoT 向けの管理画面とデータダッシュボードを主に開発しています。",
    body: "神達電腦（MiTAC）でサブスクリプション型フリート管理プラットフォームのメインフロントエンド開発者を担当。2 つのフロントエンドプロジェクトの Vue 3 移行を主導し、バックエンドエンジニア 4 名・UI/UX デザイナー 2 名と協力しながら、機能仕様書に沿って開発しています。品質は Vitest の単体テストと SonarQube で維持しています。",
    stats: [
      { value: 7, suffix: "年", label: "フロントエンド開発経験" },
      { prefix: "約", value: 20, label: "担当プラットフォームのモジュール" },
      { value: 9, label: "対応言語（ヘブライ語 RTL を含む）" },
      { prefix: "約", value: 100, label: "Vitest テストファイル" },
    ],
  },
  experience: {
    title: "経歴",
    intro: "Web デザインからフロントエンドへ。キャンペーンサイト、サイト移行、社内システム、サブスク型プラットフォームに携わってきました。",
    present: "現在",
    more: "詳細",
    less: "閉じる",
    items: [
      {
        company: "神達電腦（MiTAC）",
        role: "フロントエンドエンジニア",
        summary: "VisionMax サブスクリプション型フリート管理プラットフォームのメイン開発者。",
        bullets: [
          "イベント・走行・車両・ドライバー・レポートなど約 20 モジュールを持つ VisionMax のフロントエンド開発と運用、別のデバイス管理画面の保守を担当。バックエンドエンジニア 4 名（Server・AI Server・PHP）と協業。",
          "2 つのフロントエンドプロジェクトの Vue 3 移行を主導し、共通コンポーネント・状態管理・スタイル変数を再構成。移行後も既存機能が正常に動くことを確認。",
          "在籍中にプラットフォームの契約数は約 500 から 1 万以上に増加。その間、新機能開発と多国展開を継続的に支援。",
          "UI/UX デザイナー 2 名と協業フローを構築し、共通コンポーネントと Dark / Light の色変数システムでデザインを実装。",
          "vue-i18n で 9 言語（ヘブライ語 RTL を含む）に対応。言語ファイルは Google Sheet のスクリプトで一括出力し、2 つのシステムで同期管理。",
          "Vitest で単体テスト（約 100 ファイル）を作成し、SonarQube でコード品質を確認。",
          "機能仕様書と開発計画のドキュメントフローを整備し、Claude Code・Cursor・Copilot で同じ開発ルールを共有。",
          "機能にはライブ映像、地図上のイベント表示、ECharts のグラフなどを含む。",
        ],
      },
      {
        company: "坤侑科技",
        role: "フロントエンドエンジニア",
        summary: "鑑識システムや足輪監視システムなど社内システムのフロントエンド。",
        bullets: [
          "社内システムのフロントエンド構築と保守。RESTful API と SignalR のリアルタイム通知を連携。",
          "鑑識システム：鑑識データの作成と進捗管理。サインパッドや書画カメラなどの周辺機器と連携。",
          "監視システム：台湾の地図サービスを組み込み、装着者の位置と警告範囲をリアルタイム表示。",
        ],
      },
      {
        company: "New Kinpo Group（金寶電子）",
        role: "フロントエンドエンジニア",
        summary: "スマート工場の可視化と XYZprinting 公式サイトの移行。",
        bullets: [
          "スマート工場の監視室向けデータ可視化 UI を開発し、スマートビルの監視室システムを保守。",
          "XYZprinting 公式サイトを Play Framework（Java）から Angular 9 へ移行。ngx-translate で多言語化し、その後の保守も担当。",
          "Docker で Angular プロジェクトをパッケージ化。",
          "フィリピンチームのエンジニアにフロントエンドの考え方と開発ツールを指導。",
        ],
      },
      {
        company: "巧禾數位",
        role: "フロントエンドエンジニア",
        summary: "金融業界向けのレスポンシブなキャンペーンサイト。",
        bullets: [
          "Vue.js / Nuxt.js でキャンペーンサイトを開発・保守。バックエンドと連携し、LINE / Facebook ログインを実装。",
          "永豐銀行、台新 Richart、富邦投信、保德信投信、鋒裕匯理投信、路博邁、富達、股感などのクライアント向けに、RWD のキャンペーンサイトとインタラクション（CSS アニメーション、Canvas など）を制作。",
        ],
      },
      {
        company: "佳因企業",
        role: "Web デザイナー",
        summary: "自社サイトのモバイル対応リニューアルとサイト分析。",
        bullets: [
          "自社サイトを保守し、モバイル対応（RWD）にリニューアル。Google Analytics、Google Tag Manager、Hotjar で分析。",
          "SNS 運用、動画・商品写真の編集、チラシやポスターなどのグラフィックデザインを担当。",
        ],
      },
    ],
  },
  work: {
    title: "実績",
    intro: "携わったプロジェクトです。社内システムは文章のみでご紹介します。",
    featuredTag: "主なプロジェクト",
    illustrationNote: "イメージアニメーションであり、実際の画面ではありません",
    scaleLabel: "プロダクト規模",
    featured: {
      title: "VisionMax フリート管理プラットフォーム",
      org: "神達電腦（MiTAC）· B2B サブスクリプション",
      desc: "販売代理店が車両の状況を把握するためのサブスク型プラットフォーム。メインのフロントエンド開発者として Vue 3 移行を完了。",
      facts: ["約 20 モジュール", "9 言語（ヘブライ語 RTL を含む）", "Dark / Light テーマ", "Vue 3 移行"],
      scale: "契約数：約 500 → 1 万以上",
    },
    privateNote: "社内システムのため非公開",
    items: [
      { title: "鑑識システム", org: "坤侑科技", desc: "鑑識データの作成と進捗管理。サインパッド、書画カメラと連携。", private: true },
      { title: "足輪監視システム", org: "坤侑科技", desc: "装着者の位置と警告範囲を地図上に表示。", private: true },
      { title: "IoT スマート工場監視室", org: "金寶電子", desc: "工場データの可視化ダッシュボード。" },
      { title: "XYZprinting 公式サイト移行", org: "金寶電子", desc: "Play Framework から Angular 9 へ移行し、多言語に対応。" },
      { title: "金融業界のキャンペーンサイト", org: "巧禾數位", desc: "永豐銀行、台新 Richart、富邦投信、富達などのキャンペーンページとインタラクション。" },
    ],
  },
  approach: {
    title: "仕事の進め方",
    intro: "チームの中で、安定して進めるために心がけていること。",
    steps: [
      {
        title: "仕様から始める",
        body: "機能仕様書と開発計画のドキュメントフローを整備。Jira でバックエンドと API 仕様を確認し、Merge Request で変更を管理。",
      },
      {
        title: "共通コンポーネントと 2 つのテーマ",
        body: "UI/UX デザイナーと協業フローを作り、共通コンポーネントと Dark / Light の色変数システムで一貫した UI に。",
      },
      {
        title: "多言語と RTL",
        body: "vue-i18n で 9 言語（ヘブライ語 RTL を含む）に対応。言語ファイルは Google Sheet のスクリプトで一括出力し、2 システムで同期。",
      },
      {
        title: "テストと品質",
        body: "Vitest の単体テストと SonarQube で品質を確認。Claude Code・Cursor・Copilot で同じ開発ルールを共有。",
      },
    ],
  },
  skills: {
    title: "スキル",
    intro: "日々使っているフレームワーク、ツール、ワークフロー。",
    groups: ["フレームワークと言語", "UI とスタイル", "多言語対応", "テストと品質", "ツールとワークフロー"],
    eduTitle: "学歴",
    school: "華夏科技大学",
    dept: "電子工学科",
    langTitle: "語学",
    langs: [
      { name: "中国語", level: "ネイティブ" },
      { name: "英語", level: "英語の技術文書・API ドキュメントを読める" },
    ],
  },
  contact: {
    eyebrow: "連絡先",
    title: "お気軽にどうぞ。",
    body: "LinkedIn、CakeResume、またはメールからご連絡ください。",
    reveal: "メールアドレスを表示",
    hide: "メールアドレスを隠す",
    copy: "コピー",
    copied: "コピーしました",
    send: "メールを送る",
    noscript: "LinkedIn または CakeResume からご連絡ください。",
    backToTop: "トップへ戻る",
    rights: "© 2026 鄭宏璋 Luke Cheng",
    note: "デザイン提案 v1 · レビュー用",
  },
};

const ko: Dict = {
  langLabel: "한국어",
  langShort: "한국어",
  nav: {
    about: "소개",
    experience: "경력",
    work: "프로젝트",
    approach: "일하는 방식",
    skills: "기술",
    contact: "연락처",
    menu: "메뉴",
    close: "닫기",
    theme: "테마",
    language: "언어",
    light: "라이트",
    dark: "다크",
    system: "시스템 설정",
    skip: "본문으로 건너뛰기",
  },
  hero: {
    eyebrow: "프론트엔드 엔지니어 · 타이베이",
    greeting: "안녕하세요, Luke Cheng입니다.",
    title: [["복잡한 시스템을"], [{ hl: "명확하고" }, " 쓰기 쉽게."]],
    intro:
      "7년 차 프론트엔드 개발자입니다. Vue 3와 Angular(TypeScript + RxJS)로 주로 B2B·IoT 관리자 화면과 데이터 대시보드를 개발합니다.",
    ctaPrimary: "연락하기",
    ctaSecondary: "경력 보기",
    nowLabel: "현재",
    now: "MiTAC · 프론트엔드 엔지니어",
    stackLabel: "주요 기술",
    stack: "Vue 3 · Angular · TypeScript",
    scroll: "스크롤",
    localTime: "타이베이 시간",
  },
  about: {
    title: "소개",
    lead: "B2B·IoT 관리자 화면과 데이터 대시보드를 주로 개발합니다.",
    body: "현재 MiTAC에서 구독형 차량 관제 플랫폼의 메인 프론트엔드 개발자로 일하고 있습니다. 두 개의 프론트엔드 프로젝트를 Vue 3로 업그레이드하는 작업을 주도했고, 백엔드 엔지니어 4명, UI/UX 디자이너 2명과 협업하며 기능 명세서에 따라 개발합니다. Vitest 단위 테스트와 SonarQube로 코드 품질을 관리합니다.",
    stats: [
      { value: 7, suffix: "년", label: "프론트엔드 개발 경력" },
      { prefix: "약 ", value: 20, suffix: "개", label: "담당 플랫폼 모듈" },
      { value: 9, suffix: "개", label: "지원 언어 (히브리어 RTL 포함)" },
      { prefix: "약 ", value: 100, suffix: "개", label: "Vitest 테스트 파일" },
    ],
  },
  experience: {
    title: "경력",
    intro: "웹 디자인에서 프론트엔드 엔지니어링까지. 캠페인 사이트, 웹사이트 이전, 내부 시스템, 구독형 플랫폼을 만들어 왔습니다.",
    present: "현재",
    more: "자세히",
    less: "접기",
    items: [
      {
        company: "MiTAC (神達電腦)",
        role: "프론트엔드 엔지니어",
        summary: "VisionMax 구독형 차량 관제 플랫폼의 메인 프론트엔드 개발자.",
        bullets: [
          "이벤트, 운행, 차량, 운전자, 리포트 등 약 20개 모듈로 구성된 VisionMax의 프론트엔드 개발과 운영, 별도의 디바이스 관리 화면 유지보수를 담당. 백엔드 엔지니어 4명(Server, AI Server, PHP)과 협업.",
          "두 개의 프론트엔드 프로젝트를 Vue 3로 업그레이드하고 공통 컴포넌트, 상태 관리, 스타일 변수를 재구성. 업그레이드 후 기존 기능이 정상 동작하도록 확인.",
          "재직 기간 동안 플랫폼 구독 수가 약 500에서 1만 이상으로 증가했으며, 그동안 신규 기능 개발과 여러 국가 출시를 지원.",
          "UI/UX 디자이너 2명과 협업 프로세스를 만들고, 공통 컴포넌트와 Dark / Light 색상 변수 시스템으로 디자인을 구현.",
          "vue-i18n으로 9개 언어(히브리어 RTL 포함)를 지원. 언어 파일은 Google Sheet 스크립트로 일괄 추출해 두 시스템에서 동기화.",
          "Vitest로 단위 테스트(약 100개 파일)를 작성하고 SonarQube로 코드 품질을 점검.",
          "기능 명세서와 개발 계획 문서 프로세스를 만들고, Claude Code, Cursor, Copilot이 같은 개발 규칙을 공유하도록 정리.",
          "실시간 영상, 지도 이벤트 표시, ECharts 데이터 차트 등의 기능 포함.",
        ],
      },
      {
        company: "坤侑科技",
        role: "프론트엔드 엔지니어",
        summary: "감식 시스템, 전자발찌 관제 시스템 등 내부 시스템의 프론트엔드.",
        bullets: [
          "내부 시스템의 프론트엔드 구축과 유지보수. RESTful API와 SignalR 실시간 푸시 연동.",
          "감식 시스템: 감식 데이터 생성과 진행 상황 추적. 서명 패드, 실물 화상기 등 주변 장치 연동.",
          "관제 시스템: 대만 지도 서비스를 연동해 착용자 위치와 경고 범위를 실시간으로 표시.",
        ],
      },
      {
        company: "New Kinpo Group (Kinpo Electronics)",
        role: "프론트엔드 엔지니어",
        summary: "스마트 공장 상황실 시각화와 XYZprinting 웹사이트 이전.",
        bullets: [
          "스마트 공장 상황실의 데이터 시각화 UI를 개발하고 스마트 빌딩 상황실 시스템을 유지보수.",
          "XYZprinting 웹사이트를 Play Framework(Java)에서 Angular 9로 이전하고 ngx-translate로 다국어를 구현, 이후 유지보수 담당.",
          "Docker로 Angular 프로젝트 패키징.",
          "필리핀 팀 엔지니어에게 프론트엔드 개념과 개발 도구를 지도.",
        ],
      },
      {
        company: "巧禾數位",
        role: "프론트엔드 엔지니어",
        summary: "금융권 고객을 위한 반응형 캠페인 사이트와 인터랙션.",
        bullets: [
          "Vue.js / Nuxt.js로 캠페인 사이트를 개발·유지보수하고 백엔드 데이터 연동, LINE / Facebook 로그인 구현.",
          "Bank SinoPac, Taishin Richart, Fubon, Prudential, Amundi, Neuberger Berman, Fidelity, StockFeel 등 고객사의 반응형 캠페인 사이트와 인터랙션(CSS 애니메이션, Canvas 등) 제작.",
        ],
      },
      {
        company: "佳因企業",
        role: "웹 디자이너",
        summary: "회사 웹사이트 모바일 개편과 사이트 분석.",
        bullets: [
          "회사 웹사이트를 유지보수하고 모바일(RWD)로 개편. Google Analytics, Google Tag Manager, Hotjar로 분석.",
          "SNS 운영, 영상·제품 사진 편집, 전단지와 포스터 등 그래픽 디자인 담당.",
        ],
      },
    ],
  },
  work: {
    title: "프로젝트",
    intro: "참여했던 프로젝트입니다. 일부는 내부 시스템이라 글로만 소개합니다.",
    featuredTag: "주요 프로젝트",
    illustrationNote: "예시 애니메이션이며 실제 제품 화면이 아닙니다",
    scaleLabel: "제품 규모",
    featured: {
      title: "VisionMax 차량 관제 플랫폼",
      org: "MiTAC · B2B 구독형",
      desc: "딜러가 차량 현황을 파악할 수 있도록 돕는 구독형 플랫폼. 메인 프론트엔드 개발자로 Vue 3 업그레이드를 완료.",
      facts: ["약 20개 모듈", "9개 언어 (히브리어 RTL 포함)", "Dark / Light 테마", "Vue 3 업그레이드"],
      scale: "구독 수: 약 500 → 1만 이상",
    },
    privateNote: "내부 시스템으로 공개 불가",
    items: [
      { title: "감식 시스템", org: "坤侑科技", desc: "감식 데이터 생성과 진행 추적. 서명 패드, 실물 화상기 연동.", private: true },
      { title: "전자발찌 관제 시스템", org: "坤侑科技", desc: "지도에 착용자 위치와 경고 범위를 표시.", private: true },
      { title: "IoT 스마트 공장 상황실", org: "Kinpo Electronics", desc: "공장 데이터 시각화 대시보드." },
      { title: "XYZprinting 웹사이트 이전", org: "Kinpo Electronics", desc: "Play Framework에서 Angular 9로 이전하고 다국어 지원." },
      {
        title: "금융권 캠페인 사이트",
        org: "巧禾數位",
        desc: "Bank SinoPac, Taishin Richart, Fubon, Fidelity 등을 위한 반응형 캠페인 페이지와 인터랙션.",
      },
    ],
  },
  approach: {
    title: "일하는 방식",
    intro: "팀 안에서 일을 안정적으로 진행하기 위해 지키는 것들.",
    steps: [
      {
        title: "명세에서 시작하기",
        body: "기능 명세서와 개발 계획 문서 프로세스를 만들고, Jira로 백엔드와 API 명세를 확인하며 Merge Request로 변경을 관리합니다.",
      },
      {
        title: "공통 컴포넌트와 두 가지 테마",
        body: "UI/UX 디자이너와 협업 프로세스를 만들고, 공통 컴포넌트와 Dark / Light 색상 변수 시스템으로 일관된 화면을 유지합니다.",
      },
      {
        title: "다국어와 RTL",
        body: "vue-i18n으로 9개 언어(히브리어 RTL 포함)를 지원합니다. 언어 파일은 Google Sheet 스크립트로 일괄 추출해 두 시스템에서 동기화합니다.",
      },
      {
        title: "테스트와 품질",
        body: "Vitest 단위 테스트와 SonarQube로 품질을 점검합니다. Claude Code, Cursor, Copilot이 같은 개발 규칙을 공유합니다.",
      },
    ],
  },
  skills: {
    title: "기술",
    intro: "매일 사용하는 프레임워크, 도구, 워크플로.",
    groups: ["프레임워크와 언어", "UI와 스타일", "다국어", "테스트와 품질", "도구와 워크플로"],
    eduTitle: "학력",
    school: "Hwa Hsia University of Technology (華夏科技大學)",
    dept: "전자공학과",
    langTitle: "언어",
    langs: [
      { name: "중국어", level: "모국어" },
      { name: "영어", level: "영문 기술 문서와 API 문서를 읽을 수 있음" },
    ],
  },
  contact: {
    eyebrow: "연락처",
    title: "편하게 연락 주세요.",
    body: "LinkedIn, CakeResume 또는 이메일로 연락하실 수 있습니다.",
    reveal: "이메일 보기",
    hide: "이메일 숨기기",
    copy: "복사",
    copied: "복사됨",
    send: "메일 보내기",
    noscript: "LinkedIn 또는 CakeResume로 연락해 주세요.",
    backToTop: "맨 위로",
    rights: "© 2026 Luke Cheng (鄭宏璋)",
    note: "디자인 제안 v1 · 검토용",
  },
};

export const DICTS: Record<Locale, Dict> = { "zh-TW": zh, en, ja, ko };
