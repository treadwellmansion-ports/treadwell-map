import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { badRequest, isUuid, serverError, tooManyRequests } from "@/lib/api-helpers";
import { ago, clientIpHash, countSince, HOUR_MS } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/validate";

// Guest analytics (listing views, searches, map/list toggles). These used to be
// written straight from the browser with the public database key, which let
// anyone insert unlimited fake events. They now go through this route, which
// checks the shape, caps how much any one visitor can log, and stores only an
// anonymous hash of the caller.
const MAX_QUERY_LENGTH = 100;
// The lobby kiosk shares one address among every guest, so this is generous.
const EVENTS_PER_VISITOR_PER_HOUR = 600;

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body) return badRequest("Invalid request");

  const row: Record<string, unknown> = {};
  switch (body.type) {
    case "view_recommendation":
      if (!isUuid(body.recommendationId)) return badRequest("Invalid recommendation");
      row.event_type = "view_recommendation";
      row.recommendation_id = body.recommendationId;
      break;
    case "search": {
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (!query || query.length > MAX_QUERY_LENGTH) return badRequest("Invalid search");
      row.event_type = "search";
      row.query = query;
      break;
    }
    case "view_toggle":
      if (body.viewMode !== "map" && body.viewMode !== "list") return badRequest("Invalid view");
      row.event_type = "view_toggle";
      row.view_mode = body.viewMode;
      break;
    default:
      return badRequest("Invalid event");
  }

  const supabase = createServiceClient();
  const ipHash = clientIpHash(request);
  try {
    const recent = await countSince(supabase, "analytics_events", ago(HOUR_MS), { column: "ip_hash", value: ipHash });
    if (recent >= EVENTS_PER_VISITOR_PER_HOUR) return tooManyRequests("Too many requests", 600);
  } catch {
    return serverError("Unavailable");
  }

  row.ip_hash = ipHash;
  const { error } = await supabase.from("analytics_events").insert(row);
  if (error) {
    // 23503 = the recommendation id doesn't exist (foreign key).
    return error.code === "23503" ? badRequest("Unknown recommendation") : serverError("Unavailable");
  }
  return new NextResponse(null, { status: 204 });
}
