import { redirect } from "next/navigation";

// Catches every path under /kiosk/* that isn't the exact /kiosk route itself.
// A segment-scoped not-found.tsx alone does NOT cover this case -- Next only
// invokes a segment's not-found boundary when something inside an already-
// matched route calls notFound(); a URL that never matches any route pattern
// under /kiosk falls straight through to the app's root 404 instead (tested
// and confirmed during this hardening pass). This catch-all guarantees any
// /kiosk/... URL -- however it got typed into the device's URL Launcher --
// lands back on the live map instead of a dead end, with no guest
// interaction required. Scoped entirely to /kiosk; no effect on /map,
// /embed, or the rest of the site's own (default) 404 behavior.
export default async function KioskCatchAll() {
  redirect("/kiosk");
}
