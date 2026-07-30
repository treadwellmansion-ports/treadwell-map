import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { badRequest, unauthorized } from "@/lib/api-helpers";
import { reverseGeocode } from "@/lib/geo/geocode";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = await request.json();
  if (typeof body.lat !== "number" || typeof body.lng !== "number")
    return badRequest("lat/lng are required numbers");

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
