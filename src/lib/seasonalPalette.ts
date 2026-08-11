// Seasonal parchment variants -- only the background wash and card surfaces
// shift; ink tones and category colors stay fixed so markers, legend, and
// text remain legible and on-brand across all variants. No variant is
// defined for spring (Mar-May), so the app's original palette is used then.
export interface SeasonalPalette {
  bg: string;
  card: string;
  deepTan: string;
}

const AUTUMN: SeasonalPalette = { bg: "#EDD9AE", card: "#F8EEDD", deepTan: "#B08F5E" };
const WINTER: SeasonalPalette = { bg: "#E8E3D2", card: "#F5F3EA", deepTan: "#A9A48E" };
const HIGH_SEASON: SeasonalPalette = { bg: "#F3E8CC", card: "#FDF9EE", deepTan: "#C2AD82" };

export function getSeasonalPalette(date: Date = new Date()): SeasonalPalette | null {
  const month = date.getMonth(); // 0 = January
  if (month >= 8 && month <= 10) return AUTUMN; // Sep-Nov
  if (month === 11 || month <= 1) return WINTER; // Dec-Feb
  if (month >= 5 && month <= 7) return HIGH_SEASON; // Jun-Aug
  return null; // Mar-May: default palette
}
