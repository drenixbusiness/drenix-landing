"use client";

import Link from "next/link";
import type { ReactNode, Ref } from "react";
import { Icon, departmentIcon, zoneIcon } from "@/components/ui/Icon";
import { floors, type Floor } from "@/lib/tower";

/** Fades a panel in and out. Hidden panels cannot be focused or read, and cost no layout. */
export function Layer({ on, className = "", children }: { on: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      inert={!on}
      className={`transition-[opacity,translate,visibility,content-visibility] ease-out-expo [transition-behavior:allow-discrete] ${on ? "visible translate-y-0 opacity-100 duration-500" : "invisible translate-y-3 opacity-0 duration-200 [content-visibility:hidden]"} ${className}`}
    >
      {children}
    </div>
  );
}

const roundBtn =
  "grid size-11 shrink-0 place-items-center rounded-full border border-graphite/20 bg-white/70 text-graphite transition-colors hover:border-graphite hover:bg-graphite hover:text-white";
export const solidBtn =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-graphite px-5 text-[15px] font-medium text-white transition-colors hover:bg-ember-deep";
export const ghostBtn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-graphite/25 bg-white/60 px-5 text-[15px] font-medium text-graphite backdrop-blur-md transition-colors hover:border-graphite hover:bg-white";
const textBtn =
  "inline-flex min-h-11 items-center gap-2 text-[15px] font-medium underline decoration-graphite/30 underline-offset-4 hover:decoration-graphite";

/* ---------- Floor card (hero and tower) ---------- */

