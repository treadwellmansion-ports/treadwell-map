"use client";

import { useEffect, useRef, useState } from "react";

const ACTIVITY_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"] as const;

// Separate from useIdleReset's 3-minute walk-away reset -- this is a second,
// longer timer for the full-screen attract screen. Both watch the same
// activity events independently, so any touch clears this timer too.
export function useScreensaver(enabled: boolean, timeoutMs: number) {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!enabled) return;

    const arm = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setActive(true), timeoutMs);
    };
    armRef.current = arm;

    const wake = () => {
      setActive(false);
      arm();
    };

    arm();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, wake, { passive: true }));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, wake));
    };
  }, [enabled, timeoutMs]);

  const dismiss = () => {
    setActive(false);
    armRef.current();
  };

  return { active: enabled && active, dismiss };
}
