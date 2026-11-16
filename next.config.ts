import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is static. cacheComponents would make `dynamicParams = false`
  // fail the build and render unknown locales on request instead of a 404.
  cacheComponents: false,
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
