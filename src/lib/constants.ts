import type { Category, CategoryStyleMap } from "./types";

// Geocoded via Nominatim (OpenStreetMap) for 93 Pleasant Street, Portsmouth, NH.
export const TREADWELL_ORIGIN = {
  name: "The Treadwell Mansion",
  address: "93 Pleasant Street, Portsmouth, New Hampshire",
  lat: 43.0756593,
  lng: -70.7568112,
} as const;

export const SELECTS_CAP = 25;

// Forked from OpenFreeMap's "Liberty" style (checked into public/map-styles/)
// and recolored toward the spec's antique-chart parchment palette -- flat
// tinted washes, sepia street casings, decluttered POIs. Tile/sprite/glyph
// sources still point at OpenFreeMap's free CDN; only the paint properties
// are ours. MapConfig.styleUrl in the DB is the admin-editable override/
// escape hatch (Section 4.4) for a further-customized style (e.g. once a
// custom serif font + paper-grain texture are sourced, per Section 4.2/4.3).
export const DEFAULT_MAP_STYLE_URL = "/map-styles/treadwell-parchment.json";

// Category colors were audited for CVD (colorblind) separability -- Cafés,
// Shops, Art, and Nightlife were shifted away from their closest neighbor
// under protanopia/deuteranopia/tritanopia simulation. See CategoryIcon.tsx:
// icon shape carries the category, color is reinforcement, since no 8-hue
// palette is fully separable under every CVD type.
export const DEFAULT_CATEGORY_STYLES: CategoryStyleMap = {
  restaurant: { category: "restaurant", color: "#8C2F39", label: "Restaurants" },
  cafe: { category: "cafe", color: "#A8502B", label: "Cafés" },
  entertainment: { category: "entertainment", color: "#25476A", label: "Entertainment" },
  historical: { category: "historical", color: "#A98235", label: "Historical Sites" },
  shop: { category: "shop", color: "#1F6B5E", label: "Shops" },
  art: { category: "art", color: "#96407D", label: "Art" },
  outdoor: { category: "outdoor", color: "#3E7C7C", label: "Outdoor & Waterfront" },
  nightlife: { category: "nightlife", color: "#6B2F58", label: "Nightlife & Bars" },
};

export const SELECT_RING_COLOR = "#A98235";
export const STAR_OUTLINE_COLOR = "#3A2E20";

export const DEFAULT_MAP_CONFIG = {
  centerLat: 43.076,
  centerLng: -70.757,
  zoom: 16,
  minZoom: 11,
  maxZoom: 19,
  maxBounds: [
    [-70.787, 42.981],
    [-70.705, 43.088],
  ] as [[number, number], [number, number]],
  styleUrl: null as string | null,
};

export function categoryLabel(category: Category): string {
  return DEFAULT_CATEGORY_STYLES[category].label;
}
