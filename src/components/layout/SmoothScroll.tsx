"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { getTier, prefersReducedMotion, subscribeReducedMotion, type Tier } from "@/lib/perf";

/** A new page starts at the top, even if the last one was still gliding. Reloads and links to a section keep their place. */
function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  const last = useRef(pathname);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  // Long pages arrive in pieces, so the section a link points to may not be there yet when the page opens
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !lenis) return;
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      const there = !!el?.getClientRects().length;
      if (there || ++tries > 30) clearInterval(timer);
      if (there && window.scrollY < 2) {
        lenis.resize();
        lenis.scrollTo(el!, { immediate: true });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [lenis]);
  return null;
}

const noop = () => () => {};

export function SmoothScroll({ children }: { children: ReactNode }) {
  const tier = useSyncExternalStore<Tier | null>(noop, getTier, () => null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  // Lets CSS tone down blur and looping animations on weaker devices
  useEffect(() => {
    if (tier) document.documentElement.dataset.tier = tier;
  }, [tier]);
  // Weak devices scroll natively: smoothing every wheel tick costs main-thread time.
  // So do visitors who asked for less motion, and their anchor links jump.
  return (
    <ReactLenis root options={{ lerp: 0.075, smoothWheel: tier !== "low" && !reduced, anchors: reduced ? { immediate: true } : true }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
