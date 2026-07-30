// Server-side helper for the admin "geocode from address" flow (Section 10).
// Uses OpenStreetMap's free Nominatim geocoder -- no account or API key.
// Fair-use policy: max ~1 request/second, requires an identifying User-Agent.
// https://operations.osmfoundation.org/policies/nominatim/

export interface GeocodeResult {
  lat: number;
  lng: number;
  placeName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  // Bias results toward Portsmouth, NH's bounding box.
  url.searchParams.set("viewbox", "-70.768,43.082,-70.750,43.068");
  url.searchParams.set("bounded", "0");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "treadwell-map-admin/1.0 (recommendation geocoding)" },
  });
  if (!res.ok) {
    throw new Error(`Nominatim geocoding failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  const match = data[0];
  if (!match) return null;

  return {
    lat: Number(match.lat),
    lng: Number(match.lon),
    placeName: match.display_name,
  };
}
