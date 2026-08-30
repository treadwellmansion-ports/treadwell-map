// Free, keyless weather via Open-Meteo (no account -- same "free public
// service" pattern as Nominatim geocoding and OSRM routing elsewhere in this
// app). Used for a small on-map weather badge and to nudge the guest map's
// default category filter toward indoor picks on a rainy/snowy day.

import { TREADWELL_ORIGIN } from "./constants";

export type WeatherCondition = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: "Clear",
  cloudy: "Partly Cloudy",
  fog: "Foggy",
  rain: "Rainy",
  snow: "Snowy",
  storm: "Thunderstorms",
};

export interface WeatherReport {
  temperatureF: number;
  condition: WeatherCondition;
  label: string;
}

// WMO weather codes, per Open-Meteo's docs.
function conditionFromCode(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 71 && code <= 77) return "snow";
  if (code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "rain"; // drizzle/rain/freezing-rain/showers codes
}

export function isRainOrSnow(condition: WeatherCondition): boolean {
  return condition === "rain" || condition === "snow" || condition === "storm";
}

export async function fetchWeather(): Promise<WeatherReport | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(TREADWELL_ORIGIN.lat));
  url.searchParams.set("longitude", String(TREADWELL_ORIGIN.lng));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "America/New_York");

  // Cached at the fetch layer so many kiosk/mobile clients hitting our own
  // /api/weather route don't each trigger a fresh upstream call.
  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };
  const temp = data.current?.temperature_2m;
  const code = data.current?.weather_code;
  if (typeof temp !== "number" || typeof code !== "number") return null;

  const condition = conditionFromCode(code);
  return { temperatureF: Math.round(temp), condition, label: CONDITION_LABELS[condition] };
}
