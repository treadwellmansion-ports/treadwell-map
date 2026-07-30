export const CATEGORIES = [
  "restaurant",
  "cafe",
  "entertainment",
  "historical",
  "shop",
  "art",
  "outdoor",
  "nightlife",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface StructuredHours {
  [day: string]: string; // e.g. { monday: "9:00 AM - 5:00 PM", tuesday: "Closed" }
}

export interface Recommendation {
  id: string;
  name: string;
  category: Category; // primary category -- drives the star's color
  additionalCategories: Category[]; // up to 2 more, for filter-matching only
  description: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  website: string | null;
  phone: string | null;
  hours: string | StructuredHours | null;
  published: boolean;
  isSelect: boolean;
  selectNote: string | null;
  displayOrder: number;
  walkingDistanceMeters: number | null;
  walkingTimeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

// All categories this recommendation matches when filtering (primary + additional).
export function allCategories(r: Pick<Recommendation, "category" | "additionalCategories">): Category[] {
  return [r.category, ...r.additionalCategories];
}

export const MAX_ADDITIONAL_CATEGORIES = 2;

export interface CategoryStyle {
  category: Category;
  color: string;
  label: string;
}

export type CategoryStyleMap = Record<Category, CategoryStyle>;

export interface MapConfig {
  centerLat: number;
  centerLng: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  maxBounds: [[number, number], [number, number]]; // [[swLng,swLat],[neLng,neLat]]
  styleUrl: string | null;
}

// --- Row shapes as they come back from Supabase (snake_case) ---

export interface RecommendationRow {
  id: string;
  name: string;
  category: Category;
  description: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  website: string | null;
  phone: string | null;
  hours: string | StructuredHours | null;
  published: boolean;
  is_select: boolean;
  select_note: string | null;
  display_order: number;
  walking_distance_meters: number | null;
  walking_time_minutes: number | null;
  created_at: string;
  updated_at: string;
  // Embedded via Supabase's `*, recommendation_categories(category)` select --
  // the full category set (primary + additional) for this recommendation.
  recommendation_categories?: { category: Category }[];
}

export interface CategoryStyleRow {
  category: Category;
  color: string;
  label: string;
}

export interface MapConfigRow {
  id: number;
  center_lat: number;
  center_lng: number;
  zoom: number;
  min_zoom: number;
  max_zoom: number;
  max_bounds: [[number, number], [number, number]];
  style_url: string | null;
}

export function recommendationFromRow(row: RecommendationRow): Recommendation {
  const additionalCategories = (row.recommendation_categories ?? [])
    .map((rc) => rc.category)
    .filter((c) => c !== row.category);

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    additionalCategories: [...new Set(additionalCategories)],
    description: row.description,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    photos: row.photos ?? [],
    website: row.website,
    phone: row.phone,
    hours: row.hours,
    published: row.published,
    isSelect: row.is_select,
    selectNote: row.select_note,
    displayOrder: row.display_order,
    walkingDistanceMeters: row.walking_distance_meters,
    walkingTimeMinutes: row.walking_time_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapConfigFromRow(row: MapConfigRow): MapConfig {
  return {
    centerLat: row.center_lat,
    centerLng: row.center_lng,
    zoom: row.zoom,
    minZoom: row.min_zoom,
    maxZoom: row.max_zoom,
    maxBounds: row.max_bounds,
    styleUrl: row.style_url,
  };
}
