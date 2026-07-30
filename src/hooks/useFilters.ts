"use client";

import { useMemo, useState } from "react";
import type { Category, Recommendation } from "@/lib/types";

export function useFilters(recommendations: Recommendation[]) {
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [selectsOnly, setSelectsOnly] = useState(false);
  const [query, setQuery] = useState("");

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleSelectsOnly = () => setSelectsOnly((prev) => !prev);

  const showAll = () => {
    setSelectedCategories(new Set());
    setSelectsOnly(false);
    setQuery("");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recommendations.filter((r) => {
      if (!r.published) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(r.category)) return false;
      if (selectsOnly && !r.isSelect) return false;
      if (q) {
        const haystack = `${r.name} ${r.description} ${r.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [recommendations, selectedCategories, selectsOnly, query]);

  return {
    selectedCategories,
    selectsOnly,
    query,
    setQuery,
    toggleCategory,
    toggleSelectsOnly,
    showAll,
    filtered,
  };
}
