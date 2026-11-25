"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { getTier, prefersReducedMotion, subscribeReducedMotion, type Tier } from "@/lib/perf";
import { easeInOut, jumpPageTo, landingOf, scrollPageTo, setScrollEngine, stopPage } from "@/lib/smoothScroll";
import { whenIdle } from "@/lib/whenIdle";

const noop = () => () => {};

/** Scroll behaviour of the site: wheel smoothing, links to sections, position on page changes. */
export function SmoothScroll() {
  const pathname = usePathname();
  const tier = useSyncExternalStore<Tier | null>(noop, getTier, () => null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);

  // Lets CSS tone down blur and looping animations on weaker devices
  useEffect(() => {
    if (tier) document.documentElement.dataset.tier = tier;
  }, [tier]);

  // Wheel smoothing only for mice and trackpads: touch screens already scroll smoothly, and smoothing
  // every tick costs main-thread time on weak devices
  useEffect(() => {
    if (!tier || tier === "low" || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    let dead = false;
    let off = () => {};
    const cancel = whenIdle(() => {
      void import("lenis").then(({ default: Lenis }) => {
        if (dead) return;
        const lenis = new Lenis({ lerp: 0.075, autoRaf: true });
        setScrollEngine({
          scrollTo: (top, seconds) => lenis.scrollTo(top, { duration: seconds, easing: easeInOut }),
          jump: (top) => {
            lenis.resize();
            lenis.scrollTo(top, { immediate: true, force: true });
          },
          halt: () => {
            if (lenis.isScrolling === "smooth") lenis.scrollTo(window.scrollY, { immediate: true, force: true });
          },
          stop: () => lenis.stop(),
          start: () => lenis.start(),
        });
        off = () => {
          setScrollEngine(null);
          lenis.destroy();
        };
      });
    });
    return () => {
      dead = true;
      cancel();
      off();
    };
  }, [tier, reduced]);

  // Links to a section of the same page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const el = a && a.hash.length > 1 ? document.getElementById(decodeURIComponent(a.hash.slice(1))) : null;
      // The skip link has to move the focus too, so the browser handles it
      if (!a || !el || a.classList.contains("skip-link")) return;
      e.preventDefault();
      window.history.pushState(window.history.state, "", a.hash);
      scrollPageTo(landingOf(el));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // A new page starts at the top, even if the last one was still gliding. Reloads, Back and Forward keep their place.
  const last = useRef(pathname);
  const poppedAt = useRef(-1e4);
  useEffect(() => {
    const onPop = () => {
      poppedAt.current = performance.now();
      stopPage();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (window.location.hash || performance.now() - poppedAt.current < 1500) return;
    jumpPageTo(0);
  }, [pathname]);

  // Long pages arrive in pieces, so the section a link points to may not be there yet when the page opens
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      const there = !!el?.getClientRects().length;
      if (there || ++tries > 30) clearInterval(timer);
      if (there && window.scrollY < 2) jumpPageTo(landingOf(el!));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return null;
}
