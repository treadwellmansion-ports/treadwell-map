"use client";

import { useEffect, useState } from "react";
import type { Category, CategoryStyleMap } from "@/lib/types";
import { DEFAULT_CATEGORY_STYLES } from "@/lib/constants";

export function useCategoryStyles() {
  const [categoryStyles, setCategoryStyles] = useState<CategoryStyleMap>(DEFAULT_CATEGORY_STYLES);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const rows = (await res.json()) as { category: Category; color: string; label: string }[];
      const next = { ...DEFAULT_CATEGORY_STYLES };
      for (const row of rows) {
        next[row.category] = { category: row.category, color: row.color, label: row.label };
      }
      setCategoryStyles(next);
    } catch {
      // Fall back to defaults already in state.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/categories", { cache: "no-store" }).catch(() => null);
      if (cancelled) return;
      if (!res || !res.ok) {
        setLoading(false);
        return;
      }
      const rows = (await res.json()) as { category: Category; color: string; label: string }[];
      if (cancelled) return;
      const next = { ...DEFAULT_CATEGORY_STYLES };
      for (const row of rows) {
        next[row.category] = { category: row.category, color: row.color, label: row.label };
      }
      setCategoryStyles(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categoryStyles, loading, reload };
}
