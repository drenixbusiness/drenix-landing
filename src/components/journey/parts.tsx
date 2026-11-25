"use client";

import Link from "next/link";
import { memo } from "react";
import { Icon, departmentIcon } from "@/components/ui/Icon";
import type { FloorInfo } from "@/lib/tower";
import { roundBtn, solidBtn, textBtn } from "./buttons";

/* What the first screen needs. The panels after it are in panels.tsx and rooms.tsx, loaded later. */

/* ---------- Floor card (hero and tower) ---------- */

export const FloorCard = memo(function FloorCard({ floor, onStep, onEnter, compact = false }: { floor: FloorInfo; onStep: (d: number) => void; onEnter: () => void; compact?: boolean }) {
  return (
    <div className="panel-light rounded-2xl p-5 text-graphite low:p-4 short:p-4">
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
      <p className="mt-4 text-[20px] font-semibold leading-tight low:mt-3">{floor.name}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-smoke tiny:hidden flat:hidden">{floor.lead}</p>
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
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 low:mt-3">
        <button type="button" onClick={onEnter} className={`${solidBtn} flex-1 justify-between`}>
          Enter the floor <Icon name="arrow-right" />
        </button>
        {!compact && <Link href={`/services/${floor.slug}`} className={textBtn}>Details</Link>}
      </div>
    </div>
  );
});

/** Progress of the 3D download. */
export function LoadBadge({ progress, label = "Loading the 3D campus" }: { progress: number; label?: string }) {
  const r = 8, c = 2 * Math.PI * r;
  return (
    <div className="inline-flex min-h-10 items-center gap-3 rounded-full bg-white/90 pl-3 pr-4 text-[14px] text-graphite">
      <svg viewBox="0 0 22 22" className="size-5 -rotate-90" aria-hidden>
        <circle cx="11" cy="11" r={r} fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="2.5" />
        <circle cx="11" cy="11" r={r} fill="none" stroke="#d23a14" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
      </svg>
      <span>{label} <span className="tabular">{Math.round(progress * 100)}%</span></span>
    </div>
  );
}
