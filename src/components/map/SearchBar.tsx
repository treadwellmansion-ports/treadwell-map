"use client";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="pointer-events-auto w-full max-w-xs">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search recommendations..."
        className="w-full rounded-full bg-white/95 px-4 py-2.5 text-sm shadow-lg ring-1 ring-black/10 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#A98235]"
      />
    </div>
  );
}
