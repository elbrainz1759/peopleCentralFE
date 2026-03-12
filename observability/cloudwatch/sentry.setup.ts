// ──────────────────────────────────────────────────────────────
// SENTRY SETUP FOR NEXT.JS (peopleCentralFE)
// ──────────────────────────────────────────────────────────────
//
// 1. Create a free account at https://sentry.io
//    → Create a new project → Select "Next.js"
//    → Copy your DSN (looks like: https://xxx@xxx.ingest.sentry.io/xxx)
//
// 2. Install the SDK:
//    pnpm add @sentry/nextjs
//
// 3. Run the wizard (auto-configures everything):
//    npx @sentry/wizard@latest -i nextjs
//
//    This creates:
//    - sentry.client.config.ts  (browser errors)
//    - sentry.server.config.ts  (server errors)
//    - sentry.edge.config.ts    (edge runtime)
//    - next.config.ts update    (source maps)
//
// ──────────────────────────────────────────────────────────────
// sentry.client.config.ts  — paste this if wizard doesn't create it
// ──────────────────────────────────────────────────────────────

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 100% of transactions in dev, 10% in production
  // At 500 views/day this keeps you well within the free tier
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Group errors by release so you can track which deploy introduced a bug
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Show source-mapped stack traces
  integrations: [
    Sentry.replayIntegration({
      // Session replay: record 1% of sessions, 100% of sessions with errors
      // Free tier allows 50 replays/month — perfect for your traffic
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
});

// ──────────────────────────────────────────────────────────────
// 4. Add to your .env.production (and GitHub Secrets):
// ──────────────────────────────────────────────────────────────
//
//   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
//   SENTRY_AUTH_TOKEN=your_sentry_auth_token   ← for source maps in CI
//   SENTRY_ORG=your-org-slug
//   SENTRY_PROJECT=your-project-slug
//
// ──────────────────────────────────────────────────────────────
// What you get for FREE:
//   ✅ JS error tracking with stack traces
//   ✅ Performance monitoring (page load times, API calls)
//   ✅ Session replays (see exactly what user did before the error)
//   ✅ Release tracking (know which deploy caused an error)
//   ✅ Email alerts on new errors
// ──────────────────────────────────────────────────────────────
