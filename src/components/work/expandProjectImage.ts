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
  const expansion = overlay.animate([
    { clipPath: `inset(${Math.max(0, bounds.top)}px ${Math.max(0, width - bounds.right)}px ${Math.max(0, height - bounds.bottom)}px ${Math.max(0, bounds.left)}px)` },
    { clipPath: "inset(0px 0px 0px 0px)" },
  ], { duration: 650, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "forwards" });
  const imageExpansion = image.animate([
    { width: `${bounds.width}px`, height: `${bounds.height}px`, transform: `translate(${bounds.left}px,${bounds.top}px)` },
    { width: `${width}px`, height: `${height}px`, transform: "translate(0px,0px)" },
  ], { duration: 650, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "forwards" });
  let frame = 0;
  let finished = false;
  const cleanup = () => {
    finished = true;
    cancelAnimationFrame(frame);
    clearTimeout(deadline);
    expansion.cancel();
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
    if (cover?.complete && cover.naturalWidth && expansion.playState === "finished") {
      const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" });
      fade.onfinish = cleanup;
    } else frame = requestAnimationFrame(settle);
  };
  frame = requestAnimationFrame(settle);
}
