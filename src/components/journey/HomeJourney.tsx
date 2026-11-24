"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { getTier, prefersReducedMotion, subscribeReducedMotion, type Tier } from "@/lib/perf";
import { floors } from "@/lib/tower";
import { screenHeight, useScrollProgress } from "@/lib/useScrollProgress";
import { JourneyStatic } from "./JourneyStatic";
import { panelInsets } from "./layout";
import { Poster } from "./Poster";
import { Directory, DonePanel, Elevator, FloorCard, FloorChips, FloorSelect, Layer, LoadBadge, PlanPanel, RoomArticle, RoomLabels, RoomNav, ghostBtn, solidBtn } from "./parts";
import { clamp01 } from "./scene/math";
import { DONE_STOP, PLAN_STOP, TL, TOTAL, TOWER_STOP, ZONE_COUNT, stageAt, zoneAt, zoneStop, type Stage } from "./scene/timeline";
import { useJourney } from "./useJourney";

const N = floors.length;
const noop = () => () => {};

/**
 * Home page story: campus → tower → a floor slides out → its office → room by room.
 * One scroll drives the 3D engine and the panels over it.
 */
export function HomeJourney() {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const tier = useSyncExternalStore<Tier | null>(noop, getTier, () => null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const [floor, setFloor] = useState(0);
  const [stage, setStage] = useState<Stage>("campus");
  const [zone, setZone] = useState(0);
  const [hoverZone, setHoverZone] = useState(-1);
  const [start, setStart] = useState(false);

  // Scroll position in screen heights, and the elements that follow it every frame
  const u = useRef(0);
  const scroll = useCallback(() => u.current, []);
  const hero = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const stone = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const goTo = useCallback((to: number, duration = 1.6) => {
    const el = ref.current;
    if (!el) return;
    const top = el.offsetTop + (to / TOTAL) * (el.offsetHeight - screenHeight());
    if (lenis) lenis.scrollTo(top, { duration });
    else window.scrollTo({ top, behavior: "smooth" });
  }, [lenis]);

  const enter = useCallback((i: number) => {
    setFloor((i + N) % N);
    goTo(PLAN_STOP, 3.2);
  }, [goTo]);

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

  const { mountRef, engineRef, labelEls, status, progress } = useJourney({
    enabled: start && !reduced,
    tier,
    floors: N,
    floor,
    insets: panelInsets,
    scroll,
    events: { onHoverFloor: setFloor, onPickFloor: pickFloor, onHoverZone: setHoverZone, onPickZone: toZone },
  });

  // WebGL is heavy, and the poster already shows the same picture: start on the first sign of life
  useEffect(() => {
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(() => setStart(true), { timeout: 300 });
      else timer = setTimeout(() => setStart(true), 50);
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);

  const flat = tier === "low" || reduced || status === "failed";

  useScrollProgress(ref, { start: 0, end: 1, enabled: !flat }, (p) => {
    const v = p * TOTAL;
    u.current = v;
    engineRef.current?.setScroll(v);
    setStage(stageAt(v));
    const z = zoneAt(v);
    if (z >= 0) setZone(z);
    if (hero.current) hero.current.style.translate = `0 ${(-60 * clamp01(v / 0.8)).toFixed(1)}px`;
    if (poster.current) poster.current.style.scale = (1 + 0.5 * clamp01((v - 0.3) / 2.1)).toFixed(4);
    if (stone.current) stone.current.style.opacity = clamp01((v - TL.fade[0] + 0.3) / (TL.fade[1] - TL.fade[0] + 0.3)).toFixed(3);
    if (shade.current) shade.current.style.opacity = (1 - clamp01((v - 1.9) / 0.5)).toFixed(3);
    if (bar.current) bar.current.style.scale = `${p.toFixed(4)} 1`;
  });

  if (flat) {
    return <JourneyStatic floor={floor} onFloor={setFloor} />;
  }

  const f = floors[floor];
  const next = floors[(floor + 1) % N];
  const inside = stage === "open" || stage === "plan" || stage === "zone" || stage === "done";
  const step = (d: number) => setFloor((i) => (i + d + N) % N);
  const hoverRoom = (i: number) => engineRef.current?.setHoverZone(i);

  return (
    <section ref={ref} data-bare-header="" className="relative" style={{ height: `${(TOTAL + 1) * 100}svh` }} aria-label="Tour of the DRENIX campus">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-stone">
        {/* ---------- Picture ---------- */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#a9bfdc_0%,#d7e1ea_58%,#9db06a_80%,#6d8a3d_100%)]" aria-hidden />
        <div ref={poster} className={`absolute inset-0 transition-opacity duration-700 ${status === "ready" ? "opacity-0" : "opacity-100"}`}>
          <Poster />
        </div>
        {status !== "ready" && <div ref={stone} className="absolute inset-0 bg-stone" style={{ opacity: 0 }} aria-hidden />}
        <div ref={mountRef} className={`absolute inset-0 transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`} />

        {/* Light behind the text */}
        <div ref={shade} className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-stone/85 via-stone/45 to-transparent lg:block" />
          <div className={`absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-stone/95 via-stone/60 to-transparent transition-opacity duration-500 lg:hidden ${stage === "campus" ? "opacity-100" : "opacity-0"}`} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-stone/95 via-stone/65 to-transparent lg:h-32" aria-hidden />

        {/* ---------- 1. Campus ---------- */}
        <Layer on={stage === "campus"} className="pointer-events-none absolute inset-0 z-10">
          <div ref={hero} className="container-x flex h-full flex-col pt-[88px] lg:justify-center lg:pt-[69px] short:pt-[68px]">
            <div className="pointer-events-auto max-w-[34rem] short:max-w-[24rem]">
              <h1 className="wide text-[clamp(30px,8.6vw,44px)] leading-[1.06] text-graphite short:text-[26px] lg:text-[clamp(44px,4vw,64px)]">
                {["Rise to", "a new", "level"].map((l, i) => (
                  <span key={l} className="block overflow-hidden">
                    <span className="hero-rise block" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>{l}</span>
                  </span>
                ))}
              </h1>
              <p className="hero-up mt-4 max-w-[25rem] text-[16px] leading-relaxed text-graphite/85 lg:mt-6 lg:text-[18px] short:mt-3 short:leading-snug">
                A ten-floor IT company. Every floor is a department. Pick one and walk through its rooms to see how we work.
              </p>
              <div className="hero-in mt-5 flex flex-wrap gap-2 lg:mt-8 lg:gap-2.5" style={{ animationDelay: "0.35s" }}>
                <button type="button" onClick={() => goTo(TOWER_STOP, 2)} className={solidBtn}>
                  Choose a floor <Icon name="arrow-right" />
                </button>
                <Link href="/contact" className={ghostBtn}>Book a meeting</Link>
              </div>
            </div>
          </div>
        </Layer>

        {/* ---------- 2. Tower: directory ---------- */}
        <Layer on={stage === "tower"} className="pointer-events-none absolute inset-0 z-10">
          <div className="container-x flex h-full flex-col justify-between pb-4 pt-[84px] lg:justify-center lg:pb-0 lg:pt-[69px]">
            <div className="pointer-events-auto max-w-[23rem] lg:w-[23rem]">
              <h2 className="wide text-[22px] leading-[1.15] text-graphite short:sr-only lg:text-[28px]">Ten floors, ten departments</h2>
              <div className="hidden lg:block">
                <Directory active={floor} onPreview={setFloor} onEnter={enter} />
              </div>
            </div>
            <div className="pointer-events-auto mx-auto w-full max-w-[560px] space-y-3 lg:hidden short:mx-0 short:w-1/2">
              <div className="short:hidden"><FloorChips active={floor} onPick={setFloor} /></div>
              <FloorCard floor={f} onStep={step} onEnter={() => enter(floor)} compact />
            </div>
          </div>
        </Layer>

        {/* Floor card: shared by the campus and the tower */}
        <Layer on={stage === "campus" || stage === "tower"} className="pointer-events-none absolute inset-y-0 right-11 z-10 hidden w-[330px] items-center pt-[69px] lg:flex">
          <div className="hero-in pointer-events-auto w-full" style={{ animationDelay: "0.5s" }}>
            <FloorCard floor={f} onStep={step} onEnter={() => enter(floor)} />
          </div>
        </Layer>

        {/* ---------- 3. Plan of the floor ---------- */}
        <Layer on={stage === "plan"} className="pointer-events-none absolute inset-0 z-10">
          <RoomLabels
            floor={f}
            active={hoverZone}
            setRef={(i) => (el) => { labelEls.current[i] = el; }}
            onHover={hoverRoom}
            onPick={toZone}
          />
        </Layer>
        <Layer on={stage === "plan"} className="pointer-events-none absolute inset-x-0 top-0 z-10 lg:inset-y-0">
          <div className="container-x flex h-full flex-col pt-[132px] lg:justify-center lg:pt-[69px] short:pt-[76px]">
            <div className="pointer-events-auto lg:w-[26rem] short:w-[46%]">
              <PlanPanel floor={f} zone={hoverZone} onHover={hoverRoom} onPick={toZone} />
            </div>
          </div>
        </Layer>
        <Layer on={stage === "plan"} className="pointer-events-none absolute inset-x-0 bottom-5 z-10 lg:hidden">
          <div className="container-x">
            <button type="button" onClick={() => toZone(0)} className={`${solidBtn} pointer-events-auto w-full short:w-[46%]`}>
              Walk through the rooms <Icon name="arrow-right" />
            </button>
          </div>
        </Layer>

        {/* ---------- 4. Rooms ---------- */}
        <Layer on={stage === "zone"} className="pointer-events-none absolute inset-0 z-10">
          <div className="container-x flex h-full flex-col justify-end pb-3 lg:justify-center lg:pb-0 lg:pt-[69px]">
            <div className="panel-light pointer-events-auto mx-auto flex max-h-[56svh] w-full max-w-[560px] flex-col rounded-2xl text-graphite lg:mx-0 lg:max-h-[calc(100svh-120px)] lg:w-[27rem] short:mx-0 short:max-h-[calc(100svh-84px)] short:w-1/2">
              <div className="overflow-y-auto p-5 pb-3 [scrollbar-width:thin] lg:p-7 lg:pb-4">
                <h2 className="sr-only">Rooms of the {f.name} floor</h2>
                <div className="grid">
                  {f.department.zones.map((z, i) => <RoomArticle key={z.id} floor={f} index={i} on={i === zone} />)}
                </div>
              </div>
              <div className="border-t border-hair px-5 py-3 lg:px-7 lg:py-4">
                <RoomNav index={zone} total={ZONE_COUNT} onGo={toZone} />
              </div>
            </div>
          </div>
        </Layer>

        {/* ---------- 5. Result ---------- */}
        <Layer on={stage === "done"} className="pointer-events-none absolute inset-0 z-10">
          <div className="container-x flex h-full flex-col justify-end pb-4 lg:justify-center lg:pb-0 lg:pt-[69px]">
            <div className="panel-light pointer-events-auto mx-auto w-full max-w-[560px] rounded-2xl p-5 lg:mx-0 lg:w-[27rem] lg:p-7 short:mx-0 short:max-h-[calc(100svh-84px)] short:w-1/2 short:overflow-y-auto">
              <DonePanel floor={f} next={next} onNext={() => enter(floor + 1)} />
            </div>
          </div>
        </Layer>

        {/* ---------- Always there inside the floor ---------- */}
        <Layer on={inside} className="pointer-events-none absolute inset-y-0 right-11 z-20 hidden items-center pt-[69px] lg:flex">
          <div className="pointer-events-auto"><Elevator active={floor} onPick={setFloor} /></div>
        </Layer>
        <Layer on={inside} className="pointer-events-none absolute inset-x-0 top-[76px] z-20 lg:hidden short:z-[60] short:top-3">
          <div className="container-x flex short:justify-center [&>*]:pointer-events-auto"><FloorSelect active={floor} onPick={setFloor} /></div>
        </Layer>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="container-x flex items-end justify-between gap-4 pb-4">
            <div role="status" className={`transition-opacity duration-500 ${status === "loading" ? "opacity-100" : "opacity-0"} ${stage === "tower" || stage === "zone" || stage === "done" ? "max-lg:hidden" : ""}`}>
              {status === "loading" && <LoadBadge progress={progress} />}
            </div>
            <button
              type="button"
              onClick={() => goTo(TOTAL + 1, 1.4)}
              className={`pointer-events-auto hidden min-h-10 items-center gap-2 rounded-full bg-white/75 px-4 text-[14px] font-medium text-graphite backdrop-blur-md transition-colors hover:bg-white lg:inline-flex ${stage === "done" ? "lg:invisible" : ""}`}
            >
              Skip the tour <Icon name="skip" />
            </button>
          </div>
          <div className="h-[3px] bg-graphite/10" aria-hidden><div ref={bar} className="h-full origin-left bg-ember-deep" style={{ scale: "0 1" }} /></div>
        </div>
      </div>
    </section>
  );
}
