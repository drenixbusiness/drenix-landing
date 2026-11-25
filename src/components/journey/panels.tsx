"use client";

import Link from "next/link";
import { memo, useEffect, useRef } from "react";
import { Icon, zoneIcon } from "@/components/ui/Icon";
import type { Floor, FloorInfo } from "@/lib/tower";
import { solidBtn, textBtn } from "./buttons";

/* ---------- Directory of floors ---------- */

export const Directory = memo(function Directory({ floors, active, onPreview, onEnter }: { floors: FloorInfo[]; active: number; onPreview: (i: number) => void; onEnter: (i: number) => void }) {
  return (
    <ul className="mt-5">
      {floors.map((f, i) => {
        const on = i === active;
        return (
          <li key={f.slug}>
            <button
              type="button"
              aria-pressed={on}
              onMouseEnter={() => onPreview(i)}
              onFocus={() => onPreview(i)}
              onClick={() => onEnter(i)}
              className={`group flex min-h-[42px] w-full items-center gap-4 rounded-lg px-3 text-left transition-colors ${on ? "bg-white/85 text-graphite shadow-[0_8px_30px_-18px_rgba(20,20,20,0.5)]" : "text-graphite/80 hover:text-graphite"}`}
            >
              <span className={`tabular w-6 text-[14px] ${on ? "text-ember-text" : ""}`}>{f.level}</span>
              <span className={`flex-1 text-[17px] ${on ? "font-semibold" : ""}`}>{f.name}</span>
              <Icon name="arrow-right" className={`size-4 transition-all ${on ? "opacity-100" : "-translate-x-2 opacity-0"}`} />
            </button>
          </li>
        );
      })}
    </ul>
  );
});

