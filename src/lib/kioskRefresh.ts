// Decision logic for the lobby kiosk's self-refresh, kept free of React and the
// browser so it can be tested directly. GuestMap (kiosk only) calls this on a
// timer; the page reloads itself when this says so.
//
// Two reasons to reload, both only when nobody has touched the screen lately:
//   1. A newer version of the site has been published, so the kiosk picks up
//      the update on its own instead of someone refreshing the monitor.
//   2. A nightly refresh (between 3 and 5 AM, if the page has been open for a
//      long time) to clear anything that built up over days of running.

// Checked every 5 minutes. The NEXT_PUBLIC overrides exist only so these timings
// can be shortened for testing; they are unset in production.
export const CHECK_EVERY_MS = Number(process.env.NEXT_PUBLIC_KIOSK_CHECK_MS) || 5 * 60 * 1000;
// Never reload while a guest might be using the screen.
export const IDLE_BEFORE_RELOAD_MS = Number(process.env.NEXT_PUBLIC_KIOSK_IDLE_MS) || 60 * 1000;
// Safety net against a reload loop if anything ever misreports the version.
export const MIN_GAP_BETWEEN_RELOADS_MS = Number(process.env.NEXT_PUBLIC_KIOSK_GAP_MS) || 30 * 60 * 1000;
export const RELOAD_STAMP_KEY = "kioskLastAutoReload";

const NIGHTLY_MIN_PAGE_AGE_MS = 18 * 60 * 60 * 1000;
const NIGHTLY_HOURS = [3, 4];

export interface ReloadInput {
  /** Version baked into the page that is currently running. */
  loadedBuild?: string | null;
  /** Version the server reports right now (null if unknown or unreachable). */
  remoteBuild?: string | null;
  loadedAt: number;
  now: number;
  /** Local hour, 0-23. */
  hour: number;
  /** Milliseconds since anyone last touched the screen. */
  idleMs: number;
  lastReloadAt: number;
}

export function decideReload(input: ReloadInput): { reload: boolean; reason?: "new-version" | "nightly" } {
  if (input.idleMs < IDLE_BEFORE_RELOAD_MS) return { reload: false };
  if (input.now - input.lastReloadAt < MIN_GAP_BETWEEN_RELOADS_MS) return { reload: false };

  if (input.loadedBuild && input.remoteBuild && input.loadedBuild !== input.remoteBuild) {
    return { reload: true, reason: "new-version" };
  }
  if (NIGHTLY_HOURS.includes(input.hour) && input.now - input.loadedAt >= NIGHTLY_MIN_PAGE_AGE_MS) {
    return { reload: true, reason: "nightly" };
  }
  return { reload: false };
}
