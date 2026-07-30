import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recommendationFromRow, type RecommendationRow } from "@/lib/types";
import { badRequest, isCategory, parseAdditionalCategories, unauthorized } from "@/lib/api-helpers";
import { SELECTS_CAP, TREADWELL_ORIGIN } from "@/lib/constants";
import { getWalkingInfo } from "@/lib/geo/directions";

// RLS does the real security work here: anonymous callers only ever see
// published=true rows regardless of query params; authenticated (staff)
// callers see everything. See supabase/migrations/0001_init.sql.
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recommendations")
    .select("*, recommendation_categories(category)")
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as RecommendationRow[];
  return NextResponse.json(rows.map(recommendationFromRow));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = await request.json();

  if (typeof body.name !== "string" || !body.name.trim()) return badRequest("name is required");
  if (!isCategory(body.category)) return badRequest("category is invalid");
  if (typeof body.address !== "string" || !body.address.trim())
    return badRequest("address is required");
  if (typeof body.lat !== "number" || typeof body.lng !== "number")
    return badRequest("lat/lng are required numbers");

  const additional = parseAdditionalCategories(body.additionalCategories, body.category);
  if ("error" in additional) return badRequest(additional.error);

  if (body.isSelect) {
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

  let walkingDistanceMeters: number | null = null;
  let walkingTimeMinutes: number | null = null;
  try {
    const walking = await getWalkingInfo(TREADWELL_ORIGIN, { lat: body.lat, lng: body.lng });
    if (walking) {
      walkingDistanceMeters = walking.meters;
      walkingTimeMinutes = walking.minutes;
    }
  } catch {
    // No/invalid Mapbox token yet, or the API call failed -- don't block
    // staff from saving the recommendation. Distance can be backfilled later.
  }

  const { data, error } = await supabase
    .from("recommendations")
    .insert({
      name: body.name,
      category: body.category,
      description: body.description ?? "",
      address: body.address,
      lat: body.lat,
      lng: body.lng,
      photos: body.photos ?? [],
      website: body.website ?? null,
      phone: body.phone ?? null,
      hours: body.hours ?? null,
      published: body.published ?? true,
      is_select: body.isSelect ?? false,
      select_note: body.selectNote ?? null,
      display_order: body.displayOrder ?? 0,
      walking_distance_meters: walkingDistanceMeters,
      walking_time_minutes: walkingTimeMinutes,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = data as RecommendationRow;
  const categorySet = [row.category, ...additional.categories];
  const { error: catError } = await supabase
    .from("recommendation_categories")
    .insert(categorySet.map((category) => ({ recommendation_id: row.id, category })));
  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });

  row.recommendation_categories = categorySet.map((category) => ({ category }));
  return NextResponse.json(recommendationFromRow(row), { status: 201 });
}
