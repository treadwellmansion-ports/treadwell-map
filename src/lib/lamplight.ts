"use client";

import { useEffect, useState } from "react";
import type { Category, CategoryStyleMap } from "./types";

// Evening "lamplight" mode: a warm umber ground (not black) with lightened
// category colors, auto-switching at local dusk. This is a deliberate,
// explicit app-driven time check -- NOT `prefers-color-scheme` -- per the
// existing note in globals.css about a past dark-mode bug that made input
// text invisible. Nothing here reacts to OS theme; only the local clock.
export const LAMPLIGHT_PALETTE = {
  bg: "#2A2013",
  card: "#3A2C1A",
  border: "#5A4529",
  ink: "#EDE0C4",
  gold: "#C89B4A",
} as const;

// Category colors lightened +13 to +20% L (HSL) -- just enough to clear a
// 3:1 graphics-minimum contrast against the dark ground, not swapped for
// neon "dark mode" tones.
const LAMPLIGHT_CATEGORY_COLORS: Record<Category, string> = {
  restaurant: "#c25561",
  cafe: "#cc7049",
  entertainment: "#4075ab",
  historical: "#c7a259",
  shop: "#319c89",
  art: "#b8609f",
  outdoor: "#56a6a6",
  nightlife: "#a84d8c",
};

export function applyLamplightColors(styles: CategoryStyleMap): CategoryStyleMap {
  const result = {} as CategoryStyleMap;
  for (const category of Object.keys(styles) as Category[]) {
    result[category] = { ...styles[category], color: LAMPLIGHT_CATEGORY_COLORS[category] };
  }
  return result;
}

// Approximate local sunset hour by month for Portsmouth, NH (43.08N) --
// good enough for a lobby kiosk's "it's getting dark" cue, not meant to be
// astronomically precise to the minute.
const SUNSET_HOUR_BY_MONTH = [16.5, 17.3, 18.9, 19.6, 20.1, 20.4, 20.3, 19.7, 18.8, 18.0, 16.4, 16.2];
const DAWN_HOUR = 6.5;

function isDuskOrLater(date: Date): boolean {
  const hour = date.getHours() + date.getMinutes() / 60;
  const sunset = SUNSET_HOUR_BY_MONTH[date.getMonth()];
  return hour < DAWN_HOUR || hour >= sunset;
}

// Re-checked periodically (not just once at mount) so a long kiosk session
// crossing sunset switches over live, per the spec's "auto-switches at
// local sunset" requirement.
export function useLamplight(): boolean {
  const [isLamplight, setIsLamplight] = useState(() => isDuskOrLater(new Date()));

  useEffect(() => {
    const check = () => setIsLamplight(isDuskOrLater(new Date()));
    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return isLamplight;
}
