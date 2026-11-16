import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is static. cacheComponents would make `dynamicParams = false`
  // fail the build and render unknown locales on request instead of a 404.
  cacheComponents: false,
  experimental: {
    globalNotFound: true,
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
