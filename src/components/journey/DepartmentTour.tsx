"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon, zoneIcon } from "@/components/ui/Icon";
import { getTier, prefersReducedMotion, subscribeReducedMotion, type Tier } from "@/lib/perf";
import { floorIndex, floors } from "@/lib/tower";
import { screenHeight, useScrollProgress } from "@/lib/useScrollProgress";
import { RoomGrid } from "./RoomGrid";
import { panelInsets, roomStill } from "./layout";
import { Layer, RoomArticle, RoomLabels, RoomNav, solidBtn } from "./parts";
import { PLAN_STOP, ZONES_END, ZONE_COUNT, stageAt, zoneAt, zoneStop } from "./scene/timeline";
import { useJourney } from "./useJourney";

const noop = () => () => {};
const START = 3.72;
const END = ZONES_END - 0.06;

/**
 * Department page: the office of this floor, room by room.
 * Text is always in the page; the 3D model loads when the section comes close.
 */
export function DepartmentTour({ slug }: { slug: string }) {
  const floor = floorIndex(slug);
  const f = floors[floor];
  const d = f.department;
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
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
    const box = el.getBoundingClientRect();
    const top = window.scrollY + box.top + ((to - START) / (END - START)) * (el.offsetHeight - screenHeight());
    if (lenis) lenis.scrollTo(top, { duration: 1.4 });
    else window.scrollTo({ top, behavior: "smooth" });
  }, [lenis]);

  const toZone = useCallback((i: number) => {
    if (i < 0) goTo(PLAN_STOP - 0.1);
    else if (i >= ZONE_COUNT) goTo(END + 1.1);
    else goTo(zoneStop(i));
  }, [goTo]);

  const { mountRef, engineRef, labelEls, status } = useJourney({
    enabled: near && !reduced,
    tier,
    floors: floors.length,
    floor,
    mode: "office",
    insets: panelInsets,
    scroll,
    events: { onHoverZone: setHoverZone, onPickZone: toZone },
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: "60% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

  const hoverRoom = (i: number) => engineRef.current?.setHoverZone(i);

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
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-stone">
        {/* Stills keep the place until the 3D office is ready */}
        {status !== "ready" && (
          <div className="absolute inset-x-0 top-[120px] px-4 lg:inset-y-0 lg:left-[470px] lg:right-[84px] lg:top-0 lg:grid lg:place-items-center lg:px-0" aria-hidden>
            <Image src={roomStill(plan ? "plan" : d.zones[zone].id)} alt="" width={1200} height={860} quality={75} sizes="(min-width: 1024px) 60vw, 100vw" className="mx-auto h-auto max-h-[70svh] w-full max-w-[900px] object-contain mix-blend-multiply" />
          </div>
        )}
        <div ref={mountRef} className={`absolute inset-0 transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-stone/95 via-stone/60 to-transparent" aria-hidden />

        <Layer on={plan && status === "ready"} className="pointer-events-none absolute inset-0 z-10">
          <RoomLabels floor={f} active={hoverZone} setRef={(i) => (el) => { labelEls.current[i] = el; }} onHover={hoverRoom} onPick={toZone} />
        </Layer>

        <Layer on={plan} className="pointer-events-none absolute inset-x-0 top-0 z-10 lg:inset-y-0">
          <div className="container-x flex h-full flex-col pt-[92px] lg:justify-center lg:pt-[69px]">
            <div className="pointer-events-auto lg:w-[26rem] short:w-[46%]">
              <h2 className="wide text-[26px] leading-[1.1] lg:text-[34px]">Room by room</h2>
              <p className="mt-3 max-w-[26rem] text-[16px] leading-relaxed text-smoke lg:text-[17px]">
                A project crosses the floor from the first talk to the result. Scroll, or pick a room.
              </p>
              <ol className="mt-6 hidden lg:block">
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
        <Layer on={plan} className="pointer-events-none absolute inset-x-0 bottom-5 z-10 lg:hidden">
          <div className="container-x">
            <button type="button" onClick={() => toZone(0)} className={`${solidBtn} pointer-events-auto w-full short:w-[46%]`}>
              Walk through the rooms <Icon name="arrow-right" />
            </button>
          </div>
        </Layer>

        <Layer on={!plan} className="pointer-events-none absolute inset-0 z-10">
          <div className="container-x flex h-full flex-col justify-end pb-3 lg:justify-center lg:pb-0 lg:pt-[69px]">
            <div className="panel-light pointer-events-auto mx-auto flex max-h-[56svh] w-full max-w-[560px] flex-col rounded-2xl lg:mx-0 lg:max-h-[calc(100svh-120px)] lg:w-[27rem] short:mx-0 short:max-h-[calc(100svh-84px)] short:w-1/2">
              <div className="overflow-y-auto p-5 pb-3 [scrollbar-width:thin] lg:p-7 lg:pb-4">
                <div className="grid">
                  {d.zones.map((z, i) => <RoomArticle key={z.id} floor={f} index={i} on={i === zone} />)}
                </div>
              </div>
              <div className="border-t border-hair px-5 py-3 lg:px-7 lg:py-4">
                <RoomNav index={zone} total={ZONE_COUNT} onGo={toZone} />
              </div>
            </div>
          </div>
        </Layer>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="container-x hidden justify-end pb-4 lg:flex">
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
