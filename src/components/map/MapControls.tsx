"use client";

export function MapControls({
  onReturnDowntown,
  onReturnTreadwell,
}: {
  onReturnDowntown: () => void;
  onReturnTreadwell: () => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      <button
        type="button"
        onClick={onReturnDowntown}
        className="rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-neutral-800 shadow-md ring-1 ring-black/10 hover:bg-white"
      >
        Return to Downtown
      </button>
      <button
        type="button"
        onClick={onReturnTreadwell}
        className="rounded-full bg-[#1B1408] px-4 py-2 text-sm font-medium text-[#F4E9D6] shadow-md ring-1 ring-black/10 hover:bg-[#2a2012]"
      >
        Return to The Treadwell
      </button>
    </div>
  );
}
