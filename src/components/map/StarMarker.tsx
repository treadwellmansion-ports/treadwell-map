"use client";

import { Marker } from "react-map-gl/maplibre";
import type { Recommendation } from "@/lib/types";
import { SELECT_RING_COLOR, STAR_OUTLINE_COLOR } from "@/lib/constants";

const RING_COLOR = `var(--gold, ${SELECT_RING_COLOR})`;
import { CategoryIcon } from "./CategoryIcon";

// Selection stamp: a one-shot ink-bleed ring (radial-gradient ink fading to
// transparent) that scales past the marker, plus a persistent gold ring
// while selected. Defined once in the module scope, injected on first
// render (see StarMarker.tsx's sibling GuestMap.tsx for the map/list page
// -turn transition, which lives in globals.css instead since it's shared).
const STAMP_STYLE_ID = "marker-stamp-keyframes";
function ensureStampKeyframes() {
  if (typeof document === "undefined" || document.getElementById(STAMP_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STAMP_STYLE_ID;
  style.textContent = `
    @keyframes marker-ink-bleed {
      0% { transform: scale(0.5); opacity: 0.45; }
      100% { transform: scale(2.3); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

export function StarMarker({
  recommendation,
  color,
  isSelected,
  onClick,
}: {
  recommendation: Recommendation;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  ensureStampKeyframes();

  const baseSize = 36;
  const pinSize = recommendation.isSelect ? Math.round(baseSize * 1.15) : baseSize;
  const iconSize = Math.round(pinSize * 0.56);
  const scale = isSelected ? 1.35 : 1;
  // Selects render above standard pins, below the Treadwell marker (z-index 30).
  const zIndex = recommendation.isSelect ? 20 : 10;

  return (
    <Marker
      longitude={recommendation.lng}
      latitude={recommendation.lat}
      anchor="bottom"
      style={{ zIndex: isSelected ? 40 : zIndex }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={recommendation.name}
        className="group relative flex items-center justify-center transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] hover:scale-[1.12]"
        style={{
          width: 44,
          height: 44,
          transform: `scale(${scale})`,
        }}
      >
        {isSelected && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              width: pinSize,
              height: pinSize,
              backgroundColor: color,
              animation: "marker-ink-bleed 420ms ease-out",
            }}
          />
        )}
        <span
          className="relative flex items-center justify-center rounded-full shadow-md"
          style={{
            width: pinSize,
            height: pinSize,
            backgroundColor: color,
            boxShadow: recommendation.isSelect
              ? `0 0 0 2.5px ${RING_COLOR}, 0 1px 3px rgba(27,20,8,.35)`
              : isSelected
                ? `0 0 0 2px ${RING_COLOR}, 0 1px 3px rgba(27,20,8,.35)`
                : "0 1px 3px rgba(27,20,8,.35)",
            border: `1px solid ${STAR_OUTLINE_COLOR}55`,
          }}
        >
          <CategoryIcon category={recommendation.category} size={iconSize} />
        </span>
      </button>
    </Marker>
  );
}
