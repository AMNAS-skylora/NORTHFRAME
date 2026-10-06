"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#intro" },
  { label: "Who We Are", href: "/#founded-on-a-vision" },
  { label: "Let's talk →", href: "/#contact", isAccent: true },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const navPanelRef = useRef<HTMLDivElement>(null);
  const navSurfaceRef = useRef<HTMLDivElement>(null);
  const navContentRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const getCompactScale = useCallback(() => {
    if (typeof window === "undefined") return 0.16;
    return window.innerWidth <= 768 ? 0.13 : 0.16;
  }, []);

  useLayoutEffect(() => {
    const panel = navPanelRef.current;
    const surface = navSurfaceRef.current;
    const content = navContentRef.current;
    if (!panel || !surface || !content) return;

    gsap.set(panel, {
      autoAlpha: 0,
      pointerEvents: "none",
    });
    gsap.set(surface, {
      autoAlpha: 0,
      scale: getCompactScale(),
      transformOrigin: "top right",
      force3D: true,
    });
    gsap.set(content, { autoAlpha: 0 });
    gsap.set(navLinksRef.current.filter(Boolean), {
      autoAlpha: 0,
      y: 12,
    });

    return () => {
      timelineRef.current?.kill();
    };
  }, [getCompactScale]);

  const animateMenu = useCallback(
    (open: boolean) => {
      const panel = navPanelRef.current;
      const surface = navSurfaceRef.current;
      const content = navContentRef.current;
      if (!panel || !surface || !content) return;

      const links = navLinksRef.current.filter(
        (link): link is HTMLAnchorElement => Boolean(link)
      );
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const mobile = window.innerWidth <= 768;
      const compactScale = getCompactScale();

      timelineRef.current?.kill();
      setMenuOpen(open);

      if (open) {
        gsap.set(panel, {
          autoAlpha: 1,
          pointerEvents: "auto",
        });

        if (reducedMotion) {
          gsap.set(surface, { autoAlpha: 1, scale: 1 });
          gsap.set(content, { autoAlpha: 1 });
          gsap.set(links, { autoAlpha: 1, y: 0 });
          window.setTimeout(() => navLinksRef.current[0]?.focus(), 0);
          return;
        }

        gsap.set(surface, {
          autoAlpha: 1,
          transformOrigin: "top right",
          willChange: "transform, opacity",
          force3D: true,
        });
        gsap.set(content, { autoAlpha: 0 });
        gsap.set(links, {
          autoAlpha: 0,
          y: mobile ? 10 : 14,
          force3D: true,
        });

        const tl = gsap.timeline({
          defaults: { overwrite: "auto" },
          onComplete: () => {
            gsap.set(surface, { willChange: "auto" });
            navLinksRef.current[0]?.focus();
          },
        });

        timelineRef.current = tl;

        tl.to(surface, {
          scale: 1,
          duration: mobile ? 0.48 : 0.56,
          ease: "power3.inOut",
          force3D: true,
        })
          .to(
            content,
            {
              autoAlpha: 1,
              duration: mobile ? 0.16 : 0.2,
              ease: "power2.out",
            },
            "-=0.2"
          )
          .to(
            links,
            {
              autoAlpha: 1,
              y: 0,
              duration: mobile ? 0.28 : 0.34,
              stagger: mobile ? 0.038 : 0.045,
              ease: "power3.out",
              force3D: true,
            },
            "-=0.14"
          );
        return;
      }

      if (reducedMotion) {
        gsap.set(panel, {
          autoAlpha: 0,
          pointerEvents: "none",
        });
        gsap.set(surface, {
          autoAlpha: 0,
          scale: compactScale,
        });
        gsap.set(content, { autoAlpha: 0 });
        gsap.set(links, { autoAlpha: 0, y: 10 });
        menuBtnRef.current?.focus();
        return;
      }

      const tl = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          gsap.set(panel, {
            autoAlpha: 0,
            pointerEvents: "none",
          });
          gsap.set(surface, {
            autoAlpha: 0,
            scale: compactScale,
            willChange: "auto",
          });
          gsap.set(content, { autoAlpha: 0 });
          menuBtnRef.current?.focus();
        },
      });

      timelineRef.current = tl;

      tl.to(links, {
        autoAlpha: 0,
        y: mobile ? 7 : 9,
        duration: mobile ? 0.15 : 0.18,
        stagger: {
          each: 0.02,
          from: "end",
        },
        ease: "power2.in",
      })
        .to(
          content,
          {
            autoAlpha: 0,
            duration: 0.12,
            ease: "power2.in",
          },
          "-=0.08"
        )
        .to(
          surface,
          {
            scale: compactScale,
            autoAlpha: 0,
            duration: mobile ? 0.34 : 0.4,
            ease: "power3.inOut",
            force3D: true,
          },
          "-=0.06"
        );
    },
    [getCompactScale]
  );

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);
    updateHash();
    window.addEventListener("popstate", updateHash);
    window.addEventListener("hashchange", updateHash);
    return () => {
      window.removeEventListener("popstate", updateHash);
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        animateMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [animateMenu, menuOpen]);

  const handleToggleMenu = () => {
    animateMenu(!menuOpen);
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setActiveHash(new URL(event.currentTarget.href).hash);
    animateMenu(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full pointer-events-none">
      <div className="relative w-full max-w-[1920px] mx-auto p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] flex justify-end pointer-events-none">
        <div
          aria-hidden="true"
          onPointerDown={() => {
            if (menuOpen) animateMenu(false);
          }}
          className={
            "fixed inset-0 z-[80] bg-transparent transition-none " +
            (menuOpen
              ? "pointer-events-auto touch-none"
              : "pointer-events-none")
          }
        />

        <button
          id="header-menu-button"
          ref={menuBtnRef}
          type="button"
          onClick={handleToggleMenu}
          aria-expanded={menuOpen}
          aria-controls="northframe-menu-panel"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="header-menu-button pointer-events-auto relative z-[110] inline-flex min-h-0 min-w-0 items-center justify-center bg-[#1677FF] p-[3px] text-white rounded-none select-none touch-action-manipulation cursor-pointer focus:outline-none before:absolute before:-inset-3 before:content-[''] md:h-[14px] md:w-[58px] md:min-h-0 md:min-w-0 md:gap-[5px] md:px-[4px] md:py-0 md:focus-visible:ring-2 md:focus-visible:ring-white/70"
        >
          <span className="hidden md:inline font-mono text-[7px] font-semibold uppercase tracking-[0.08em] leading-none">
            {menuOpen ? "CLOSE" : "MENU"}
          </span>

          <span className="relative block h-3 w-4 pointer-events-none md:h-2 md:w-[14px]">
            <span
              className={
                "absolute left-0 top-[2px] block w-4 h-[1.5px] origin-center transition-[transform,background-color] duration-300 md:top-[1px] md:w-[14px] md:h-px " +
                (menuOpen
                  ? "translate-y-[3.5px] rotate-45 bg-white"
                  : "bg-white")
              }
            />
            <span
              className={
                "absolute left-0 bottom-[2px] block w-4 h-[1.5px] origin-center transition-[transform,background-color] duration-300 md:bottom-[1px] md:w-[14px] md:h-px " +
                (menuOpen
                  ? "-translate-y-[3.5px] -rotate-45 bg-white"
                  : "bg-white")
              }
            />
          </span>
        </button>

        <div
          id="northframe-menu-panel"
          ref={navPanelRef}
          aria-hidden={!menuOpen}
          className="fixed z-[100] w-[min(252px,calc(100vw-24px))] min-h-[min(292px,calc(100svh-24px))] max-h-[calc(100svh-24px)] overflow-y-auto overflow-x-hidden text-white pointer-events-none opacity-0 md:w-[min(460px,calc(100vw-28px))] md:min-h-[min(460px,calc(100dvh-2rem))] md:max-h-[calc(100dvh-2rem)]"
          style={{
            top: "max(1rem, env(safe-area-inset-top))",
            right: "max(1rem, env(safe-area-inset-right))",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <div
            ref={navSurfaceRef}
            aria-hidden="true"
            className="absolute inset-0 bg-[#1677FF] pointer-events-none"
          />

          <div
            ref={navContentRef}
            className="relative z-10 flex min-h-[min(292px,calc(100svh-24px))] flex-col px-5 pb-5 pt-4 md:min-h-[min(460px,calc(100dvh-2rem))] md:px-9 md:pb-9 md:pt-8"
          >
            <div className="flex items-center pr-8 font-mono text-[9px] uppercase tracking-[0.08em] leading-none text-white/90 md:pr-12 md:text-[10px]">
              <span>NORTHFRAME</span>
            </div>

            <nav
              aria-label="Primary navigation"
              className="mt-5 flex flex-1 flex-col items-start justify-center gap-1.5 md:mt-8 md:gap-3"
            >
              {NAV_ITEMS.map((item, index) => (
                <TransitionLink
                  key={item.label}
                  ref={(element) => {
                    navLinksRef.current[index] = element;
                  }}
                  href={item.href}
                  onClick={handleLinkClick}
                  aria-current={
                    pathname === item.href.split("#")[0] &&
                    (item.href.includes("#") ? activeHash === `#${item.href.split("#")[1]}` : !activeHash)
                      ? "page"
                      : undefined
                  }
                  className={
                    "group block w-fit font-montserrat text-[1.32rem] font-semibold uppercase tracking-[-0.055em] leading-[1.02] text-white transition-colors duration-200 hover:text-[#061321] focus-visible:text-[#061321] focus-visible:outline-2 focus-visible:outline-white aria-[current=page]:bg-white aria-[current=page]:px-1 aria-[current=page]:text-[#061321] sm:text-[1.45rem] md:text-[clamp(1.7rem,7vw,2.7rem)] md:tracking-[-0.065em] " +
                    (item.isAccent ? "mt-2 md:mt-3" : "")
                  }
                >
                  {item.label}
                  <sup className="ml-1 align-top font-mono text-[8px] tracking-normal text-current opacity-75 md:text-[10px]">
                    {String(index + 1).padStart(2, "0")}
                  </sup>
                </TransitionLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
