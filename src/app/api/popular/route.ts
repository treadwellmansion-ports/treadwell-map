import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// "Popular with guests" -- recommendations with the most view_recommendation
// events in the trailing window. Computed server-side with the service-role
// client since anon (guest) sessions can only INSERT analytics_events, not
// read them back -- this route is the one sanctioned way that aggregate
// signal reaches the guest-facing map without exposing raw event data.
const LOOKBACK_DAYS = 30;
const MIN_VIEWS = 3;
const MAX_POPULAR = 12;

export async function GET() {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("analytics_events")
    .select("recommendation_id")
    .eq("event_type", "view_recommendation")
    .gte("created_at", since)
    .not("recommendation_id", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.recommendation_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const popularIds = [...counts.entries()]
    .filter(([, count]) => count >= MIN_VIEWS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_POPULAR)
    .map(([id]) => id);

  return NextResponse.json({ popularIds });
}