export function FloorCard({ floor, onStep, onEnter, compact = false }: { floor: Floor; onStep: (d: number) => void; onEnter: () => void; compact?: boolean }) {
  return (
    <div className="panel-light rounded-2xl p-5 text-graphite">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="wide tabular text-[44px] leading-none">{floor.level}</span>
          <span className="grid size-10 place-items-center rounded-full bg-ember/15 text-ember-text">
            <Icon name={departmentIcon[floor.slug]} className="size-5" />
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" className={roundBtn} onClick={() => onStep(-1)} aria-label="One floor up"><Icon name="arrow-up" /></button>
          <button type="button" className={roundBtn} onClick={() => onStep(1)} aria-label="One floor down"><Icon name="arrow-down" /></button>
        </div>
      </div>
      <p className="mt-4 text-[20px] font-semibold leading-tight">{floor.name}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-smoke">{floor.lead}</p>
      {!compact && (
        <dl className="mt-4 border-t border-hair text-[14px]">
          {floor.specs.slice(0, 3).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-hair py-2.5">
              <dt className="text-smoke">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button type="button" onClick={onEnter} className={`${solidBtn} flex-1 justify-between`}>
          Enter the floor <Icon name="arrow-right" />
        </button>
        {!compact && <Link href={`/services/${floor.slug}`} className={textBtn}>Details</Link>}
      </div>
    </div>
  );
}

/* ---------- Directory of floors ---------- */

export function Directory({ active, onPreview, onEnter }: { active: number; onPreview: (i: number) => void; onEnter: (i: number) => void }) {
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
}

/** Same choice as a strip of chips, for small screens. */
export function FloorChips({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
}

/* ---------- Inside the floor ---------- */

/** Lift panel: change the floor without leaving the office. */
export function Elevator({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  return (
    <nav aria-label="Change floor" className="flex flex-col gap-1 rounded-full border border-hair bg-white/80 p-1.5 backdrop-blur-md">
      {floors.map((f, i) => (
        <button
          key={f.slug}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`Floor ${f.level}: ${f.name}`}
          aria-current={i === active ? "true" : undefined}
          className={`tabular group relative grid size-9 place-items-center rounded-full text-[13px] transition-colors ${i === active ? "bg-ember-deep text-white" : "text-graphite/80 hover:bg-graphite hover:text-white"}`}
        >
          {f.level}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-graphite px-3 py-1.5 text-[13px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
            {f.name}
          </span>
        </button>
      ))}
    </nav>
  );
}

/** Native select: the lift panel on small screens. */
export function FloorSelect({ active, onPick }: { active: number; onPick: (i: number) => void }) {
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
}

export function PlanPanel({ floor, zone, onHover, onPick }: { floor: Floor; zone: number; onHover: (i: number) => void; onPick: (i: number) => void }) {
  const d = floor.department;
  return (
    <div className="text-graphite">
      <h2 className="wide text-[26px] leading-[1.1] lg:text-[34px]">{d.name}</h2>
      <p className="mt-3 max-w-[26rem] text-[16px] leading-relaxed text-smoke lg:text-[17px]">{d.about}</p>
      <ol className="mt-6 hidden lg:block">
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
}

/** Room labels on the plan. The engine moves them; the list beside the plan is their keyboard version. */
export function RoomLabels({ floor, active, setRef, onHover, onPick }: { floor: Floor; active: number; setRef: (i: number) => Ref<HTMLDivElement>; onHover: (i: number) => void; onPick: (i: number) => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {floor.department.zones.map((z, i) => (
        <div key={z.id} ref={setRef(i)} className="absolute left-0 top-0 will-change-transform">
          <span className="absolute -left-1 -top-1 size-2 rounded-full bg-graphite ring-4 ring-white/70" />
          <span className="absolute bottom-0 left-0 h-9 w-px -translate-y-1 bg-graphite/50" />
          <button
            type="button"
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(-1)}
            onFocus={() => onHover(i)}
            onBlur={() => onHover(-1)}
            onClick={() => onPick(i)}
            aria-label={`${z.room}: ${z.title}`}
            className={`pointer-events-auto absolute bottom-10 left-0 flex min-h-10 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full p-1.5 text-[14px] font-medium shadow-[0_8px_24px_-8px_rgba(20,20,20,0.4)] transition-colors sm:pr-4 ${active === i ? "bg-graphite text-white" : "bg-white text-graphite hover:bg-graphite hover:text-white"}`}
          >
            <span className="tabular grid size-7 place-items-center rounded-full bg-ember-deep text-[13px] text-white">{i + 1}</span>
            <span className="hidden sm:inline">{z.room}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

/** Text of one room. All six stay in the document, so the page reads in full without scroll effects. */
export function RoomArticle({ floor, index, on }: { floor: Floor; index: number; on: boolean }) {
  const z = floor.department.zones[index];
  return (
    <article className={`col-start-1 row-start-1 transition-[opacity,translate] ease-out-expo ${on ? "translate-y-0 opacity-100 duration-500" : "pointer-events-none translate-y-2 opacity-0 duration-150"}`}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ember/15 text-ember-text">
          <Icon name={zoneIcon[z.id]} className="size-5" />
        </span>
        <p className="text-[15px] leading-tight">
          <span className="block font-semibold">{z.room}</span>
          <span className="block text-[14px] text-smoke">{floor.name}</span>
        </p>
      </div>
      <h3 className="mt-3 text-[21px] font-semibold leading-[1.2] tracking-[-0.01em] lg:mt-4 lg:text-[27px]">{z.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-smoke lg:mt-3 lg:text-[16px]">{z.text}</p>
      <ul className="mt-3 space-y-1.5 lg:mt-5 lg:space-y-2.5">
        {z.tasks.map((t) => (
          <li key={t} className="flex gap-3 text-[15px] leading-snug">
            <Icon name="check" className="mt-0.5 size-4 text-ember-text" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-3 rounded-xl bg-stone px-4 py-3 text-[15px] lg:mt-6">
        <Icon name="box" className="size-5 text-ember-text" />
        <span>
          <span className="text-smoke">You get: </span>
          <span className="font-semibold">{z.output}</span>
        </span>
      </p>
    </article>
  );
}

export function RoomNav({ index, total, onGo }: { index: number; total: number; onGo: (i: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-2">
        <button type="button" className={roundBtn} onClick={() => onGo(index - 1)} aria-label="Previous room"><Icon name="arrow-left" /></button>
        <button type="button" className={roundBtn} onClick={() => onGo(index + 1)} aria-label="Next room"><Icon name="arrow-right" /></button>
      </div>
      <div className="flex flex-1 gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`block h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-ember-deep" : "bg-graphite/15"}`} />
        ))}
      </div>
      <p className="tabular text-[15px] text-smoke">
        <span className="sr-only">Room </span>{index + 1} of {total}
      </p>
    </div>
  );
}

export function DonePanel({ floor, next, onNext }: { floor: Floor; next: Floor; onNext: () => void }) {
  return (
    <div className="text-graphite">
      <h2 className="wide text-[23px] leading-[1.15] lg:text-[30px]">What you take home</h2>
      <ul className="mt-4 lg:mt-6">
        {floor.deliverables.map((d) => (
          <li key={d} className="flex items-center gap-3 border-b border-hair py-2 text-[16px] lg:py-2.5">
            <Icon name="check" className="size-4 text-ember-text" /> {d}
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-3 text-[15px] text-smoke">
        <Icon name="clock" className="size-5" /> {floor.timeline}
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link href={`/contact?service=${floor.slug}`} className={solidBtn}>Start with {floor.name} <Icon name="arrow-right" /></Link>
        <Link href={`/services/${floor.slug}`} className={ghostBtn}>Department page</Link>
      </div>
      <button type="button" onClick={onNext} className={`${textBtn} mt-3`}>
        <Icon name="arrow-down" /> Next floor: {next.name}
      </button>
    </div>
  );
}

/** Progress of the 3D download. */
export function LoadBadge({ progress, label = "Loading the 3D campus" }: { progress: number; label?: string }) {
  const r = 8, c = 2 * Math.PI * r;
  return (
    <div className="inline-flex min-h-10 items-center gap-3 rounded-full bg-white/85 pl-3 pr-4 text-[14px] text-graphite backdrop-blur-md">
      <svg viewBox="0 0 22 22" className="size-5 -rotate-90" aria-hidden>
        <circle cx="11" cy="11" r={r} fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="2.5" />
        <circle cx="11" cy="11" r={r} fill="none" stroke="#d23a14" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
      </svg>
      <span>{label} <span className="tabular">{Math.round(progress * 100)}%</span></span>
    </div>
  );
}
