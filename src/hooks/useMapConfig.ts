"use client";

import { useEffect, useState } from "react";
import type { MapConfig } from "@/lib/types";
import { DEFAULT_MAP_CONFIG } from "@/lib/constants";

export function useMapConfig() {
  const [mapConfig, setMapConfig] = useState<MapConfig>(DEFAULT_MAP_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/map-config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data: MapConfig) => {
        if (!cancelled) setMapConfig(data);
      })
      .catch(() => {
        // Fall back to the DEFAULT_MAP_CONFIG already in state (e.g. Supabase
        // not provisioned yet).
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { mapConfig, loading };
}
