import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// "Popular with guests" -- listings with the most view_recommendation events
// in the trailing window. Guests can't read analytics directly, so this route
// is the one sanctioned way the aggregate signal reaches the guest map.
//
// The counting happens inside the database (popular_recommendation_ids, see
// migration 0015): it isn't subject to the API's 1000-row cap, and each
// visitor/day contributes at most PER_SOURCE_DAILY_CAP views per listing, so
// one person repeating views can't push a listing onto the list.
const LOOKBACK_DAYS = 30;
const MIN_VIEWS = 3;
const MAX_POPULAR = 12;
const PER_SOURCE_DAILY_CAP = 5;

export async function GET() {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase.rpc("popular_recommendation_ids", {
    p_since: since,
    p_min_views: MIN_VIEWS,
    p_limit: MAX_POPULAR,
    p_per_ip_daily_cap: PER_SOURCE_DAILY_CAP,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const popularIds = ((data ?? []) as { recommendation_id: string }[]).map((r) => r.recommendation_id);
  // Shared cache: the list changes slowly, so don't query the database on every page load.
  return NextResponse.json({ popularIds }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
