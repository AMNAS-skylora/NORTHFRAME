"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });
}

export default function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    let refreshFrame = 0;
    let visualFrame = 0;
    let settleFrame = 0;
    let orientationTimer = 0;
    let delayedRefreshTimer = 0;
    let lateRefreshTimer = 0;
    let mutationRefreshTimer = 0;
    let mutationStopTimer = 0;
    let active = true;
    let lastWidth = window.innerWidth;

    // Only the service artwork follows browser chrome. Its sticky layout and
    // ScrollTrigger distance remain measured against the stable viewport.
    const syncVisualViewport = () => {
      const root = document.documentElement;
      if (window.innerWidth >= 1024) {
        root.style.removeProperty("--nf-visual-vh");
        return;
      }
      const height = `${Math.round(window.visualViewport?.height || window.innerHeight)}px`;
      if (root.style.getPropertyValue("--nf-visual-vh") !== height) {
        root.style.setProperty("--nf-visual-vh", height);
      }
    };
    const queueVisualViewport = () => {
      cancelAnimationFrame(visualFrame);
      visualFrame = requestAnimationFrame(syncVisualViewport);
    };

    const syncStableViewport = () => {
      const root = document.documentElement;
      if (window.innerWidth >= 1024) {
        root.style.removeProperty("--nf-mobile-vh");
        return;
      }

      // Match the CSS breakpoint, including tablets with a mouse. Keep this
      // value stable during toolbar-only resizes, but remeasure on rotation
      // and width changes before refreshing any sticky story's distance.
      const height = window.visualViewport?.height || window.innerHeight;
      root.style.setProperty("--nf-mobile-vh", `${Math.round(height)}px`);
    };

    syncVisualViewport();
    syncStableViewport();

    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (!active) return;
        ScrollTrigger.refresh();
        ScrollTrigger.update();
      });
    };

    const refreshAfterPaint = () => {
      cancelAnimationFrame(settleFrame);
      settleFrame = requestAnimationFrame(() => {
        settleFrame = requestAnimationFrame(refresh);
      });
    };

    const handleOrientationChange = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        lastWidth = window.innerWidth;
        syncStableViewport();
        refreshAfterPaint();
      }, 320);
    };

    const handleViewportResize = () => {
      queueVisualViewport();
      const nextWidth = window.innerWidth;
      if (nextWidth === lastWidth) return;
      lastWidth = nextWidth;
      syncStableViewport();
      refreshAfterPaint();
    };

    const handlePageShow = () => {
      refreshAfterPaint();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAfterPaint();
      }
    };

    // Components with late media use fixed aspect-ratio containers, so media
    // decode does not change document geometry. Avoid globally refreshing every
    // time an image/video loads; that was expensive on mobile Safari/Chrome.

    const handleMotionRefresh = () => {
      refreshAfterPaint();
    };

    const foreground = document.querySelector(".foreground");
    const mutationObserver =
      foreground && "MutationObserver" in window
        ? new MutationObserver((mutations) => {
            const addedLayoutContent = mutations.some((mutation) =>
              Array.from(mutation.addedNodes).some(
                (node) => node.nodeType === Node.ELEMENT_NODE
              )
            );

            if (!addedLayoutContent) return;

            window.clearTimeout(mutationRefreshTimer);
            mutationRefreshTimer = window.setTimeout(refreshAfterPaint, 120);
          })
        : null;

    mutationObserver?.observe(foreground as Node, {
      childList: true,
      subtree: true,
    });

    // Dynamic homepage chunks settle during the initial load window. Stop
    // observing after that so normal interactions never pay observer overhead.
    mutationStopTimer = window.setTimeout(() => {
      mutationObserver?.disconnect();
    }, 8000);

    window.addEventListener("northframe:motion-refresh", handleMotionRefresh);

    window.addEventListener("load", refreshAfterPaint, { once: true });
    window.addEventListener("resize", handleViewportResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.visualViewport?.addEventListener("resize", handleViewportResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) refreshAfterPaint();
      });
    }

    refreshAfterPaint();

    // Mobile Safari/Chrome and in-app browsers can change the visual viewport
    // again after their top/bottom browser chrome settles. One delayed refresh
    // keeps all ScrollTrigger start/end measurements aligned without reacting
    // continuously to toolbar height changes.
    const mobileLike = window.matchMedia(
      "(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)"
    ).matches;

    if (mobileLike) {
      // One settle pass is enough on touch browsers. BrandIntro performs the
      // final refresh again when its overlay hands control to the page.
      lateRefreshTimer = window.setTimeout(refreshAfterPaint, 720);
    } else {
      delayedRefreshTimer = window.setTimeout(refreshAfterPaint, 420);
      lateRefreshTimer = window.setTimeout(refreshAfterPaint, 900);
    }

    return () => {
      active = false;
      cancelAnimationFrame(refreshFrame);
      cancelAnimationFrame(visualFrame);
      cancelAnimationFrame(settleFrame);
      window.clearTimeout(orientationTimer);
      window.clearTimeout(delayedRefreshTimer);
      window.clearTimeout(lateRefreshTimer);
      window.clearTimeout(mutationRefreshTimer);
      window.clearTimeout(mutationStopTimer);
      mutationObserver?.disconnect();
      window.removeEventListener("northframe:motion-refresh", handleMotionRefresh);
      window.removeEventListener("load", refreshAfterPaint);
      window.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
    };
  }, [pathname]);

  return null;
}
