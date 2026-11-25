import { prefersReducedMotion } from "./perf";

/**
 * Smooth scrolling for the whole site. Touch screens scroll natively and only the programmed moves are
 * animated here; on computers Lenis takes over once it is loaded (see SmoothScroll).
 */
type Engine = {
  scrollTo: (top: number, seconds: number) => void;
  jump: (top: number) => void;
  /** Ends a move that is still running. */
  halt: () => void;
  stop: () => void;
  start: () => void;
};

let engine: Engine | null = null;
export const setScrollEngine = (e: Engine | null) => {
  engine = e;
};

/** Slow start, slow end: the 3D camera follows the scroll position. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2);

let raf = 0;
const interrupts = ["touchstart", "wheel", "keydown"] as const;

function stopGlide() {
  cancelAnimationFrame(raf);
  for (const e of interrupts) window.removeEventListener(e, stopGlide);
}

function glide(top: number, seconds: number) {
  stopGlide();
  const from = window.scrollY, t0 = performance.now();
  for (const e of interrupts) window.addEventListener(e, stopGlide, { passive: true });
  const step = (now: number) => {
    const t = Math.min(1, Math.max(0, now - t0) / (seconds * 1000));
    window.scrollTo(0, from + (top - from) * easeInOut(t));
    if (t < 1) raf = requestAnimationFrame(step);
    else stopGlide();
  };
  raf = requestAnimationFrame(step);
}

/** Animated move. Any touch, wheel tick or key press from the visitor stops it. */
export function scrollPageTo(top: number, seconds = 1.4) {
  if (prefersReducedMotion()) window.scrollTo(0, top);
  else if (engine) engine.scrollTo(top, seconds);
  else glide(top, seconds);
}

/** Immediate move, also ends a glide that is still running. */
export function jumpPageTo(top: number) {
  stopGlide();
  if (engine) engine.jump(top);
  else window.scrollTo(0, top);
}

/** Ends a glide that is still running, where it is. */
export function stopPage() {
  stopGlide();
  engine?.halt();
}

/** Where an element lands, respecting scroll-margin and the fixed header. */
export function landingOf(el: Element) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin - padding);
}

/** Open menu: the page behind it stays where it is. */
export function lockPage(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) engine?.stop();
  else engine?.start();
}
