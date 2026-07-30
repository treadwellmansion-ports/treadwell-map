import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recommendationFromRow, type RecommendationRow } from "@/lib/types";
import { badRequest, isCategory, notFound, unauthorized } from "@/lib/api-helpers";
import { SELECTS_CAP, TREADWELL_ORIGIN } from "@/lib/constants";
import { getWalkingInfo } from "@/lib/geo/directions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("recommendations").select("*").eq("id", id).single();

  if (error || !data) return notFound();
  return NextResponse.json(recommendationFromRow(data as RecommendationRow));
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { data: existingRow, error: existingError } = await supabase
    .from("recommendations")
    .select("*")
    .eq("id", id)
    .single();
  if (existingError || !existingRow) return notFound();
  const existing = existingRow as RecommendationRow;

  const body = await request.json();
  if (body.category !== undefined && !isCategory(body.category))
    return badRequest("category is invalid");

  const wantsSelect = body.isSelect ?? existing.is_select;
  if (wantsSelect && !existing.is_select) {
    const { count, error: countError } = await supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .eq("is_select", true);
    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
    if ((count ?? 0) >= SELECTS_CAP) {
      return NextResponse.json(
        { error: `Treadwell Selects is capped at ${SELECTS_CAP}. Remove one before adding another.` },
        { status: 409 }
      );
    }
  }

  const nextLat = body.lat ?? existing.lat;
  const nextLng = body.lng ?? existing.lng;
  let walkingDistanceMeters = existing.walking_distance_meters;
  let walkingTimeMinutes = existing.walking_time_minutes;

  if (nextLat !== existing.lat || nextLng !== existing.lng) {
    try {
      const walking = await getWalkingInfo(TREADWELL_ORIGIN, { lat: nextLat, lng: nextLng });
      walkingDistanceMeters = walking?.meters ?? null;
      walkingTimeMinutes = walking?.minutes ?? null;
    } catch {
      // Leave the previous cached values in place if the Directions call fails.
    }
  }

  const update: Record<string, unknown> = { walking_distance_meters: walkingDistanceMeters, walking_time_minutes: walkingTimeMinutes };
  if (body.name !== undefined) update.name = body.name;
  if (body.category !== undefined) update.category = body.category;
  if (body.description !== undefined) update.description = body.description;
  if (body.address !== undefined) update.address = body.address;
  if (body.lat !== undefined) update.lat = body.lat;
  if (body.lng !== undefined) update.lng = body.lng;
  if (body.photos !== undefined) update.photos = body.photos;
  if (body.website !== undefined) update.website = body.website;
  if (body.phone !== undefined) update.phone = body.phone;
  if (body.hours !== undefined) update.hours = body.hours;
  if (body.published !== undefined) update.published = body.published;
  if (body.isSelect !== undefined) update.is_select = body.isSelect;
  if (body.selectNote !== undefined) update.select_note = body.selectNote;
  if (body.displayOrder !== undefined) update.display_order = body.displayOrder;

  const { data, error } = await supabase
    .from("recommendations")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(recommendationFromRow(data as RecommendationRow));
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { error } = await supabase.from("recommendations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
