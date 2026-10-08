"use client";

import { getReducedMotionQuery } from "@/components/motion/motionPreference";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMobileMotionReady } from "@/components/motion/useMobileMotionReady";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const words = ["WE", "MAKE", "BRANDS", "GO", "WOW"];
const extraOs = Array.from({ length: 20 }, (_, index) => index);

const TOP_STEP_OPEN =
  "polygon(0% 100%, 0% 36%, 14% 36%, 14% 78%, 28% 78%, 28% 24%, 43% 24%, 43% 66%, 57% 66%, 57% 30%, 72% 30%, 72% 76%, 86% 76%, 86% 18%, 100% 18%, 100% 100%)";

const TOP_STEP_TIGHT =
  "polygon(0% 100%, 0% 34%, 14% 34%, 14% 38%, 28% 38%, 28% 32%, 43% 32%, 43% 37%, 57% 37%, 57% 33%, 72% 33%, 72% 38%, 86% 38%, 86% 30%, 100% 30%, 100% 100%)";

const BOTTOM_STEP_OPEN =
  "polygon(0% 0%, 0% 64%, 14% 64%, 14% 22%, 28% 22%, 28% 76%, 43% 76%, 43% 34%, 57% 34%, 57% 70%, 72% 70%, 72% 24%, 86% 24%, 86% 82%, 100% 82%, 100% 0%)";

const BOTTOM_STEP_TIGHT =
  "polygon(0% 0%, 0% 66%, 14% 66%, 14% 62%, 28% 62%, 28% 68%, 43% 68%, 43% 63%, 57% 63%, 57% 67%, 72% 67%, 72% 62%, 86% 62%, 86% 70%, 100% 70%, 100% 0%)";

