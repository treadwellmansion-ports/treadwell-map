"use client";

import { useEffect, useState } from "react";
import type { Category, CategoryStyleMap } from "@/lib/types";
import { DEFAULT_CATEGORY_STYLES } from "@/lib/constants";

function mergeRows(rows: { category: Category; color: string; label: string }[]): CategoryStyleMap {
  const next = { ...DEFAULT_CATEGORY_STYLES };
  for (const row of rows) {
    next[row.category] = { category: row.category, color: row.color, label: row.label };
  }
  return next;
}

export function useCategoryStyles() {
  const [categoryStyles, setCategoryStyles] = useState<CategoryStyleMap>(DEFAULT_CATEGORY_STYLES);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const rows = (await res.json()) as { category: Category; color: string; label: string }[];
      setCategoryStyles(mergeRows(rows));
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
      setCategoryStyles(mergeRows(rows));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Staff often edit colors in one tab (e.g. /admin/categories) while a
  // guest map or another admin page is already open elsewhere. Refetch
  // silently (no loading flicker) whenever this tab regains focus, instead
  // of requiring a manual reload to see the update.
  useEffect(() => {
    let cancelled = false;
    const refreshSilently = () => {
      if (document.visibilityState !== "visible") return;
      (async () => {
        const res = await fetch("/api/categories", { cache: "no-store" }).catch(() => null);
        if (cancelled || !res || !res.ok) return;
        const rows = (await res.json()) as { category: Category; color: string; label: string }[];
        if (cancelled) return;
        setCategoryStyles(mergeRows(rows));
      })();
    };
    window.addEventListener("focus", refreshSilently);
    document.addEventListener("visibilitychange", refreshSilently);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshSilently);
      document.removeEventListener("visibilitychange", refreshSilently);
    };
  }, []);

  return { categoryStyles, loading, reload };
}
