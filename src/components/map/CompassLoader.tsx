// Reuses the compass-rose motif for the map's loading state instead of a
// generic spinner: the needle wobbles as if searching while tiles load,
// then settles to true north once the style has finished loading.
export function CompassLoader({ phase }: { phase: "idle" | "settling" }) {
  const dark = "#4A3B2A";
  const gold = "#A98235";
  const line = "#3A2E20";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#F0E2C7]"
      aria-hidden="true"
    >
      <svg width="72" height="72" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke={line} strokeWidth="1" opacity="0.4" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={line} strokeWidth="0.6" opacity="0.3" />
        <text x="50" y="22" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="12" fill={gold}>
          N
        </text>
        <g
          style={{
            transformOrigin: "50px 50px",
            animation:
              phase === "idle"
                ? "compass-idle-wobble 0.9s ease-in-out infinite"
                : "compass-settle 1.4s cubic-bezier(.2,.6,.2,1) both",
          }}
        >
          <path d="M50,50 L50,12 L44,50 Z" fill={dark} />
          <path d="M50,50 L50,88 L56,50 Z" fill={dark} opacity="0.5" />
          <circle cx="50" cy="50" r="4" fill="none" stroke={line} strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
