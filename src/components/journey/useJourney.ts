"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { canRender3D, type Tier } from "@/lib/perf";
import type { Journey, JourneyEvents, JourneyOptions } from "./scene/engine";

export type JourneyStatus = "idle" | "loading" | "ready" | "failed";

type Options = {
  enabled: boolean;
  tier: Tier | null;
  floors: number;
  floor: number;
  mode?: JourneyOptions["mode"];
  insets?: JourneyOptions["insets"];
  events?: Pick<JourneyEvents, "onHoverFloor" | "onPickFloor" | "onHoverZone" | "onPickZone">;
  /** Current scroll position, read when the engine starts. */
  scroll: () => number;
};

/**
 * Creates the 3D engine when it is needed, in its own JavaScript chunk, and destroys it when the
 * page is hidden. With Cache Components a hidden page keeps its React state, so the status is reset too.
 */
export function useJourney({ enabled, tier, floors, floor, mode = "full", insets, events, scroll }: Options): {
  mountRef: RefObject<HTMLDivElement | null>;
  engineRef: RefObject<Journey | null>;
  labelEls: RefObject<(HTMLElement | null)[]>;
  status: JourneyStatus;
  progress: number;
} {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Journey | null>(null);
  const labelEls = useRef<(HTMLElement | null)[]>([]);
  const [status, setStatus] = useState<JourneyStatus>("idle");
  const [progress, setProgress] = useState(0);

  // Latest values for callbacks that outlive a render
  const live = useRef({ events, floor, insets, scroll });
  useEffect(() => {
    live.current = { events, floor, insets, scroll };
  });

  useEffect(() => {
    if (!enabled || !tier || tier === "low") return;
    let dead = false;
    let engine: Journey | null = null;
    let shown = 0;
    // A software renderer would stutter: the pictures take over, and the engine is not even downloaded
    const engineFile = canRender3D() ? import("./scene/engine") : Promise.reject(new Error("WebGL 2 is not available"));
    void engineFile.then(({ Journey }) => {
      const mount = mountRef.current;
      if (dead || !mount) return;
      setStatus("loading");
      try {
        engine = new Journey(
          mount,
          { tier, floors, floor: live.current.floor, mode, insets: (w, h) => live.current.insets?.(w, h) ?? { tower: ZERO, plan: ZERO, zone: ZERO } },
          {
            onProgress: (f) => {
              // Enough for a percentage label; not a render per network packet
              if (f - shown < 0.04 && f < 1) return;
              shown = f;
              setProgress(f);
            },
            onReady: () => setStatus("ready"),
            onError: () => setStatus("failed"),
            onHoverFloor: (i) => live.current.events?.onHoverFloor?.(i),
            onPickFloor: (i, direct) => live.current.events?.onPickFloor?.(i, direct),
            onHoverZone: (i) => live.current.events?.onHoverZone?.(i),
            onPickZone: (i) => live.current.events?.onPickZone?.(i),
          },
        );
        engine.labelEls = labelEls.current;
        engine.setScroll(live.current.scroll());
        engineRef.current = engine;
      } catch {
        setStatus("failed");
      }
    }, () => {
      if (!dead) setStatus("failed");
    });
    return () => {
      dead = true;
      engine?.dispose();
      engineRef.current = null;
      setStatus("idle");
      setProgress(0);
    };
  }, [enabled, tier, floors, mode]);

  useEffect(() => {
    engineRef.current?.setFloor(floor);
  }, [floor, status]);

  return { mountRef, engineRef, labelEls, status, progress };
}

const ZERO = { left: 0, right: 0, top: 0, bottom: 0 };
