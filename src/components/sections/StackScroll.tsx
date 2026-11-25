"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

/** Cards that stack on top of each other. A card that is being covered steps back and gets darker. */
export function StackScroll({ total, children }: { total: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const parts = useRef<{ card: HTMLElement; shade: HTMLElement }[]>([]);

  useScrollProgress(ref, { start: 0, end: 1 }, (p) => {
    if (!parts.current.length && ref.current) {
      parts.current = [...ref.current.querySelectorAll<HTMLElement>("[data-card]")].map((card) => ({ card, shade: card.querySelector<HTMLElement>("[data-shade]")! }));
    }
    parts.current.forEach(({ card, shade }, i) => {
      const from = i / total;
      const back = Math.max(0, (p - from) / (1 - from));
      const dark = Math.min(1, Math.max(0, (p - from) * total));
      card.style.scale = (1 - back * (total - i) * 0.035).toFixed(4);
      shade.style.opacity = i === total - 1 ? "0" : (dark * 0.25).toFixed(3);
    });
  });

  return (
    <div ref={ref} className="cv relative space-y-[30svh] pb-[10svh]" style={{ "--cv": `calc(${total * 130 - 20}svh - ${total * 8}rem)` } as CSSProperties}>
      {children}
    </div>
  );
}
