import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { badRequest, unauthorized } from "@/lib/api-helpers";
import { reverseGeocode } from "@/lib/geo/geocode";
import { readJsonBody } from "@/lib/validate";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = await readJsonBody(request);
  if (!body) return badRequest("Request body must be valid JSON");
  if (
    typeof body.lat !== "number" || typeof body.lng !== "number" ||
    !Number.isFinite(body.lat) || !Number.isFinite(body.lng) ||
    Math.abs(body.lat) > 90 || Math.abs(body.lng) > 180
  )
    return badRequest("lat/lng must be valid coordinates");

  try {
    const address = await reverseGeocode(body.lat, body.lng);
    if (!address) return NextResponse.json({ error: "No address found for this location" }, { status: 404 });
    return NextResponse.json({ address });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reverse geocoding failed" },
      { status: 502 }
    );
  }
}
