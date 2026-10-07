let cancelCurrent: (() => void) | undefined;

// Keep the tapped image above both routes until the destination cover is ready.
export function expandProjectImage(source: HTMLImageElement | null, slug: string) {
  cancelCurrent?.();
  if (!source?.complete || !source.naturalWidth || !source.animate) return;
  const bounds = source.parentElement!.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.dataset.projectTransition = slug;
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: "100001", pointerEvents: "none",
    overflow: "hidden", background: "#05070B",
  });
  const image = document.createElement("img");
  image.src = source.currentSrc || source.src;
  image.alt = "";
  Object.assign(image.style, { width: "100%", height: "100%", objectFit: "cover" });
  overlay.append(image);
  document.body.append(overlay);
  const width = window.innerWidth;
  const height = window.innerHeight;
  // A short inward beat on black, then open the same image into the cover.
  const shrink = Math.min(0.72, width * 0.65 / bounds.width, height * 0.55 / bounds.height);
  const smallWidth = bounds.width * shrink;
  const smallHeight = bounds.height * shrink;
  const centered = { width: `${smallWidth}px`, height: `${smallHeight}px`, transform: `translate(${(width - smallWidth) / 2}px,${(height - smallHeight) / 2}px)` };
  const fullCover = { width: `${width}px`, height: `${height}px`, transform: "translate(0px,0px)" };
  const imageExpansion = image.animate([
    { offset: 0, width: `${bounds.width}px`, height: `${bounds.height}px`, transform: `translate(${bounds.left}px,${bounds.top}px)`, easing: "cubic-bezier(0.4,0,0.2,1)" },
    { offset: 0.3, ...centered },
    { offset: 0.42, ...centered, easing: "cubic-bezier(0.4,0,0.2,1)" },
    { offset: 0.94, ...fullCover },
    { offset: 1, ...fullCover },
  ], { duration: 2000, easing: "linear", fill: "forwards" });
  let frame = 0;
  let finished = false;
  const cleanup = () => {
    finished = true;
    cancelAnimationFrame(frame);
    clearTimeout(deadline);
    imageExpansion.cancel();
    overlay.remove();
    window.removeEventListener("popstate", cleanup);
    if (cancelCurrent === cleanup) cancelCurrent = undefined;
  };
  const deadline = window.setTimeout(cleanup, 5000);
  cancelCurrent = cleanup;
  window.addEventListener("popstate", cleanup);
  const settle = () => {
    if (finished) return;
    const cover = document.querySelector<HTMLImageElement>(`[data-project-cover="${CSS.escape(slug)}"] img`);
    if (cover?.complete && cover.naturalWidth && imageExpansion.playState === "finished") {
      const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" });
      fade.onfinish = cleanup;
    } else frame = requestAnimationFrame(settle);
  };
  frame = requestAnimationFrame(settle);
}
