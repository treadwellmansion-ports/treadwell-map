import type { WeatherCondition } from "@/lib/weather";

// Same single-weight engraving-line style as CategoryIcon.tsx, sized for a
// small inline badge rather than a map pin.
const CONDITION_PATHS: Record<WeatherCondition, string[]> = {
  clear: [
    "M20,20 a7,7 0 1,0 0.1,0",
    "M20,4 V9 M20,31 V36 M4,20 H9 M31,20 H36",
    "M9,9 L12.5,12.5 M27.5,27.5 L31,31 M31,9 L27.5,12.5 M12.5,27.5 L9,31",
  ],
  cloudy: [
    "M10,26 Q5,26 5,21 Q5,16.5 9.5,16 Q10.5,10 17,10 Q23,10 24.5,15.5 Q30,15.5 30,21 Q30,26 25,26 Z",
  ],
  fog: [
    "M11,20 Q7,20 7,16 Q7,11.5 12,11 Q13,6 19,6 Q24,6 25.5,10.5 Q30,10.5 30,15 Q30,19 26,19 Z",
    "M6,26 H34",
    "M9,32 H31",
  ],
  rain: [
    "M10,20 Q5,20 5,15 Q5,10.5 9.5,10 Q10.5,4 17,4 Q23,4 24.5,9.5 Q30,9.5 30,15 Q30,20 25,20 Z",
    "M12,25 L9,32",
    "M20,25 L17,32",
    "M28,25 L25,32",
  ],
  snow: [
    "M10,18 Q5,18 5,13 Q5,8.5 9.5,8 Q10.5,2 17,2 Q23,2 24.5,7.5 Q30,7.5 30,13 Q30,18 25,18 Z",
    "M12,26 V34 M9,28 L15,32 M15,28 L9,32",
    "M27,26 V34 M24,28 L30,32 M30,28 L24,32",
  ],
  storm: [
    "M10,18 Q5,18 5,13 Q5,8.5 9.5,8 Q10.5,2 17,2 Q23,2 24.5,7.5 Q30,7.5 30,13 Q30,18 25,18 Z",
    "M20,20 L14,29 H19 L15,37 L26,25 H20 Z",
  ],
};

export function WeatherIcon({
  condition,
  size = 16,
  strokeColor = "currentColor",
}: {
  condition: WeatherCondition;
  size?: number;
  strokeColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke={strokeColor}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {CONDITION_PATHS[condition].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
