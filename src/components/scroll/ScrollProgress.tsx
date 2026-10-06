"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    if (!desktopQuery.matches) return;

    const updateProgress = () => {
      if (barRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        barRef.current.style.transform = `scaleY(${Math.min(1, Math.max(0, progress))})`;
      }
      rafIdRef.current = null;
    };

    const handleScroll = () => {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="hidden md:flex fixed top-0 right-0 h-full w-[3px] z-50 pointer-events-none flex-col justify-start overflow-hidden"
    >
      {/* Background Subtle Track */}
      <div className="absolute inset-0 bg-blue-950/20" />

      {/* Active Scroll Progress Indicator */}
      <div
        ref={barRef}
        className="w-full bg-[#1677FF]"
        style={{
          height: "100%",
          transform: "scaleY(0)",
          transformOrigin: "top center",
          willChange: "transform",
          backgroundImage: "linear-gradient(to bottom, #1677FF 65%, transparent 35%)",
          backgroundSize: "100% 5px",
        }}
      />
    </div>
  );
}

