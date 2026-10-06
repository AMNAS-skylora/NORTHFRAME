"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ScrollIndicator from "./ScrollIndicator";
import HeroContent from "./HeroContent";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HeroProps {
  introCompleted: boolean;
}

export default function Hero({ introCompleted }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const blueLineRef = useRef<HTMLSpanElement>(null);
  const servicesContainerRef = useRef<HTMLDivElement>(null);
  const serviceItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      const bgVisual = document.querySelector<HTMLElement>(".global-visual-background");
      const heroVisual = document.querySelector<HTMLElement>(".hero-a-stage");
      const headerBtn = document.querySelector<HTMLElement>(".header-menu-button");
      const serviceItems = serviceItemsRef.current.filter(
        (item): item is HTMLAnchorElement => Boolean(item)
      );
      const serviceTextItems = serviceItems
        .map((item) => item.querySelector<HTMLElement>(".service-item-text"))
        .filter((item): item is HTMLElement => Boolean(item));

      // Keep the hero in a clean pre-intro state so the loading animation never
      // fights with the hero entrance behind it.
      if (!introCompleted) {
        if (bgVisual) gsap.set(bgVisual, { opacity: 0 });
        if (heroVisual) gsap.set(heroVisual, { opacity: 0 });
        if (logoWrapperRef.current) {
          gsap.set(logoWrapperRef.current, { opacity: 0, y: 18 });
        }
        if (labelRef.current) {
          gsap.set(labelRef.current, { opacity: 0, y: 12 });
        }
        if (blueLineRef.current) {
          gsap.set(blueLineRef.current, {
            scaleY: 0,
            transformOrigin: "center bottom",
          });
        }
        if (serviceItems.length) {
          gsap.set(serviceItems, { opacity: 0, y: 8 });
        }
        if (serviceTextItems.length) {
          gsap.set(serviceTextItems, { yPercent: 110 });
        }
        if (headerBtn) {
          gsap.set(headerBtn, { opacity: 0, y: -10 });
        }
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          mobile: "(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)",
          desktop: "(min-width: 1024px), (min-width: 769px) and (hover: hover) and (pointer: fine)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile, reducedMotion } = context.conditions as {
            mobile: boolean;
            desktop: boolean;
            reducedMotion: boolean;
          };

          if (reducedMotion) {
            if (bgVisual) gsap.set(bgVisual, { opacity: 1 });
            if (heroVisual) gsap.set(heroVisual, { opacity: 1 });
            if (logoWrapperRef.current) {
              gsap.set(logoWrapperRef.current, { opacity: 1, y: 0 });
            }
            if (labelRef.current) {
              gsap.set(labelRef.current, { opacity: 1, y: 0 });
            }
            if (blueLineRef.current) {
              gsap.set(blueLineRef.current, { scaleY: 1 });
            }
            if (serviceItems.length) {
              gsap.set(serviceItems, { opacity: 1, y: 0 });
            }
            if (serviceTextItems.length) {
              gsap.set(serviceTextItems, { yPercent: 0 });
            }
            if (headerBtn) {
              gsap.set(headerBtn, { opacity: 1, y: 0 });
            }
            return;
          }

          // Keep desktop timing and movement unchanged, and reuse those exact
          // values on touch devices so the hero entrance is visually identical.
          const duration = 0.86;
          const logoY = 16;
          const labelY = 9;
          const serviceY = 8;

          if (bgVisual) gsap.set(bgVisual, { opacity: 0 });
          if (heroVisual) gsap.set(heroVisual, { opacity: 0 });
          if (logoWrapperRef.current) {
            gsap.set(logoWrapperRef.current, {
              opacity: 0,
              y: logoY,
              force3D: true,
            });
          }
          if (labelRef.current) {
            gsap.set(labelRef.current, {
              opacity: 0,
              y: labelY,
              force3D: true,
            });
          }
          if (blueLineRef.current) {
            gsap.set(blueLineRef.current, {
              scaleY: 0,
              transformOrigin: "center bottom",
            });
          }
          if (serviceItems.length) {
            gsap.set(serviceItems, {
              opacity: 0,
              y: serviceY,
              force3D: true,
            });
          }
          if (serviceTextItems.length) {
            gsap.set(serviceTextItems, {
              yPercent: 110,
              force3D: true,
            });
          }
          if (headerBtn) {
            gsap.set(headerBtn, {
              opacity: 0,
              y: -6,
              force3D: true,
            });
          }

          const tl = gsap.timeline({
            paused: mobile,
            delay: 0.16,
            defaults: { overwrite: "auto" },
          });

          if (bgVisual) {
            tl.to(bgVisual, {
              opacity: 1,
              duration: duration * 0.9,
              ease: "power2.out",
            });
          }

          if (heroVisual) {
            tl.to(
              heroVisual,
              {
                opacity: 1,
                duration: duration,
                ease: "power2.out",
              },
              "-=0.5"
            );
          }

          if (logoWrapperRef.current) {
            tl.to(
              logoWrapperRef.current,
              {
                opacity: 1,
                y: 0,
                duration,
                ease: "power3.out",
                force3D: true,
              },
              "-=0.58"
            );
          }

          if (labelRef.current) {
            tl.to(
              labelRef.current,
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.34,
                ease: "power3.out",
                force3D: true,
              },
              "-=0.34"
            );
          }

          if (blueLineRef.current) {
            tl.to(
              blueLineRef.current,
              {
                scaleY: 1,
                duration: duration * 0.32,
                ease: "power2.out",
              },
              "<0.05"
            );
          }

          if (serviceItems.length) {
            tl.to(
              serviceItems,
              {
                opacity: 1,
                y: 0,
                duration: 0.34,
                stagger: 0.06,
                ease: "power2.out",
                force3D: true,
              },
              "-=0.12"
            );
          }

          if (serviceTextItems.length) {
            tl.to(
              serviceTextItems,
              {
                yPercent: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: "power3.out",
                force3D: true,
              },
              "<0.02"
            );
          }

          if (headerBtn) {
            tl.to(
              headerBtn,
              {
                opacity: 1,
                y: 0,
                duration: duration * 0.42,
                ease: "power3.out",
                force3D: true,
              },
              "-=0.14"
            );
          }

          tl.call(() => {
            if (logoWrapperRef.current) {
              gsap.set(logoWrapperRef.current, { clearProps: "willChange" });
            }
            serviceItems.forEach((item) => {
              item.style.willChange = "auto";
            });
          });

          if (!mobile) {
            return () => tl.kill();
          }

          // iOS Safari can finish the intro overlay and paint the hero in the
          // same frame. Starting after two RAFs guarantees the hidden start
          // state has actually been painted before the reveal timeline runs.
          let firstFrame = 0;
          let secondFrame = 0;

          firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() => {
              ScrollTrigger.refresh();
              tl.play(0);
            });
          });

          return () => {
            window.cancelAnimationFrame(firstFrame);
            window.cancelAnimationFrame(secondFrame);
            tl.kill();
          };
        }
      );

      return () => mm.revert();
    },
    {
      scope: containerRef,
      dependencies: [introCompleted],
      revertOnUpdate: true,
    }
  );

  useGSAP(
    () => {
      if (!introCompleted || !containerRef.current || !handoffRef.current) return;

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const mm = gsap.matchMedia();

      const buildHandoff = (mobile: boolean) => {
        const handoff = handoffRef.current;
        const indicator = labelRef.current;
        const line = blueLineRef.current;

        if (!handoff) return;

        const timeline = gsap.timeline({
          defaults: {
            ease: "none",
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: mobile ? 0.28 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        // Let the logo scroll naturally so it stays directly above the
        // introduction instead of rising away from it.
        timeline.to(handoff, { autoAlpha: 0, duration: 0.06 }, 0.94);

        if (indicator) {
          timeline.to(
            indicator,
            {
              yPercent: -80,
              autoAlpha: 0,
              duration: 0.58,
              force3D: true,
            },
            0
          );
        }

        if (line) {
          timeline.to(
            line,
            {
              scaleY: 0.2,
              autoAlpha: 0,
              duration: 0.5,
            },
            0
          );
        }

        return () => {
          gsap.set(handoff, {
            clearProps: "willChange",
          });
        };
      };

      mm.add("(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)", () => buildHandoff(true));
      mm.add("(min-width: 1024px), (min-width: 769px) and (hover: hover) and (pointer: fine)", () => buildHandoff(false));

      return () => mm.revert();
    },
    {
      scope: containerRef,
      dependencies: [introCompleted],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={containerRef}
      className={`hero relative w-full h-[100svh] pointer-events-auto flex flex-col justify-between select-none !bg-transparent overflow-hidden ${introCompleted ? "hero-mobile-ready" : "hero-mobile-waiting"}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,8,11,0.1) 0%, rgba(5,8,11,0) 38%, rgba(5,8,11,0.52) 100%)",
        }}
      />
      <ScrollIndicator labelRef={labelRef} lineRef={blueLineRef} />

      <HeroContent
        handoffRef={handoffRef}
        logoWrapperRef={logoWrapperRef}
        servicesContainerRef={servicesContainerRef}
        serviceItemsRef={serviceItemsRef}
      />
    </section>
  );
}
