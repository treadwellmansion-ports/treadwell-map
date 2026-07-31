// Purely decorative -- the map itself is always north-up (no rotation), so
// this doesn't do any wayfinding work. It's here because real antique harbor
// charts almost always carry one, and it reinforces the "old scroll" feel
// without touching legibility of the basemap or markers.
export function CompassRose({ size = 92 }: { size?: number }) {
  const dark = "#4A3B2A";
  const light = "#D8C9A3";
  const mid = "#9C8763";
  const line = "#3A2E20";

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="94" fill="none" stroke={line} strokeWidth="1" opacity="0.55" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={line} strokeWidth="0.75" opacity="0.4" />

      {/* intercardinal points (NE, SE, SW, NW) */}
      <g fill={mid} opacity="0.85">
        <path d="M100.00,100.00 L138.89,61.11 L108.62,88.97 Z" />
        <path d="M100.00,100.00 L138.89,61.11 L111.03,91.38 Z" />
        <path d="M100.00,100.00 L138.89,138.89 L111.03,108.62 Z" />
        <path d="M100.00,100.00 L138.89,138.89 L108.62,111.03 Z" />
        <path d="M100.00,100.00 L61.11,138.89 L91.38,111.03 Z" />
        <path d="M100.00,100.00 L61.11,138.89 L88.97,108.62 Z" />
        <path d="M100.00,100.00 L61.11,61.11 L88.97,91.38 Z" />
        <path d="M100.00,100.00 L61.11,61.11 L91.38,88.97 Z" />
      </g>

      {/* cardinal points (N, E, S, W) -- split light/dark for the classic star look */}
      <g stroke={line} strokeWidth="0.75" strokeLinejoin="round">
        <path d="M100.00,100.00 L100.00,8.00 L97.81,82.13 Z" fill={dark} />
        <path d="M100.00,100.00 L100.00,8.00 L102.19,82.13 Z" fill={light} />
        <path d="M100.00,100.00 L192.00,100.00 L117.87,97.81 Z" fill={dark} />
        <path d="M100.00,100.00 L192.00,100.00 L117.87,102.19 Z" fill={light} />
        <path d="M100.00,100.00 L100.00,192.00 L102.19,117.87 Z" fill={dark} />
        <path d="M100.00,100.00 L100.00,192.00 L97.81,117.87 Z" fill={light} />
        <path d="M100.00,100.00 L8.00,100.00 L82.13,102.19 Z" fill={dark} />
        <path d="M100.00,100.00 L8.00,100.00 L82.13,97.81 Z" fill={light} />
      </g>

      <circle cx="100" cy="100" r="5" fill="none" stroke={line} strokeWidth="1.25" opacity="0.8" />

      <text
        x="100"
        y="26"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="20"
        fill={dark}
      >
        N
      </text>
    </svg>
  );
}
