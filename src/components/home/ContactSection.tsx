"use client";

import { getReducedMotionQuery } from "@/components/motion/motionPreference";

import { revealOnce } from "@/components/motion/revealOnce";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CONTACT_CONFIG = {
  phone: "+91 807 555 9044",
  phoneRaw: "+918075559044",
  whatsappUrl: "https://wa.me/918075559044",
  email: "of.northframe@gmail.com",
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://instagram.com/northframe",
  facebookUrl:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    "https://facebook.com/northframe",
  linkedinUrl:
    process.env.NEXT_PUBLIC_LINKEDIN_URL ||
    "https://linkedin.com/company/northframe",
};

const SERVICE_CHIPS = [
  "Strategy",
  "Brand Identity",
  "Digital Marketing",
  "Technology",
  "Creative Production",
];

interface FormErrors {
  services?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const formAreaRef = useRef<HTMLDivElement>(null);
  const contactAreaRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [website, setWebsite] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<"success" | "error" | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(getReducedMotionQuery()).matches
      : false
  );

  useEffect(() => {
    const motionQuery = window.matchMedia(getReducedMotionQuery());

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionChange);
      return () =>
        motionQuery.removeEventListener("change", handleMotionChange);
    }

    motionQuery.addListener(handleMotionChange);
    return () => motionQuery.removeListener(handleMotionChange);
  }, []);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        !sectionRef.current ||
        !backgroundRef.current ||
        !contentRef.current ||
        isReducedMotion
      ) {
        return;
      }

      const section = sectionRef.current;
      const background = backgroundRef.current;
      const content = contentRef.current;
      const mm = gsap.matchMedia();

      const buildReveal = (mobile: boolean) => {
        const targets = [
          introRef.current,
          formAreaRef.current,
          contactAreaRef.current,
          brandRef.current,
        ].filter((item): item is HTMLDivElement => Boolean(item));

        const tweens: gsap.core.Tween[] = [];
        const stopReveals: (() => void)[] = [];

        targets.forEach((target) => {
          gsap.set(target, {
            y: mobile ? 18 : 30,
            clipPath: "inset(0% 0% 100% 0%)",
            force3D: true,
          });

          const tween = gsap.to(target, {
            paused: mobile,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: mobile ? 0.58 : 0.78,
            ease: "expo.out",
            force3D: true,
            ...(mobile
              ? {}
              : {
                  scrollTrigger: {
                    trigger: target,
                    start: "top 88%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                }),
          });

          tweens.push(tween);

          if (!mobile) return;

          stopReveals.push(revealOnce(target, () => tween.play(0), 0.95));
        });

        return () => {
          stopReveals.forEach((stop) => stop());
          tweens.forEach((tween) => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        };
      };

      mm.add("(max-width: 768px), (max-width: 1023px) and (hover: none) and (pointer: coarse)", () => buildReveal(true));
      mm.add("(min-width: 1024px), (min-width: 769px) and (hover: hover) and (pointer: fine)", () => buildReveal(false));

      mm.add(
        "(min-width: 0px)",
        () => {
          const backgroundTween = gsap.fromTo(
            background,
            { yPercent: -0.12 },
            {
              yPercent: 0.12,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 6.5,
                invalidateOnRefresh: true,
              },
            }
          );

          const contentTween = gsap.fromTo(
            content,
            { yPercent: 0.35 },
            {
              yPercent: -2.4,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9,
                invalidateOnRefresh: true,
              },
            }
          );

          return () => {
            backgroundTween.scrollTrigger?.kill();
            backgroundTween.kill();
            contentTween.scrollTrigger?.kill();
            contentTween.kill();
          };
        }
      );

      return () => mm.revert();
    },
    {
      scope: sectionRef,
      dependencies: [isReducedMotion],
      revertOnUpdate: true,
    }
  );

  const toggleService = (chip: string) => {
    setSelectedServices((previous) =>
      previous.includes(chip)
        ? previous.filter((service) => service !== chip)
        : [...previous, chip]
    );

    if (errors.services) {
      setErrors((previous) => ({
        ...previous,
        services: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (selectedServices.length === 0) {
      nextErrors.services = "Please select at least one service category.";
    }

    if (!name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!phone.trim()) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmissionNotice(null);
    setSubmissionState(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          services: selectedServices,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          projectDetails: projectDetails.trim(),
          website,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "Unable to send your enquiry right now."
        );
      }

      setSubmissionState("success");
      setSubmissionNotice(
        "Enquiry sent successfully. We’ll get back to you shortly."
      );
      setSelectedServices([]);
      setName("");
      setPhone("");
      setEmail("");
      setProjectDetails("");
      setWebsite("");
      setErrors({});
    } catch (error) {
      setSubmissionState("error");
      setSubmissionNotice(
        error instanceof Error
          ? error.message
          : "Unable to send your enquiry right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-30 m-0 min-h-[100svh] w-full overflow-hidden bg-[#040507] px-[max(1.1rem,env(safe-area-inset-left))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 pr-[max(1.1rem,env(safe-area-inset-right))] text-white pointer-events-auto sm:px-10 sm:pt-20 lg:px-16 lg:pt-24"
    >
      <div
        ref={backgroundRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <Image
          src="/images/studio_materials_bg.jpg"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-center opacity-[0.16]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,5,7,0.76)_0%,rgba(4,5,7,0.91)_48%,#040507_100%)]" />
        <div className="absolute bottom-[12%] right-[6%] h-[22%] w-[30%] bg-white/[0.025]" />
      </div>

      <div ref={contentRef} className="relative z-10 mx-auto w-full max-w-[1400px]">
        <div
          ref={introRef}
          className="mb-12 w-full max-w-[1050px] sm:mb-16"
        >
          <div className="mb-6 flex items-center sm:mb-8">
            <span className="inline-block bg-white px-2.5 py-1 font-mono text-xs font-bold uppercase leading-none tracking-wider text-black sm:text-sm">
              CONTACT
            </span>
          </div>

          <h2 className="m-0 w-full text-left font-sans text-[clamp(25px,6.2vw,36px)] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[clamp(30px,3.4vw,44px)] lg:max-w-[1100px] lg:text-[clamp(34px,2.5vw,46px)]">
            <span className="block">Ready to take your brand to the next level?</span>
            <span className="block">
              Fill out the form or drop us a{" "}
              <a
                href={CONTACT_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline text-[#25D366] transition-opacity lg:hover:opacity-80"
              >
                WhatsApp message
              </a>
              .
            </span>
            <span className="block">Let’s connect, share ideas, and create something</span>
            <span className="block">that makes people say WOOOOOW.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 border-b border-white/10 pb-14 lg:grid-cols-12 lg:gap-16 lg:pb-16">
          <div ref={formAreaRef} className="lg:col-span-7">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                  {SERVICE_CHIPS.map((chip) => {
                    const isSelected = selectedServices.includes(chip);

                    return (
                      <button
                        key={chip}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleService(chip)}
                        className={`min-h-[42px] w-full cursor-pointer px-3 py-2.5 text-center font-mono text-xs uppercase tracking-wider transition-[background-color,border-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-[#1677FF] sm:px-4 sm:text-sm ${
                          isSelected
                            ? "bg-[#1677FF] font-semibold text-white"
                            : "border border-white/10 bg-white/[0.035] text-white/65 lg:hover:border-white/35 lg:hover:text-white"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                {errors.services && (
                  <span className="mt-2 block font-mono text-xs text-red-400">
                    {errors.services}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (errors.name) {
                        setErrors((previous) => ({
                          ...previous,
                          name: undefined,
                        }));
                      }
                    }}
                    placeholder="Name"
                    className={`w-full rounded-none border-b bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF] ${
                      errors.name ? "border-red-500" : "border-white/20"
                    }`}
                  />

                  {errors.name && (
                    <span className="mt-1 font-mono text-xs text-red-400">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                  <div className="flex flex-col">
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (errors.phone) {
                          setErrors((previous) => ({
                            ...previous,
                            phone: undefined,
                          }));
                        }
                      }}
                      placeholder="Phone Number"
                      className={`w-full rounded-none border-b bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF] ${
                        errors.phone ? "border-red-500" : "border-white/20"
                      }`}
                    />

                    {errors.phone && (
                      <span className="mt-1 font-mono text-xs text-red-400">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (errors.email) {
                          setErrors((previous) => ({
                            ...previous,
                            email: undefined,
                          }));
                        }
                      }}
                      placeholder="Email ID"
                      className={`w-full rounded-none border-b bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF] ${
                        errors.email ? "border-red-500" : "border-white/20"
                      }`}
                    />
                    {errors.email && (
                      <span className="mt-1 font-mono text-xs text-red-400">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <input
                    id="contact-details"
                    type="text"
                    value={projectDetails}
                    onChange={(event) => setProjectDetails(event.target.value)}
                    placeholder="Project Details"
                    aria-label="Project Details"
                    className="w-full rounded-none border-b border-white/20 bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF]"
                  />
                </div>

              </div>

              {submissionNotice && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`border p-4 font-sans text-xs leading-relaxed text-white sm:text-sm ${
                    submissionState === "error"
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-[#1677FF]/50 bg-[#1677FF]/15"
                  }`}
                >
                  {submissionNotice}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[36px] cursor-pointer items-center justify-center border border-white/10 bg-white/[0.035] px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-wider text-white/80 transition-[background-color,border-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-[#1677FF] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-sm lg:hover:border-[#1677FF] lg:hover:bg-[#1677FF] lg:hover:text-white"
              >
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>

          <div
            ref={contactAreaRef}
            className="flex flex-col space-y-8 border-t border-white/10 pt-8 lg:col-span-5 lg:border-t-0 lg:pl-8 lg:pt-0"
          >
            <div className="space-y-6">
              <div>
                <span className="mb-1 block font-mono text-xs font-semibold uppercase tracking-wider text-[#1677FF]">
                  EMAIL
                </span>
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="flex w-fit max-w-full items-center gap-2.5 break-all font-sans text-lg font-medium text-white transition-colors sm:text-xl lg:hover:text-[#1677FF]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.7] sm:h-[18px] sm:w-[18px]"
                  >
                    <path d="M3.5 6.5h17v11h-17z" />
                    <path d="m4.5 7.5 7.5 6 7.5-6" />
                  </svg>
                  <span>{CONTACT_CONFIG.email}</span>
                </a>
              </div>

              <div>
                <span className="mb-1 block font-mono text-xs font-semibold uppercase tracking-wider text-[#1677FF]">
                  CALL/WHATSAPP
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <a
                    href={`tel:${CONTACT_CONFIG.phoneRaw}`}
                    className="flex w-fit items-center gap-2.5 font-sans text-xl font-medium text-white transition-colors sm:text-2xl lg:hover:text-[#1677FF]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-[18px] w-[18px] shrink-0 fill-none stroke-current stroke-[1.7] sm:h-5 sm:w-5"
                    >
                      <path d="M6.5 3.5h3l1.4 4.1-2 1.7a15.2 15.2 0 0 0 5.8 5.8l1.7-2 4.1 1.4v3c0 1.1-.9 2-2 2C10.8 19.5 4.5 13.2 4.5 5.5c0-1.1.9-2 2-2Z" />
                    </svg>
                    <span>{CONTACT_CONFIG.phone}</span>
                  </a>

                  <a
                    href={CONTACT_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open WhatsApp chat"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1677FF] text-white transition-transform lg:hover:scale-105"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4 fill-current"
                    >
                      <path d="M12.04 2a9.74 9.74 0 0 0-8.3 14.83L2.4 21.76l5.06-1.32A9.76 9.76 0 1 0 12.04 2Zm0 17.73a7.94 7.94 0 0 1-4.05-1.11l-.29-.17-3 .78.8-2.92-.19-.3a7.96 7.96 0 1 1 6.73 3.72Zm4.37-5.96c-.24-.12-1.41-.7-1.63-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
              {[
                ["INSTAGRAM", CONTACT_CONFIG.instagramUrl],
                ["FACEBOOK", CONTACT_CONFIG.facebookUrl],
                ["LINKEDIN", CONTACT_CONFIG.linkedinUrl],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-fit font-mono text-sm text-white/65 transition-colors lg:hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <footer className="relative pt-10 sm:pt-12">
          <div
            ref={brandRef}
            className="overflow-hidden border-b border-white/10 pb-6"
          >
            <div
              aria-label="NORTHFRAME"
              className="relative h-[clamp(3.4rem,12vw,10.5rem)] w-full max-w-[1320px]"
            >
              <Image
                src="/images/brand/northframe-logo.webp"
                alt="NORTHFRAME"
                fill
                sizes="(max-width: 768px) 92vw, 96vw"
                className="object-contain object-left"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 py-6 font-mono text-[10px] uppercase tracking-[0.08em] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
            <span>Creative · Digital · Technology</span>

            <button
              type="button"
              onClick={() => {
                const reduced = window.matchMedia(
                  getReducedMotionQuery()
                ).matches;

                window.scrollTo({
                  top: 0,
                  behavior: reduced ? "auto" : "smooth",
                });
              }}
              aria-label="Back to top"
              className="group inline-flex w-fit min-h-[40px] items-center gap-2 text-white/60 transition-colors lg:hover:text-white"
            >
              <span>Back to top</span>
              <span
                aria-hidden="true"
                className="text-base leading-none transition-transform duration-200 lg:group-hover:-translate-y-1"
              >
                ↑
              </span>
            </button>

            <span>
              © {new Date().getFullYear()} NORTHFRAME. All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
