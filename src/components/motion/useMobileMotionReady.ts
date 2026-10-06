"use client";

import { useEffect, useState } from "react";

const MOBILE_TOUCH_QUERY =
  "(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)";

function isMobileLike() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_TOUCH_QUERY).matches;
}

export function useMobileMotionReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mobile = isMobileLike();

    if (!mobile) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setReady(true);
      });
      return () => { cancelled = true; };
    }

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    // Initialize mobile GSAP at the same lifecycle point as desktop instead of
    // waiting for window.load/fonts. MotionRuntime performs safe refresh passes
    // again as fonts/assets settle.
    // MotionRuntime owns the shared viewport height. Components only wait for
    // its initial measurement, so mounting several stories cannot overwrite it.

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (cancelled) return;
        setReady(true);
        window.dispatchEvent(new Event("northframe:motion-refresh"));
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);

  return ready;
}
