"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BrandIntroProps {
  onComplete?: () => void;
}

interface SavedScrollStyles {
  bodyOverflow: string;
  bodyTouchAction: string;
  bodyOverscrollBehavior: string;
  rootOverflow: string;
  rootTouchAction: string;
  rootOverscrollBehavior: string;
}


export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const finishedRef = useRef(false);
  const savedScrollStylesRef = useRef<SavedScrollStyles | null>(null);

  const restoreScroll = useCallback(() => {
    const saved = savedScrollStylesRef.current;
    if (!saved) return;

    document.body.style.overflow = saved.bodyOverflow;
    document.body.style.touchAction = saved.bodyTouchAction;
    document.body.style.overscrollBehavior = saved.bodyOverscrollBehavior;

    document.documentElement.style.overflow = saved.rootOverflow;
    document.documentElement.style.touchAction = saved.rootTouchAction;
    document.documentElement.style.overscrollBehavior =
      saved.rootOverscrollBehavior;

    savedScrollStylesRef.current = null;
  }, []);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    timelineRef.current?.kill();
    timelineRef.current = null;
    restoreScroll();
    setIsVisible(false);
    onComplete?.();
    window.dispatchEvent(new Event("northframe:motion-refresh"));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [onComplete, restoreScroll]);

  useEffect(() => {
    if (!isVisible || finishedRef.current) return;
    const timeoutId = window.setTimeout(finishIntro, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [finishIntro, isVisible]);

  useLayoutEffect(() => {
    if (!isVisible) return;

    savedScrollStylesRef.current = {
      bodyOverflow: document.body.style.overflow,
      bodyTouchAction: document.body.style.touchAction,
      bodyOverscrollBehavior: document.body.style.overscrollBehavior,
      rootOverflow: document.documentElement.style.overflow,
      rootTouchAction: document.documentElement.style.touchAction,
      rootOverscrollBehavior:
        document.documentElement.style.overscrollBehavior,
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";

    const container = containerRef.current;
    const mark = markRef.current;
    const cover = coverRef.current;
    if (!container || !mark || !cover) {
      finishIntro();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const markSize = mark.getBoundingClientRect().width || 92;
    const screenDiagonal = Math.hypot(viewportWidth, viewportHeight);
    const coverScale = Math.max(
      16,
      (screenDiagonal / markSize) * 2.5
    );

    gsap.set(container, { autoAlpha: 1 });
    gsap.set(mark, {
      autoAlpha: reducedMotion ? 1 : 0,
      scale: reducedMotion ? 1 : 0.74,
      transformOrigin: "50% 50%",
      force3D: true,
    });
    gsap.set(cover, { autoAlpha: 0 });

    let cancelled = false;
    let assetFallbackTimer = 0;
    let removeAssetListeners = () => {};

    const startTimeline = () => {
      if (cancelled || finishedRef.current || timelineRef.current) return;

      const timeline = gsap.timeline({
        onComplete: finishIntro,
        defaults: { overwrite: "auto" },
      });
      timelineRef.current = timeline;

      if (reducedMotion) {
        timeline.to({}, { duration: 0.22 });
      } else {
        timeline.to(mark, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
          force3D: true,
        });
        timeline.to({}, { duration: 0.3 });
        timeline.to(mark, {
          scale: coverScale,
          duration: 0.68,
          ease: "power3.in",
          force3D: true,
        });
        timeline.to(
          cover,
          {
            autoAlpha: 1,
            duration: 0.12,
            ease: "none",
          },
          "-=0.17"
        );
      }

      timeline.to(container, {
        autoAlpha: 0,
        duration: reducedMotion ? 0.12 : 0.3,
        ease: "power2.out",
      });
    };

    const image = imageRef.current;

    if (reducedMotion || !image) {
      startTimeline();
    } else if (image.complete && image.naturalWidth > 0) {
      if (typeof image.decode === "function") {
        image.decode().catch(() => undefined).finally(startTimeline);
      } else {
        startTimeline();
      }
    } else {
      const handleReady = () => {
        removeAssetListeners();
        if (typeof image.decode === "function") {
          image.decode().catch(() => undefined).finally(startTimeline);
        } else {
          startTimeline();
        }
      };

      const handleError = () => {
        removeAssetListeners();
        startTimeline();
      };

      image.addEventListener("load", handleReady, { once: true });
      image.addEventListener("error", handleError, { once: true });

      removeAssetListeners = () => {
        image.removeEventListener("load", handleReady);
        image.removeEventListener("error", handleError);
      };

      // Never leave the screen blocked if an in-app browser delays image events.
      assetFallbackTimer = window.setTimeout(startTimeline, 1400);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(assetFallbackTimer);
      removeAssetListeners();
      timelineRef.current?.kill();
      timelineRef.current = null;
      restoreScroll();
    };
  }, [finishIntro, isVisible, restoreScroll]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="brand-intro-root fixed inset-0 z-[200] flex h-[100dvh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#070B14] select-none touch-none"
    >
      <div ref={markRef} className="brand-intro-mark relative z-10 h-[68px] w-[68px] opacity-0 will-change-transform sm:h-[92px] sm:w-[92px]">
        <img
          ref={imageRef}
          src="/images/brand/northframe-icon.webp"
          alt=""
          width="1254"
          height="1254"
          decoding="async"
          fetchPriority="high"
          className="block h-full w-full object-contain"
        />
      </div>
      <div ref={coverRef} aria-hidden="true" className="brand-intro-cover pointer-events-none absolute inset-0 z-20 bg-[#1677FF] opacity-0 will-change-[opacity]" />
    </div>
  );
}
