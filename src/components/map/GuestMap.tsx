"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import MapLibreMap, { type MapEvent, type MapRef } from "react-map-gl/maplibre";
import Supercluster, { type ClusterFeature, type PointFeature } from "supercluster";
import type { Recommendation } from "@/lib/types";
import { DEFAULT_MAP_STYLE_URL, TREADWELL_ORIGIN } from "@/lib/constants";
import { getSeasonalPalette } from "@/lib/seasonalPalette";
import { applyLamplightColors, LAMPLIGHT_PALETTE, useLamplight } from "@/lib/lamplight";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useMapConfig } from "@/hooks/useMapConfig";
import { useCategoryStyles } from "@/hooks/useCategoryStyles";
import { useFilters } from "@/hooks/useFilters";
import { useIdleReset } from "@/hooks/useIdleReset";
import { useScreensaver } from "@/hooks/useScreensaver";
import { logEvent } from "@/lib/analytics";
import { StarMarker } from "./StarMarker";
import { TreadwellMarker } from "./TreadwellMarker";
import { ClusterMarker } from "./ClusterMarker";
import { MapControls } from "./MapControls";
import { Legend } from "./Legend";
import { SearchBar } from "./SearchBar";
import { ListView } from "./ListView";
import { DetailPanel, type SelectedEntity } from "./DetailPanel";
import { CompassRose } from "./CompassRose";
import { CompassLoader } from "./CompassLoader";
import { Screensaver } from "./Screensaver";

const SCREENSAVER_TIMEOUT_MS = 5 * 60 * 1000;

// Baked into the basemap itself (via a runtime background-pattern, not a
// screen-space overlay) so it always sits under every marker -- a DOM
// overlay would sit above the marker layer and dull the stars.
// The pattern paints opaque over whatever background-color is set beneath
// it, so it's skipped in lamplight mode (a flat dark umber wash) rather
// than masking the dark tint with the light parchment-noise texture.
function handleMapLoad(e: MapEvent, applyPattern: boolean) {
  const map = e.target;
  if (map.hasImage("paper-grain")) {
    if (map.getLayer("background")) {
      map.setPaintProperty("background", "background-pattern", applyPattern ? "paper-grain" : null);
    }
    return;
  }
  map
    .loadImage("/map-styles/paper-grain.png")
    .then(({ data: image }) => {
      if (!image || map.hasImage("paper-grain")) return;
      map.addImage("paper-grain", image);
      if (applyPattern && map.getLayer("background")) {
        map.setPaintProperty("background", "background-pattern", "paper-grain");
      }
    })
    .catch(() => {
      // Non-critical decoration -- if it fails to load, the flat parchment
      // background-color already set in the style JSON is a fine fallback.
    });
}

type ClusterProps = { recommendationId: string };
type ClusterPoint = PointFeature<ClusterProps> | ClusterFeature<ClusterProps>;

