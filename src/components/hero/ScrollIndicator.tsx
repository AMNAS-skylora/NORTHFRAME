"use client";

import React from "react";

interface ScrollIndicatorProps {
  labelRef?: React.RefObject<HTMLDivElement | null>;
  lineRef?: React.RefObject<HTMLSpanElement | null>;
}

export default function ScrollIndicator({
  labelRef,
  lineRef,
}: ScrollIndicatorProps) {
  return (
    <div
      ref={labelRef}
      aria-hidden="true"
      className="scroll-indicator-wrapper absolute top-[29%] sm:top-[37%] left-[max(16px,env(safe-area-inset-left))] sm:left-[max(28px,env(safe-area-inset-left))] lg:left-[max(40px,env(safe-area-inset-left))] z-[4] flex items-center gap-[6px] select-none pointer-events-none opacity-0"
    >
      <span
        ref={lineRef}
        className="scroll-indicator-line block bg-[#1677FF] w-[2px] h-[13px] origin-bottom scale-y-0 will-change-transform"
      />
      <span className="scroll-indicator text-white/90 text-[9px] sm:text-[10px] font-medium tracking-[0.16em] uppercase leading-none font-sans">
        SCROLL TO EXPLORE
      </span>
    </div>
  );
}
