"use client";

import { createClient } from "@/lib/supabase/client";

type AnalyticsEvent =
  | { type: "view_recommendation"; recommendationId: string }
  | { type: "search"; query: string }
  | { type: "view_toggle"; viewMode: "map" | "list" };

// Fire-and-forget: analytics should never block or break the guest UI.
export function logEvent(event: AnalyticsEvent) {
  try {
    const supabase = createClient();
    const row: Record<string, unknown> = { event_type: event.type };
    if (event.type === "view_recommendation") row.recommendation_id = event.recommendationId;
    if (event.type === "search") row.query = event.query;
    if (event.type === "view_toggle") row.view_mode = event.viewMode;

    supabase
      .from("analytics_events")
      .insert(row)
      .then(() => {});
  } catch {
    // Ignore -- analytics is best-effort only.
  }
}
