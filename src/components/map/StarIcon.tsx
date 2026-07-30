import { STAR_OUTLINE_COLOR } from "@/lib/constants";

// Single reusable 5-point star path, shared by the guest map, list view,
// legend, and admin live preview so every star in the app is pixel-identical.
export const STAR_PATH =
  "M12 2.5l2.98 6.44 7.02.66-5.36 4.75 1.6 6.98L12 17.77l-6.24 3.56 1.6-6.98L2 9.6l7.02-.66z";

export function StarIcon({
  color,
  size = 22,
  outlineWidth = 1.5,
}: {
  color: string;
  size?: number;
  outlineWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={STAR_PATH}
        fill={color}
        stroke={STAR_OUTLINE_COLOR}
        strokeWidth={outlineWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}
