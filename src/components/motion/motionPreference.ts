export const MOTION_STORAGE_KEY = "northframe:full-motion";

// Read the explicit site preference before components initialize their timelines.
// A reload after changes lets every GSAP context start and clean up normally.
export function getReducedMotionQuery(): string {
  if (typeof document !== "undefined" && document.documentElement.dataset.motion === "full") {
    return "(max-width: -1px)";
  }
  return "(prefers-reduced-motion: reduce)";
}

export const MOTION_BOOTSTRAP = `try{if(localStorage.getItem("${MOTION_STORAGE_KEY}")==="true"){document.documentElement.dataset.motion="full"}}catch{}`;
