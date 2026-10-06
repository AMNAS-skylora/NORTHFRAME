"use client";

import { useLayoutEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface USP {
  id: string;
  number: string;
  title: string;
  description: string;
}

export const usps: USP[] = [
  {
    id: "usp-1",
    number: "01",
    title: "ONE PARTNER,\nEND-TO-END",
    description:
      "From strategy and branding to marketing, technology, and creative production, everything your brand needs works together under one roof.",
  },
  {
    id: "usp-2",
    number: "02",
    title: "CREATIVITY WITH\nCOMMERCIAL PURPOSE",
    description:
      "Every creative decision is rooted in your business goals, ensuring our work is purposeful, practical, and commercially relevant.",
  },
  {
    id: "usp-3",
    number: "03",
    title: "DEEP LOCAL\nFLUENCY",
    description:
      "Communication built in Malayalam, for the way business actually works in Kerala — including its many Gulf-returnee founders.",
  },
  {
    id: "usp-4",
    number: "04",
    title: "ATTENTION\nTO DETAIL",
    description:
      "We refine every element with precision, ensuring your brand delivers a consistent and memorable experience across every touchpoint.",
  },
  {
    id: "usp-5",
    number: "05",
    title: "STRATEGY BEFORE\nAESTHETICS",
    description:
      "Good design starts with good thinking. We look beyond surface-level visuals to understand your business, audience, and goals. Every creative decision is rooted in strategy, ensuring your brand looks great and communicates with purpose.",
  },
];

const CARD_LAYOUTS = [
  "lg:col-span-4 lg:col-start-7 lg:row-start-1",
  "lg:col-span-4 lg:col-start-2 lg:row-start-2 lg:-mt-[180px] xl:-mt-[220px]",
  "lg:col-span-4 lg:col-start-8 lg:row-start-3",
  "lg:col-span-4 lg:col-start-3 lg:row-start-4 lg:-mt-[180px] xl:-mt-[220px]",
  "lg:col-span-4 lg:col-start-8 lg:row-start-5 lg:-mt-[120px] xl:-mt-[150px]",
];

const MOBILE_ALIGNMENTS = [
  "mr-auto",
  "ml-auto",
  "mx-auto",
  "mr-auto",
  "ml-auto",
];

export default function OurUSPs() {
  const containerRef = useRef<HTMLElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    if (window.innerWidth < 1024) return;

    const syncThirdCardOverlap = () => {
      if (window.innerWidth < 1024) return;

      const secondCard = cardRefs.current[1];
      const thirdCard = cardRefs.current[2];
      if (!secondCard || !thirdCard) return;

      const overlap = Math.round(secondCard.offsetHeight * 0.25);
      thirdCard.style.marginTop = `-${overlap}px`;
    };

    let frame = requestAnimationFrame(syncThirdCardOverlap);

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncThirdCardOverlap);
    });

    cardRefs.current.slice(1, 3).forEach((card) => {
      if (card) observer.observe(card);
    });

    window.addEventListener("resize", syncThirdCardOverlap, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", syncThirdCardOverlap);

      const thirdCard = cardRefs.current[2];
      if (thirdCard) thirdCard.style.marginTop = "";
    };
  }, []);

  useGSAP(
    () => {
      const section = containerRef.current;
      const content = contentRef.current;
      const shape = shapeRef.current;
      if (!section || !content || !shape) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const motionTargets = [
          content,
          labelRef.current,
          ctaRef.current,
          ...cardRefs.current,
        ].filter((target): target is HTMLElement => Boolean(target));

        gsap.set(motionTargets, {
          y: 0,
          scale: 1,
          clearProps: "transform",
        });
        gsap.set(section.querySelectorAll(".usp-card-number, .usp-card-title, .usp-card-body"), {
          y: 0,
          scaleX: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          clearProps: "transform,clip-path",
        });
        return;
      }

      const mm = gsap.matchMedia();

      const buildSectionAnimation = ({
        start,
        end,
        y,
        scrub,
        shapeFrom,
        shapeTo,
      }: {
        start: string;
        end: string;
        y: number;
        scrub: number;
        shapeFrom: number;
        shapeTo: number;
      }) => {
        const contentTween = gsap.fromTo(
          content,
          {
            y,
            scale: 0.992,
          },
          {
            y: 0,
            scale: 1,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start,
              end,
              scrub,
              invalidateOnRefresh: true,
            },
          }
        );

        const shapeTween = gsap.fromTo(
          shape,
          {
            yPercent: shapeFrom,
          },
          {
            yPercent: shapeTo,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: scrub + 7.5,
              invalidateOnRefresh: true,
            },
          }
        );

        return () => {
          contentTween.scrollTrigger?.kill();
          contentTween.kill();
          shapeTween.scrollTrigger?.kill();
          shapeTween.kill();
        };
      };

      const buildCardTextReveals = (
        titleY: number,
        titleDuration: number,
        bodyDuration: number,
        start: string,
        useObserver = false
      ) => {
        const cards = cardRefs.current.filter(
          (card): card is HTMLElement => Boolean(card)
        );

        const timelines = cards.map((card) => {
          const number = card.querySelector<HTMLElement>(".usp-card-number");
          const title = card.querySelector<HTMLElement>(".usp-card-title");
          const body = card.querySelector<HTMLElement>(".usp-card-body");

          if (!number || !title || !body) return null;

          gsap.set(card, {
            y: titleY * 1.35,
            scale: 0.985,
            transformOrigin: "center bottom",
            force3D: true,
          });

          gsap.set(number, {
            scaleX: 0,
            transformOrigin: "left center",
          });

          gsap.set(title, {
            y: titleY,
            clipPath: "inset(0% 0% 100% 0%)",
          });

          gsap.set(body, {
            y: Math.round(titleY * 0.7),
            clipPath: "inset(0% 0% 100% 0%)",
          });

          const timeline = gsap.timeline({
            paused: true,
            defaults: {
              overwrite: "auto",
            },
          });

          let observer: IntersectionObserver | null = null;
          let trigger: ScrollTrigger | null = null;

          if (useObserver) {
            if ("IntersectionObserver" in window) {
              observer = new IntersectionObserver(
                ([entry]) => {
                  if (!entry?.isIntersecting) return;
                  timeline.play(0);
                  observer?.disconnect();
                },
                {
                  threshold: 0.01,
                  rootMargin: "0px 0px -5% 0px",
                }
              );
              observer.observe(card);
            } else {
              timeline.play(0);
            }
          } else {
            trigger = ScrollTrigger.create({
              trigger: card,
              start,
              once: true,
              invalidateOnRefresh: true,
              onEnter: () => timeline.play(0),
            });
          }

          timeline
            .to(card, {
              y: 0,
              scale: 1,
              duration: titleDuration + 0.12,
              ease: "expo.out",
              force3D: true,
            })
            .to(number, {
              scaleX: 1,
              duration: 0.28,
              ease: "power4.out",
              force3D: true,
            })
            .to(
              title,
              {
                y: 0,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: titleDuration,
                ease: "expo.out",
                force3D: true,
              },
              0.16
            )
            .to(
              body,
              {
                y: 0,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: bodyDuration,
                ease: "power4.out",
                force3D: true,
              },
              0.34
            );

          return { timeline, observer, trigger };
        });

        return () => {
          timelines.forEach((item) => {
            if (!item) return;
            item.observer?.disconnect();
            item.trigger?.kill();
            item.timeline.kill();
          });
        };
      };

      const buildStandaloneReveal = (
        element: HTMLElement | null,
        start: string,
        y: number,
        duration: number,
        stagger = 0,
        useObserver = false
      ) => {
        if (!element) return () => {};

        const targets =
          stagger > 0
            ? Array.from(element.children) as HTMLElement[]
            : [element];

        gsap.set(targets, {
          y,
          clipPath: "inset(0% 0% 100% 0%)",
          force3D: true,
        });

        const tween = gsap.to(targets, {
          paused: useObserver,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration,
          stagger,
          ease: "expo.out",
          force3D: true,
          ...(useObserver
            ? {}
            : {
                scrollTrigger: {
                  trigger: element,
                  start,
                  once: true,
                  invalidateOnRefresh: true,
                },
              }),
        });

        let observer: IntersectionObserver | null = null;

        if (useObserver) {
          if ("IntersectionObserver" in window) {
            observer = new IntersectionObserver(
              ([entry]) => {
                if (!entry?.isIntersecting) return;
                tween.play(0);
                observer?.disconnect();
              },
              {
                threshold: 0.01,
                rootMargin: "0px 0px -5% 0px",
              }
            );
            observer.observe(element);
          } else {
            tween.play(0);
          }
        }

        return () => {
          observer?.disconnect();
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      };

      mm.add("(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)", () => {
        const cleanups = [
          buildStandaloneReveal(labelRef.current, "top 88%", 18, 0.58),
          buildStandaloneReveal(ctaRef.current, "top 88%", 22, 0.64, 0.1),
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      mm.add("(min-width: 1024px), (min-width: 769px) and (hover: hover) and (pointer: fine)", () => {
        const cleanups = [
          buildStandaloneReveal(labelRef.current, "top 88%", 18, 0.58),
          buildStandaloneReveal(ctaRef.current, "top 88%", 22, 0.64, 0.1),
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      mm.add("(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)", () =>
        buildCardTextReveals(30, 0.72, 0.62, "top 86%")
      );

      mm.add("(min-width: 769px) and (max-width: 1023px) and (hover: hover) and (pointer: fine)", () =>
        buildCardTextReveals(20, 0.58, 0.5, "top 90%")
      );

      mm.add("(min-width: 1024px)", () =>
        buildCardTextReveals(30, 0.72, 0.62, "top 86%")
      );

      mm.add("(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)", () =>
        buildSectionAnimation({
          start: "top 88%",
          end: "top 46%",
          y: 42,
          scrub: 0.32,
          shapeFrom: 0.2,
          shapeTo: -0.2,
        })
      );

      mm.add("(min-width: 769px) and (max-width: 1023px) and (hover: hover) and (pointer: fine)", () =>
        buildSectionAnimation({
          start: "top 92%",
          end: "top 54%",
          y: 28,
          scrub: 0.2,
          shapeFrom: 0.16,
          shapeTo: -0.16,
        })
      );

      mm.add("(min-width: 1024px)", () =>
        buildSectionAnimation({
          start: "top 88%",
          end: "top 46%",
          y: 42,
          scrub: 0.32,
          shapeFrom: 0.2,
          shapeTo: -0.2,
        })
      );

      const contentParallax = gsap.fromTo(
        content,
        { yPercent: 0.8 },
        {
          yPercent: -6.2,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.68,
            invalidateOnRefresh: true,
          },
        }
      );

      return () => {
        contentParallax.scrollTrigger?.kill();
        contentParallax.kill();
        mm.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      id="our-usps"
      ref={containerRef}
      className="relative isolate z-30 w-full overflow-hidden bg-black pb-20 text-white pointer-events-auto sm:pb-24 lg:pb-32"
    >
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[10%] top-[18%] z-0 aspect-[341/220] w-[118%] opacity-85 sm:left-[14%] sm:w-[104%] lg:left-[18%] lg:top-[20%] lg:w-[88%] lg:opacity-100 xl:w-[82%]"
      >
        <div
          className="absolute inset-0 bg-[#1A1A1A]"
          style={{
            clipPath:
              "polygon(64.22% 0%,50.44% 0%,32.26% 21.36%,13.49% 0%,0% 0%,31.96% 99.55%)",
          }}
        />
        <div
          className="absolute inset-0 bg-[#1A1A1A]"
          style={{
            clipPath:
              "polygon(67.74% 0%,35.19% 99.55%,48.97% 99.55%,67.45% 77.73%,85.92% 99.55%,99.71% 99.55%)",
          }}
        />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-y-10 px-6 sm:gap-y-12 sm:px-10 md:px-16 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0 lg:px-20"
      >
        <header ref={labelRef} className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <span className="inline-block bg-white px-2 py-1 font-mono text-[18px] font-bold uppercase leading-none tracking-[0.06em] text-black sm:text-[20px] lg:text-[22px]">
            OUR USPs
          </span>
        </header>

        {usps.map((item, index) => (
          <article
            key={item.id}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            className={`relative flex min-h-[350px] w-[88%] max-w-[430px] flex-col justify-between bg-[#151515] p-6 text-white shadow-[0_22px_60px_rgba(0,0,0,0.16)] sm:min-h-[380px] sm:p-8 lg:min-h-[440px] lg:w-full lg:max-w-none lg:p-9 xl:min-h-[470px] xl:p-10 ${MOBILE_ALIGNMENTS[index]} ${CARD_LAYOUTS[index]}`}
            style={{
              clipPath:
                "polygon(10% 0,100% 0,100% 100%,0 100%,0 10%)",
            }}
          >
            <div className="flex flex-col items-start">
              <div className="usp-card-number mb-5 inline-block bg-[#1677FF] px-2.5 py-1 font-mono text-[11px] font-bold leading-none text-black sm:mb-6 sm:text-xs">
                {item.number}
              </div>

              <h3 className="usp-card-title whitespace-pre-line text-left font-pixel text-[clamp(22px,6vw,30px)] font-bold uppercase leading-[1.04] tracking-[-0.02em] text-white lg:text-[clamp(24px,2vw,32px)]">
                {item.title}
              </h3>
            </div>

            <div className="usp-card-body mt-8 border-t border-white/10 pt-5 sm:pt-6">
              <p className="text-left font-sans text-[clamp(13px,3.7vw,16px)] leading-relaxed text-white/60 lg:text-base">
                {item.description}
              </p>
            </div>
          </article>
        ))}

        <div ref={ctaRef} className="order-last flex w-full max-w-[390px] flex-col items-start gap-3 text-left lg:col-span-4 lg:col-start-1 lg:row-start-5 lg:self-end lg:pb-10">
          <h4 className="font-montserrat text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
            Think your brand belongs here too?
          </h4>

          <p className="max-w-[390px] font-sans text-sm leading-relaxed text-white/60 sm:text-base">
            Let’s get to know your brand, your ideas, and what you’re aiming for.
            We’re here to turn good ideas into something that makes people say “wow.”
          </p>

          <TransitionLink
            href="/#contact"
            className="group inline-flex min-h-10 items-center gap-2 border-b border-white/30 py-1 font-sans text-sm font-medium text-white transition-colors lg:hover:border-[#1677FF] lg:hover:text-[#1677FF]"
          >
            <span>Let’s talk</span>
            <span className="transition-transform duration-200 lg:group-hover:translate-x-1">→</span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
