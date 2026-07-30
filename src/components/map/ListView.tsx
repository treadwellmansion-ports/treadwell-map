"use client";

import type { CategoryStyleMap, Recommendation } from "@/lib/types";
import { StarIcon } from "./StarIcon";

export function ListView({
  recommendations,
  categoryStyles,
  onSelect,
}: {
  recommendations: Recommendation[];
  categoryStyles: CategoryStyleMap;
  onSelect: (recommendation: Recommendation) => void;
}) {
  const selects = recommendations
    .filter((r) => r.isSelect)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const standard = recommendations
    .filter((r) => !r.isSelect)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="w-full bg-[#FBF6EA] px-4 pb-8 pt-4">
      {selects.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-[#A98235] uppercase">
            Treadwell Selects
          </h3>
          <div className="flex flex-col gap-2">
            {selects.map((r) => (
              <Row key={r.id} recommendation={r} categoryStyles={categoryStyles} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col gap-2">
          {standard.map((r) => (
            <Row key={r.id} recommendation={r} categoryStyles={categoryStyles} onSelect={onSelect} />
          ))}
        </div>
      </section>

      {recommendations.length === 0 && (
        <p className="mt-8 text-center text-sm text-neutral-500">No recommendations match your filters.</p>
      )}
    </div>
  );
}

function Row({
  recommendation,
  categoryStyles,
  onSelect,
}: {
  recommendation: Recommendation;
  categoryStyles: CategoryStyleMap;
  onSelect: (recommendation: Recommendation) => void;
}) {
  const style = categoryStyles[recommendation.category];
  return (
    <button
      type="button"
      onClick={() => onSelect(recommendation)}
      className="flex items-center gap-3 rounded-xl bg-white/70 p-3 text-left shadow-sm ring-1 ring-black/5 hover:bg-white"
    >
      <StarIcon color={style.color} size={22} />
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-[#1B1408]">{recommendation.name}</span>
          {recommendation.isSelect && (
            <span className="rounded-full bg-[#A98235] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              SELECT
            </span>
          )}
        </span>
        <span className="block text-xs text-neutral-500">{style.label}</span>
      </span>
    </button>
  );
}
