// src/app/api/health/route.ts
// Add this file to your Next.js project.
// The Dockerfile HEALTHCHECK hits this endpoint every 30s.

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  );
}
