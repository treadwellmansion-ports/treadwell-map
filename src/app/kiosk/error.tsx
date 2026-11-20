"use client";

import { useEffect } from "react";

// Segment-scoped by file placement (src/app/kiosk/error.tsx) -- Next's error
// boundary convention is per-route-segment, so this never touches /map,
// /embed, or /admin. Unattended hardware means a guest will never be there
// to tap a "try again" button, so this retries on its own instead of
// waiting for one.
export default function KioskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[kiosk] runtime error, will retry:", error);
    const timer = setTimeout(() => reset(), 8000);
    return () => clearTimeout(timer);
  }, [error, reset]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1B1408] p-6 text-center">
      <div>
        <p className="text-lg font-semibold text-[#F4E9D6]">Connection temporarily unavailable</p>
        <p className="mt-2 text-sm text-[#C9B893]">Please try again in a moment.</p>
      </div>
    </div>
  );
}
