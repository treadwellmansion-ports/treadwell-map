"use client";

import type { CategoryStyleMap, Recommendation } from "@/lib/types";
import { POPULAR_BADGE_COLOR } from "@/lib/constants";
import { CategoryIcon } from "./CategoryIcon";

// Closest first; recommendations with no computed walking time (a data gap,
// not "far away") sort to the end rather than the front.
function byDistance(a: Recommendation, b: Recommendation) {
  const da = a.walkingDistanceMeters ?? Infinity;
  const db = b.walkingDistanceMeters ?? Infinity;
  return da - db;
}

export function ListView({
  recommendations,
  categoryStyles,
  popularIds,
  onSelect,
}: {
  recommendations: Recommendation[];
  categoryStyles: CategoryStyleMap;
  popularIds?: Set<string>;
  onSelect: (recommendation: Recommendation) => void;
}) {
  const selects = recommendations.filter((r) => r.isSelect).sort(byDistance);
  const standard = recommendations.filter((r) => !r.isSelect).sort(byDistance);

  return (
    <div className="w-full bg-[var(--seasonal-card)] px-4 pb-8 pt-4">
      {selects.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--gold)] uppercase">
            Treadwell Selects
          </h3>
          <div className="flex flex-col gap-2">
            {selects.map((r) => (
              <Row
                key={r.id}
                recommendation={r}
                categoryStyles={categoryStyles}
                isPopular={popularIds?.has(r.id) ?? false}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col gap-2">
          {standard.map((r) => (
            <Row
              key={r.id}
              recommendation={r}
              categoryStyles={categoryStyles}
              isPopular={popularIds?.has(r.id) ?? false}
              onSelect={onSelect}
            />
          ))}
        </div>
      </section>

      {recommendations.length === 0 && (
        <p className="mt-8 text-center text-sm text-[var(--ink-secondary)]">No recommendations match your filters.</p>
      )}
    </div>
  );
}

function Row({
  recommendation,
  categoryStyles,
  isPopular,
  onSelect,
}: {
  recommendation: Recommendation;
  categoryStyles: CategoryStyleMap;
  isPopular: boolean;
  onSelect: (recommendation: Recommendation) => void;
}) {
  const style = categoryStyles[recommendation.category];
  return (
    <button
      type="button"
      onClick={() => onSelect(recommendation)}
      className="flex items-center gap-3 rounded-xl bg-[var(--row-bg)] p-3 text-left shadow-sm ring-1 ring-black/5 transition-colors duration-[600ms] hover:bg-[var(--row-bg-hover)]"
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{ width: 36, height: 36, backgroundColor: style.color }}
      >
        <CategoryIcon category={recommendation.category} size={20} />
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-[var(--ink)]">{recommendation.name}</span>
          {recommendation.isSelect && (
            <span className="rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              SELECT
            </span>
          )}
          {isPopular && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: POPULAR_BADGE_COLOR }}
            >
              POPULAR
            </span>
          )}
        </span>
        <span className="block text-xs text-[var(--ink-secondary)]">{style.label}</span>
      </span>
    </button>
  );
}
