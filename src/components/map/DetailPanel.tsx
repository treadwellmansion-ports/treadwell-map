"use client";

import { useRef, useState } from "react";
import type { CategoryStyleMap, Recommendation } from "@/lib/types";
import { POPULAR_BADGE_COLOR, TREADWELL_ORIGIN } from "@/lib/constants";
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
  isInCart,
  onToggleCart,
  isPopular,
  related,
  onSelectRelated,
}: {
  entity: SelectedEntity;
  categoryStyles: CategoryStyleMap;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isInCart?: boolean;
  onToggleCart?: () => void;
  isPopular?: boolean;
  related?: Recommendation[];
  onSelectRelated?: (recommendation: Recommendation) => void;
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
            isInCart={isInCart ?? false}
            onToggleCart={onToggleCart}
            isPopular={isPopular ?? false}
            related={related ?? []}
            onSelectRelated={onSelectRelated}
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
  isInCart,
  onToggleCart,
  isPopular,
  related,
  onSelectRelated,
}: {
  recommendation: Recommendation;
  categoryStyles: CategoryStyleMap;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  largeText: boolean;
  isInCart: boolean;
  onToggleCart?: () => void;
  isPopular: boolean;
  related: Recommendation[];
  onSelectRelated?: (recommendation: Recommendation) => void;
}) {
  const style = categoryStyles[recommendation.category];
  const walking = formatWalkingInfo(
    recommendation.walkingDistanceMeters,
    recommendation.walkingTimeMinutes
  );

  // Pointer capture is only engaged once real drag movement is detected
  // (past DRAG_THRESHOLD_PX), not on every pointerdown -- capturing
  // immediately would redirect the click event that normally follows a
  // plain tap/click to this container, silently swallowing clicks on any
  // interactive child (the "More like this" carousel below has buttons;
  // the photo strip doesn't, but shares this pattern for consistency).
  const DRAG_THRESHOLD_PX = 4;

  const photoStripRef = useRef<HTMLDivElement>(null);
  const photoDrag = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
    dragging: boolean;
  } | null>(null);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);

  function handlePhotoPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // touch already scrolls natively
    const el = photoStripRef.current;
    if (!el) return;
    photoDrag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      dragging: false,
    };
  }

  function handlePhotoPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = photoDrag.current;
    const el = photoStripRef.current;
    if (!drag || !el) return;
    const delta = e.clientX - drag.startX;
    if (!drag.dragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      drag.dragging = true;
      setIsDraggingPhotos(true);
      el.setPointerCapture(drag.pointerId);
    }
    el.scrollLeft = drag.startScrollLeft - delta;
  }

  function endPhotoDrag() {
    photoDrag.current = null;
    setIsDraggingPhotos(false);
  }

  // Same click-and-drag pattern as the photo strip above, applied to the
  // "More like this" carousel further down -- see that strip's comment for
  // why this is needed at all (mouse drag doesn't auto-scroll like touch does).
  const relatedStripRef = useRef<HTMLDivElement>(null);
  const relatedDrag = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
    dragging: boolean;
  } | null>(null);
  const [isDraggingRelated, setIsDraggingRelated] = useState(false);

  function handleRelatedPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = relatedStripRef.current;
    if (!el) return;
    relatedDrag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      dragging: false,
    };
  }

  function handleRelatedPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = relatedDrag.current;
    const el = relatedStripRef.current;
    if (!drag || !el) return;
    const delta = e.clientX - drag.startX;
    if (!drag.dragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      drag.dragging = true;
      setIsDraggingRelated(true);
      el.setPointerCapture(drag.pointerId);
    }
    el.scrollLeft = drag.startScrollLeft - delta;
  }

  function endRelatedDrag() {
    relatedDrag.current = null;
    setIsDraggingRelated(false);
  }

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
        <span className="mt-1 flex shrink-0 flex-col items-end gap-1">
          {recommendation.isSelect && (
            <span className="rounded-full bg-[var(--gold)] px-2.5 py-1 text-xs font-semibold text-white">
              Treadwell Selects
            </span>
          )}
          {isPopular && (
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: POPULAR_BADGE_COLOR }}
            >
              Popular with Guests
            </span>
          )}
        </span>
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
        <div
          ref={photoStripRef}
          className={`mt-4 flex gap-2 overflow-x-auto pb-2 photo-strip-scroll ${
            isDraggingPhotos ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerDown={handlePhotoPointerDown}
          onPointerMove={handlePhotoPointerMove}
          onPointerUp={endPhotoDrag}
          onPointerLeave={endPhotoDrag}
          onPointerCancel={endPhotoDrag}
        >
          {recommendation.photos.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={recommendation.name}
              draggable={false}
              className="h-32 w-44 shrink-0 select-none rounded-lg object-cover"
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

      <div className="mt-5 flex gap-2">
        <a
          href={directionsUrl(recommendation.lat, recommendation.lng)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center rounded-full bg-[var(--cta-bg)] px-4 text-sm font-semibold text-[var(--cta-text)] transition-colors duration-[600ms] hover:opacity-90"
          style={{ minHeight: largeText ? 48 : 44 }}
        >
          Get Directions
        </a>
        {onToggleCart && (
          <button
            type="button"
            onClick={onToggleCart}
            aria-pressed={isInCart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors"
            style={{
              minHeight: largeText ? 48 : 44,
              borderColor: "var(--gold)",
              backgroundColor: isInCart ? "var(--gold)" : "transparent",
              color: isInCart ? "#fff" : "var(--ink-secondary)",
            }}
          >
            {isInCart ? "✓ On Your List" : "+ Add to List"}
          </button>
        )}
      </div>

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

      {related.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-[var(--gold)] uppercase">
            More {categoryStyles[recommendation.category].label}
          </h3>
          <div
            ref={relatedStripRef}
            className={`flex gap-2 overflow-x-auto pb-2 photo-strip-scroll ${
              isDraggingRelated ? "cursor-grabbing" : "cursor-grab"
            }`}
            onPointerDown={handleRelatedPointerDown}
            onPointerMove={handleRelatedPointerMove}
            onPointerUp={endRelatedDrag}
            onPointerLeave={endRelatedDrag}
            onPointerCancel={endRelatedDrag}
          >
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRelated?.(r)}
                draggable={false}
                className="flex w-28 shrink-0 select-none flex-col items-start gap-1.5 rounded-lg bg-[var(--row-bg)] p-2 text-left"
              >
                {r.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photos[0]}
                    alt=""
                    draggable={false}
                    className="h-16 w-full rounded object-cover"
                  />
                ) : (
                  <span
                    className="flex h-16 w-full items-center justify-center rounded"
                    style={{ backgroundColor: categoryStyles[r.category].color }}
                  >
                    <CategoryIcon category={r.category} size={22} />
                  </span>
                )}
                <span className="line-clamp-2 text-xs font-medium leading-tight text-[var(--ink)]">
                  {r.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <ReportIssueButton recommendationId={recommendation.id} recommendationName={recommendation.name} />
    </div>
  );
}
