import type { WeatherReport } from "@/lib/weather";
import { WeatherIcon } from "./WeatherIcon";

// Small companion pill to the "Treadwell Mansion" title badge -- fixed
// colors (not the seasonal/lamplight CSS vars) to match that pill's own
// always-white-chip treatment, since both sit directly on the map canvas
// rather than inside a themed panel.
export function WeatherBadge({ weather }: { weather: WeatherReport | null }) {
  if (!weather) return null;
  return (
    <div className="pointer-events-auto flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#4A3B2A] shadow-md">
      <WeatherIcon condition={weather.condition} size={15} strokeColor="#8C6A3A" />
      <span className="font-semibold text-[#1B1408]">{weather.temperatureF}°F</span>
      <span className="opacity-70">{weather.label}</span>
    </div>
  );
}
