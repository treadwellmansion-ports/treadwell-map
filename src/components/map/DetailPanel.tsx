"use client";

import type { CategoryStyleMap, Recommendation } from "@/lib/types";
import { TREADWELL_ORIGIN } from "@/lib/constants";
import { formatWalkingInfo } from "@/lib/geo/directions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { StarIcon } from "./StarIcon";
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

  const containerClass = isLandscape
    ? "absolute top-0 right-0 h-full w-full max-w-sm overflow-y-auto bg-[#FBF6EA] shadow-2xl"
    : "absolute inset-x-0 bottom-0 max-h-[65vh] overflow-y-auto rounded-t-2xl bg-[#FBF6EA] shadow-2xl";

  return (
    <div className={`${containerClass} pointer-events-auto z-30`}>
      <div className="sticky top-0 flex justify-end bg-[#FBF6EA] p-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-xl text-neutral-700 hover:bg-black/10"
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
          />
        )}
      </div>
    </div>
  );
}

function TreadwellContent() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#1B1408]">{TREADWELL_ORIGIN.name}</h2>
      <p className="mt-1 text-sm font-medium tracking-wide text-[#A98235] uppercase">You Are Here</p>
      <p className="mt-4 text-[#4A3B2A]">{TREADWELL_ORIGIN.address}</p>
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
}: {
  recommendation: Recommendation;
  categoryStyles: CategoryStyleMap;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const style = categoryStyles[recommendation.category];
  const walking = formatWalkingInfo(
    recommendation.walkingDistanceMeters,
    recommendation.walkingTimeMinutes
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[#1B1408]">{recommendation.name}</h2>
        {recommendation.isSelect && (
          <span className="mt-1 shrink-0 rounded-full bg-[#A98235] px-2.5 py-1 text-xs font-semibold text-white">
            Treadwell Selects
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <StarIcon color={style.color} size={16} outlineWidth={1} />
        <span className="text-sm font-medium" style={{ color: style.color }}>
          {style.label}
        </span>
      </div>

      {recommendation.isSelect && recommendation.selectNote && (
        <p className="mt-3 border-l-2 border-[#A98235] pl-3 text-sm italic text-[#6b5636]">
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
        <p className="mt-4 text-[15px] leading-relaxed text-[#4A3B2A]">{recommendation.description}</p>
      )}

      {walking && <p className="mt-4 text-sm font-medium text-[#6b5636]">{walking} from The Treadwell</p>}

      <dl className="mt-4 space-y-1 text-sm text-[#4A3B2A]">
        <div>
          <dt className="inline text-neutral-500">Address: </dt>
          <dd className="inline">{recommendation.address}</dd>
        </div>
        {recommendation.phone && (
          <div>
            <dt className="inline text-neutral-500">Phone: </dt>
            <dd className="inline">
              <a href={`tel:${recommendation.phone}`} className="underline">
                {recommendation.phone}
              </a>
            </dd>
          </div>
        )}
        {recommendation.website && (
          <div>
            <dt className="inline text-neutral-500">Website: </dt>
            <dd className="inline">
              <a href={recommendation.website} target="_blank" rel="noreferrer" className="underline">
                {recommendation.website.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        )}
        {recommendation.hours && (
          <div>
            <dt className="inline text-neutral-500">Hours: </dt>
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
        className="mt-5 flex items-center justify-center rounded-full bg-[#1B1408] px-4 py-3 text-sm font-semibold text-[#F4E9D6] hover:bg-[#2a2012]"
      >
        Get Directions
      </a>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="rounded-full px-3 py-2 text-sm font-medium text-neutral-700 disabled:opacity-30"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="rounded-full px-3 py-2 text-sm font-medium text-neutral-700 disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      <ReportIssueButton recommendationId={recommendation.id} recommendationName={recommendation.name} />
    </div>
  );
}
