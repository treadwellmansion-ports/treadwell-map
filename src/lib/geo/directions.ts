// Server-side helper that computes walking distance/time from the fixed
// Treadwell origin to a recommendation. Called on create/update and cached
// into recommendations.walking_distance_meters / walking_time_minutes -- not
// recomputed on every guest page load (see plan's "Defaults" section).
//
// Uses OSRM's free public demo routing server -- no account or API key.
// It's a shared demo instance (fair-use, not for heavy bulk traffic), which
// is fine for this app's light "once per recommendation edit" call volume.
// Self-host OSRM later if usage ever grows beyond that.
//
// IMPORTANT: the public demo server only has a driving graph loaded -- it
// accepts a /walking/ profile in the URL without erroring, but silently
// returns driving-speed results (confirmed: identical distance AND duration
// as the /driving/ profile for the same coordinates, ~16mph). The distance
// is still a reasonable proxy for walking distance in a small dense downtown
// (pedestrians mostly follow the same streets), but the duration is not --
// so we discard OSRM's duration and compute minutes ourselves from a
// standard walking pace instead.

const WALKING_SPEED_METERS_PER_SECOND = 1.35; // ~3 mph / ~4.8 km/h, average adult walking pace

export interface WalkingInfo {
  meters: number;
  minutes: number;
}

export async function getWalkingInfo(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<WalkingInfo | null> {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/walking/${coords}?overview=false`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OSRM routing failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    code: string;
    routes?: { distance: number; duration: number }[];
  };

  const route = data.routes?.[0];
  if (!route) return null;

  return {
    meters: Math.round(route.distance),
    minutes: Math.max(1, Math.round(route.distance / WALKING_SPEED_METERS_PER_SECOND / 60)),
  };
}

export function formatWalkingInfo(meters: number | null, minutes: number | null): string | null {
  if (meters == null || minutes == null) return null;
  const feet = meters * 3.28084;
  const distanceLabel = feet >= 1000 ? `${(feet / 5280).toFixed(1)} mi` : `${Math.round(feet)} ft`;
  return `${minutes} min walk (${distanceLabel})`;
}
