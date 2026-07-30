"use client";

import { useEffect, useRef } from "react";

const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"] as const;

// Resets the kiosk to its default state after a period of no guest
// interaction, so the next guest doesn't inherit a stranger's search/filters
// (see the "walk away" reset item from the long-term suggestions list).
export function useIdleReset(onIdle: () => void, enabled: boolean) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  });

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onIdleRef.current(), IDLE_TIMEOUT_MS);
    };

    reset();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, reset, { passive: true }));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [enabled]);
}
