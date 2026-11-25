"use client";

import Link from "next/link";
import { Suspense, lazy, startTransition, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { getTier, prefersReducedMotion, subscribeReducedMotion, type Tier } from "@/lib/perf";
import { scrollPageTo } from "@/lib/smoothScroll";
import type { FloorInfo } from "@/lib/tower";
import { screenHeight, useScrollProgress } from "@/lib/useScrollProgress";
import { onFirstSign, warmLayers, whenIdle } from "@/lib/whenIdle";
import type HomePanels from "./HomePanels";
import { ghostBtn, solidBtn } from "./buttons";
import { Layer } from "./Layer";
import { panelInsets } from "./layout";
import { FloorCard, LoadBadge } from "./parts";
import { clamp01 } from "./scene/math";
import { DONE_STOP, PLAN_STOP, TL, TOTAL, TOWER_STOP, ZONE_COUNT, stageAt, zoneAt, zoneStop, type Stage } from "./scene/timeline";
import { useJourney } from "./useJourney";

const noop = () => () => {};
/** The browser itself moves the parts that follow the scroll (see .tour in globals.css). */
const cssTour = () => typeof CSS !== "undefined" && CSS.supports("(animation-timeline: view()) and (not (-webkit-touch-callout: none))");
const JourneyStatic = lazy(() => import("./JourneyStatic"));
const loadPanels = () => import("./HomePanels");

type Panels = ComponentType<Parameters<typeof HomePanels>[0]>;

/**
 * Home page story: campus → tower → a floor slides out → its office → room by room.
 * One scroll drives the 3D engine and the panels over it. The first screen is all the page needs to open;
 * the panels, the engine and the models come with the first touch, move or scroll.
 */
export function HomeJourney({ floors, poster: picture }: { floors: FloorInfo[]; poster: ReactNode }) {
  const n = floors.length;
  const ref = useRef<HTMLElement>(null);
  const tier = useSyncExternalStore<Tier | null>(noop, getTier, () => null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const [floor, setFloor] = useState(0);
  const [stage, setStage] = useState<Stage>("campus");
  const [zone, setZone] = useState(0);
  const [hoverZone, setHoverZone] = useState(-1);
  const [start, setStart] = useState(false);
  const [Panels, setPanels] = useState<Panels | null>(null);

  // Scroll position in screen heights, and the elements that follow it every frame
  const u = useRef(0);
  const byCss = useRef(false);
  const warm = useRef(false);
  const scroll = useCallback(() => u.current, []);
  const hero = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const stone = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const goTo = useCallback((to: number, seconds = 1.6) => {
    const el = ref.current;
    if (el) scrollPageTo(el.offsetTop + (to / TOTAL) * (el.offsetHeight - screenHeight()), seconds);
  }, []);

  const enter = useCallback((i: number) => {
    setFloor((i + n) % n);
    goTo(PLAN_STOP, 3.2);
  }, [goTo, n]);
  const enterCurrent = useCallback(() => goTo(PLAN_STOP, 3.2), [goTo]);
  const step = useCallback((d: number) => setFloor((i) => (i + d + n) % n), [n]);

  // On a phone the first tap shows the floor and the second one enters. A mouse has shown it already.
  const pickFloor = useCallback((i: number, direct: boolean) => {
    if (direct || i === floor) enter(i);
    else setFloor(i);
  }, [floor, enter]);

  const toZone = useCallback((i: number) => {
    if (i < 0) goTo(PLAN_STOP);
    else if (i >= ZONE_COUNT) goTo(DONE_STOP);
    else goTo(zoneStop(i));
  }, [goTo]);

  const insets = useCallback((w: number, h: number) => panelInsets(w, h, ref.current), []);
  const { mountRef, engineRef, labelEls, status, progress } = useJourney({
    enabled: start && !reduced,
    tier,
    floors: n,
    floor,
    insets,
    scroll,
    events: { onHoverFloor: setFloor, onPickFloor: pickFloor, onHoverZone: setHoverZone, onPickZone: toZone },
  });
  const hoverRoom = useCallback((i: number) => engineRef.current?.setHoverZone(i), [engineRef]);

  useEffect(() => {
    byCss.current = cssTour();
  }, []);

  // The files of the panels are fetched in a quiet moment; they are built on the first sign of life
  useEffect(() => {
    if (!tier || tier === "low" || reduced) return;
    const stopFetch = whenIdle(() => void loadPanels().catch(() => {}));
    const wake = () => {
      setStart(true);
      loadPanels().then((m) => startTransition(() => setPanels(() => m.default)), () => {});
    };
    // A reload in the middle of the tour is a sign too
    const offSign = window.scrollY > 40 ? (queueMicrotask(wake), () => {}) : onFirstSign(wake);
    return () => {
      stopFetch();
      offSign();
    };
  }, [tier, reduced]);

  // Once the scene runs, the hidden panels are laid out ahead of time: no work left for the moment they appear
  useEffect(() => {
    const el = ref.current;
    if (!el || status !== "ready" || !Panels) return;
    return warmLayers(el, () => {
      warm.current = true;
      engineRef.current?.refit();
    });
  }, [status, Panels, engineRef]);

  // Texts of another floor may be longer: the picture makes room for them
  useEffect(() => {
    if (warm.current) engineRef.current?.refit();
  }, [floor, engineRef]);

  const flat = tier === "low" || reduced || status === "failed";

  useScrollProgress(ref, { start: 0, end: 1, enabled: !flat }, (p) => {
    const v = p * TOTAL;
    u.current = v;
    engineRef.current?.setScroll(v);
    setStage(stageAt(v));
    const z = zoneAt(v);
    if (z >= 0) setZone(z);
    if (stone.current) stone.current.style.opacity = clamp01((v - TL.fade[0] + 0.3) / (TL.fade[1] - TL.fade[0] + 0.3)).toFixed(3);
    if (shade.current) shade.current.style.opacity = (1 - clamp01((v - 1.9) / 0.5)).toFixed(3);
    if (byCss.current) return;
    if (hero.current && v < 1.2) hero.current.style.translate = `0 calc(var(--shift) * ${clamp01(v / 0.8).toFixed(3)})`;
    if (poster.current) poster.current.style.scale = (1 + 0.5 * clamp01((v - 0.3) / 2.1)).toFixed(4);
    if (bar.current) bar.current.style.scale = `${p.toFixed(4)} 1`;
  });

  if (flat) {
    return (
      <Suspense fallback={<div className="relative h-[100svh] overflow-hidden bg-stone">{picture}</div>}>
        <JourneyStatic floor={floor} onFloor={setFloor} poster={picture} />
      </Suspense>
    );
  }

  return (
    <section ref={ref} data-bare-header="" className="tour relative" style={{ height: `${(TOTAL + 1) * 100}svh`, "--total": TOTAL } as CSSProperties} aria-label="Tour of the DRENIX campus">
      <div className="tour-box sticky top-0 h-[100svh] overflow-hidden bg-stone">
        {/* ---------- Picture ---------- */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#a9bfdc_0%,#d7e1ea_58%,#9db06a_80%,#6d8a3d_100%)]" aria-hidden />
        <div ref={poster} className={`tour-zoom absolute inset-0 transition-[opacity,visibility] duration-700 ${status === "ready" ? "invisible opacity-0" : "opacity-100"}`}>
          {picture}
        </div>
        {status !== "ready" && <div ref={stone} className="absolute inset-0 bg-stone" style={{ opacity: 0 }} aria-hidden />}
        <div ref={mountRef} className={`absolute inset-0 transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`} />

        {/* Light behind the text */}
        <div ref={shade} className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="side-light absolute inset-0 hidden desk:block" />
          <div className={`absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-stone/95 via-stone/60 to-transparent transition-opacity duration-500 desk:hidden ${stage === "campus" ? "opacity-100" : "opacity-0"}`} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-stone/95 via-stone/65 to-transparent desk:h-32" aria-hidden />

        {/* ---------- 1. Campus ---------- */}
        <Layer on={stage === "campus"} className="pointer-events-none absolute inset-0 z-10">
          <div ref={hero} className="tour-hero container-x flex h-full flex-col pt-[88px] low:pt-[76px] desk:justify-center desk:pt-[69px] short:pt-[68px]">
            <div className="pointer-events-auto max-w-[34rem] short:max-w-[24rem]">
              <h1 className="wide text-[clamp(30px,8.6vw,44px)] leading-[1.06] text-graphite tiny:text-[27px] short:text-[26px] desk:text-[clamp(44px,4vw,64px)]">
                {["Rise to", "a new", "level"].map((l, i) => (
                  <span key={l} className="block overflow-hidden">
                    <span className="hero-rise block" style={{ animationDelay: `${i * 0.05}s` }}>{l}</span>
                  </span>
                ))}
              </h1>
              <p className="hero-up mt-4 max-w-[25rem] text-[16px] leading-relaxed text-graphite/85 low:mt-3 low:leading-normal desk:mt-6 desk:text-[18px] short:mt-3 short:max-w-[42vw] short:leading-snug">
                A ten-floor IT company. Every floor is a department. <span className="low:hidden short:hidden">Pick one and walk through its rooms to see how we work.</span>
              </p>
              <div className="hero-in mt-5 flex flex-wrap gap-2 low:mt-4 desk:mt-8 desk:gap-2.5">
                <button type="button" onClick={() => goTo(TOWER_STOP, 2)} className={`${solidBtn} max-[343px]:[&_svg]:hidden`}>
                  Choose a floor <Icon name="arrow-right" />
                </button>
                <Link href="/contact" className={ghostBtn}>Book a meeting</Link>
              </div>
            </div>
          </div>
        </Layer>

        {/* Floor card: shared by the campus and the tower */}
        <Layer on={stage === "campus" || stage === "tower"} className="pointer-events-none absolute inset-y-0 right-[calc(var(--edge)+44px)] z-10 hidden w-[290px] items-center roomy:w-[330px] pt-[69px] desk:flex">
          <div className="hero-in pointer-events-auto w-full" style={{ animationDelay: "0.1s" }}>
            <FloorCard floor={floors[floor]} onStep={step} onEnter={enterCurrent} />
          </div>
        </Layer>

        {Panels && (
          <Panels
            stage={stage}
            floor={floor}
            zone={zone}
            hoverZone={hoverZone}
            labelEls={labelEls}
            onFloor={setFloor}
            onStep={step}
            onEnter={enter}
            onEnterCurrent={enterCurrent}
            onZone={toZone}
            onHoverRoom={hoverRoom}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="container-x flex items-end justify-between gap-4 pb-4">
            <div role="status" className={`transition-opacity duration-500 ${status === "loading" ? "opacity-100" : "opacity-0"} ${stage === "tower" || stage === "zone" || stage === "done" ? "stack:hidden" : ""}`}>
              {status === "loading" && <LoadBadge progress={progress} />}
            </div>
            <button
              type="button"
              onClick={() => goTo(TOTAL + 1, 1.4)}
              className={`pointer-events-auto hidden min-h-10 items-center gap-2 rounded-full bg-white/75 px-4 text-[14px] font-medium text-graphite backdrop-blur-md transition-colors hover:bg-white desk:inline-flex ${stage === "done" ? "desk:invisible" : ""}`}
            >
              Skip the tour <Icon name="skip" />
            </button>
          </div>
          <div className="h-[3px] bg-graphite/10" aria-hidden><div ref={bar} className="tour-bar h-full origin-left bg-ember-deep" style={{ scale: "0 1" }} /></div>
        </div>
      </div>
    </section>
  );
}
