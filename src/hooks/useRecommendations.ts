"use client";

import { useEffect, useState } from "react";
import type { Recommendation } from "@/lib/types";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load recommendations (${res.status})`);
      const data = (await res.json()) as Recommendation[];
      setRecommendations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/recommendations", { cache: "no-store" }).catch(() => null);
      if (cancelled) return;
      if (!res || !res.ok) {
        setError(`Failed to load recommendations${res ? ` (${res.status})` : ""}`);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as Recommendation[];
      if (cancelled) return;
      setRecommendations(data);
      setError(null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { recommendations, loading, error, reload };
}
