"use client";

import { CATEGORIES, type Category, type CategoryStyleMap } from "@/lib/types";
import { StarIcon } from "./StarIcon";

export function Legend({
  categoryStyles,
  selectedCategories,
  selectsOnly,
  filteredCount,
  totalCount,
  onToggleCategory,
  onToggleSelects,
  onShowAll,
}: {
  categoryStyles: CategoryStyleMap;
  selectedCategories: Set<Category>;
  selectsOnly: boolean;
  filteredCount: number;
  totalCount: number;
  onToggleCategory: (category: Category) => void;
  onToggleSelects: () => void;
  onShowAll: () => void;
}) {
  const hasActiveFilter = selectedCategories.size > 0 || selectsOnly;

  return (
    <div className="pointer-events-auto w-full max-w-xs rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-black/10">
      <button
        type="button"
        onClick={onToggleSelects}
        className="mb-2 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
        style={{
          borderColor: "#A98235",
          backgroundColor: selectsOnly ? "#A98235" : "transparent",
          color: selectsOnly ? "#fff" : "#4A3B2A",
        }}
      >
        <span>★ Treadwell Selects</span>
      </button>

      <div className="mb-2 h-px bg-black/10" />

      <div className="flex flex-col gap-1">
        {CATEGORIES.map((category) => {
          const style = categoryStyles[category];
          const active = selectedCategories.has(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggleCategory(category)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
              style={{ backgroundColor: active ? `${style.color}22` : "transparent" }}
            >
              <StarIcon color={style.color} size={16} outlineWidth={1} />
              <span
                className="font-medium"
                style={{ color: active ? style.color : "#4A3B2A" }}
              >
                {style.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-xs text-neutral-600">
        <span>
          Showing {filteredCount} of {totalCount}
        </span>
        {hasActiveFilter && (
          <button type="button" onClick={onShowAll} className="font-semibold text-neutral-800 underline">
            Show All
          </button>
        )}
      </div>
    </div>
  );
}
