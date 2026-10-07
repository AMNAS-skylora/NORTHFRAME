// Full animations are the site's default on every device, including browsers
// requesting reduced motion. Keep one shared query for all GSAP consumers.
export function getReducedMotionQuery(): string {
  return "(max-width: -1px)";
}
