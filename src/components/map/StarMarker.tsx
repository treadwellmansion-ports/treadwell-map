"use client";

import { Marker } from "react-map-gl/maplibre";
import type { Recommendation } from "@/lib/types";
import { SELECT_RING_COLOR } from "@/lib/constants";
import { StarIcon } from "./StarIcon";

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
  const baseSize = 22;
  const size = recommendation.isSelect ? Math.round(baseSize * 1.15) : baseSize;
  const scale = isSelected ? 1.35 : 1;
  // Selects render above standard stars, below the Treadwell marker (z-index 30).
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
        className="flex items-center justify-center rounded-full transition-transform duration-150"
        style={{
          width: 44,
          height: 44,
          transform: `scale(${scale})`,
        }}
      >
        <span
          className="flex items-center justify-center rounded-full"
          style={{
            width: size + (recommendation.isSelect ? 10 : 0),
            height: size + (recommendation.isSelect ? 10 : 0),
            boxShadow: recommendation.isSelect ? `0 0 0 2.5px ${SELECT_RING_COLOR}` : undefined,
            backgroundColor: isSelected ? "rgba(255,255,255,0.35)" : "transparent",
          }}
        >
          <StarIcon color={color} size={size} />
        </span>
      </button>
    </Marker>
  );
}
