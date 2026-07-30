"use client";

import { Marker } from "react-map-gl/maplibre";

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
  const size = Math.min(56, 34 + Math.log2(count) * 6);

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center" style={{ zIndex: 5 }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={`${count} recommendations in this area`}
        className="flex items-center justify-center rounded-full border-2 font-semibold text-white shadow-md transition-transform hover:scale-105"
        style={{
          width: size,
          height: size,
          backgroundColor: "#4A3B2A",
          borderColor: "#F4E9D6",
          fontSize: 13,
        }}
      >
        {count}
      </button>
    </Marker>
  );
}
