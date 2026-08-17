import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { badRequest, serverError } from "@/lib/api-helpers";
import { sendCartEmails, type CartRecommendation } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ITEMS = 25;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid request body");

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
  const rawIds: unknown[] = Array.isArray(body.recommendationIds) ? body.recommendationIds : [];

  if (!EMAIL_PATTERN.test(email)) return badRequest("A valid email address is required");
  if (rawIds.length === 0) return badRequest("Your list is empty -- add a recommendation first");
  if (rawIds.length > MAX_ITEMS) return badRequest(`Lists are capped at ${MAX_ITEMS} recommendations`);
  if (!rawIds.every((id): id is string => typeof id === "string"))
    return badRequest("Invalid recommendation list");
  const recommendationIds: string[] = rawIds;

  const supabase = createServiceClient();

  // Re-fetch from the DB rather than trusting the client payload's names/
  // addresses, so the emails (especially the staff notification) reflect
  // real, current data even if the client sent something tampered with.
  const { data: rows, error: fetchError } = await supabase
    .from("recommendations")
    .select("id, name, address, phone")
    .in("id", recommendationIds)
    .eq("published", true);

  if (fetchError) return serverError(fetchError.message);
  if (!rows || rows.length === 0) return badRequest("None of those recommendations could be found");

  const recommendations: CartRecommendation[] = rows;

  let guestSent = false;
  let guestError: string | null = null;
  try {
    const result = await sendCartEmails({
      guestEmail: email,
      guestName: name,
      deliveryMethod: "email",
      recommendations,
    });
    guestSent = result.guestSent;
    guestError = result.guestError;
  } catch (err) {
    guestError = err instanceof Error ? err.message : "Failed to send your list";
  }

  // Log every email a guest enters -- whether or not the send itself
  // succeeded -- so no contact is lost to a delivery hiccup (e.g. Resend's
  // unverified-domain test-mode restriction blocking sends to non-owner
  // addresses). Staff can follow up manually on anything marked "failed".
  const { error: logError } = await supabase.from("cart_submissions").insert({
    guest_email: email,
    guest_name: name,
    delivery_method: "email",
    status: guestSent ? "sent" : "failed",
    failure_reason: guestError,
    recommendation_ids: recommendations.map((r) => r.id),
    recommendation_snapshot: recommendations.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
    })),
  });
  if (logError) console.error("cart_submissions log failed:", logError.message);

  if (!guestSent) return serverError("Couldn't send your list -- please try again in a moment");
  return NextResponse.json({ ok: true });
}
