import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapConfigFromRow, type MapConfigRow } from "@/lib/types";
import { badRequest, unauthorized } from "@/lib/api-helpers";
import { readJsonBody, validateMapConfigInput } from "@/lib/validate";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("map_config").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapConfigFromRow(data as MapConfigRow));
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = await readJsonBody(request);
  if (!body) return badRequest("Request body must be valid JSON");
  const invalid = validateMapConfigInput(body);
  if (invalid) return badRequest(invalid);
  const update: Record<string, unknown> = {};
  if (body.centerLat !== undefined) update.center_lat = body.centerLat;
  if (body.centerLng !== undefined) update.center_lng = body.centerLng;
  if (body.zoom !== undefined) update.zoom = body.zoom;
  if (body.minZoom !== undefined) update.min_zoom = body.minZoom;
  if (body.maxZoom !== undefined) update.max_zoom = body.maxZoom;
  if (body.maxBounds !== undefined) update.max_bounds = body.maxBounds;
  if (body.styleUrl !== undefined) update.style_url = body.styleUrl;

  const { data, error } = await supabase
    .from("map_config")
    .update(update)
    .eq("id", 1)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapConfigFromRow(data as MapConfigRow));
}