export default function StatementSection() {
  const motionReady = useMobileMotionReady();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const topStepRef = useRef<HTMLDivElement>(null);
  const bottomStepRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wowRef = useRef<HTMLSpanElement>(null);
  const blackORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const whiteORefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blackFillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (!motionReady) return;

      const section = sectionRef.current;
      const stage = stageRef.current;
      const topStep = topStepRef.current;
      const bottomStep = bottomStepRef.current;
      const heading = headingRef.current;
      const wow = wowRef.current;

      if (
        !section ||
        !stage ||
        !topStep ||
        !bottomStep ||
        !heading ||
        !wow ||
        blackORefs.current.length !== extraOs.length ||
        whiteORefs.current.length !== extraOs.length ||
        blackFillRefs.current.length !== words.length ||
        blackFillRefs.current.some((fill) => !fill)
      ) {
        return;
      }

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

          const reduced = Boolean(conditions.reduced);

          if (reduced) {
            gsap.set(heading, { autoAlpha: 1 });
            gsap.set(topStep, {
              clipPath: TOP_STEP_OPEN,
              WebkitClipPath: TOP_STEP_OPEN,
              clearProps: "transform,height",
            });
            gsap.set(bottomStep, {
              clipPath: BOTTOM_STEP_OPEN,
              WebkitClipPath: BOTTOM_STEP_OPEN,
              clearProps: "transform,height",
            });
            gsap.set(blackFillRefs.current, {
              clipPath: "inset(0 0% 0 0)",
            });
            return;
          }

          // Typography is visible as the blue overlay enters.
          // The black word backgrounds are introduced later by scroll progress.
          gsap.set(heading, {
            autoAlpha: 1,
            force3D: true,
          });

          gsap.set(blackFillRefs.current, {
            clipPath: "inset(0 100% 0 0)",
          });

          gsap.set(topStep, {
            clipPath: TOP_STEP_OPEN,
            WebkitClipPath: TOP_STEP_OPEN,
            clearProps: "transform,height",
            force3D: true,
          });

          gsap.set(bottomStep, {
            clipPath: BOTTOM_STEP_OPEN,
            WebkitClipPath: BOTTOM_STEP_OPEN,
            clearProps: "transform,height",
            force3D: true,
          });

          const wowBox = wow.getBoundingClientRect();
          const blackOs = blackORefs.current as HTMLSpanElement[];
          const whiteOs = whiteORefs.current as HTMLSpanElement[];
          const letterWidths = blackOs.map(
            (letter) =>
              letter.firstElementChild?.getBoundingClientRect().width || 1
          );
          const extraCount = Math.min(
            extraOs.length,
            Math.max(
              3,
              Math.ceil(
                (stage.clientWidth * 1.04 - wowBox.width) /
                  Math.max(1, letterWidths[0])
              )
            )
          );

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              // Start once a meaningful part of the WOW overlay is already
              // covering Deliverables. The section itself keeps moving upward.
              start: "top 55%",
              // Use the same desktop scroll range on mobile for identical pacing.
              end: "bottom 20%",
              scrub: 0.22,
              invalidateOnRefresh: true,
              fastScrollEnd: false,
            },
          });

          // Reveal the black word backgrounds while the whole section is
          // naturally scrolling upward: WE → MAKE → BRANDS → GO → WOW.
          blackFillRefs.current.forEach((fill) => {
            timeline.to(fill, {
              clipPath: "inset(0 0% 0 0)",
              duration: 0.42,
              ease: "none",
            });
          });

          // Continue the same scroll-linked motion by extending the WOW letters.
          extraOs.slice(0, extraCount).forEach((index) => {
            timeline.to(
              [blackOs[index], whiteOs[index]],
              {
                width: letterWidths[index],
                autoAlpha: 1,
                duration: 0.14,
                ease: "none",
              }
            );
          });

          // Each edge has its own viewport timing.
          // The top notch closes while the WOW overlay enters.
          const topEdgeTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: topStep,
              start: "top 100%",
              end: "bottom 42%",
              scrub: 0.18,
              invalidateOnRefresh: true,
            },
          });

          topEdgeTimeline.to(topStep, {
            clipPath: TOP_STEP_TIGHT,
            WebkitClipPath: TOP_STEP_TIGHT,
            duration: 1,
            ease: "none",
            force3D: true,
          });

          // The bottom notch does not animate early anymore.
          // It starts closing only when the bottom edge itself reaches the viewport.
          const bottomEdgeTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: bottomStep,
              start: "top 96%",
              end: "top 52%",
              scrub: 0.18,
              invalidateOnRefresh: true,
            },
          });

          bottomEdgeTimeline.to(bottomStep, {
            clipPath: BOTTOM_STEP_TIGHT,
            WebkitClipPath: BOTTOM_STEP_TIGHT,
            duration: 1,
            ease: "none",
            force3D: true,
          });

          let frameA = 0;
          let frameB = 0;
          frameA = requestAnimationFrame(() => {
            frameB = requestAnimationFrame(() => {
              timeline.scrollTrigger?.refresh();
              timeline.scrollTrigger?.update();
            });
          });

          return () => {
            cancelAnimationFrame(frameA);
            cancelAnimationFrame(frameB);
            timeline.scrollTrigger?.kill();
            timeline.kill();
            topEdgeTimeline.scrollTrigger?.kill();
            topEdgeTimeline.kill();
            bottomEdgeTimeline.scrollTrigger?.kill();
            bottomEdgeTimeline.kill();
            gsap.set([topStep, bottomStep], {
              clearProps:
                "transform,height,will-change,clip-path,-webkit-clip-path",
            });
            gsap.set(heading, { clearProps: "will-change" });
          };
        }
      );

      return () => {
        mm.revert();
      };
    },
    {
      scope: sectionRef,
      dependencies: [motionReady],
      revertOnUpdate: true,
    }
  );

  const headingClass = "m-0 flex w-full flex-col items-center justify-center gap-1 md:gap-[clamp(6px,1.4svh,14px)] text-center font-pixel font-bold uppercase leading-[0.86] tracking-[-0.035em]";

  const renderWowLetters = (onBlack: boolean) => (
    <>
      WO
      {extraOs.map((index) => (
        <span
          key={index}
          ref={(element) => {
            (onBlack ? whiteORefs : blackORefs).current[index] = element;
          }}
          className="inline-block w-0 overflow-hidden align-baseline opacity-0"
        ><span className="inline-block">O</span></span>
      ))}
      W
    </>
  );

  const renderWords = () => words.map((word, index) => (
    <span
      key={word}
      className="block w-full py-0 md:py-[0.025em]"
    >
      <span
        ref={index === 4 ? wowRef : undefined}
        className={`${index === 4 ? "relative left-1/2 block w-max -translate-x-1/2" : "relative inline-block"} whitespace-nowrap px-[0.06em] ${
          index === 4
            ? "text-[60px] md:text-[clamp(68px,min(16vw,20svh),220px)]"
            : "text-[60px] md:text-[clamp(60px,min(14vw,18svh),205px)]"
        } text-black`}
      >
        <span>{index === 4 ? renderWowLetters(false) : word}</span>
        <span
          ref={(element) => { blackFillRefs.current[index] = element; }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block overflow-hidden bg-black text-white"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <span className="inline-block whitespace-nowrap px-[0.06em]">
            {index === 4 ? renderWowLetters(true) : word}
          </span>
        </span>
      </span>
    </span>
  ));

  return (
    <section
      id="statement"
      ref={sectionRef}
      className="relative isolate z-40 mt-[6svh] w-full bg-[#1677FF] p-0 text-black pointer-events-auto lg:-mt-[80dvh]"
      aria-label="We make brands go wow"
    >
      <div
        ref={topStepRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[calc(100%-2px)] left-0 z-[50] h-[6svh] min-h-[6svh] w-full bg-[#1677FF] will-change-transform lg:h-[30dvh] lg:min-h-[30dvh]"
        style={{
          clipPath: TOP_STEP_OPEN,
          WebkitClipPath: TOP_STEP_OPEN,
        }}
      />

      <div
        ref={bottomStepRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[calc(100%-2px)] z-[50] h-[6svh] min-h-[6svh] w-full bg-[#1677FF] will-change-transform lg:h-[30dvh] lg:min-h-[30dvh]"
        style={{
          clipPath: BOTTOM_STEP_OPEN,
          WebkitClipPath: BOTTOM_STEP_OPEN,
        }}
      />

      <div
        ref={stageRef}
        className="statement-stage relative z-10 flex h-auto min-h-0 md:h-[100svh] md:min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#1677FF] px-3 py-2 md:py-[clamp(1.5rem,4svh,3rem)] select-none lg:h-[100dvh] lg:min-h-[100dvh]"
      >
        <h2 ref={headingRef} aria-label="We make brands go wow" className={`relative z-10 ${headingClass}`}>{renderWords()}</h2>

      </div>
    </section>
  );
}
