"use client";

import { useMemo, useState } from "react";
import { allCategories, type Category, type Recommendation } from "@/lib/types";

export function useFilters(recommendations: Recommendation[]) {
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [selectsOnly, setSelectsOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [maxWalkMinutes, setMaxWalkMinutes] = useState<number | null>(null);

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
    setMaxWalkMinutes(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recommendations.filter((r) => {
      if (!r.published) return false;
      if (selectedCategories.size > 0) {
        const matchesAny = allCategories(r).some((c) => selectedCategories.has(c));
        if (!matchesAny) return false;
      }
      if (selectsOnly && !r.isSelect) return false;
      if (maxWalkMinutes != null) {
        if (r.walkingTimeMinutes == null || r.walkingTimeMinutes > maxWalkMinutes) return false;
      }
      if (q) {
        const haystack = `${r.name} ${r.description} ${allCategories(r).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [recommendations, selectedCategories, selectsOnly, maxWalkMinutes, query]);

  return {
    selectedCategories,
    setSelectedCategories,
    selectsOnly,
    query,
    maxWalkMinutes,
    setMaxWalkMinutes,
    setQuery,
    toggleCategory,
    toggleSelectsOnly,
    showAll,
    filtered,
  };
}
