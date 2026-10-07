/**
 * Start a touch reveal even if observer delivery is delayed or unavailable.
 * Keep a passive, frame-batched layout check until the reveal starts, then
 * remove it. The check does not depend on the animated clip/opacity state.
 */
export function revealOnce(
  target: Element,
  play: () => void,
  viewportRatio = 0.9
): () => void {
  let stopped = false;
  let frame = 0;
  let observer: IntersectionObserver | null = null;

  const cleanup = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("pageshow", schedule);
    window.removeEventListener("northframe:motion-refresh", schedule);
    document.removeEventListener("visibilitychange", schedule);
    window.visualViewport?.removeEventListener("resize", schedule);
  };

  const check = () => {
    frame = 0;
    if (stopped || document.visibilityState === "hidden" || !target.isConnected) return;
    const bounds = target.getBoundingClientRect();
    const height = window.visualViewport?.height || window.innerHeight;
    if (bounds.height > 0 && bounds.bottom > 0 && bounds.top < height * viewportRatio) {
      cleanup();
      play();
    }
  };

  function schedule() {
    if (!stopped && !frame) frame = requestAnimationFrame(check);
  }

  if ("IntersectionObserver" in window) {
    // The callback is only a wake-up signal. The layout check also works for
    // zero-width labels and fully clipped text without exposing hidden text.
    observer = new IntersectionObserver(schedule, { threshold: 0 });
    observer.observe(target);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);
  window.addEventListener("northframe:motion-refresh", schedule);
  document.addEventListener("visibilitychange", schedule);
  window.visualViewport?.addEventListener("resize", schedule, { passive: true });
  schedule();
  return cleanup;
}
