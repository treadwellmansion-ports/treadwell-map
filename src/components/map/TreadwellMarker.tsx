"use client";

import { Marker } from "react-map-gl/maplibre";
import { TREADWELL_ORIGIN } from "@/lib/constants";

const LOGO_ASPECT = 1023 / 1380; // width / height of the source PNG

export function TreadwellMarker({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  const height = 48;
  const width = Math.round(height * LOGO_ASPECT);

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
        style={{ width: width + 16, height: height + 16, transform: `scale(${isSelected ? 1.15 : 1})` }}
      >
        <span
          className="flex items-center justify-center rounded-lg bg-[#FBF6EA] p-1.5 shadow-lg ring-1 ring-black/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/treadwell-logo.png"
            alt="The Treadwell Mansion"
            width={width}
            height={height}
            style={{ width, height }}
            draggable={false}
          />
        </span>
      </button>
    </Marker>
  );
}
