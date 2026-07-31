"use client";

import { Marker } from "react-map-gl/maplibre";

const LOGO_ASPECT = 1023 / 1380; // width / height of the source PNG

export function ClusterMarker({
  longitude,
  latitude,
  count,
  onClick,
}: {
  longitude: number;
  latitude: number;
  count: number;
  onClick: () => void;
}) {
  const size = Math.min(60, 38 + Math.log2(count) * 6);
  const logoHeight = size * 0.62;
  const logoWidth = logoHeight * LOGO_ASPECT;

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center" style={{ zIndex: 5 }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={`${count} recommendations in this area`}
        className="relative flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        <span
          className="flex items-center justify-center rounded-full border-2 shadow-md"
          style={{ width: size, height: size, backgroundColor: "#FBF6EA", borderColor: "#3A2E20" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/treadwell-logo.png"
            alt=""
            width={logoWidth}
            height={logoHeight}
            style={{ width: logoWidth, height: logoHeight }}
            draggable={false}
          />
        </span>
        <span
          className="absolute -right-1 -top-1 flex items-center justify-center rounded-full border-2 border-[#FBF6EA] font-semibold text-white shadow-sm"
          style={{ minWidth: 20, height: 20, padding: "0 4px", backgroundColor: "#A98235", fontSize: 11 }}
        >
          {count}
        </span>
      </button>
    </Marker>
  );
}