/** Same choice as a strip of chips, for small screens. */
export const FloorChips = memo(function FloorChips({ floors, active, onPick }: { floors: FloorInfo[]; active: number; onPick: (i: number) => void }) {
  const row = useRef<HTMLDivElement>(null);
  // The chosen floor stays in view, also when it was chosen on the tower
  useEffect(() => {
    const el = row.current;
    if (!el?.clientWidth) return;
    const chip = el.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (chip) el.scrollTo({ left: chip.offsetLeft - (el.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);
  return (
    <div ref={row} className="relative -mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2 pb-1">
        {floors.map((f, i) => (
          <button
            key={f.slug}
            type="button"
            aria-pressed={i === active}
            onClick={() => onPick(i)}
            className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] transition-colors ${i === active ? "border-graphite bg-graphite text-white" : "border-graphite/20 bg-white/85 text-graphite"}`}
          >
            <span className="tabular text-[13px] opacity-75">{f.level}</span>
            {f.name}
          </button>
        ))}
      </div>
    </div>
  );
});

/* ---------- Inside the floor ---------- */

/** Lift panel: change the floor without leaving the office. */
export const Elevator = memo(function Elevator({ floors, active, onPick }: { floors: FloorInfo[]; active: number; onPick: (i: number) => void }) {
  return (
    <nav aria-label="Change floor" className="flex flex-col gap-1 rounded-full border border-hair bg-white/90 p-1.5">
      {floors.map((f, i) => (
        <button
          key={f.slug}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`Floor ${f.level}: ${f.name}`}
          aria-current={i === active ? "true" : undefined}
          className={`tabular group relative grid size-9 place-items-center rounded-full text-[13px] pointer-coarse:size-11 transition-colors ${i === active ? "bg-ember-deep text-white" : "text-graphite/80 hover:bg-graphite hover:text-white"}`}
        >
          {f.level}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-graphite px-3 py-1.5 text-[13px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
            {f.name}
          </span>
        </button>
      ))}
    </nav>
  );
});

/** Native select: the lift panel on small screens. */
export const FloorSelect = memo(function FloorSelect({ floors, active, onPick }: { floors: FloorInfo[]; active: number; onPick: (i: number) => void }) {
  return (
    <label className="relative inline-flex min-h-11 items-center gap-2 rounded-full border border-hair bg-white/90 pl-4 pr-10 text-[15px] font-medium text-graphite focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ember-deep">
      <span className="sr-only">Change floor</span>
      <select value={active} onChange={(e) => onPick(Number(e.target.value))} className="absolute inset-0 w-full cursor-pointer appearance-none rounded-full text-[16px] opacity-0">
        {floors.map((f, i) => (
          <option key={f.slug} value={i}>{`${f.level}  ${f.name}`}</option>
        ))}
      </select>
      <span className="tabular text-ember-text" aria-hidden>{floors[active].level}</span>
      <span aria-hidden>{floors[active].name}</span>
      <Icon name="arrow-down" className="pointer-events-none absolute right-3.5 size-4" />
    </label>
  );
});

export const PlanPanel = memo(function PlanPanel({ floor, zone, onHover, onPick }: { floor: Floor; zone: number; onHover: (i: number) => void; onPick: (i: number) => void }) {
  const d = floor.department;
  return (
    <div className="text-graphite">
      <h2 className="wide text-[26px] leading-[1.1] desk:text-[34px]">{d.name}</h2>
      <p className="mt-3 max-w-[26rem] text-[16px] leading-relaxed text-smoke low:hidden short:text-[15px] short:leading-snug desk:text-[17px]">{d.about}</p>
      <ol className="mt-6 hidden desk:block">
        {d.zones.map((z, i) => (
          <li key={z.id}>
            <button
              type="button"
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(-1)}
              onFocus={() => onHover(i)}
              onBlur={() => onHover(-1)}
              onClick={() => onPick(i)}
              className={`flex min-h-[46px] w-full items-center gap-4 border-b border-hair py-2 text-left transition-colors ${zone === i ? "text-ember-text" : "hover:text-ember-text"}`}
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
  );
});

export const DonePanel = memo(function DonePanel({ floor, next, onNext }: { floor: Floor; next: FloorInfo; onNext: () => void }) {
  return (
    <div className="text-graphite">
      <h2 className="wide text-[23px] leading-[1.15] snug:text-[clamp(14px,4.4vw,20px)] short:text-[17px] flat:text-[15px] desk:text-[30px] squat:text-[22px]">What you take home</h2>
      <ul className="mt-4 low:mt-2 short:mt-1.5 flat:grid flat:grid-cols-2 flat:gap-x-4 desk:mt-6 squat:mt-3">
        {floor.deliverables.map((d) => (
          <li key={d} className="flex items-center gap-3 border-b border-hair py-2 text-[16px] leading-snug low:py-1.5 low:text-[15px] short:py-1 short:text-[14px] flat:gap-1.5 flat:border-0 flat:py-0.5 flat:text-[13px] desk:py-2.5 squat:py-1.5">
            <Icon name="check" className="size-4 text-ember-text" /> {d}
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-3 text-[15px] leading-snug text-smoke low:mt-2.5 low:text-[14px] short:hidden squat:mt-2.5">
        <Icon name="clock" className="size-5" /> {floor.timeline}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 low:mt-3 short:mt-2 desk:gap-2.5 squat:mt-3">
        <Link href={`/contact?service=${floor.slug}`} className={`${solidBtn} w-full desk:w-auto`}>Start with {floor.name} <Icon name="arrow-right" /></Link>
        <Link href={`/services/${floor.slug}`} className="inline-flex min-h-11 items-center text-[15px] low:text-[14px] font-medium underline decoration-graphite/30 underline-offset-4 hover:decoration-graphite desk:min-h-12 desk:rounded-full desk:border desk:border-graphite/25 desk:bg-white/60 desk:px-5 desk:no-underline desk:transition-colors desk:hover:border-graphite desk:hover:bg-white">Department page</Link>
        <button type="button" onClick={onNext} className={`${textBtn} low:text-[14px] stack:[&>svg]:hidden`}>
          <Icon name="arrow-down" /> <span>Next<span className="stack:hidden"> floor</span>: {next.name}</span>
        </button>
      </div>
    </div>
  );
});
