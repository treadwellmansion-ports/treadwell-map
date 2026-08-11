import type { Category } from "@/lib/types";

// Single-weight engraving-line icons (2.5px stroke, round caps/joins) meant
// to sit on a solid category-color circle -- the parchment stroke color
// works over any background, so the mark never needs to change with its
// context (map pin, legend swatch, list row, detail badge). Shape carries
// the category; color is reinforcement only (see the CVD audit note next to
// DEFAULT_CATEGORY_STYLES) since no 8-hue palette is fully separable under
// every form of colorblindness.
const CATEGORY_PATHS: Record<Category, string[]> = {
  restaurant: [
    "M12,6 V14 M15,6 V14 M18,6 V14 M12,14 Q12,17 15,17 Q18,17 18,14",
    "M15,17 V34",
    "M25,6 Q30,6 30,12 L30,17 Q30,19 27,19",
    "M27,19 V34",
  ],
  cafe: [
    "M10,14 H26 V23 Q26,30 18,30 Q10,30 10,23 Z",
    "M26,17 Q33,17 33,21 Q33,25 26,25",
    "M14,6 Q16,9 14,11",
    "M18,4 Q20,7 18,10",
    "M22,6 Q24,9 22,11",
  ],
  entertainment: [
    "M8,15 Q8,8 15,8 Q22,8 22,15 Q22,23 15,25 Q8,23 8,15 Z",
    "M11.5,14 a1.3,1.3 0 1,0 0.1,0",
    "M17,14 a1.3,1.3 0 1,0 0.1,0",
    "M11,19 Q15,16 19,19",
    "M18,17 Q18,10 25,10 Q32,10 32,17 Q32,25 25,27 Q18,25 18,17 Z",
    "M22,16 a1.3,1.3 0 1,0 0.1,0",
    "M28,16 a1.3,1.3 0 1,0 0.1,0",
    "M21,21 Q25,24.5 29,21",
  ],
  historical: [
    "M5,15 L20,6 L35,15",
    "M5,15 H35",
    "M9,15 V29",
    "M16,15 V29",
    "M24,15 V29",
    "M31,15 V29",
    "M4,29 H36",
    "M4,33 H36",
  ],
  shop: [
    "M9,14 H31 L29,33 H11 Z",
    "M14,14 V10 Q14,5 20,5 Q26,5 26,10 V14",
  ],
  art: [
    "M8,20 Q8,7 20,7 Q33,7 33,18 Q33,25 26,25 Q23,25 23,22 Q23,20 25.5,20 Q28,20 28,17.5 Q28,11 20,11 Q12,11 12,20 Q12,29 20,31 Q23,31.5 23,33.5 Q23,35 20,35 Q8,35 8,20 Z",
    "M15,17 a1.6,1.6 0 1,0 0.1,0",
    "M20.5,13 a1.6,1.6 0 1,0 0.1,0",
    "M26,16.5 a1.6,1.6 0 1,0 0.1,0",
    "M29,9 L35,3",
  ],
  outdoor: [
    "M5,16 Q9,11 13,16 Q17,21 21,16 Q25,11 29,16 Q33,21 35,17",
    "M5,25 Q9,20 13,25 Q17,30 21,25 Q25,20 29,25 Q33,30 35,26",
  ],
  nightlife: [
    "M7,8 H33 L20,23 V32",
    "M14,32 H26",
    "M24.5,9.5 a1.3,1.3 0 1,0 0.1,0",
    "M22.5,8 L24.5,9.5 L27,6.5",
  ],
};

export function CategoryIcon({
  category,
  size = 22,
  strokeColor = "#F0E2C7",
}: {
  category: Category;
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
      {CATEGORY_PATHS[category].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
