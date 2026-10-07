"use client";

import { getReducedMotionQuery } from "@/components/motion/motionPreference";

import { useRef } from "react";
import { revealOnce } from "@/components/motion/revealOnce";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const IMAGE_SHAPE =
  "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 12%)";

const BACKING_SHAPE =
  "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 12%)";

export default function FoundedOnAVision() {
  const containerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = containerRef.current;
      const label = labelRef.current;
      const text = textRef.current;
      const visual = visualRef.current;
      const imageInner = imageInnerRef.current;

      if (!section || !label || !text || !visual || !imageInner) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          mobile: "(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)",
          desktop: "(min-width: 1024px), (min-width: 769px) and (hover: hover) and (pointer: fine)",
          reduced: getReducedMotionQuery(),
        },
        (context) => {
          const conditions = context.conditions as {
            mobile: boolean;
            desktop: boolean;
            reduced: boolean;
          };

          // Use the lightweight observer-driven reveal on touch devices so
          // mobile Safari/Chrome do not depend on desktop ScrollTrigger timing.
          const mobile = Boolean(conditions.mobile);
          const reduced = Boolean(conditions.reduced);

          if (reduced) {
            gsap.set([label, text, visual, imageInner], {
              x: 0,
              y: 0,
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              scaleX: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              clearProps: "transform,clip-path,willChange",
            });
            return;
          }

          gsap.set(label, {
            scaleX: 0,
            transformOrigin: "left center",
          });

          gsap.set(text, {
            y: mobile ? 32 : 52,
            clipPath: "inset(0% 0% 100% 0%)",
            force3D: true,
          });

          gsap.set(visual, {
            y: mobile ? 46 : 72,
            scale: mobile ? 0.99 : 0.98,
            clipPath: "inset(100% 0% 0% 0%)",
            transformOrigin: "center bottom",
            force3D: true,
          });

          gsap.set(imageInner, {
            yPercent: mobile ? 5 : 8,
            scale: mobile ? 1.04 : 1.06,
            transformOrigin: "center center",
            force3D: true,
          });

          const labelTween = gsap.to(label, {
            paused: mobile,
            scaleX: 1,
            duration: mobile ? 0.38 : 0.52,
            ease: "power4.out",
            ...(mobile
              ? {}
              : {
                  scrollTrigger: {
                    trigger: label,
                    start: "top 90%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                }),
          });

          const textTween = gsap.to(text, {
            paused: mobile,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: mobile ? 0.72 : 0.96,
            ease: "expo.out",
            force3D: true,
            ...(mobile
              ? {}
              : {
                  scrollTrigger: {
                    trigger: text,
                    start: "top 86%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                }),
          });

          const visualTimeline = gsap.timeline({
            paused: mobile,
            ...(mobile
              ? {}
              : {
                  scrollTrigger: {
                    trigger: visual,
                    start: "top 88%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                }),
          });

          visualTimeline
            .to(visual, {
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: mobile ? 0.72 : 0.94,
              ease: "expo.out",
              force3D: true,
            })
            .to(
              imageInner,
              {
                yPercent: 0,
                scale: 1,
                duration: mobile ? 0.82 : 1.04,
                ease: "power3.out",
                force3D: true,
              },
              0
            );

          const stopReveals = mobile ? [
            revealOnce(label, () => labelTween.play(0), 0.96),
            revealOnce(text, () => textTween.play(0), 0.94),
            revealOnce(visual, () => visualTimeline.play(0), 0.95),
          ] : [];

          return () => {
            stopReveals.forEach((stop) => stop());
            labelTween.scrollTrigger?.kill();
            labelTween.kill();
            textTween.scrollTrigger?.kill();
            textTween.kill();
            visualTimeline.scrollTrigger?.kill();
            visualTimeline.kill();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="founded-on-a-vision"
      ref={containerRef}
      className="relative z-30 m-0 w-full overflow-hidden bg-[#D4D6E4] px-[max(1.1rem,env(safe-area-inset-left))] py-16 pr-[max(1.1rem,env(safe-area-inset-right))] text-black pointer-events-auto select-none sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex w-full flex-col items-start text-left lg:w-[60%] xl:w-[58%]">
          <div
            ref={labelRef}
            className="mb-6 flex items-center sm:mb-8"
          >
            <span className="inline-block bg-black px-2.5 py-1 font-mono text-xs font-bold uppercase leading-none tracking-wider text-white sm:text-sm">
              FOUNDED ON A VISION
            </span>
          </div>

          <p
            ref={textRef}
            className="m-0 text-left font-sans text-[clamp(24px,6.2vw,34px)] font-normal leading-[1.08] tracking-[-0.025em] text-black sm:text-[clamp(28px,3.4vw,42px)] lg:text-[clamp(30px,2.5vw,42px)]"
          >
            NORTHFRAME was built on my belief that ordinary isn’t enough. I
            bring strategy, creativity, and technology together to help brands
            stand out and make an impact. No shortcuts. No mediocrity. Just
            purposeful work that makes you say WOOOOOW.
          </p>
        </div>

        <div
          ref={visualRef}
          data-cursor-theme="image"
          className="relative aspect-[4/5] w-full max-w-[470px] self-center overflow-hidden bg-[#C7C9DD] shadow-2xl will-change-transform sm:w-[82%] lg:w-[38%] lg:self-auto xl:w-[36%]"
          style={{ clipPath: BACKING_SHAPE }}
        >
          <div
            ref={imageInnerRef}
            className="absolute inset-[5%] overflow-hidden will-change-transform"
            style={{ clipPath: IMAGE_SHAPE }}
          >
            <Image
              src="/images/FOUNDED/Head.png"
              alt="NORTHFRAME Founder"
              fill
              className="object-cover object-center grayscale contrast-105"
              sizes="(max-width: 768px) 82vw, (max-width: 1024px) 56vw, 38vw"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
