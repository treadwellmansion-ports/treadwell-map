import { NextResponse } from "next/server";
import { CATEGORIES, MAX_ADDITIONAL_CATEGORIES, type Category } from "./types";

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

// Validates the optional "additional categories" list a recommendation can
// carry alongside its primary category. Returns the deduped, primary-excluded
// list, or an error message to surface to the admin.
export function parseAdditionalCategories(
  value: unknown,
  primary: Category
): { categories: Category[] } | { error: string } {
  if (value === undefined || value === null) return { categories: [] };
  if (!Array.isArray(value)) return { error: "additionalCategories must be an array" };
  if (value.length > MAX_ADDITIONAL_CATEGORIES) {
    return { error: `You can add at most ${MAX_ADDITIONAL_CATEGORIES} additional categories` };
  }
  const result: Category[] = [];
  for (const v of value) {
    if (!isCategory(v)) return { error: `"${v}" is not a valid category` };
    if (v === primary) continue;
    if (!result.includes(v)) result.push(v);
  }
  return { categories: result };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

// 429 for the guest write routes. Retry-After is a hint to well-behaved clients.
export function tooManyRequests(message: string, retryAfterSeconds = 3600) {
  return NextResponse.json({ error: message }, { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}
