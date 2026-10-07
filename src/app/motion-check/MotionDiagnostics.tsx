"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Status = { reduced: boolean; full: boolean; width: number; touch: boolean; animation: boolean };

export default function MotionDiagnostics({ build }: { build: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [result, setResult] = useState("Not tested");
  const marker = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStatus({
      reduced: query.matches,
      full: document.documentElement.dataset.motion === "full",
      width: window.innerWidth,
      touch: window.matchMedia("(pointer: coarse)").matches,
      animation: typeof Element.prototype.animate === "function",
    });
    let active = true;
    queueMicrotask(() => { if (active) update(); });
    if (typeof query.addEventListener === "function") query.addEventListener("change", update);
    else query.addListener(update);
    window.addEventListener("resize", update);
    return () => {
      active = false;
      animation.current?.cancel();
      if (typeof query.removeEventListener === "function") query.removeEventListener("change", update);
      else query.removeListener(update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const playTest = () => {
    if (!marker.current || !status?.animation) return;
    animation.current?.cancel();
    setResult("Running — the blue square should move right, then return");
    // User-triggered test: never overrides the website's system preference.
    const test = marker.current.animate([
      { transform: "translateX(0)" },
      { transform: "translateX(180px)" },
      { transform: "translateX(0)" },
    ], { duration: 1800, easing: "ease-in-out" });
    animation.current = test;
    test.onfinish = () => setResult("Completed — did the blue square visibly move?");
  };

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12 text-white">
      <h1 className="text-3xl font-semibold">NORTHFRAME motion check</h1>
      <p className="mt-3 text-white/70">This page checks your phone locally. It sends no diagnostic data.</p>
      <dl className="mt-8 space-y-4 rounded-xl border border-white/20 p-5">
        <div><dt className="text-white/60">JavaScript</dt><dd data-testid="javascript-status">{status ? "Working" : "Waiting for JavaScript — if this stays, scripts have not started"}</dd></div>
        <div><dt className="text-white/60">Reduce Motion requested by browser</dt><dd data-testid="motion-preference">{status ? status.reduced ? "ON" : "OFF" : "Not checked yet"}</dd></div>
        <div><dt className="text-white/60">Website animation preference</dt><dd data-testid="effective-motion">{status ? status.full ? "Full animations enabled — device preference overridden for this site" : status.reduced ? "Use device settings — homepage entrances are intentionally static" : "Use device settings — homepage animations should run" : "Not checked yet"}</dd></div>
        <div><dt className="text-white/60">Browser animation API</dt><dd>{status ? status.animation ? "Available" : "Unavailable" : "Not checked yet"}</dd></div>
        <div><dt className="text-white/60">Viewport / pointer</dt><dd>{status ? `${status.width}px / ${status.touch ? "touch" : "mouse"}` : "Not checked yet"}</dd></div>
        <div><dt className="text-white/60">Deployment commit</dt><dd>{build}</dd></div>
      </dl>
      <p className="mt-6 text-white/80">Use “Enable full animations” to try the complete homepage animation without changing your phone settings. “Use device motion settings” restores your device preference.</p>
      <div className="mt-6 overflow-hidden rounded-lg border border-white/20 p-4" aria-hidden="true">
        <div ref={marker} data-testid="motion-marker" className="h-8 w-8 bg-[#1677FF]" />
      </div>
      <button type="button" onClick={playTest} disabled={!status?.animation} className="mt-4 rounded-lg bg-[#1677FF] px-5 py-3 font-medium disabled:opacity-40">Play test animation</button>
      <p className="mt-3 text-sm" role="status">{result}</p>
      <p className="mt-6 text-white/70">If full animations are enabled but the homepage remains static, send a screenshot of these results and a short screen recording of the homepage.</p>
      <Link href="/" className="mt-6 inline-block underline">Back to homepage</Link>
    </main>
  );
}
