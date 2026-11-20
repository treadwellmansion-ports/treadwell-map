import type { NextRequest } from "next/server";
import { isCategory } from "./api-helpers";

// Server-side input checks for the staff admin API. The admin form already
// does light client-side validation, but the API is the real boundary --
// anything that can reach it with a valid login session can send any JSON.

const MAX_PHOTOS = 20;

// Values are checked by the validators below before any caller uses them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonBody = Record<string, any>;
type Obj = JsonBody;

export async function readJsonBody(request: NextRequest): Promise<JsonBody | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as JsonBody) : null;
  } catch {
    return null;
  }
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function stringWithin(v: unknown, field: string, max: number, opts: { required?: boolean } = {}): string | null {
  if (typeof v !== "string") return `${field} must be text`;
  if (opts.required && !v.trim()) return `${field} is required`;
  if (v.length > max) return `${field} is too long (max ${max} characters)`;
  return null;
}

// Only plain http(s) links -- a "javascript:" website would otherwise be
// rendered as a clickable link on the guest map.
function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// `partial` = PATCH (only validate fields that are present); otherwise POST
// (name/category/address/lat/lng are required). Returns an error message or null.
export function validateRecommendationInput(body: Obj, partial: boolean): string | null {
  const has = (k: string) => body[k] !== undefined;

  if (!partial || has("name")) {
    const e = stringWithin(body.name, "name", 120, { required: true });
    if (e) return e;
  }
  if (!partial || has("category")) {
    if (!isCategory(body.category)) return "category is invalid";
  }
  if (!partial || has("address")) {
    const e = stringWithin(body.address, "address", 300, { required: true });
    if (e) return e;
  }
  if (!partial || has("lat")) {
    if (!isFiniteNumber(body.lat) || body.lat < -90 || body.lat > 90) return "lat must be a number between -90 and 90";
  }
  if (!partial || has("lng")) {
    if (!isFiniteNumber(body.lng) || body.lng < -180 || body.lng > 180) return "lng must be a number between -180 and 180";
  }

  if (has("description") && body.description !== null) {
    const e = stringWithin(body.description, "description", 2000);
    if (e) return e;
  }
  if (has("selectNote") && body.selectNote !== null) {
    const e = stringWithin(body.selectNote, "selectNote", 500);
    if (e) return e;
  }
  if (has("phone") && body.phone !== null) {
    const e = stringWithin(body.phone, "phone", 40);
    if (e) return e;
  }
  if (has("website") && body.website !== null) {
    const e = stringWithin(body.website, "website", 500);
    if (e) return e;
    if (body.website && !isHttpUrl(body.website as string)) return "website must be a full http(s) link, like https://example.com";
  }
  if (has("photos")) {
    if (!Array.isArray(body.photos)) return "photos must be a list";
    if (body.photos.length > MAX_PHOTOS) return `photos is limited to ${MAX_PHOTOS} per listing`;
    for (const p of body.photos) {
      if (typeof p !== "string" || p.length > 600 || !isHttpUrl(p)) return "each photo must be an http(s) link";
    }
  }
  if (has("hours") && body.hours !== null) {
    const h = body.hours;
    if (typeof h === "string") {
      if (h.length > 600) return "hours is too long";
    } else if (h && typeof h === "object" && !Array.isArray(h)) {
      const entries = Object.entries(h as Obj);
      if (entries.length > 14) return "hours has too many entries";
      for (const [k, v] of entries) {
        if (k.length > 40 || typeof v !== "string" || v.length > 100) return "hours entries must be short text";
      }
    } else {
      return "hours must be text or a day -> hours map";
    }
  }
  if (has("published") && typeof body.published !== "boolean") return "published must be true or false";
  if (has("isSelect") && typeof body.isSelect !== "boolean") return "isSelect must be true or false";
  if (has("displayOrder")) {
    if (!Number.isInteger(body.displayOrder) || (body.displayOrder as number) < -100000 || (body.displayOrder as number) > 100000)
      return "displayOrder must be a whole number";
  }
  return null;
}

export function validateMapConfigInput(body: Obj): string | null {
  const nums: [string, number, number][] = [
    ["centerLat", -90, 90],
    ["centerLng", -180, 180],
    ["zoom", 0, 24],
    ["minZoom", 0, 24],
    ["maxZoom", 0, 24],
  ];
  for (const [k, lo, hi] of nums) {
    if (body[k] !== undefined && (!isFiniteNumber(body[k]) || (body[k] as number) < lo || (body[k] as number) > hi))
      return `${k} must be a number between ${lo} and ${hi}`;
  }
  if (body.maxBounds !== undefined) {
    const b = body.maxBounds;
    const ok =
      Array.isArray(b) &&
      b.length === 2 &&
      b.every((p) => Array.isArray(p) && p.length === 2 && p.every(isFiniteNumber)) &&
      (b as number[][])[0][0] < (b as number[][])[1][0] &&
      (b as number[][])[0][1] < (b as number[][])[1][1];
    if (!ok) return "maxBounds must be [[west, south], [east, north]] with west < east and south < north";
  }
  if (body.styleUrl !== undefined && body.styleUrl !== null) {
    const e = stringWithin(body.styleUrl, "styleUrl", 500);
    if (e) return e;
    // Same-site style files (/map-styles/...) or https URLs only.
    if (body.styleUrl && !(String(body.styleUrl).startsWith("/") && !String(body.styleUrl).startsWith("//")) && !isHttpUrl(String(body.styleUrl)))
      return "styleUrl must be a /path on this site or an https link";
  }
  return null;
}
