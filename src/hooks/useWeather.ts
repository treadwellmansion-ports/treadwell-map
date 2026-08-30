"use client";

import { useEffect, useState } from "react";
import type { WeatherReport } from "@/lib/weather";

// Re-fetched hourly, comfortably inside "updates daily" -- the kiosk stays
// open for days at a stretch, so relying on a page reload to refresh the
// weather would leave it stale for whoever's using it later that day.
const REFRESH_MS = 60 * 60 * 1000;

export function useWeather() {
  const [weather, setWeather] = useState<WeatherReport | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch("/api/weather", { cache: "no-store" }).catch(() => null);
      if (cancelled || !res || !res.ok) return;
      const data = (await res.json()) as WeatherReport;
      if (!cancelled) setWeather(data);
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return weather;
}
