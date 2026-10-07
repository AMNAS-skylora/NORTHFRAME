"use client";

import { useEffect, useState } from "react";
import { MOTION_STORAGE_KEY } from "./motionPreference";

export default function MotionPreferenceControl() {
  const [state, setState] = useState<{ reduced: boolean; full: boolean } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setState({ reduced: query.matches, full: document.documentElement.dataset.motion === "full" });
    let active = true;
    queueMicrotask(() => { if (active) update(); });
    query.addEventListener("change", update);
    return () => { active = false; query.removeEventListener("change", update); };
  }, []);

  if (!state || (!state.reduced && !state.full)) return null;

  const changePreference = () => {
    try {
      if (state.full) localStorage.removeItem(MOTION_STORAGE_KEY);
      else localStorage.setItem(MOTION_STORAGE_KEY, "true");
      window.location.reload();
    } catch {
      setError("Your browser could not save this preference. Allow site storage and try again.");
    }
  };

  return (
    <aside aria-label="Animation preference" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[10000] max-w-[calc(100vw-2rem)] rounded-lg border border-white/20 bg-[#05070B]/95 p-3 text-white shadow-lg">
      <button type="button" data-testid="motion-preference-toggle" aria-pressed={state.full} onClick={changePreference} className="min-h-11 rounded bg-[#1677FF] px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        {state.full ? "Use device motion settings" : "Enable full animations"}
      </button>
      <p className="mt-2 text-xs text-white/70">{state.full ? "Full animations enabled for this site." : "Reduced motion is on. Full animations include movement and zoom."}</p>
      {error && <p role="alert" className="mt-2 max-w-xs text-xs">{error}</p>}
    </aside>
  );
}
