"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { getTier, type Tier } from "@/lib/perf";

function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);
  return null;
}

const noop = () => () => {};

export function SmoothScroll({ children }: { children: ReactNode }) {
  const tier = useSyncExternalStore<Tier | null>(noop, getTier, () => null);
  // Lets CSS tone down blur and looping animations on weaker devices
  useEffect(() => {
    if (tier) document.documentElement.dataset.tier = tier;
  }, [tier]);
  // Weak devices scroll natively: smoothing every wheel tick costs main-thread time
  return (
    <ReactLenis root options={{ lerp: 0.075, smoothWheel: tier !== "low" }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
