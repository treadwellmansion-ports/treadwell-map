import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { badRequest, isUuid, serverError, tooManyRequests } from "@/lib/api-helpers";
import { ago, clientIpHash, countSince, DAY_MS, HOUR_MS } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/validate";

// "Report an issue with this listing". Previously written straight from the
// browser; now validated here. The listing's name is looked up on the server
// instead of trusted from the request, and per-visitor and overall limits stop
// the front-desk inbox from being flooded.
const MAX_MESSAGE_LENGTH = 500;
const LIMITS = { perVisitorPerHour: 10, allVisitorsPerDay: 100 } as const;

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body) return badRequest("Invalid request");

  if (!isUuid(body.recommendationId)) return badRequest("Invalid listing");
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length > MAX_MESSAGE_LENGTH) return badRequest(`Please keep it under ${MAX_MESSAGE_LENGTH} characters.`);

  const supabase = createServiceClient();
  const ipHash = clientIpHash(request);

  try {
    const [visitorHour, allDay] = await Promise.all([
      countSince(supabase, "issue_reports", ago(HOUR_MS), { column: "ip_hash", value: ipHash }),
      countSince(supabase, "issue_reports", ago(DAY_MS)),
    ]);
    if (visitorHour >= LIMITS.perVisitorPerHour || allDay >= LIMITS.allVisitorsPerDay)
      return tooManyRequests("We've received a lot of reports just now. Thank you -- please try again later.");
  } catch {
    return NextResponse.json({ error: "Please try again in a moment." }, { status: 503 });
  }

  const { data: recommendation, error: lookupError } = await supabase
    .from("recommendations")
    .select("id, name")
    .eq("id", body.recommendationId)
    .eq("published", true)
    .maybeSingle();
  if (lookupError) return serverError("Please try again in a moment.");
  if (!recommendation) return badRequest("That listing could not be found");

  const { error } = await supabase.from("issue_reports").insert({
    recommendation_id: recommendation.id,
    recommendation_name: recommendation.name.slice(0, 120),
    message: message || null,
    ip_hash: ipHash,
  });
  if (error) return serverError("Please try again in a moment.");
  return NextResponse.json({ ok: true }, { status: 201 });
}
