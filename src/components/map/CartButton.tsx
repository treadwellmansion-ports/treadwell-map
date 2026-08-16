"use client";

export function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `Your list, ${count} saved` : "Your list"}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/10 hover:bg-white"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B1408" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 6h15l-1.5 9h-12z" />
        <path d="M6 6 5 3H2" />
        <circle cx="9" cy="20" r="1.4" fill="#1B1408" stroke="none" />
        <circle cx="18" cy="20" r="1.4" fill="#1B1408" stroke="none" />
      </svg>
      {count > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold text-white"
          style={{ backgroundColor: "#A98235" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
