"use client";

import { useRef } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/data/services";
import { useMobileMotionReady } from "@/components/motion/useMobileMotionReady";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CLOSED_STEPS =
  "polygon(0% 100%, 0% 100%, 20% 100%, 20% 100%, 40% 100%, 40% 100%, 60% 100%, 60% 100%, 80% 100%, 80% 100%, 100% 100%, 100% 100%)";

const OPEN_STEPS =
  "polygon(0% 100%, 0% 0%, 20% 0%, 20% -12%, 40% -12%, 40% -24%, 60% -24%, 60% -36%, 80% -36%, 80% -48%, 100% -48%, 100% 100%)";

export default function WatWeDoen() {
  const wrapperRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLElement | null)[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const motionReady = useMobileMotionReady();

  // Mobile and desktop share one GSAP timeline below. This avoids a second
  // manual scroll renderer on touch devices and keeps animation behavior
  // consistent across Safari, Chrome and desktop browsers.

  useGSAP(
    () => {
      if (!motionReady) return;

      const wrapper = wrapperRef.current;
      const sticky = stickyRef.current;
      if (!wrapper || !sticky) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          phone: "(max-width: 768px)",
          tablet: "(min-width: 769px) and (max-width: 1023px)",
          desktop: "(min-width: 1024px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as {
            phone: boolean;
            tablet: boolean;
            desktop: boolean;
            reduced: boolean;
          };

          const phone = Boolean(conditions.phone);
          const tablet = Boolean(conditions.tablet);
          const mobile = phone || tablet;
          const reduced = Boolean(conditions.reduced);
          const panelCount = services.length;
          const revealDuration = 0.86;
          const introSegment = reduced ? 0.2 : 1.2;

          const getScrollDistance = () =>
            Math.round(
              sticky.clientHeight *
                (panelCount + introSegment - 1) *
                (reduced ? 0.72 : mobile ? 0.96 : 1.22)
            );

          const syncMobileStageHeight = () => {
            if (mobile) {
              wrapper.style.height = `${sticky.clientHeight + getScrollDistance()}px`;
            } else {
              wrapper.style.height = "";
            }
          };

          syncMobileStageHeight();

          panelsRef.current.forEach((panel, index) => {
            if (!panel) return;

            // Keep panel opacity fixed: services reveal through the same mask
            // on every device. Reduced motion switches masks without a tween.
            gsap.set(panel, {
              inset: 0,
              clipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
              WebkitClipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
              autoAlpha: 1,
              zIndex: 10 + index,
              ...(mobile ? { clearProps: "transform" } : { yPercent: 0, force3D: true }),
              willChange: mobile || reduced ? "auto" : "clip-path",
            });

            const image = imagesRef.current[index];
            if (image) {
              gsap.set(image, {
                scale: !reduced && index === 0 ? 1.035 : 1,
                transformOrigin: "center center",
                force3D: true,
                willChange: reduced ? "auto" : "transform",
              });
            }

            if (index === 0) {
              const introText = panel.querySelectorAll(".first-service-intro");
              gsap.set(introText, {
                y: reduced ? 0 : 22,
                autoAlpha: reduced ? 1 : 0,
                force3D: true,
              });
            }
          });

          const timeline = gsap.timeline({
            defaults: {
              overwrite: "auto",
            },
            scrollTrigger: {
              trigger: wrapper,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              pin: mobile ? false : sticky,
              pinSpacing: mobile ? false : true,
              scrub: reduced ? true : mobile ? 0.28 : 0.5,
              anticipatePin: mobile ? 0 : 1,
              invalidateOnRefresh: true,
              fastScrollEnd: false,
              refreshPriority: 2,
              onRefreshInit: syncMobileStageHeight,
            },
          });

          services.forEach((_, index) => {
            const panel = panelsRef.current[index];
            const image = imagesRef.current[index];
            if (!panel) return;

            if (index === 0) {
              const introText = panel.querySelectorAll(".first-service-intro");
              if (!reduced) {
                if (image) {
                  timeline.to(
                    image,
                    {
                      scale: 1,
                      duration: 0.58,
                      ease: "power2.out",
                      force3D: true,
                    },
                    0
                  );
                }

                timeline.to(
                  introText,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.48,
                    ease: "power3.out",
                    force3D: true,
                  },
                  0.08
                );
              }

              // Reserve the first scroll movement for the BRAND IDENTITY intro.
              // The next service panel does not start revealing until this finishes.
              timeline.to({}, { duration: introSegment }, 0);
              return;
            }

            const segmentStart = introSegment + (index - 1);

            if (reduced) {
              // Reduce Motion keeps a discrete panel switch, never a crossfade.
              timeline.set(
                panel,
                {
                  clipPath: OPEN_STEPS,
                  WebkitClipPath: OPEN_STEPS,
                },
                segmentStart
              );
            } else {
              timeline.to(
                panel,
                {
                  clipPath: OPEN_STEPS,
                  WebkitClipPath: OPEN_STEPS,
                  duration: revealDuration,
                  ease: "none",
                },
                segmentStart
              );
            }

            if (!reduced && image) {
              timeline.to(
                image,
                {
                  scale: 1.095,
                  duration: 1,
                  ease: "none",
                  force3D: true,
                },
                segmentStart
              );
            }

            timeline.to(
              {},
              {
                duration: reduced
                  ? 1
                  : Math.max(0.12, 1 - revealDuration),
              },
              segmentStart + (reduced ? 0 : revealDuration)
            );
          });

          let firstFrame = 0;
          let secondFrame = 0;

          firstFrame = requestAnimationFrame(() => {
            secondFrame = requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          });

          return () => {
            cancelAnimationFrame(firstFrame);
            cancelAnimationFrame(secondFrame);
            wrapper.style.height = "";
            timeline.scrollTrigger?.kill();
            timeline.kill();

            panelsRef.current.forEach((panel, index) => {
              if (panel) {
                gsap.set(panel, {
                  clearProps:
                    "will-change,transform,opacity,visibility,clip-path,-webkit-clip-path",
                });
              }

              const mobileText = panel?.querySelectorAll<HTMLElement>(
                ".service-mobile-text"
              );
              if (mobileText?.length) {
                gsap.set(mobileText, {
                  clearProps:
                    "will-change,transform,clip-path,-webkit-clip-path",
                });
              }

              const image = imagesRef.current[index];
              if (image) {
                gsap.set(image, {
                  clearProps: "will-change,transform",
                });
              }
            });
          };
        }
      );

      return () => mm.revert();
    },
    {
      scope: wrapperRef,
      dependencies: [motionReady],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={wrapperRef}
      id="wat-we-doen"
      className="wat-we-doen-scroll relative w-full bg-transparent text-black"
    >
      <div
        ref={stickyRef}
        className="wat-we-doen-sticky sticky top-0 h-[100svh] min-h-[100svh] w-full overflow-hidden bg-transparent lg:relative lg:top-auto lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <div className="wat-we-doen-stage relative h-full w-full overflow-hidden bg-transparent">
          {services.map((service, index) => (
            <article
              key={service.id}
              ref={(element) => {
                panelsRef.current[index] = element;
              }}
              data-cursor-theme="image"
              className="service-panel absolute inset-0 overflow-hidden select-none"
              style={{
                clipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
                WebkitClipPath: index === 0 ? "inset(0)" : CLOSED_STEPS,
              }}
            >
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    ref={(element) => {
                      imagesRef.current[index] = element;
                    }}
                    src={service.image}
                    alt={service.imageAlt || service.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="panel-image object-cover select-none pointer-events-none"
                    style={{
                      objectPosition: service.objectPosition || "center center",
                    }}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-black/10" />
              </div>

              <div
                className={`absolute left-[max(1.1rem,env(safe-area-inset-left))] right-[max(4.5rem,env(safe-area-inset-right))] top-[max(1.1rem,env(safe-area-inset-top))] z-20 flex items-start gap-4 pointer-events-none md:left-8 md:right-24 md:top-[max(2rem,env(safe-area-inset-top))] md:gap-12 ${index === 0 ? "first-service-intro" : ""}`}
              >
                <span className="service-mobile-text shrink-0 bg-black px-1.5 py-0.5 font-montserrat text-[9px] font-semibold uppercase leading-none tracking-[0.04em] text-white sm:text-[10px] md:text-[16px]">
                  WHAT WE DO
                </span>

                <div className="flex max-w-[55vw] flex-col items-start gap-[2px] md:max-w-[440px]">
                  {service.items.map((item) => (
                    <span
                      key={item}
                      className="service-mobile-text inline-block bg-black px-1 py-[1px] font-montserrat text-[8px] font-medium uppercase leading-none tracking-[0.03em] text-white sm:text-[9px] md:text-[16px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 z-20 pointer-events-none">
                <div
                  className={`absolute bottom-[max(3.5rem,env(safe-area-inset-bottom))] left-[max(1.1rem,env(safe-area-inset-left))] max-w-[90vw] pointer-events-auto md:bottom-[max(3rem,env(safe-area-inset-bottom))] md:left-8 lg:left-12 ${index === 0 ? "first-service-intro" : ""}`}
                >
                  <TransitionLink
                    href={`/services/${service.slug}`}
                    className="flex flex-col items-start gap-[2px] font-pixel text-[clamp(46px,12vw,62px)] font-bold uppercase leading-[0.91] tracking-normal text-white sm:text-[clamp(52px,10.5vw,70px)] md:text-[clamp(58px,7.5vw,78px)] lg:text-[106px] lg:leading-[0.94]"
                  >
                    {service.displayLines.map((line) => (
                      <span
                        key={line}
                        className="service-mobile-text block w-fit bg-black px-[0.06em] py-[0.01em] leading-[0.94] text-white lg:leading-[0.96]"
                      >
                        {line}
                      </span>
                    ))}
                  </TransitionLink>
                </div>

                <div
                  className={`service-mobile-text absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1.1rem,env(safe-area-inset-left))] inline-flex items-center gap-2 bg-black px-2 py-1 font-pixel text-[10px] tracking-wider text-white md:left-auto md:right-8 md:bottom-[max(2rem,env(safe-area-inset-bottom))] md:font-mono md:text-xs lg:right-12 ${index === 0 ? "first-service-intro" : ""}`}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="relative h-[2px] w-7 overflow-hidden bg-white/30">
                    <span className="absolute inset-0 origin-left bg-[#1677FF]" />
                  </span>
                  <span>{String(services.length).padStart(2, "0")}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
