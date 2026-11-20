import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { badRequest, unauthorized } from "@/lib/api-helpers";
import { geocodeAddress } from "@/lib/geo/geocode";
import { readJsonBody } from "@/lib/validate";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = await readJsonBody(request);
  if (!body) return badRequest("Request body must be valid JSON");
  if (typeof body.address !== "string" || !body.address.trim() || body.address.length > 300)
    return badRequest("address is required (max 300 characters)");

  try {
    const result = await geocodeAddress(body.address);
    if (!result) return NextResponse.json({ error: "No match found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    // Surfaced to the admin UI, which falls back to manual marker placement
    // per Section 10 ("fallback of manually dragging the marker").
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Geocoding failed" },
      { status: 502 }
    );
  }
}
