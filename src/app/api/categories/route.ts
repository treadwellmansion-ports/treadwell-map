import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CategoryStyleRow } from "@/lib/types";
import { badRequest, isCategory, unauthorized } from "@/lib/api-helpers";
import { readJsonBody } from "@/lib/validate";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("category_styles").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as CategoryStyleRow[]);
}

// Body: { category, color, label } -- edits one category's global style.
// Affects every marker in that category everywhere immediately (Section 10).
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = await readJsonBody(request);
  if (!body) return badRequest("Request body must be valid JSON");
  if (!isCategory(body.category)) return badRequest("category is invalid");
  if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color))
    return badRequest("color must be a hex string like #8C2F39");
  if (typeof body.label !== "string" || !body.label.trim() || body.label.length > 60)
    return badRequest("label is required (max 60 characters)");

  const { data, error } = await supabase
    .from("category_styles")
    .update({ color: body.color, label: body.label })
    .eq("category", body.category)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as CategoryStyleRow);
}
