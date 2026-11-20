import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Called once a day by the Vercel cron in vercel.json. Supabase's free tier
// pauses a project that sees no database activity for about a week; this runs
// one tiny read so the project stays awake even if no guest touches the map.
// Deliberately cheap and read-only (one row from a one-row table).
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServiceClient();
  const { error } = await supabase.from("map_config").select("id").eq("id", 1).single();
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
