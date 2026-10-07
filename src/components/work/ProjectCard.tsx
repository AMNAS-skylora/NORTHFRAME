"use client";

import { useRef } from "react";
import { revealOnce } from "@/components/motion/revealOnce";
import Image from "next/image";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WorkProject } from "@/data/work";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProjectCardProps {
  project: WorkProject;
  gridClass?: string;
  isEvenMobile?: boolean;
}

export function ProjectCard({
  project,
  gridClass = "col-span-full lg:col-span-4 lg:col-start-8 lg:w-full",
  isEvenMobile = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageRevealRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        !cardRef.current ||
        !imageRef.current ||
        !imageRevealRef.current ||
        !metaRef.current
      ) {
        return;
      }

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const mm = gsap.matchMedia();

      const buildReveal = () => {
        const card = cardRef.current;
        const imageReveal = imageRevealRef.current;
        const meta = metaRef.current;
        const image = imageRef.current;
        if (!card || !imageReveal || !meta || !image) return;

        const metaItems = Array.from(meta.children) as HTMLElement[];

        gsap.set(imageReveal, {
          clipPath: "inset(0% 0% 100% 0%)",
        });
        gsap.set(image, {
          scale: 1.09,
        });
        gsap.set(metaItems, {
          y: 18,
          clipPath: "inset(0% 0% 100% 0%)",
        });

        const timeline = gsap.timeline({ paused: true });

        timeline
          .to(imageReveal, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.78,
            ease: "expo.out",
          })
          .to(
            image,
            {
              scale: 1.035,
              duration: 0.92,
              ease: "power3.out",
              force3D: true,
            },
            0
          )
          .to(
            metaItems,
            {
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.58,
              stagger: 0.08,
              ease: "expo.out",
              force3D: true,
            },
            0.3
          );

        const mobileLike = window.matchMedia(
          "(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)"
        ).matches;

        let stopReveal = () => {};
        let trigger: ScrollTrigger | null = null;

        if (mobileLike) {
          stopReveal = revealOnce(card, () => timeline.play(0), 0.92);
        } else {
          trigger = ScrollTrigger.create({
            trigger: card,
            start: "top 87%",
            once: true,
            invalidateOnRefresh: true,
            onEnter: () => timeline.play(0),
          });
        }

        return () => {
          stopReveal();
          trigger?.kill();
          timeline.kill();
        };
      };

      mm.add("(min-width: 0px)", () => buildReveal());

      // Keep per-frame parallax on desktop only. Mobile keeps the same reveal
      // without a continuous scrub transform fighting touch scrolling.
      mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine)", () => {
        gsap.fromTo(
          imageRef.current,
          { yPercent: -1.5 },
          {
            yPercent: 1.5,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: cardRef }
  );

  return (
    <article
      ref={cardRef}
      className={`work-project-item col-span-full w-full ${
        isEvenMobile ? "mx-0 lg:ml-0" : "mx-0 lg:mr-0"
      } ${gridClass}`}
    >
      <TransitionLink
        href={`/work/${project.slug}`}
        className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative flex w-full flex-col items-start text-left cursor-pointer">
          {/* CONTROLLED 29/34 PORTRAIT ASPECT RATIO WITH DIAGONAL TOP-LEFT CLIP */}
          <div ref={imageRevealRef} className="w-full overflow-hidden">
            <div
              data-cursor-theme="image"
              className="project-image relative w-full aspect-[29/34] overflow-hidden"
              style={{
                clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%, 0 12%)",
              }}
            >
            <Image
              ref={imageRef}
              fill
              src={project.image}
              alt={project.title}
              sizes="(max-width: 767px) 88vw, (max-width: 1023px) 92vw, 30vw"
              className="object-cover scale-[1.035] lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-[1.055]"
            />
            </div>
          </div>

          {/* PROJECT METADATA DIRECTLY ATTACHED BELOW IMAGE */}
          <div ref={metaRef} className="mt-2 flex flex-col items-start gap-[4px]">
            <h3 className="text-[clamp(18px,1.5vw,22px)] font-normal leading-none tracking-[-0.02em] text-black">
              {project.title}
            </h3>

            <span
              className="inline-block w-fit bg-black px-[2px] py-0 text-[10px] uppercase leading-none text-white"
              aria-label={project.category}
            >
              {project.category}
            </span>
          </div>
        </div>
      </TransitionLink>
    </article>
  );
}
