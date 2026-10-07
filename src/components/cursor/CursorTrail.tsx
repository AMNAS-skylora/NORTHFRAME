"use client";

import { getReducedMotionQuery } from "@/components/motion/motionPreference";

import { useEffect, useRef } from "react";

interface NodePoint {
  x: number;
  y: number;
}

type CursorTheme = "dark" | "light" | "image" | "blue";

const palettes: Record<CursorTheme, { head: [number, number, number]; tail: [number, number, number] }> = {
  dark: { head: [22, 119, 255], tail: [0, 229, 153] },
  light: { head: [12, 30, 67], tail: [13, 82, 184] },
  image: { head: [255, 255, 255], tail: [22, 119, 255] },
  blue: { head: [255, 255, 255], tail: [8, 34, 83] },
};

function getCursorTheme(element: Element | null): CursorTheme {
  for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
    const explicit = (node as HTMLElement).dataset?.cursorTheme;
    if (explicit === "dark" || explicit === "light" || explicit === "image" || explicit === "blue") return explicit;
    if (node.matches("img, video, picture")) return "image";

    const color = getComputedStyle(node).backgroundColor;
    const background = color.match(/^rgba?\((\d+)[, ]+?(\d+)[, ]+?(\d+)/);
    if (!background) continue;
    const [, red, green, blue] = background.map(Number);
    const opacity = Number(color.match(/(?:\/|,)\s*([\d.]+)\)$/)?.[1] ?? 1);
    if (opacity < 0.8) continue;
    if (blue > red * 1.35 && blue > green * 1.12 && blue > 110) return "blue";
    return (red * 0.299 + green * 0.587 + blue * 0.114) > 150 ? "light" : "dark";
  }
  return "dark";
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atmosphereRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Disable on non-fine pointer (touch/mobile) or reduced motion preference
    const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const isReducedMotion = window.matchMedia(getReducedMotionQuery()).matches;

    if (!isFinePointer || isReducedMotion || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Physics trail settings
    const NUM_NODES = 24;
    const nodes: NodePoint[] = [];
    const target = { x: -1000, y: -1000 };
    let isMouseActive = false;
    let lastMouseMoveTime = 0;

    // Layer B delayed lerp position
    const posB = { x: 50, y: 50 };

    for (let i = 0; i < NUM_NODES; i++) {
      nodes.push({ x: -1000, y: -1000 });
    }

    const rootEl = document.documentElement;
    let theme: CursorTheme = "dark";
    let previousTarget: EventTarget | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      lastMouseMoveTime = performance.now();

      if (e.target !== previousTarget) {
        previousTarget = e.target;
        theme = getCursorTheme(e.target instanceof Element ? e.target : null);
        const { head, tail } = palettes[theme];
        rootEl.style.setProperty("--cursor-head-rgb", head.join(", "));
        rootEl.style.setProperty("--cursor-tail-rgb", tail.join(", "));
      }

      if (!isMouseActive) {
        isMouseActive = true;
        posB.x = e.clientX;
        posB.y = e.clientY;
        for (let i = 0; i < NUM_NODES; i++) {
          nodes[i].x = e.clientX;
          nodes[i].y = e.clientY;
        }
      }
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isMouseActive) return;

      const now = performance.now();
      const idleTime = now - lastMouseMoveTime;

      // Smooth lerp physics
      const easeHead = 0.45;
      nodes[0].x += (target.x - nodes[0].x) * easeHead;
      nodes[0].y += (target.y - nodes[0].y) * easeHead;

      const easeTail = 0.42;
      for (let i = 1; i < NUM_NODES; i++) {
        nodes[i].x += (nodes[i - 1].x - nodes[i].x) * easeTail;
        nodes[i].y += (nodes[i - 1].y - nodes[i].y) * easeTail;
      }

      // Smooth delayed position for Accent B atmosphere
      posB.x += (target.x - posB.x) * 0.1;
      posB.y += (target.y - posB.y) * 0.1;

      // Update global CSS variables for pointer position without triggering React re-renders
      const normX = ((target.x / window.innerWidth) * 2 - 1).toFixed(3);
      const normY = ((target.y / window.innerHeight) * 2 - 1).toFixed(3);
      rootEl.style.setProperty("--mouse-x", `${target.x.toFixed(1)}px`);
      rootEl.style.setProperty("--mouse-y", `${target.y.toFixed(1)}px`);
      rootEl.style.setProperty("--mouse-x-norm", normX);
      rootEl.style.setProperty("--mouse-y-norm", normY);
      rootEl.style.setProperty("--mouse-x-b", `${posB.x.toFixed(1)}px`);
      rootEl.style.setProperty("--mouse-y-b", `${posB.y.toFixed(1)}px`);

      let distanceSum = 0;
      for (let i = 1; i < NUM_NODES; i++) {
        const dx = nodes[i].x - nodes[i - 1].x;
        const dy = nodes[i].y - nodes[i - 1].y;
        distanceSum += Math.hypot(dx, dy);
      }

      let globalAlpha = 1;
      if (idleTime > 300) {
        globalAlpha = Math.max(0, 1 - (idleTime - 300) / 400);
      }

      if (globalAlpha <= 0.001 || distanceSum < 0.8) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.setLineDash([6, 4]);
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";

      const { head, tail } = palettes[theme];

      // Reveal the palette of the surface below the pointer.
      for (let i = 0; i < NUM_NODES - 1; i++) {
        const p1 = nodes[i];
        const p2 = nodes[i + 1];

        const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (segDist < 0.5) continue;

        const progress = 1 - i / (NUM_NODES - 1);
        const segmentAlpha = Math.pow(progress, 0.85) * globalAlpha;

        ctx.lineWidth = 2 + progress * 1.2;
        
        const r = Math.round(head[0] * progress + tail[0] * (1 - progress));
        const g = Math.round(head[1] * progress + tail[1] * (1 - progress));
        const b = Math.round(head[2] * progress + tail[2] * (1 - progress));

        if (theme === "image") {
          ctx.strokeStyle = `rgba(0, 0, 0, ${(segmentAlpha * 0.6).toFixed(3)})`;
          ctx.lineWidth += 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.lineWidth -= 2;
        }

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${segmentAlpha.toFixed(3)})`;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      ctx.restore();
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      rootEl.style.removeProperty("--cursor-head-rgb");
      rootEl.style.removeProperty("--cursor-tail-rgb");
    };
  }, []);

  return (
    <>
      {/* Dual-Color Ambient Atmosphere Fields */}
      <div
        ref={atmosphereRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-35 hidden md:block"
        style={{
          background: `
            radial-gradient(450px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(var(--cursor-head-rgb, 22, 119, 255), 0.08), transparent 75%),
            radial-gradient(650px circle at var(--mouse-x-b, 50vw) var(--mouse-y-b, 50vh), rgba(var(--cursor-tail-rgb, 0, 229, 153), 0.05), transparent 75%)
          `,
        }}
      />
      {/* Dual-Color Segmented Cursor Trail */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50 w-full h-full hidden md:block"
      />
    </>
  );
}
