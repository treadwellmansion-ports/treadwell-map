"use client";

import { Marker } from "react-map-gl/maplibre";
import { TREADWELL_ORIGIN } from "@/lib/constants";
import { StarIcon } from "./StarIcon";

// Placeholder Treadwell "You Are Here" mark: a gold star-in-circle with a
// simple building glyph. Swap for the real Treadwell brand mark asset when
// one is provided (see plan's "Defaults" section).
export function TreadwellMarker({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Marker
      longitude={TREADWELL_ORIGIN.lng}
      latitude={TREADWELL_ORIGIN.lat}
      anchor="bottom"
      style={{ zIndex: 50 }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label="The Treadwell Mansion -- You Are Here"
        className="flex items-center justify-center transition-transform duration-150"
        style={{ width: 52, height: 52, transform: `scale(${isSelected ? 1.15 : 1})` }}
      >
        <span
          className="flex items-center justify-center rounded-full border-2 border-[#3A2E20] bg-[#1B1408] shadow-lg"
          style={{ width: 40, height: 40 }}
        >
          <StarIcon color="#D9A93B" size={22} outlineWidth={1} />
        </span>
      </button>
    </Marker>
  );
}
