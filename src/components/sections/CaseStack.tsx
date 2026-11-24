"use client";

import { useRef, type CSSProperties } from "react";
import type { CaseStudy } from "@/lib/data";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { Mockup } from "@/components/mockups/Mockups";

const plates: Record<CaseStudy["plate"], string> = {
  bone: "bg-paper text-graphite",
  ember: "bg-ember-deep text-white",
  umber: "bg-graphite text-white",
  ink: "bg-[#d8ccbc] text-graphite",
};

/** Projects: cards stack on top of each other as you scroll. */
export function CaseStack({ cases }: { cases: CaseStudy[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const shades = useRef<(HTMLElement | null)[]>([]);
  const total = cases.length;

  // A card that is being covered steps back and gets darker
  useScrollProgress(ref, { start: 0, end: 1 }, (p) => {
    for (let i = 0; i < total; i++) {
      const from = i / total;
      const back = Math.max(0, (p - from) / (1 - from));
      const dark = Math.min(1, Math.max(0, (p - from) * total));
      const card = cards.current[i], shade = shades.current[i];
      if (card) card.style.scale = (1 - back * (total - i) * 0.035).toFixed(4);
      if (shade) shade.style.opacity = i === total - 1 ? "0" : (dark * 0.25).toFixed(3);
    }
  });

  return (
    <div ref={ref} className="cv relative space-y-[30svh] pb-[10svh]" style={{ "--cv": `calc(${total * 130 - 20}svh - ${total * 8}rem)` } as CSSProperties}>
      {cases.map((c, i) => (
        <div key={c.slug} className="sticky top-24 h-[calc(100svh-8rem)] md:top-28" style={{ paddingTop: i * 14 }}>
          <article ref={(el) => { cards.current[i] = el; }} className={`relative flex h-full origin-top flex-col overflow-hidden rounded-[18px] ${plates[c.plate]}`}>
            <div className="grid flex-1 grid-rows-[auto_1fr] gap-8 p-6 md:grid-cols-12 md:grid-rows-1 md:p-10">
              <div className="flex flex-col justify-between md:col-span-4">
                <p className="wide text-[22px] md:text-[28px]">{c.client}</p>
                <div>
                  <h3 className="text-[20px] font-medium leading-snug md:text-[25px]">{c.title}</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {c.services.map((s) => (
                      <li key={s} className="rounded-full border border-current/40 px-4 py-1.5 text-[15px]">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="relative min-h-0 md:col-span-8">
                <div className="absolute inset-x-0 bottom-[-12%] md:bottom-[-18%]">
                  <Mockup kind={c.mock} />
                </div>
              </div>
            </div>
            <div ref={(el) => { shades.current[i] = el; }} className="pointer-events-none absolute inset-0 bg-graphite opacity-0" aria-hidden />
          </article>
        </div>
      ))}
    </div>
  );
}
