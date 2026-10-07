"use client";

import { getReducedMotionQuery } from "@/components/motion/motionPreference";

import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface PageTransitionContextType {
  triggerTransition: (href: string) => void;
  scrollToSection: (targetHash: string) => boolean;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  triggerTransition: () => {},
  scrollToSection: () => false,
  isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, children, onClick, ...props }, ref) {
    const pathname = usePathname();
    const { triggerTransition } = usePageTransition();
    const [targetPath, hash] = href.split("#");

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        props.target === "_blank" ||
        props.download
      ) return;

      // Link still prefetches visible routes; navigation begins on this click
      // rather than waiting for the old page's exit animation.
      event.preventDefault();
      triggerTransition(!targetPath && hash ? `${pathname}#${hash}` : href);
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        scroll={hash ? false : undefined}
        {...props}
      >
        {children}
      </Link>
    );
  }
);
TransitionLink.displayName = "TransitionLink";

export function SmoothSectionLink({
  target,
  children,
  ...props
}: Omit<TransitionLinkProps, "href"> & { target: string }) {
  return <TransitionLink href={target} {...props}>{children}</TransitionLink>;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pendingHashRef = useRef<string | null>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const wipeAnimationRef = useRef<Animation | null>(null);
  const routeLineRef = useRef<HTMLDivElement>(null);
  const routeLineAnimationRef = useRef<Animation | null>(null);

  const cancelWipe = useCallback(() => {
    wipeAnimationRef.current?.cancel();
    wipeAnimationRef.current = null;
    if (wipeRef.current) wipeRef.current.style.transform = "translateX(-100%)";
  }, []);

  const scrollToSection = useCallback((targetHash: string, animate = false) => {
    const id = decodeURIComponent(targetHash.replace(/^#/, ""));
    const target = document.getElementById(id);
    if (!target) return false;

    const moveToTarget = () => {
      const headerOffset = window.innerWidth <= 768 ? 56 : 70;
      window.scrollTo({
        top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset),
        behavior: "auto",
      });
    };

    cancelWipe();
    const wipe = wipeRef.current;
    if (
      !animate ||
      !wipe ||
      typeof wipe.animate !== "function" ||
      window.matchMedia(getReducedMotionQuery()).matches
    ) {
      moveToTarget();
      return true;
    }

    // A short, transform-only wipe masks a long jump across pinned sections
    // without making the browser animate every intervening scroll trigger.
    const enter = wipe.animate(
      [{ transform: "translateX(-100%)" }, { transform: "translateX(0)" }],
      { duration: 170, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
    );
    wipeAnimationRef.current = enter;
    enter.onfinish = () => {
      moveToTarget();
      const leave = wipe.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
        { duration: 210, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
      );
      enter.cancel();
      wipeAnimationRef.current = leave;
      leave.onfinish = cancelWipe;
    };
    return true;
  }, [cancelWipe]);

  // The destination can mount a frame after the layout. Wait for the anchor,
  // never for an animation before starting the route change.
  useEffect(() => {
    const hash = pendingHashRef.current ?? window.location.hash;
    if (!hash) return;

    let frame = 0;
    let attempts = 0;
    const settle = () => {
      if (scrollToSection(hash)) {
        pendingHashRef.current = null;
      } else if (attempts++ < 60) {
        frame = requestAnimationFrame(settle);
      }
    };
    frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [pathname, scrollToSection]);

  useEffect(() => {
    const restoreHash = () => {
      cancelWipe();
      if (window.location.hash) {
        requestAnimationFrame(() => scrollToSection(window.location.hash));
      }
    };
    window.addEventListener("popstate", restoreHash);
    window.addEventListener("hashchange", restoreHash);
    return () => {
      window.removeEventListener("popstate", restoreHash);
      window.removeEventListener("hashchange", restoreHash);
    };
  }, [cancelWipe, scrollToSection]);

  useEffect(() => cancelWipe, [cancelWipe]);
  useEffect(() => () => routeLineAnimationRef.current?.cancel(), []);

  const triggerTransition = useCallback((href: string) => {
    const [targetPath, hash] = href.split("#");
    if (!targetPath || targetPath === pathname) {
      window.history.pushState(window.history.state, "", href);
      if (hash) scrollToSection(hash, true);
      else {
        cancelWipe();
        window.scrollTo({ top: 0, behavior: "auto" });
      }
      return;
    }

    cancelWipe();
    routeLineAnimationRef.current?.cancel();
    const routeLine = routeLineRef.current;
    const wipe = wipeRef.current;
    if (wipe && !document.querySelector("[data-project-transition]")) {
      wipeAnimationRef.current = wipe.animate(
        [{ transform: "translateX(-100%)" }, { transform: "translateX(0)", offset: 0.45 }, { transform: "translateX(100%)" }],
        { duration: 600, easing: "cubic-bezier(0.65,0,0.35,1)" }
      );
      wipeAnimationRef.current.onfinish = cancelWipe;
    }
    if (
      routeLine &&
      typeof routeLine.animate === "function" &&
      !window.matchMedia(getReducedMotionQuery()).matches
    ) {
      routeLineAnimationRef.current = routeLine.animate(
        [
          { transform: "scaleX(0)", opacity: 1 },
          { transform: "scaleX(1)", opacity: 0 },
        ],
        { duration: 480, easing: "ease-out" }
      );
    }
    pendingHashRef.current = hash ? `#${hash}` : null;
    router.push(href, { scroll: !hash });
  }, [cancelWipe, pathname, router, scrollToSection]);

  return (
    <PageTransitionContext.Provider
      value={{ triggerTransition, scrollToSection, isTransitioning: false }}
    >
      {children}
      <div
        ref={wipeRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99999] bg-[#1677FF]"
        style={{ transform: "translateX(-100%)" }}
      />
      <div
        ref={routeLineRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100000] h-[3px] origin-left bg-[#1677FF] opacity-0"
      />
    </PageTransitionContext.Provider>
  );
}
