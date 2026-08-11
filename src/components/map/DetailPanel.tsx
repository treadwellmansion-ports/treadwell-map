"use client";

import { useState } from "react";
import type { CategoryStyleMap, Recommendation } from "@/lib/types";
import { TREADWELL_ORIGIN } from "@/lib/constants";
import { formatWalkingInfo } from "@/lib/geo/directions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CategoryIcon } from "./CategoryIcon";
import { ReportIssueButton } from "./ReportIssueButton";

export type SelectedEntity =
  | { type: "recommendation"; data: Recommendation }
  | { type: "treadwell" };

function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export function DetailPanel({
  entity,
  categoryStyles,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  entity: SelectedEntity;
  categoryStyles: CategoryStyleMap;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const [largeText, setLargeText] = useState(false);

  const containerClass = isLandscape
    ? "absolute top-0 right-0 h-full overflow-y-auto bg-[var(--seasonal-card)] shadow-2xl transition-colors duration-[600ms]"
    : "absolute inset-x-0 bottom-0 max-h-[65vh] overflow-y-auto rounded-t-2xl bg-[var(--seasonal-card)] shadow-2xl transition-colors duration-[600ms]";

  return (
    <div
      className={`${containerClass} pointer-events-auto z-30 w-full`}
      style={isLandscape ? { maxWidth: largeText ? "30ch" : "38ch" } : undefined}
    >
      <div className="sticky top-0 flex items-center justify-between bg-[var(--seasonal-card)] p-2 transition-colors duration-[600ms]">
        <button
          type="button"
          onClick={() => setLargeText((v) => !v)}
          aria-label="Toggle larger text"
          aria-pressed={largeText}
          className="flex items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[var(--ink-secondary)] hover:bg-black/5"
          style={{ height: largeText ? 48 : 44, minWidth: largeText ? 48 : undefined }}
        >
          <span aria-hidden="true" style={{ fontSize: 12 }}>
            A
          </span>
          <span aria-hidden="true" style={{ fontSize: 18 }}>
            A
          </span>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex items-center justify-center rounded-full bg-black/5 text-xl text-[var(--ink-secondary)] hover:bg-black/10"
          style={{ width: largeText ? 48 : 44, height: largeText ? 48 : 44 }}
        >
          ×
        </button>
      </div>

      <div className="px-5 pb-8">
        {entity.type === "treadwell" ? (
          <TreadwellContent />
        ) : (
          <RecommendationContent
            recommendation={entity.data}
            categoryStyles={categoryStyles}
            onPrev={onPrev}
            onNext={onNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
            largeText={largeText}
          />
        )}
      </div>
    </div>
  );
}

function TreadwellContent() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[var(--ink)]">{TREADWELL_ORIGIN.name}</h2>
      <p className="mt-1 text-sm font-medium tracking-wide text-[var(--gold)] uppercase">You Are Here</p>
      <p className="mt-4 text-[var(--ink-secondary)]">{TREADWELL_ORIGIN.address}</p>
    </div>
  );
}

function RecommendationContent({
  recommendation,
  categoryStyles,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  largeText,
}: {
  recommendation: Recommendation;
  categoryStyles: CategoryStyleMap;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  largeText: boolean;
}) {
  const style = categoryStyles[recommendation.category];
  const walking = formatWalkingInfo(
    recommendation.walkingDistanceMeters,
    recommendation.walkingTimeMinutes
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-semibold text-[var(--ink)]"
          style={{
            fontFamily: "'PT Serif', Georgia, serif",
            fontSize: largeText ? 28 : 22,
            lineHeight: largeText ? 1.25 : 1.2,
          }}
        >
          {recommendation.name}
        </h2>
        {recommendation.isSelect && (
          <span className="mt-1 shrink-0 rounded-full bg-[var(--gold)] px-2.5 py-1 text-xs font-semibold text-white">
            Treadwell Selects
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="flex items-center gap-2">
          <span
            className="flex items-center justify-center rounded-full"
            style={{ width: 22, height: 22, backgroundColor: style.color }}
          >
            <CategoryIcon category={recommendation.category} size={13} />
          </span>
          <span className="text-sm font-medium" style={{ color: style.color }}>
            {style.label}
          </span>
        </span>
        {recommendation.additionalCategories.map((c) => (
          <span key={c} className="text-xs text-[var(--ink-secondary)]">
            + {categoryStyles[c].label}
          </span>
        ))}
      </div>

      {recommendation.isSelect && recommendation.selectNote && (
        <p className="mt-3 border-l-2 border-[var(--gold)] pl-3 text-sm italic text-[var(--ink-secondary)]">
          {recommendation.selectNote}
        </p>
      )}

      {recommendation.photos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {recommendation.photos.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={recommendation.name}
              className="h-32 w-44 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {recommendation.description && (
        <p
          className="mt-4 text-[var(--ink-secondary)]"
          style={{ fontSize: largeText ? 20 : 16, lineHeight: largeText ? 1.6 : 1.5 }}
        >
          {recommendation.description}
        </p>
      )}

      {walking && (
        <p className="mt-4 text-sm font-medium text-[var(--ink-secondary)]">{walking} from The Treadwell</p>
      )}

      <dl
        className={`mt-4 space-y-1 text-[var(--ink-secondary)] ${largeText ? "uppercase tracking-wide" : ""}`}
        style={{ fontSize: largeText ? 17 : 14, lineHeight: largeText ? 1.5 : 1.4 }}
      >
        <div>
          <dt className="inline opacity-70">Address: </dt>
          <dd className="inline">{recommendation.address}</dd>
        </div>
        {recommendation.phone && (
          <div>
            <dt className="inline opacity-70">Phone: </dt>
            <dd className="inline">
              <a href={`tel:${recommendation.phone}`} className="underline">
                {recommendation.phone}
              </a>
            </dd>
          </div>
        )}
        {recommendation.website && (
          <div>
            <dt className="inline opacity-70">Website: </dt>
            <dd className="inline">
              <a href={recommendation.website} target="_blank" rel="noreferrer" className="underline">
                {recommendation.website.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        )}
        {recommendation.hours && (
          <div>
            <dt className="inline opacity-70">Hours: </dt>
            <dd className="inline">
              {typeof recommendation.hours === "string"
                ? recommendation.hours
                : Object.entries(recommendation.hours)
                    .map(([day, hours]) => `${day}: ${hours}`)
                    .join(", ")}
            </dd>
          </div>
        )}
      </dl>

      <a
        href={directionsUrl(recommendation.lat, recommendation.lng)}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-center rounded-full bg-[var(--cta-bg)] px-4 text-sm font-semibold text-[var(--cta-text)] transition-colors duration-[600ms] hover:opacity-90"
        style={{ minHeight: largeText ? 48 : 44 }}
      >
        Get Directions
      </a>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="rounded-full px-3 py-2 text-sm font-medium text-[var(--ink-secondary)] disabled:opacity-30"
          style={{ minHeight: largeText ? 48 : undefined }}
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="rounded-full px-3 py-2 text-sm font-medium text-[var(--ink-secondary)] disabled:opacity-30"
          style={{ minHeight: largeText ? 48 : undefined }}
        >
          Next →
        </button>
      </div>

      <ReportIssueButton recommendationId={recommendation.id} recommendationName={recommendation.name} />
    </div>
  );
}
