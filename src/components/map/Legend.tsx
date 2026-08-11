"use client";

import { CATEGORIES, type Category, type CategoryStyleMap } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";

const GOLD = "var(--gold, #A98235)";
// The ribbon plaque is a fixed-contrast stamp (dark ink + light text
// normally), not a foreground/background pair that should invert -- in
// lamplight mode it swaps to the same gold-accent treatment as the primary
// CTA button, rather than going light-on-light against a dark card.
const PLAQUE_BG = "var(--cta-bg, #1B1408)";
const PLAQUE_TEXT = "var(--cta-text, #E9D8B5)";

// Corner brackets: four small L-shaped marks, like the corner accents on a
// chart's cartouche or a viewfinder -- plain CSS borders, no image asset.
function CornerBracket({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const size = 14;
  const base: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: GOLD,
    pointerEvents: "none",
  };
  const byCorner: Record<string, React.CSSProperties> = {
    tl: { top: -2, left: -2, borderTop: "2px solid", borderLeft: "2px solid" },
    tr: { top: -2, right: -2, borderTop: "2px solid", borderRight: "2px solid" },
    bl: { bottom: -2, left: -2, borderBottom: "2px solid", borderLeft: "2px solid" },
    br: { bottom: -2, right: -2, borderBottom: "2px solid", borderRight: "2px solid" },
  };
  return <span aria-hidden="true" style={{ ...base, ...byCorner[corner] }} />;
}

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
    <div className="pointer-events-auto w-full max-w-xs">
      {/* Ribbon title -- overlaps the top edge of the frame below. */}
      <div className="relative z-10 flex justify-center">
        <div
          className="relative px-4 py-1 text-xs font-semibold tracking-[0.15em] transition-colors duration-[600ms]"
          style={{ backgroundColor: PLAQUE_BG, color: PLAQUE_TEXT }}
        >
          MAP KEY
          <span
            aria-hidden="true"
            className="absolute top-0 h-full w-2"
            style={{ left: -8, backgroundColor: PLAQUE_BG, clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }}
          />
          <span
            aria-hidden="true"
            className="absolute top-0 h-full w-2"
            style={{ right: -8, backgroundColor: PLAQUE_BG, clipPath: "polygon(0 0, 0 100%, 100% 50%)" }}
          />
        </div>
      </div>

      {/* Double-rule frame with corner brackets. */}
      <div className="-mt-2.5 rounded-lg p-[3px]" style={{ border: `1px solid ${GOLD}88` }}>
        <div
          className="relative rounded-md p-3 pt-4 transition-colors duration-[600ms]"
          style={{ border: `1px solid ${GOLD}`, backgroundColor: "var(--seasonal-card, #FBF6EA)" }}
        >
          <CornerBracket corner="tl" />
          <CornerBracket corner="tr" />
          <CornerBracket corner="bl" />
          <CornerBracket corner="br" />

          <button
            type="button"
            onClick={onToggleSelects}
            className="mb-2 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
            style={{
              borderColor: GOLD,
              backgroundColor: selectsOnly ? GOLD : "transparent",
              color: selectsOnly ? "#fff" : "var(--ink-secondary, #4A3B2A)",
            }}
          >
            <span>⟡ Treadwell Selects</span>
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
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full"
                    style={{ width: 22, height: 22, backgroundColor: style.color }}
                  >
                    <CategoryIcon category={category} size={13} />
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: active ? style.color : "var(--ink-secondary, #4A3B2A)" }}
                  >
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-xs text-[var(--ink-secondary)] opacity-80">
            <span>
              Showing {filteredCount} of {totalCount}
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={onShowAll}
                className="font-semibold text-[var(--ink)] underline opacity-100"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
