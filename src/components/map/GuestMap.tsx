"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import MapLibreMap, { type MapRef } from "react-map-gl/maplibre";
import Supercluster, { type ClusterFeature, type PointFeature } from "supercluster";
import type { Recommendation } from "@/lib/types";
import { DEFAULT_MAP_STYLE_URL, TREADWELL_ORIGIN } from "@/lib/constants";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useMapConfig } from "@/hooks/useMapConfig";
import { useCategoryStyles } from "@/hooks/useCategoryStyles";
import { useFilters } from "@/hooks/useFilters";
import { useIdleReset } from "@/hooks/useIdleReset";
import { logEvent } from "@/lib/analytics";
import { StarMarker } from "./StarMarker";
import { TreadwellMarker } from "./TreadwellMarker";
import { ClusterMarker } from "./ClusterMarker";
import { MapControls } from "./MapControls";
import { Legend } from "./Legend";
import { SearchBar } from "./SearchBar";
import { ListView } from "./ListView";
import { DetailPanel, type SelectedEntity } from "./DetailPanel";

type ClusterProps = { recommendationId: string };
type ClusterPoint = PointFeature<ClusterProps> | ClusterFeature<ClusterProps>;

export function GuestMap({ variant = "mobile" }: { variant?: "kiosk" | "mobile" | "embed" }) {
  const { recommendations, loading: recsLoading } = useRecommendations();
  const { mapConfig } = useMapConfig();
  const { categoryStyles } = useCategoryStyles();
  const filters = useFilters(recommendations);

  const mapRef = useRef<MapRef | null>(null);
  const [zoom, setZoom] = useState(mapConfig.zoom);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [view, setView] = useState<"map" | "list">("map");

  const standardFiltered = useMemo(
    () => filters.filtered.filter((r) => !r.isSelect),
    [filters.filtered]
  );
  const selectFiltered = useMemo(() => filters.filtered.filter((r) => r.isSelect), [filters.filtered]);

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<ClusterProps>({ radius: 60, maxZoom: mapConfig.maxZoom - 1 });
    index.load(
      standardFiltered.map((r) => ({
        type: "Feature",
        properties: { recommendationId: r.id },
        geometry: { type: "Point", coordinates: [r.lng, r.lat] },
      }))
    );
    return index;
  }, [standardFiltered, mapConfig.maxZoom]);

  const clusters: ClusterPoint[] = useMemo(
    () => clusterIndex.getClusters([-180, -85, 180, 85], Math.round(zoom)) as ClusterPoint[],
    [clusterIndex, zoom]
  );

  const recommendationById = useMemo(() => {
    const record: Record<string, Recommendation> = {};
    for (const r of recommendations) record[r.id] = r;
    return record;
  }, [recommendations]);

  function flyTo(lat: number, lng: number, targetZoom?: number) {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: targetZoom ?? Math.max(zoom, mapConfig.zoom),
      duration: 900,
      offset: variant !== "embed" ? [0, -60] : undefined,
    });
  }

  function selectRecommendation(recommendation: Recommendation) {
    setSelectedEntity({ type: "recommendation", data: recommendation });
    setView("map");
    flyTo(recommendation.lat, recommendation.lng);
    logEvent({ type: "view_recommendation", recommendationId: recommendation.id });
  }

  function changeView(nextView: "map" | "list") {
    setView(nextView);
    logEvent({ type: "view_toggle", viewMode: nextView });
  }

  function returnToDowntown() {
    setSelectedEntity(null);
    mapRef.current?.flyTo({
      center: [mapConfig.centerLng, mapConfig.centerLat],
      zoom: mapConfig.zoom,
      duration: 1000,
    });
  }

  // On the kiosk, a guest walking away shouldn't leave their search/filters
  // for the next person -- clear everything and recenter on the Treadwell
  // itself (not just the downtown default), per the idle-reset request.
  function resetToDefault() {
    setSelectedEntity(null);
    setView("map");
    filters.showAll();
    mapRef.current?.flyTo({
      center: [TREADWELL_ORIGIN.lng, TREADWELL_ORIGIN.lat],
      zoom: Math.max(mapConfig.zoom, 17),
      duration: 1000,
    });
  }

  useIdleReset(resetToDefault, variant === "kiosk");

  // Debounced so we log intent-to-search, not every keystroke.
  useEffect(() => {
    const query = filters.query.trim();
    if (!query) return;
    const timer = setTimeout(() => logEvent({ type: "search", query }), 800);
    return () => clearTimeout(timer);
  }, [filters.query]);

  function selectTreadwell() {
    setSelectedEntity({ type: "treadwell" });
    setView("map");
    flyTo(TREADWELL_ORIGIN.lat, TREADWELL_ORIGIN.lng, Math.max(zoom, 17));
  }

  function returnToTreadwell() {
    flyTo(TREADWELL_ORIGIN.lat, TREADWELL_ORIGIN.lng, Math.max(mapConfig.zoom, 17));
  }

  const sameCategorySorted = useMemo(() => {
    if (selectedEntity?.type !== "recommendation") return [];
    return recommendations
      .filter((r) => r.published && r.category === selectedEntity.data.category)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [recommendations, selectedEntity]);

  const currentIndex =
    selectedEntity?.type === "recommendation"
      ? sameCategorySorted.findIndex((r) => r.id === selectedEntity.data.id)
      : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < sameCategorySorted.length - 1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#8FB0AE]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto rounded-full bg-white/95 px-4 py-2 text-sm font-semibold tracking-wide text-[#1B1408] shadow-md">
          The Treadwell Mansion
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full bg-white/95 text-sm font-medium shadow-md ring-1 ring-black/10">
            <button
              type="button"
              onClick={() => changeView("map")}
              className="px-4 py-2"
              style={{ backgroundColor: view === "map" ? "#1B1408" : "transparent", color: view === "map" ? "#F4E9D6" : "#4A3B2A" }}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => changeView("list")}
              className="px-4 py-2"
              style={{ backgroundColor: view === "list" ? "#1B1408" : "transparent", color: view === "list" ? "#F4E9D6" : "#4A3B2A" }}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {view === "map" && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex items-start justify-between gap-3 p-3">
          <div className="flex flex-col gap-3">
            <SearchBar value={filters.query} onChange={filters.setQuery} />
            <Legend
              categoryStyles={categoryStyles}
              selectedCategories={filters.selectedCategories}
              selectsOnly={filters.selectsOnly}
              filteredCount={filters.filtered.length}
              totalCount={recommendations.filter((r) => r.published).length}
              onToggleCategory={filters.toggleCategory}
              onToggleSelects={filters.toggleSelectsOnly}
              onShowAll={filters.showAll}
            />
          </div>
          <MapControls onReturnDowntown={returnToDowntown} onReturnTreadwell={returnToTreadwell} />
        </div>
      )}

      {view === "list" ? (
        <div className="absolute inset-0 z-10 overflow-y-auto bg-[#FBF6EA] pt-16">
          <div className="flex flex-col gap-3 border-b border-black/5 p-3">
            <SearchBar value={filters.query} onChange={filters.setQuery} />
            <Legend
              categoryStyles={categoryStyles}
              selectedCategories={filters.selectedCategories}
              selectsOnly={filters.selectsOnly}
              filteredCount={filters.filtered.length}
              totalCount={recommendations.filter((r) => r.published).length}
              onToggleCategory={filters.toggleCategory}
              onToggleSelects={filters.toggleSelectsOnly}
              onShowAll={filters.showAll}
            />
          </div>
          <ListView recommendations={filters.filtered} categoryStyles={categoryStyles} onSelect={selectRecommendation} />
        </div>
      ) : (
        <MapLibreMap
          ref={mapRef}
          initialViewState={{
            longitude: mapConfig.centerLng,
            latitude: mapConfig.centerLat,
            zoom: mapConfig.zoom,
          }}
          minZoom={mapConfig.minZoom}
          maxZoom={mapConfig.maxZoom}
          maxBounds={mapConfig.maxBounds}
          mapStyle={mapConfig.styleUrl ?? DEFAULT_MAP_STYLE_URL}
          style={{ width: "100%", height: "100%" }}
          onMove={(evt) => setZoom(evt.viewState.zoom)}
          onClick={() => setSelectedEntity(null)}
        >
          {clusters.map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            if ("cluster" in feature.properties && feature.properties.cluster) {
              const clusterId = feature.properties.cluster_id;
              return (
                <ClusterMarker
                  key={`cluster-${clusterId}`}
                  longitude={lng}
                  latitude={lat}
                  count={feature.properties.point_count}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      clusterIndex.getClusterExpansionZoom(clusterId),
                      mapConfig.maxZoom
                    );
                    flyTo(lat, lng, expansionZoom);
                  }}
                />
              );
            }

            const recommendation = recommendationById[feature.properties.recommendationId];
            if (!recommendation) return null;
            return (
              <StarMarker
                key={recommendation.id}
                recommendation={recommendation}
                color={categoryStyles[recommendation.category].color}
                isSelected={selectedEntity?.type === "recommendation" && selectedEntity.data.id === recommendation.id}
                onClick={() => selectRecommendation(recommendation)}
              />
            );
          })}

          {selectFiltered.map((r) => (
            <StarMarker
              key={r.id}
              recommendation={r}
              color={categoryStyles[r.category].color}
              isSelected={selectedEntity?.type === "recommendation" && selectedEntity.data.id === r.id}
              onClick={() => selectRecommendation(r)}
            />
          ))}

          <TreadwellMarker isSelected={selectedEntity?.type === "treadwell"} onClick={selectTreadwell} />
        </MapLibreMap>
      )}

      {selectedEntity && (
        <DetailPanel
          entity={selectedEntity}
          categoryStyles={categoryStyles}
          onClose={() => setSelectedEntity(null)}
          onPrev={() => hasPrev && selectRecommendation(sameCategorySorted[currentIndex - 1])}
          onNext={() => hasNext && selectRecommendation(sameCategorySorted[currentIndex + 1])}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}

      {!recsLoading && recommendations.length === 0 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs text-neutral-600 shadow-md">
          No recommendations yet -- add some from /admin.
        </div>
      )}
    </div>
  );
}
