"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon, zoneIcon } from "@/components/ui/Icon";
import { getTier, prefersReducedMotion, subscribeReducedMotion, type Tier } from "@/lib/perf";
import { scrollPageTo } from "@/lib/smoothScroll";
import type { Floor } from "@/lib/tower";
import { screenHeight, useScrollProgress } from "@/lib/useScrollProgress";
import { onFirstSign, warmLayers } from "@/lib/whenIdle";
import { RoomGrid } from "./RoomGrid";
import { panelInsets, roomStill } from "./layout";
import { solidBtn } from "./buttons";
import { Layer } from "./Layer";
import { RoomArticle, RoomLabels, RoomNav } from "./rooms";
import { PLAN_STOP, ZONES_END, ZONE_COUNT, stageAt, zoneAt, zoneStop } from "./scene/timeline";
import { useJourney } from "./useJourney";

const noop = () => () => {};
const START = 3.72;
const END = ZONES_END - 0.06;

/**
 * Department page: the office of this floor, room by room.
 * Text is always in the page; the 3D model loads when the visitor is there and the section comes close.
 */
export function DepartmentTour({ floor: f, index, total }: { floor: Pick<Floor, "name" | "department">; index: number; total: number }) {
  const d = f.department;
  const ref = useRef<HTMLElement>(null);
  const tier = useSyncExternalStore<Tier | null>(noop, getTier, () => null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const [near, setNear] = useState(false);
  const [plan, setPlan] = useState(true);
  const [zone, setZone] = useState(0);
  const [hoverZone, setHoverZone] = useState(-1);

  const u = useRef(START);
  const scroll = useCallback(() => u.current, []);
  const bar = useRef<HTMLDivElement>(null);

  const goTo = useCallback((to: number) => {
    const el = ref.current;
    if (!el) return;
    scrollPageTo(window.scrollY + el.getBoundingClientRect().top + ((to - START) / (END - START)) * (el.offsetHeight - screenHeight()));
  }, []);

  const toZone = useCallback((i: number) => {
    if (i < 0) goTo(PLAN_STOP - 0.1);
    else if (i >= ZONE_COUNT) goTo(END + 1.1);
    else goTo(zoneStop(i));
  }, [goTo]);

  const insets = useCallback((w: number, h: number) => panelInsets(w, h, ref.current), []);
  const { mountRef, engineRef, labelEls, status } = useJourney({
    enabled: near && !reduced,
    tier,
    floors: total,
    floor: index,
    mode: "office",
    insets,
    scroll,
    events: { onHoverZone: setHoverZone, onPickZone: toZone },
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let close = false, awake = window.scrollY > 40;
    const go = () => {
      if (close && awake) setNear(true);
    };
    const io = new IntersectionObserver(([e]) => {
      close = e.isIntersecting;
      go();
    }, { rootMargin: "60% 0px" });
    io.observe(el);
    const off = onFirstSign(() => {
      awake = true;
      go();
    });
    return () => {
      io.disconnect();
      off();
    };
  }, []);

  // Panels that are still hidden are laid out ahead of time, once the scene runs
  useEffect(() => {
    const el = ref.current;
    if (!el || status !== "ready") return;
    return warmLayers(el, () => engineRef.current?.refit());
  }, [status, engineRef]);

  const flat = tier === "low" || reduced || status === "failed";

  useScrollProgress(ref, { start: 0, end: 1, enabled: !flat }, (p) => {
    const v = START + p * (END - START);
    u.current = v;
    engineRef.current?.setScroll(v);
    setPlan(stageAt(v) !== "zone");
    const z = zoneAt(v);
    if (z >= 0) setZone(z);
    if (bar.current) bar.current.style.scale = `${p.toFixed(4)} 1`;
  });

  const hoverRoom = useCallback((i: number) => engineRef.current?.setHoverZone(i), [engineRef]);

  if (flat) {
    return (
      <section ref={ref} id="rooms" className="container-x scroll-mt-[-72px] py-20 md:py-28" aria-label={`Rooms of the ${f.name} floor`}>
        <h2 className="wide text-[26px] leading-[1.12] md:text-[38px]">Room by room</h2>
        <div className="mt-12"><RoomGrid department={d} /></div>
      </section>
    );
  }

  return (
    <section ref={ref} id="rooms" data-bare-header="" className="relative scroll-mt-[-88px]" style={{ height: `${((END - START) * 0.92 + 1) * 100}svh` }} aria-label={`Rooms of the ${f.name} floor`}>
      <div className="tour-box sticky top-0 h-[100svh] overflow-hidden bg-stone">
        {/* Stills keep the place until the 3D office is ready */}
        {status !== "ready" && (
          <div className="absolute inset-x-0 top-[120px] px-4 desk:inset-y-0 desk:left-[470px] desk:right-[84px] desk:top-0 desk:grid desk:place-items-center desk:px-0" aria-hidden>
            <Image src={roomStill(plan ? "plan" : d.zones[zone].id)} alt="" width={1200} height={860} quality={75} sizes="(min-width: 1024px) 60vw, 100vw" className="mx-auto h-auto max-h-[70svh] w-full max-w-[900px] object-contain mix-blend-multiply" />
          </div>
        )}
        <div ref={mountRef} className={`absolute inset-0 transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-stone/95 via-stone/60 to-transparent" aria-hidden />

        <Layer on={plan && status === "ready"} className="pointer-events-none absolute inset-0 z-10">
          <RoomLabels floor={f} active={hoverZone} els={labelEls} onHover={hoverRoom} onPick={toZone} />
        </Layer>

        <Layer on={plan} className="pointer-events-none absolute inset-x-0 top-0 z-10 desk:inset-y-0">
          <div className="container-x flex h-full flex-col pt-[92px] desk:justify-center desk:pt-[69px]">
            <div data-block="plan" className="pointer-events-auto desk:w-[26rem] short:w-[46%]">
              <h2 className="wide text-[26px] leading-[1.1] desk:text-[34px]">Room by room</h2>
              <p className="mt-3 max-w-[26rem] text-[16px] leading-relaxed text-smoke desk:text-[17px]">
                A project crosses the floor from the first talk to the result. Scroll, or pick a room.
              </p>
              <ol className="mt-6 hidden desk:block">
                {d.zones.map((z, i) => (
                  <li key={z.id}>
                    <button
                      type="button"
                      onMouseEnter={() => hoverRoom(i)}
                      onMouseLeave={() => hoverRoom(-1)}
                      onFocus={() => hoverRoom(i)}
                      onBlur={() => hoverRoom(-1)}
                      onClick={() => toZone(i)}
                      className={`flex min-h-[46px] w-full items-center gap-4 border-b border-hair py-2 text-left transition-colors ${hoverZone === i ? "text-ember-text" : "hover:text-ember-text"}`}
                    >
                      <Icon name={zoneIcon[z.id]} className="size-5" />
                      <span className="w-[9.5rem] text-[15px] font-semibold">{z.room}</span>
                      <span className="flex-1 text-[14px] leading-snug text-smoke">{z.output}</span>
                      <Icon name="arrow-right" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Layer>
        <Layer on={plan} className="pointer-events-none absolute inset-x-0 bottom-5 z-10 desk:hidden">
          <div className="container-x">
            <button type="button" onClick={() => toZone(0)} className={`${solidBtn} pointer-events-auto w-full short:w-[46%]`}>
              Walk through the rooms <Icon name="arrow-right" />
            </button>
          </div>
        </Layer>

        <Layer on={!plan} className="pointer-events-none absolute inset-0 z-10">
          <div className="container-x flex h-full flex-col justify-end pb-3 desk:justify-center desk:pb-0 desk:pt-[69px]">
            <div data-block="zone" className="panel-light pointer-events-auto mx-auto flex max-h-[66svh] w-full max-w-[560px] flex-col rounded-2xl desk:mx-0 desk:max-h-[calc(100svh-120px)] desk:w-[27rem] short:mx-0 short:max-h-[calc(100svh-84px)] short:w-1/2">
              <div className="overflow-y-auto p-5 pb-3 [scrollbar-width:thin] low:p-4 low:pb-2 short:p-4 short:pb-2 flat:p-3 flat:pb-1.5 desk:p-7 desk:pb-4 squat:p-5 squat:pb-3">
                <div className="grid">
                  {d.zones.map((z, i) => <RoomArticle key={z.id} floor={f} index={i} on={i === zone} />)}
                </div>
              </div>
              <div className="border-t border-hair px-5 py-3 low:px-4 low:py-2 short:px-4 short:py-1.5 flat:py-0.5 desk:px-7 desk:py-4 squat:px-5 squat:py-2.5">
                <RoomNav index={zone} total={ZONE_COUNT} onGo={toZone} />
              </div>
            </div>
          </div>
        </Layer>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="container-x hidden justify-end pb-4 desk:flex">
            <button type="button" onClick={() => toZone(ZONE_COUNT)} className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full bg-white/75 px-4 text-[14px] font-medium transition-colors hover:bg-white">
              Skip the rooms <Icon name="skip" />
            </button>
          </div>
          <div className="h-[3px] bg-graphite/10" aria-hidden><div ref={bar} className="h-full origin-left bg-ember-deep" style={{ scale: "0 1" }} /></div>
        </div>
      </div>
    </section>
  );
}
