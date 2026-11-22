import { createHmac } from "crypto";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// A stable, anonymous fingerprint of the caller's network address. The raw IP
// is never stored: it is keyed-hashed with a server-only secret, so the stored
// value can be used to count requests per visitor but can't be turned back
// into an address. Vercel sets x-forwarded-for to the real client address.
export function clientIpHash(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : (request.headers.get("x-real-ip") ?? "")).trim() || "unknown";
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-only-salt";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

// How many rows a table has gained since `since`, optionally narrowed to one
// column value (e.g. one visitor's ip_hash, or one email address). The guest
// write routes log every accepted request in a table, so these counts double as
// the rate-limit counters -- no extra infrastructure, and it works the same
// across serverless instances (unlike an in-memory counter).
export async function countSince(
  supabase: SupabaseClient,
  table: string,
  since: Date,
  filter?: { column: string; value: string }
): Promise<number> {
  let query = supabase.from(table).select("id", { count: "exact", head: true }).gte("created_at", since.toISOString());
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
export const ago = (ms: number) => new Date(Date.now() - ms);
