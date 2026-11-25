"use client";

import { memo, type RefObject } from "react";
import { Icon, zoneIcon } from "@/components/ui/Icon";
import type { Floor } from "@/lib/tower";
import { roundBtn } from "./buttons";

/* ---------- Rooms of a floor: labels on the plan, texts, steps ---------- */

/** Room labels on the plan. The engine moves them; the list beside the plan is their keyboard version. */
export const RoomLabels = memo(function RoomLabels({ floor, active, els, onHover, onPick }: { floor: Pick<Floor, "department">; active: number; els: RefObject<(HTMLElement | null)[]>; onHover: (i: number) => void; onPick: (i: number) => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {floor.department.zones.map((z, i) => (
        <div key={z.id} ref={(el) => { els.current[i] = el; }} className="absolute left-0 top-0 will-change-transform">
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
            className={`pointer-events-auto absolute bottom-10 left-0 flex min-h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full p-2 text-[14px] font-medium shadow-[0_8px_24px_-8px_rgba(20,20,20,0.4)] transition-colors md:pr-4 short:pr-2 desk:pr-2 roomy:pr-4 ${active === i ? "bg-graphite text-white" : "bg-white text-graphite hover:bg-graphite hover:text-white"}`}
          >
            <span className="tabular grid size-7 place-items-center rounded-full bg-ember-deep text-[13px] text-white">{i + 1}</span>
            <span className="hidden md:inline short:hidden desk:hidden roomy:inline">{z.room}</span>
          </button>
        </div>
      ))}
    </div>
  );
});

/** Text of one room. All six stay in the document, so the page reads in full without scroll effects. */
export const RoomArticle = memo(function RoomArticle({ floor, index, on }: { floor: Pick<Floor, "name" | "department">; index: number; on: boolean }) {
  const z = floor.department.zones[index];
  return (
    <article className={`col-start-1 row-start-1 transition-[opacity,translate] ease-out-expo ${on ? "translate-y-0 opacity-100 duration-500" : "pointer-events-none translate-y-2 opacity-0 duration-150"}`}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ember/15 text-ember-text low:size-9 short:hidden">
          <Icon name={zoneIcon[z.id]} className="size-5" />
        </span>
        <p className="text-[15px] leading-tight short:flex short:items-baseline short:gap-2">
          <span className="block font-semibold">{z.room}</span>
          <span className="block text-[14px] text-smoke">{floor.name}</span>
        </p>
      </div>
      <h3 className="mt-3 text-[21px] font-semibold leading-[1.2] tracking-[-0.01em] low:mt-2 low:text-[19px] short:mt-1.5 short:text-[18px] flat:mt-1 flat:text-[15px] desk:mt-4 desk:text-[27px] squat:mt-2.5 squat:text-[22px]">{z.title}</h3>
      <p className="mt-2 text-[15px] leading-normal text-smoke snug:hidden short:hidden desk:mt-3 desk:text-[16px] desk:leading-relaxed squat:mt-2 squat:text-[15px] squat:leading-normal">{z.text}</p>
      <ul className="mt-3 space-y-1.5 low:mt-2 low:space-y-1 short:mt-2 short:space-y-1 flat:mt-1 flat:space-y-0.5 desk:mt-5 desk:space-y-2.5 squat:mt-3 squat:space-y-1.5">
        {z.tasks.map((t) => (
          <li key={t} className="flex gap-3 text-[15px] leading-snug low:gap-2.5 low:text-[14px] short:text-[14px] flat:text-[13px]">
            <Icon name="check" className="mt-0.5 size-4 text-ember-text" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-3 rounded-xl bg-stone px-4 py-2.5 text-[15px] leading-snug low:mt-2.5 low:px-3 low:py-2 low:text-[14px] short:mt-2 short:px-3 short:py-1.5 short:text-[14px] flat:mt-1.5 flat:py-1 flat:text-[13px] desk:mt-6 desk:py-3 squat:mt-3 squat:py-2">
        <Icon name="box" className="size-5 text-ember-text" />
        <span>
          <span className="text-smoke">You get: </span>
          <span className="font-semibold">{z.output}</span>
        </span>
      </p>
    </article>
  );
});

export const RoomNav = memo(function RoomNav({ index, total, onGo }: { index: number; total: number; onGo: (i: number) => void }) {
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
});
