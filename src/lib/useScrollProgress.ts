"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Height of the screen that does not change when a phone hides its address bar. */
export const screenHeight = () => document.documentElement.clientHeight;

/**
 * Progress of an element through the screen, 0..1, at most once per frame and only when it changes.
 * It is 0 while the top of the element is at `start` (share of the screen height) and 1 when its bottom is at `end`.
 */
export function useScrollProgress(ref: RefObject<Element | null>, { start, end, enabled = true }: { start: number; end: number; enabled?: boolean }, onChange: (p: number) => void) {
  const live = useRef(onChange);
  useEffect(() => {
    live.current = onChange;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let raf = 0, last = -1;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const h = screenHeight();
      const p = Math.min(1, Math.max(0, (h * start - r.top) / (r.height - h * end + h * start)));
      if (p === last) return;
      last = p;
      live.current(p);
    };
    const ask = () => {
      raf ||= requestAnimationFrame(read);
    };
    ask();
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    const ro = new ResizeObserver(ask);
    ro.observe(el);
    return () => {
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", ask);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, start, end, enabled]);
}
