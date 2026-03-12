import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://d17gqyseyowaqt.cloudfront.net/:path*",
      },
    ];
  },

  output: "standalone",

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: "agejerry",
  project: "people-central-fe",
  silent: !process.env.CI,
  widenClientFileUpload: true,

  // Disable the automatic pages-router error page injection
  // Your app uses App Router so this causes the <Html> conflict
  autoInstrumentServerFunctions: false,
  disableLogger: true,
});
