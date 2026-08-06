"use client";

const LOGO_ASPECT = 1023 / 1380;

export function Screensaver({ onDismiss }: { onDismiss: () => void }) {
  const logoHeight = 220;
  const logoWidth = Math.round(logoHeight * LOGO_ASPECT);

  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Tap anywhere to explore the map"
      className="absolute inset-0 z-[100] flex animate-[screensaver-fade-in_700ms_ease-out] flex-col items-center justify-center gap-8 bg-[#1B1408] text-center"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at center, #2a2012 0%, #1B1408 70%), url(/map-styles/paper-grain.png)",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/treadwell-logo.png"
        alt="The Treadwell Mansion"
        width={logoWidth}
        height={logoHeight}
        style={{ width: logoWidth, height: logoHeight }}
        className="animate-[screensaver-breathe_4s_ease-in-out_infinite] drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        draggable={false}
      />

      <div className="flex flex-col items-center gap-3 px-6">
        <p
          className="text-4xl font-semibold tracking-wide text-[#F4E9D6]"
          style={{ fontFamily: "'PT Serif', Georgia, 'Times New Roman', serif" }}
        >
          Portsmouth Is Waiting
        </p>
        <p className="animate-[screensaver-breathe_2.5s_ease-in-out_infinite] text-lg font-medium tracking-[0.2em] text-[#D8C9A3] uppercase">
          Tap Anywhere to Explore
        </p>
      </div>
    </button>
  );
}
