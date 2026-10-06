"use client";

import { useEffect, useRef, useState } from "react";

const WHATSAPP_URL = "https://wa.me/918075559044";

export default function FloatingContactActions() {
  const [visible, setVisible] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateVisibility = () => {
      const intro = document.getElementById("intro");

      if (!intro) {
        setVisible(false);
        frameRef.current = null;
        return;
      }

      const rect = intro.getBoundingClientRect();
      const shouldShow = rect.bottom <= window.innerHeight * 0.16;

      setVisible((current) =>
        current === shouldShow ? current : shouldShow
      );
      frameRef.current = null;
    };

    const requestUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message NORTHFRAME on WhatsApp"
      className={
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#1677FF] text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] transition-[opacity,transform] duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:h-12 sm:w-12 " +
        (visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-95 opacity-0")
      }
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[21px] w-[21px] fill-current sm:h-[22px] sm:w-[22px]"
      >
        <path d="M12.04 2a9.74 9.74 0 0 0-8.3 14.83L2.4 21.76l5.06-1.32A9.76 9.76 0 1 0 12.04 2Zm0 17.73a7.94 7.94 0 0 1-4.05-1.11l-.29-.17-3 .78.8-2.92-.19-.3a7.96 7.96 0 1 1 6.73 3.72Zm4.37-5.96c-.24-.12-1.41-.7-1.63-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
