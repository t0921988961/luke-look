import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// 'unsafe-inline' scripts: a nonce would force every page to render per request,
// and hashes cannot cover Next's inline RSC payload. The site takes no user input.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com`,
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Every page is static. cacheComponents would make `dynamicParams = false`
  // fail the build and render unknown locales on request instead of a 404.
  cacheComponents: false,
  poweredByHeader: false,
  experimental: {
    globalNotFound: true,
  },
  async redirects() {
    return [
      {
        // An explicit language choice wins on `/`; evaluated by the router, so the page stays static.
        source: "/",
        has: [{ type: "cookie", key: "NEXT_LOCALE", value: "(?<locale>en|ja|ko)" }],
        destination: "/:locale",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
