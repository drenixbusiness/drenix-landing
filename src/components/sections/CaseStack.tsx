"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import type { CaseStudy } from "@/lib/data";
import { Mockup } from "@/components/mockups/Mockups";

const plates: Record<CaseStudy["plate"], string> = {
  bone: "bg-stone-2 text-graphite",
  ember: "bg-ember-deep text-white",
  umber: "bg-graphite text-white",
  ink: "bg-[#e9c9cf] text-graphite",
};

function Card({ c, i, total, progress }: { c: CaseStudy; i: number; total: number; progress: MotionValue<number> }) {
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.035]);
  const dim = useTransform(progress, [start, start + 1 / total], [0, i === total - 1 ? 0 : 0.25]);

  return (
    <div className="sticky top-24 h-[calc(100svh-8rem)] md:top-28" style={{ paddingTop: i * 14 }}>
      <motion.article style={{ scale }} className={`relative flex h-full origin-top flex-col overflow-hidden rounded-[18px] ${plates[c.plate]}`}>
        <div className="grid flex-1 grid-rows-[auto_1fr] gap-8 p-6 md:grid-cols-12 md:grid-rows-1 md:p-10">
          <div className="flex flex-col justify-between md:col-span-4">
            <div>
              <p className="wide text-[22px] md:text-[28px]">{c.client}</p>
            </div>
            <div>
              <h3 className="text-xl font-medium md:text-2xl">{c.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.services.map((s) => (
                  <span key={s} className="label rounded-full border border-current/25 px-3 py-1.5 text-[9px]">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative min-h-0 md:col-span-8">
            <div className="absolute inset-x-0 bottom-[-12%] md:bottom-[-18%]">
              <Mockup kind={c.mock} />
            </div>
          </div>
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-graphite" />
      </motion.article>
    </div>
  );
}

/** Projects: cards stack on top of each other as you scroll. */
export function CaseStack({ cases }: { cases: CaseStudy[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="relative space-y-[30svh] pb-[10svh]">
      {cases.map((c, i) => (
        <Card key={c.slug} c={c} i={i} total={cases.length} progress={scrollYProgress} />
      ))}
    </div>
  );
}
