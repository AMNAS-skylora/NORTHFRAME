"use client";

import { useLayoutEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workProjects } from "@/data/work";
import { ProjectCard } from "@/components/work/ProjectCard";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content || window.innerWidth < 1024) return;

    const syncThirdCard = () => {
      if (window.innerWidth < 1024) return;

      const projectCards = Array.from(
        content.querySelectorAll<HTMLElement>("article.work-project-item")
      );

      const secondCard = projectCards[1];
      const thirdCard = projectCards[2];
      const cta = ctaRef.current;
      if (!secondCard || !thirdCard) return;

      const thirdTop = Math.round(secondCard.offsetTop + secondCard.offsetHeight);
      thirdCard.style.top = `${thirdTop}px`;

      if (cta) {
        const thirdBottom = thirdTop + thirdCard.offsetHeight;
        const ctaTop = Math.max(0, Math.round(thirdBottom - cta.offsetHeight));
        cta.style.top = `${ctaTop}px`;
      }
    };

    let frame = requestAnimationFrame(() => {
      syncThirdCard();
      ScrollTrigger.refresh();
    });

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        syncThirdCard();
        ScrollTrigger.refresh();
      });
    });

    const projectCards = Array.from(
      content.querySelectorAll<HTMLElement>("article.work-project-item")
    );

    projectCards.slice(0, 3).forEach((card) => observer.observe(card));
    if (ctaRef.current) observer.observe(ctaRef.current);
    window.addEventListener("resize", syncThirdCard, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", syncThirdCard);

      const thirdCard = projectCards[2];
      if (thirdCard) {
        thirdCard.style.top = "";
      }
      if (ctaRef.current) {
        ctaRef.current.style.top = "";
      }
    };
  }, []);

  useGSAP(
    () => {
      if (!sectionRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        sectionRef.current.querySelectorAll(".work-project-item")
      );
      const mobileOuterItems = cards.filter(
        (card) => !card.matches("article.work-project-item")
      );
      const media = gsap.matchMedia();

      const buildCardReveals = (
        y: number,
        duration: number,
        start: string,
        items = cards
      ) => {
        items.forEach((card) => {
          gsap.fromTo(
            card,
            {
              y,
              scale: 0.988,
            },
            {
              y: 0,
              scale: 1,
              duration,
              ease: "expo.out",
              force3D: true,
              scrollTrigger: {
                trigger: card,
                start,
                once: true,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      };

      media.add(
        "(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)",
        () => buildCardReveals(28, 0.62, "top 88%", mobileOuterItems)
      );
      media.add("(min-width: 769px) and (max-width: 1023px) and (hover: hover) and (pointer: fine)", () =>
        buildCardReveals(16, 0.5, "top 92%")
      );
      media.add("(min-width: 1024px)", () =>
        buildCardReveals(28, 0.62, "top 88%")
      );

      media.add("(min-width: 1024px) and (hover: hover) and (pointer: fine)", () => {
        const shape = shapeRef.current;
        const content = contentRef.current;
        if (!shape || !content) return;

        const shapeTween = gsap.fromTo(
          shape,
          { yPercent: -0.12 },
          {
            yPercent: 0.12,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 6.5,
              invalidateOnRefresh: true,
            },
          }
        );

        const contentTween = gsap.fromTo(
          content,
          { yPercent: 0.55 },
          {
            yPercent: -4.2,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.78,
              invalidateOnRefresh: true,
            },
          }
        );

        return () => {
          shapeTween.scrollTrigger?.kill();
          shapeTween.kill();
          contentTween.scrollTrigger?.kill();
          contentTween.kill();
        };
      });
      return () => media.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="selected-work"
      ref={sectionRef}
      aria-label="A selection of our work"
      className="relative isolate z-20 w-full overflow-hidden bg-white px-[max(1.1rem,env(safe-area-inset-left))] py-16 pr-[max(1.1rem,env(safe-area-inset-right))] text-black pointer-events-auto sm:px-8 lg:px-12 lg:py-0 xl:px-16"
    >
      <div
        ref={shapeRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[22%] top-[25%] z-0 aspect-[341/220] w-[76%] max-lg:hidden"
      >
        <div
          className="absolute inset-0 bg-[#F2F3F5]"
          style={{
            clipPath:
              "polygon(64.22% 0%, 50.44% 0%, 32.26% 21.36%, 13.49% 0%, 0% 0%, 31.96% 99.55%)",
          }}
        />
        <div
          className="absolute inset-0 bg-[#F2F3F5]"
          style={{
            clipPath:
              "polygon(67.74% 0%, 35.19% 99.55%, 48.97% 99.55%, 67.45% 77.73%, 85.92% 99.55%, 99.71% 99.55%)",
          }}
        />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col items-start gap-12 sm:gap-16 lg:block lg:min-h-[clamp(1280px,104vw,1580px)] lg:translate-x-2 xl:translate-x-3"
      >
        <div
          ref={headingRef}
          className="work-project-item work-heading-mobile flex flex-col items-start gap-[2px] lg:absolute lg:left-0 lg:top-[clamp(80px,6.5vw,104px)] lg:-translate-x-[5px] xl:-translate-x-[9px]"
        >
          <h2 className="flex flex-col items-start gap-[2px] font-montserrat text-[clamp(14px,1.35vw,19px)] font-semibold uppercase leading-[1] tracking-[0.01em]">
            <span className="bg-black px-[3px] text-white">A SELECTION</span>
            <span className="bg-black px-[3px] text-white">OF OUR WORK</span>
          </h2>
        </div>

        <ProjectCard
          project={workProjects[0]}
          gridClass="lg:absolute lg:left-[59%] lg:top-[clamp(100px,9.6vw,145px)] lg:w-[32%]"
        />

        <ProjectCard
          project={workProjects[1]}
          gridClass="lg:absolute lg:left-0 lg:top-[clamp(280px,24vw,360px)] lg:w-[32%]"
          isEvenMobile
        />

        <ProjectCard
          project={workProjects[2]}
          gridClass="lg:absolute lg:left-1/2 lg:right-auto lg:top-[clamp(780px,62vw,940px)] lg:w-[32%]"
        />

        <div ref={ctaRef} className="work-project-item flex max-w-[390px] flex-col items-start gap-3 lg:absolute lg:left-[3%] lg:top-[clamp(820px,69vw,1050px)] lg:w-[30%]">
          <h3 className="font-montserrat text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            Think your brand belongs here too?
          </h3>
          <p className="font-sans text-sm leading-relaxed text-black/70 sm:text-base">
            Let’s get to know your brand, your ideas, and what you’re aiming for.
            We’re here to turn good ideas into something that makes people say “wow.”
          </p>
          <TransitionLink
            href="/#contact"
            className="group inline-flex min-h-10 items-center gap-2 border-b border-black/30 py-1 font-sans text-sm font-medium transition-colors lg:hover:border-[#1677FF] lg:hover:text-[#1677FF]"
          >
            <span>Let’s talk</span>
            <span className="transition-transform duration-200 lg:group-hover:translate-x-1">→</span>
          </TransitionLink>
        </div>

      </div>
    </section>
  );
}
