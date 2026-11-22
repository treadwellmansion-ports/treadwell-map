import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { badRequest, isUuid, serverError, tooManyRequests } from "@/lib/api-helpers";
import { sendCartEmails, type CartRecommendation } from "@/lib/email";
import { ago, clientIpHash, countSince, DAY_MS, HOUR_MS } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/validate";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_ITEMS = 25;
// A guest's name is dropped (the email just says "Hi there,") unless it looks
// like a name: letters, spaces, and . ' - only. This keeps links, phone numbers,
// and other text out of an email that goes out under the hotel's name.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}'’ .-]{0,59}$/u;

// This route is public and sends real email, so it is rate-limited. Every
// accepted request is logged in cart_submissions, and these limits count those
// rows. Sized for a boutique hotel's lobby kiosk, where every guest shares one
// network address, while stopping someone from using the form to flood an
// inbox or burn the email quota.
const LIMITS = {
  perEmailPerHour: 3,
  perEmailPerDay: 6,
  perVisitorPerHour: 20,
  allVisitorsPerDay: 120,
} as const;

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body) return badRequest("Invalid request body");

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  const name = NAME_PATTERN.test(rawName) ? rawName : null;
  const rawIds: unknown[] = Array.isArray(body.recommendationIds) ? body.recommendationIds : [];

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email))
    return badRequest("A valid email address is required");
  if (rawIds.length === 0) return badRequest("Your list is empty -- add a recommendation first");
  if (rawIds.length > MAX_ITEMS) return badRequest(`Lists are capped at ${MAX_ITEMS} recommendations`);
  if (!rawIds.every(isUuid)) return badRequest("Invalid recommendation list");
  const recommendationIds: string[] = [...new Set(rawIds as string[])];

  const supabase = createServiceClient();
  const ipHash = clientIpHash(request);

  try {
    const [emailHour, emailDay, visitorHour, allDay] = await Promise.all([
      countSince(supabase, "cart_submissions", ago(HOUR_MS), { column: "guest_email", value: email }),
      countSince(supabase, "cart_submissions", ago(DAY_MS), { column: "guest_email", value: email }),
      countSince(supabase, "cart_submissions", ago(HOUR_MS), { column: "ip_hash", value: ipHash }),
      countSince(supabase, "cart_submissions", ago(DAY_MS)),
    ]);
    if (emailHour >= LIMITS.perEmailPerHour || emailDay >= LIMITS.perEmailPerDay)
      return tooManyRequests("A few lists have already been sent to that address. Please check your inbox, or try again a little later.");
    if (visitorHour >= LIMITS.perVisitorPerHour || allDay >= LIMITS.allVisitorsPerDay)
      return tooManyRequests("We're getting a lot of requests right now. Please try again in a little while.");
  } catch {
    return NextResponse.json({ error: "Please try again in a moment." }, { status: 503 });
  }

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

  // Log the attempt BEFORE sending. Two reasons: no guest contact is ever lost
  // to a delivery hiccup (staff can follow up on anything marked "failed"), and
  // a burst of simultaneous requests is counted by the limits above as soon as
  // it starts, not only after the slow email call finishes.
  const { data: reservation, error: reserveError } = await supabase
    .from("cart_submissions")
    .insert({
      guest_email: email,
      guest_name: name,
      delivery_method: "email",
      status: "failed",
      failure_reason: "in progress",
      recommendation_ids: recommendations.map((r) => r.id),
      recommendation_snapshot: recommendations.map((r) => ({ id: r.id, name: r.name, address: r.address })),
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (reserveError || !reservation) {
    console.error("cart_submissions log failed:", reserveError?.message);
    return serverError("Couldn't send your list -- please try again in a moment");
  }

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

  const { error: updateError } = await supabase
    .from("cart_submissions")
    .update({
      status: guestSent ? "sent" : "failed",
      failure_reason: guestSent ? null : (guestError ?? "Failed to send").slice(0, 500),
    })
    .eq("id", reservation.id);
  if (updateError) console.error("cart_submissions status update failed:", updateError.message);

  if (!guestSent) return serverError("Couldn't send your list -- please try again in a moment");
  return NextResponse.json({ ok: true });
}
