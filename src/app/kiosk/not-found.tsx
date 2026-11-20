"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Segment-scoped by file placement (src/app/kiosk/not-found.tsx) -- this has
// no effect on the site's default 404 anywhere outside /kiosk. Nothing in
// the guest-facing map ever produces a URL-based navigation (the Map/List
// toggle and every selection are local component state, not routes), so the
// only realistic way to land here is a malformed URL Launcher configuration
// on the physical device -- unattended hardware with no one to tap a link,
// so this recovers on its own rather than waiting for a guest.
export default function KioskNotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/kiosk"), 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1B1408] p-6 text-center">
      <div>
        <p className="text-lg font-semibold text-[#F4E9D6]">The Treadwell Mansion</p>
        <p className="mt-2 text-sm text-[#C9B893]">Returning to the map...</p>
      </div>
    </div>
  );
}
