"use client";

import { useEffect, useState } from "react";

export function usePopular() {
  const [popularIds, setPopularIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/popular", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { popularIds?: string[] } | null) => {
        if (cancelled || !data?.popularIds) return;
        setPopularIds(new Set(data.popularIds));
      })
      .catch(() => {
        // Best-effort -- guest map works fine with no popularity signal.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return popularIds;
}
