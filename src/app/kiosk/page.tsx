import type { Viewport } from "next";
import { GuestMap } from "@/components/map/GuestMap";

// Unattended lobby hardware: never serve a prerendered/edge-cached shell that
// could reference an old JS bundle after a deploy -- every load must hit the
// server fresh (kiosk-only; /map and /embed keep Next's default caching).
export const dynamic = "force-dynamic";

// Locks out browser-level pinch-zoom and double-tap-zoom of the page itself.
// This does NOT affect MapLibre's own pinch/double-tap zoom-the-map gestures
// (those are handled by the map canvas's own touch listeners, independent of
// viewport scale) -- only the outer page's ability to zoom, which would
// otherwise let a guest zoom out past the fullscreen layout.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Printed to the server-side function log on every load (guaranteed thanks
// to force-dynamic above) so an operator can confirm a deploy actually
// reached the kiosk via `vercel logs` / the dashboard, without a lobby visit
// or any guest-visible on-screen element.
console.info(
  `[kiosk] serving build ${process.env.VERCEL_GIT_COMMIT_SHA ?? "local"} at ${new Date().toISOString()}`
);

export default function KioskPage() {
  return (
    <div className="fixed inset-0" style={{ touchAction: "manipulation" }}>
      <GuestMap variant="kiosk" />
    </div>
  );
}
