"use client";

import { getReducedMotionQuery } from "@/components/motion/motionPreference";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { deliverables } from "@/data/deliverables";
import { useMobileMotionReady } from "@/components/motion/useMobileMotionReady";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DeliverablesSection() {
  const motionReady = useMobileMotionReady();
  const masterRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const desktopListRef = useRef<HTMLDivElement>(null);
  const desktopItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const desktopHighlightRef = useRef<HTMLDivElement>(null);

  const progressFillRef = useRef<HTMLDivElement>(null);
  const mobileProgressFillRef = useRef<HTMLDivElement>(null);

  const mediaStageRef = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const descRef = useRef<HTMLDivElement>(null);

  const prevIndexRef = useRef(0);
  const activeIndexRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const viewportWidthRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (id: number) => {
    setImageErrors((previous) => ({
      ...previous,
      [id]: true,
    }));
  };

  const updateMobileNavigation = useCallback(() => {
    const track = mobileTrackRef.current;
    const active = mobileItemRefs.current[activeIndex];
    if (!track || !active || window.innerWidth >= 1024) return;

    const viewport = track.parentElement;
    const viewportWidth = viewport?.clientWidth ?? window.innerWidth;
    const activeCenter = active.offsetLeft + active.offsetWidth / 2;
    const desiredX = viewportWidth / 2 - activeCenter;
    const minX = Math.min(0, viewportWidth - track.scrollWidth);
    const targetX = Math.max(minX, Math.min(0, desiredX));

    gsap.to(track, {
      x: targetX,
      duration: window.innerWidth < 1024 ? 0.3 : 0.42,
      ease: "power2.out",
      overwrite: "auto",
      force3D: true,
    });
  }, [activeIndex]);

  useEffect(() => {
    updateMobileNavigation();

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        const playPromise = video.play();
        playPromise?.catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [activeIndex, updateMobileNavigation]);

  useEffect(() => {
    viewportWidthRef.current = window.innerWidth;

    let resizeFrame = 0;
    let orientationTimer = 0;

    const handleResize = () => {
      const nextWidth = window.innerWidth;

      if (Math.abs(nextWidth - viewportWidthRef.current) < 2) return;

      viewportWidthRef.current = nextWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        updateMobileNavigation();
        ScrollTrigger.refresh();
      });
    };

    const handleOrientationChange = () => {
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(() => {
        viewportWidthRef.current = window.innerWidth;
        updateMobileNavigation();
        ScrollTrigger.refresh();
      }, 260);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.clearTimeout(orientationTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [updateMobileNavigation]);

  useLayoutEffect(() => {
    const previousIndex = prevIndexRef.current;
    const compact =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;

    mediaRefs.current.forEach((element, index) => {
      if (!element) return;

      gsap.killTweensOf(element);

      if (index === activeIndex) {
        gsap.set(element, {
          visibility: "visible",
          zIndex: 20,
        });

        if (previousIndex === activeIndex) {
          gsap.set(element, {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
          });
          return;
        }

        gsap.fromTo(
          element,
          {
            opacity: 1,
            yPercent: 100,
            scale: 1.02,
            clipPath: "inset(0% 0% 0% 0%)",
          },
          {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: compact ? 0.66 : 0.82,
            ease: "power3.inOut",
            overwrite: "auto",
            force3D: true,
          }
        );

        return;
      }

      if (index === previousIndex) {
        gsap.to(element, {
          zIndex: 10,
          yPercent: compact ? -34 : -46,
          scale: compact ? 0.995 : 0.99,
          duration: compact ? 0.58 : 0.74,
          ease: "power3.inOut",
          overwrite: "auto",
          force3D: true,
          onComplete: () => {
            gsap.set(element, {
              visibility: "hidden",
              zIndex: 1,
              opacity: 1,
              yPercent: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0%)",
            });
          },
        });
        return;
      }

      gsap.set(element, {
        opacity: 1,
        visibility: "hidden",
        zIndex: 1,
        yPercent: 0,
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
      });
    });

    if (descRef.current && previousIndex !== activeIndex) {
      const descEl = descRef.current;
      gsap.killTweensOf(descEl);
      gsap.fromTo(
        descEl,
        {
          autoAlpha: 0,
          y: compact ? 4 : 6,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: compact ? 0.3 : 0.4,
          ease: "power2.out",
          overwrite: "auto",
          force3D: true,
        }
      );
    }

    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  useGSAP(
    () => {
      if (!motionReady) return;

      const master = masterRef.current;
      const sticky = stickyRef.current;
      if (!master || !sticky) return;

      const total = deliverables.length;
      const mm = gsap.matchMedia();

      mm.add(
        {
          phone: "(max-width: 768px)",
          tablet: "(min-width: 769px) and (max-width: 1023px)",
          desktop: "(min-width: 1024px)",
          reduced: getReducedMotionQuery(),
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
          const desktop = Boolean(conditions.desktop);
          const reduced = Boolean(conditions.reduced);
          const compact = phone || tablet;
          const exitHold = 0.9;

          const mediaStage = mediaStageRef.current;
          let mediaIntroTrigger: ScrollTrigger | null = null;

          if (!reduced && mediaStage) {
            mediaIntroTrigger = ScrollTrigger.create({
              trigger: mediaStage,
              start: compact ? "top 94%" : "top 88%",
              once: true,
              invalidateOnRefresh: true,
              onEnter: () => {
                const currentMedia = mediaRefs.current[activeIndexRef.current];
                if (!currentMedia) return;

                gsap.fromTo(
                  currentMedia,
                  {
                    opacity: 1,
                    yPercent: 100,
                    scale: 1.02,
                    clipPath: "inset(0% 0% 0% 0%)",
                  },
                  {
                    opacity: 1,
                    yPercent: 0,
                    scale: 1,
                    clipPath: "inset(0% 0% 0% 0%)",
                    duration: compact ? 0.7 : 0.86,
                    ease: "power3.inOut",
                    overwrite: "auto",
                    force3D: true,
                  }
                );
              },
            });
          }

          if (reduced) {
            master.style.height = "";
            scrollTriggerRef.current = null;
            if (progressFillRef.current) {
              gsap.set(progressFillRef.current, {
                scaleY: 1 / total,
              });
            }
            if (mobileProgressFillRef.current) {
              gsap.set(mobileProgressFillRef.current, {
                scaleX: 1 / total,
              });
            }
            return;
          }

          const getPinDistance = () =>
            Math.round(
              Math.max(320, sticky.clientHeight || window.innerHeight) *
                (total + exitHold) *
                0.88
            );

          const syncStageHeight = () => {
            master.style.height = `${sticky.clientHeight + getPinDistance()}px`;
          };

          syncStageHeight();

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: master,
              start: "top top",
              end: () => `+=${getPinDistance()}`,
              pin: false,
              pinSpacing: false,
              scrub: 0.45,
              anticipatePin: 0,
              invalidateOnRefresh: true,
              fastScrollEnd: false,
              refreshPriority: 1,
              onRefreshInit: syncStageHeight,
              onUpdate: (self) => {
                const servicePhase = total / (total + exitHold);
                const serviceProgress = Math.min(
                  1,
                  Math.max(0, self.progress / servicePhase)
                );
                const continuousScale = Math.max(
                  1 / total,
                  serviceProgress
                );

                if (progressFillRef.current) {
                  gsap.set(progressFillRef.current, {
                    scaleY: continuousScale,
                  });
                }

                if (mobileProgressFillRef.current) {
                  gsap.set(mobileProgressFillRef.current, {
                    scaleX: continuousScale,
                  });
                }

                const position = serviceProgress * (total - 1);
                const fromIndex = Math.floor(position);
                const toIndex = Math.min(total - 1, fromIndex + 1);
                const mix = position - fromIndex;

                if (desktop) {
                  const highlight = desktopHighlightRef.current;
                  const fromItem = desktopItemRefs.current[fromIndex];
                  const toItem = desktopItemRefs.current[toIndex];

                  if (highlight && fromItem && toItem) {
                    const x =
                      fromItem.offsetLeft +
                      (toItem.offsetLeft - fromItem.offsetLeft) * mix;
                    const y =
                      fromItem.offsetTop +
                      (toItem.offsetTop - fromItem.offsetTop) * mix;
                    const width =
                      fromItem.offsetWidth +
                      (toItem.offsetWidth - fromItem.offsetWidth) * mix;
                    const height =
                      fromItem.offsetHeight +
                      (toItem.offsetHeight - fromItem.offsetHeight) * mix;

                    gsap.set(highlight, {
                      x,
                      y,
                      width,
                      height,
                      force3D: true,
                    });
                  }
                }

                const calculatedIndex = Math.min(
                  total - 1,
                  Math.max(0, Math.round(position))
                );

                if (calculatedIndex !== activeIndexRef.current) {
                  activeIndexRef.current = calculatedIndex;
                  setActiveIndex(calculatedIndex);
                }
              },
              onLeave: () => {
                activeIndexRef.current = total - 1;
                setActiveIndex(total - 1);
              },
              onLeaveBack: () => {
                activeIndexRef.current = 0;
                setActiveIndex(0);
              },
            },
          });

          scrollTriggerRef.current = timeline.scrollTrigger ?? null;
          timeline.to({}, { duration: 1 });

          let frameA = 0;
          let frameB = 0;
          frameA = requestAnimationFrame(() => {
            frameB = requestAnimationFrame(() => {
              if (desktop) {
                const highlight = desktopHighlightRef.current;
                const firstItem = desktopItemRefs.current[0];

                if (highlight && firstItem) {
                  gsap.set(highlight, {
                    x: firstItem.offsetLeft,
                    y: firstItem.offsetTop,
                    width: firstItem.offsetWidth,
                    height: firstItem.offsetHeight,
                  });
                }
              }

              timeline.scrollTrigger?.refresh();
              timeline.scrollTrigger?.update();
            });
          });

          return () => {
            cancelAnimationFrame(frameA);
            cancelAnimationFrame(frameB);
            mediaIntroTrigger?.kill();
            timeline.scrollTrigger?.kill();
            timeline.kill();
            master.style.height = "";
            scrollTriggerRef.current = null;
          };
        }
      );

      return () => {
        mm.revert();
        master.style.height = "";
        scrollTriggerRef.current = null;
      };
    },
    {
      scope: masterRef,
      dependencies: [motionReady],
      revertOnUpdate: true,
    }
  );

  const handleSelectService = (index: number) => {
    const scrollTrigger = scrollTriggerRef.current;

    if (!scrollTrigger) {
      setActiveIndex(index);
      return;
    }

    const start = scrollTrigger.start;
    const end = scrollTrigger.end;
    const total = deliverables.length;

    const targetProgress = (index + 0.5) / deliverables.length;
    const targetScroll = start + (end - start) * targetProgress;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (
      (event.key === "ArrowDown" || event.key === "ArrowRight") &&
      activeIndex < deliverables.length - 1
    ) {
      event.preventDefault();
      handleSelectService(activeIndex + 1);
    }

    if (
      (event.key === "ArrowUp" || event.key === "ArrowLeft") &&
      activeIndex > 0
    ) {
      event.preventDefault();
      handleSelectService(activeIndex - 1);
    }
  };

  const currentDeliverable = deliverables[activeIndex];

  return (
    <section
      id="deliverables"
      ref={masterRef}
      tabIndex={0}
      aria-label="Deliverables and showcase"
      onKeyDown={handleKeyDown}
      className="relative z-20 m-0 min-h-[100svh] w-full overflow-x-clip bg-white p-0 text-black outline-none pointer-events-auto"
    >
      <div
        ref={stickyRef}
        className="mobile-scroll-sticky h-[100svh] min-h-[100svh] w-full overflow-hidden bg-white lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <div className="relative z-[1] flex h-full w-full flex-col justify-center overflow-hidden bg-white px-4 py-0 sm:px-8 md:px-12">
          <div className="w-full max-w-[1500px] mx-auto min-h-[72vh] flex flex-col justify-center">
            
            {/* Mobile Header Nav & Progress */}
            <div className="lg:hidden mx-auto flex w-full max-w-[540px] flex-col px-0 pt-[max(0.75rem,env(safe-area-inset-top))] mb-3">
              <div className="mb-2 flex items-center justify-end">
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span className="font-bold text-black">
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="text-black/30">—</span>
                  <span className="text-black/50">
                    {String(deliverables.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="relative w-full overflow-hidden py-1">
                <div
                  ref={mobileTrackRef}
                  className="flex w-max items-center gap-1.5 will-change-transform"
                >
                  {deliverables.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        ref={(element) => {
                          mobileItemRefs.current[index] = element;
                        }}
                        type="button"
                        onClick={() => handleSelectService(index)}
                        aria-current={isActive ? "true" : undefined}
                        className={`min-h-[44px] whitespace-nowrap px-2.5 py-1.5 font-sans text-xs font-medium transition-colors duration-300 select-none sm:text-sm ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-transparent text-black/40"
                        }`}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative mt-2 h-[2px] w-full overflow-hidden bg-[#E7E7E7]">
                <div
                  ref={mobileProgressFillRef}
                  className="absolute inset-0 h-full w-full origin-left bg-[#1677FF] will-change-transform"
                  style={{
                    transform: `scaleX(${1 / deliverables.length})`,
                  }}
                />
              </div>
            </div>

            {/* Layout Grid */}
            <div className="w-full max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_24px_minmax(0,1.1fr)] items-center gap-x-12 xl:gap-x-16">
              
              {/* Desktop Left Nav */}
              <div className="hidden lg:flex w-full flex-col items-center justify-center overflow-visible pr-4">
                <nav
                  className="relative flex w-full justify-center overflow-visible"
                  aria-label="Deliverable services"
                >
                  <div
                    ref={desktopListRef}
                    className="relative flex w-fit flex-col items-center gap-0"
                  >
                    <div
                      ref={desktopHighlightRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-0 z-0 bg-black will-change-transform"
                    />

                    {deliverables.map((item, index) => {
                      const isActive = index === activeIndex;

                      return (
                        <button
                          key={item.id}
                          ref={(element) => {
                            desktopItemRefs.current[index] = element;
                          }}
                          type="button"
                          onClick={() => handleSelectService(index)}
                          aria-current={isActive ? "true" : undefined}
                          className={`relative z-10 block w-fit whitespace-nowrap px-2 py-[3px] text-center font-sans text-[clamp(20px,2vw,34px)] leading-[0.94] tracking-tight transition-colors duration-300 select-none ${
                            isActive
                              ? "text-white"
                              : "text-black/20 lg:hover:text-black/45"
                          }`}
                        >
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </div>

              {/* Desktop Middle Bar */}
              <div className="hidden lg:flex h-[42vh] flex-col items-center justify-between self-center">
                <div className="relative flex-1 w-[2px] overflow-hidden bg-[#E7E7E7]">
                  <div
                    ref={progressFillRef}
                    className="absolute inset-0 h-full w-full origin-top bg-[#1677FF] will-change-transform"
                    style={{
                      transform: `scaleY(${1 / deliverables.length})`,
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center gap-1 font-mono text-xs text-black">
                  <span className="font-bold">
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="text-black/30">—</span>
                  <span className="text-black/50">
                    {String(deliverables.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Shared Media Container & Description */}
              <div className="flex w-full flex-col items-center justify-center max-w-[540px] lg:max-w-[650px] mx-auto">
                <div ref={mediaStageRef} className="relative w-full aspect-[16/10] overflow-hidden bg-black shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
                  {deliverables.map((item, index) => {
                    const isError = imageErrors[item.id];

                    return (
                      <div
                        key={item.id}
                        ref={(element) => {
                          mediaRefs.current[index] = element;
                        }}
                        className="absolute inset-0 flex h-full w-full items-center justify-center bg-black will-change-transform"
                        style={{
                          visibility: index === 0 ? "visible" : "hidden",
                          zIndex: index === 0 ? 20 : 1,
                          opacity: 1,
                        }}
                      >
                        {item.mediaType === "video" ? (
                          <video
                            ref={(element) => {
                              videoRefs.current[index] = element;
                            }}
                            src={item.media}
                            autoPlay={index === 0}
                            loop
                            muted
                            playsInline
                            preload={index === 0 ? "auto" : "metadata"}
                            className="h-full w-full object-cover"
                          />
                        ) : isError || !item.media ? (
                          <div className="flex h-full w-full items-center justify-center bg-[#111]">
                            <span className="font-pixel text-2xl lg:text-4xl uppercase tracking-widest text-white/30">
                              NORTHFRAME
                            </span>
                          </div>
                        ) : (
                          <Image
                            src={item.media}
                            alt={item.alt || item.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 650px"
                            onError={() => handleImageError(item.id)}
                            className="object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  ref={descRef}
                  className="mt-3 lg:mt-5 min-h-[70px] lg:min-h-[72px] w-full max-w-[650px]"
                >
                  <p className="max-w-[620px] text-left font-sans text-[clamp(13px,1.1vw,17px)] font-normal leading-relaxed text-black/80">
                    {currentDeliverable.description}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
