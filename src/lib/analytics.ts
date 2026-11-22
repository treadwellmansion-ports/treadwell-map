"use client";

type AnalyticsEvent =
  | { type: "view_recommendation"; recommendationId: string }
  | { type: "search"; query: string }
  | { type: "view_toggle"; viewMode: "map" | "list" };

// Fire-and-forget: analytics should never block or break the guest UI.
// Sent through our own /api/events route (which validates and rate-limits)
// rather than written to the database directly from the browser.
export function logEvent(event: AnalyticsEvent) {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore -- analytics is best-effort only.
  }
}