export function GuestMap({ variant = "mobile" }: { variant?: "kiosk" | "mobile" | "embed" }) {
  const { recommendations, loading: recsLoading } = useRecommendations();
  const { mapConfig } = useMapConfig();
  const { categoryStyles } = useCategoryStyles();
  const filters = useFilters(recommendations);
  const isLamplight = useLamplight();
  const effectiveCategoryStyles = useMemo(
    () => (isLamplight ? applyLamplightColors(categoryStyles) : categoryStyles),
    [categoryStyles, isLamplight]
  );

  const mapRef = useRef<MapRef | null>(null);
  const [zoom, setZoom] = useState(mapConfig.zoom);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [loaderPhase, setLoaderPhase] = useState<"idle" | "settling" | "done">("idle");
  // Computed once per mount, not re-checked mid-session -- a guest's visit
  // won't cross a season boundary, so there's no need to watch the clock.
  const seasonal = useMemo(() => getSeasonalPalette(), []);

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
  const screensaver = useScreensaver(variant === "kiosk", SCREENSAVER_TIMEOUT_MS);

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

  // Compass-settle loading state: idle wobble while the style/tiles load,
  // then a one-shot settle-to-north once ready, instead of a blank gap.
  // Guarded so a second `load` event (react-map-gl re-fires onLoad when the
  // prop identity changes on an already-loaded map) can't restart the timer.
  function onMapLoad(e: MapEvent) {
    handleMapLoad(e, !isLamplight);
    if (e.target.getLayer("background")) {
      const bg = isLamplight ? LAMPLIGHT_PALETTE.bg : seasonal?.bg;
      if (bg) e.target.setPaintProperty("background", "background-color", bg);
    }
    setLoaderPhase((prev) => (prev === "idle" ? "settling" : prev));
    setTimeout(() => setLoaderPhase((prev) => (prev === "settling" ? "done" : prev)), 1900);
  }

  // Lamplight can flip live during a long kiosk session (re-checked every 5
  // min, see useLamplight) -- re-paint the already-loaded map's background
  // rather than waiting for a reload. MapLibre cross-fades paint property
  // changes by default, giving the spec's dusk transition "for free".
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded() || !map.getLayer("background")) return;
    const bg = isLamplight ? LAMPLIGHT_PALETTE.bg : seasonal?.bg;
    if (bg) map.setPaintProperty("background", "background-color", bg);
    map.setPaintProperty("background", "background-pattern", isLamplight ? null : "paper-grain");
  }, [isLamplight, seasonal]);

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
    <div
      className="relative h-full w-full overflow-hidden bg-[#8FB0AE]"
      style={
        {
          "--seasonal-card": isLamplight ? LAMPLIGHT_PALETTE.card : (seasonal?.card ?? "#FBF6EA"),
          "--seasonal-deep-tan": isLamplight ? LAMPLIGHT_PALETTE.border : (seasonal?.deepTan ?? "#B9A47B"),
          "--ink": isLamplight ? LAMPLIGHT_PALETTE.ink : "#1B1408",
          "--ink-secondary": isLamplight ? "#C9B893" : "#4A3B2A",
          "--border": isLamplight ? LAMPLIGHT_PALETTE.border : "rgba(0,0,0,0.1)",
          "--gold": isLamplight ? LAMPLIGHT_PALETTE.gold : "#A98235",
          "--cta-bg": isLamplight ? LAMPLIGHT_PALETTE.gold : "#1B1408",
          "--cta-text": isLamplight ? LAMPLIGHT_PALETTE.bg : "#F4E9D6",
          "--row-bg": isLamplight ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
          "--row-bg-hover": isLamplight ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,1)",
        } as CSSProperties
      }
    >
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
              categoryStyles={effectiveCategoryStyles}
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
        <div
          key="list"
          className="animate-page-turn-in-list absolute inset-0 z-10 overflow-y-auto bg-[var(--seasonal-card)] pt-16 transition-colors duration-[600ms]"
        >
          <div className="flex flex-col gap-3 border-b border-black/5 p-3">
            <SearchBar value={filters.query} onChange={filters.setQuery} />
            <Legend
              categoryStyles={effectiveCategoryStyles}
              selectedCategories={filters.selectedCategories}
              selectsOnly={filters.selectsOnly}
              filteredCount={filters.filtered.length}
              totalCount={recommendations.filter((r) => r.published).length}
              onToggleCategory={filters.toggleCategory}
              onToggleSelects={filters.toggleSelectsOnly}
              onShowAll={filters.showAll}
            />
          </div>
          <ListView recommendations={filters.filtered} categoryStyles={effectiveCategoryStyles} onSelect={selectRecommendation} />
        </div>
      ) : (
        <div key="map" className="animate-page-turn-in-map absolute inset-0">
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
          onLoad={onMapLoad}
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
                color={effectiveCategoryStyles[recommendation.category].color}
                isSelected={selectedEntity?.type === "recommendation" && selectedEntity.data.id === recommendation.id}
                onClick={() => selectRecommendation(recommendation)}
              />
            );
          })}

          {selectFiltered.map((r) => (
            <StarMarker
              key={r.id}
              recommendation={r}
              color={effectiveCategoryStyles[r.category].color}
              isSelected={selectedEntity?.type === "recommendation" && selectedEntity.data.id === r.id}
              onClick={() => selectRecommendation(r)}
            />
          ))}

          <TreadwellMarker isSelected={selectedEntity?.type === "treadwell"} onClick={selectTreadwell} />
        </MapLibreMap>
        {loaderPhase !== "done" && <CompassLoader phase={loaderPhase === "idle" ? "idle" : "settling"} />}
        </div>
      )}

      {view === "map" && (
        <>
          {/* Edge-only vignette -- like foxing/wear on old paper. Transparent
              through the whole central viewing area, only darkens the outer
              margin, so it never meaningfully dulls markers or controls. */}
          <div
            className="pointer-events-none absolute inset-0 z-[3]"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 60%, rgba(58,46,32,0.16) 100%)",
            }}
          />
          <div className="pointer-events-none absolute bottom-3 left-3 z-[3] opacity-70">
            <CompassRose size={76} />
          </div>
        </>
      )}

      {selectedEntity && (
        <DetailPanel
          entity={selectedEntity}
          categoryStyles={effectiveCategoryStyles}
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

      {screensaver.active && <Screensaver onDismiss={screensaver.dismiss} />}
    </div>
  );
}
