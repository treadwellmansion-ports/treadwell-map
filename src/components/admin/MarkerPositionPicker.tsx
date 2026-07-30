"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState } from "react";
import MapLibreMap, { Marker, type MapRef } from "react-map-gl/maplibre";
import { DEFAULT_MAP_STYLE_URL } from "@/lib/constants";
import { StarIcon } from "@/components/map/StarIcon";

export function MarkerPositionPicker({
  lat,
  lng,
  address,
  color,
  onChange,
  onAddressChange,
}: {
  lat: number;
  lng: number;
  address: string;
  color: string;
  onChange: (lat: number, lng: number) => void;
  onAddressChange: (address: string) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGeocode() {
    if (!address.trim()) {
      setError("Enter an address first");
      return;
    }
    setGeocoding(true);
    setError(null);
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Geocoding failed");
      onChange(data.lat, data.lng);
      mapRef.current?.flyTo({ center: [data.lng, data.lat], zoom: 17, duration: 800 });
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} -- drag the marker below to set the position manually.`
          : "Geocoding failed -- drag the marker below to set the position manually."
      );
    } finally {
      setGeocoding(false);
    }
  }

  async function handleDragEnd(newLat: number, newLng: number) {
    onChange(newLat, newLng);
    setLocating(true);
    setError(null);
    try {
      const res = await fetch("/api/reverse-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: newLat, lng: newLng }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reverse geocoding failed");
      onAddressChange(data.address);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Moved the pin, but couldn't look up the new address automatically (${err.message}) -- edit the Address field by hand if needed.`
          : "Moved the pin, but couldn't look up the new address automatically -- edit the Address field by hand if needed."
      );
    } finally {
      setLocating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleGeocode}
          disabled={geocoding}
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
        >
          {geocoding ? "Locating..." : "Geocode from address"}
        </button>
        <span className="text-xs text-neutral-500">
          {locating ? "Looking up new address..." : "or drag the marker to correct/override"}
        </span>
      </div>
      {error && <p className="mt-1 text-sm text-amber-700">{error}</p>}

      <div className="mt-3 h-64 overflow-hidden rounded-xl ring-1 ring-black/10">
        <MapLibreMap
          ref={mapRef}
          initialViewState={{ longitude: lng, latitude: lat, zoom: 16 }}
          mapStyle={DEFAULT_MAP_STYLE_URL}
          style={{ width: "100%", height: "100%" }}
        >
          <Marker
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            draggable
            onDragEnd={(e) => handleDragEnd(e.lngLat.lat, e.lngLat.lng)}
          >
            <div className="cursor-grab active:cursor-grabbing">
              <StarIcon color={color} size={28} />
            </div>
          </Marker>
        </MapLibreMap>
      </div>

      <div className="mt-2 flex gap-4 text-xs text-neutral-500">
        <span>Lat: {lat.toFixed(6)}</span>
        <span>Lng: {lng.toFixed(6)}</span>
      </div>
    </div>
  );
}
