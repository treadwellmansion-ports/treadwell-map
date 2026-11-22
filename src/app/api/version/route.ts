import { NextResponse } from "next/server";

// Reports which build of the site is currently published. The lobby kiosk
// compares this with the build it loaded and refreshes itself when they differ.
// NEXT_PUBLIC_BUILD_ID is set at build time in next.config.ts.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
