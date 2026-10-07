"use client";

import { useRef } from "react";
import { revealOnce } from "@/components/motion/revealOnce";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OurVision() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const label = labelRef.current;
      const copy = copyRef.current;
      if (!containerRef.current || !label || !copy) return;

      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        gsap.set(label, {
          scaleX: 0,
          transformOrigin: "left center",
        });

        gsap.set(copy, {
          y: mobile ? 22 : 38,
          clipPath: "inset(0% 0% 100% 0%)",
          force3D: true,
        });

        const timeline = gsap.timeline({
          paused: mobile,
          ...(mobile
            ? {}
            : {
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 84%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }),
        });

        timeline
          .to(label, {
            scaleX: 1,
            duration: mobile ? 0.36 : 0.52,
            ease: "power4.out",
          })
          .to(
            copy,
            {
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: mobile ? 0.62 : 0.86,
              ease: "expo.out",
              force3D: true,
            },
            mobile ? 0.08 : 0.12
          );

        if (!mobile) {
          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        }

        const stopReveal = revealOnce(containerRef.current!, () => timeline.play(0), 0.94);

        return () => {
          stopReveal();
          timeline.kill();
        };
      };

      mm.add("(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)", () => buildReveal(true));
      mm.add("(min-width: 1024px), (min-width: 769px) and (hover: hover) and (pointer: fine)", () => buildReveal(false));

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div className="relative z-30 w-full overflow-visible">
      <section
        id="our-vision"
        ref={containerRef}
        className="relative z-10 w-full overflow-hidden bg-[#000000] px-6 pb-20 pt-[calc(28svh+3.5rem)] text-white pointer-events-auto m-0 select-none sm:px-10 md:px-16 md:pb-28 md:pt-[calc(30dvh+4rem)] lg:px-20 lg:py-36"
      >
        <div className="relative w-full max-w-[1300px] mx-auto flex flex-col items-start text-left">
        {/* SMALL EDITORIAL LABEL IN UPPER-LEFT: WHITE BG, BLACK TEXT */}
        <div ref={labelRef} className="flex items-center mb-8 md:mb-12">
          <span className="font-mono inline-block bg-[#FFFFFF] text-[#000000] px-2 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider leading-none">
            OUR VISION
          </span>
        </div>

        {/* MAIN EDITORIAL PARAGRAPH */}
        <div
          ref={copyRef}
          className="w-full max-w-[1100px] text-left"
        >
          <p className="font-sans font-normal text-[#FFFFFF] text-[clamp(24px,2.5vw,40px)] leading-[1.08] tracking-tight m-0">
            Meeting expectations is easy. Surpassing them is the real craft.
            At NORTHFRAME, our vision is to move beyond the ordinary and create
            work that sets a higher standard. Anyone can create a brand, build
            a website, or run a campaign. We aim to go further, think bigger,
            and deliver work that truly stands apart.
          </p>
        </div>
        </div>
      </section>
    </div>
  );
}
