"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { processSteps } from "@/lib/data";
import { SectionHead } from "@/components/ui/Misc";

/** Work process: a vertical line that fills as you scroll, with the stages. */
export function ProcessLine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="bg-paper text-graphite" data-header="dark">
      <div className="container-x py-24 md:py-32">
        <SectionHead
          title="From first|call to|results"
          text="The estimate and timeline are agreed before work starts. Every stage ends with a concrete result in your hands."
        />
        <div ref={ref} className="relative mt-16 md:mt-20">
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-hair md:left-1/2" />
          <motion.div style={{ height: h }} className="absolute left-[19px] top-0 w-px bg-ember md:left-1/2" />
          <ol className="space-y-12 md:space-y-20">
            {processSteps.map((s, i) => (
              <motion.li
                key={s.no}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative grid pl-14 md:grid-cols-2 md:pl-0"
              >
                <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full border border-hair bg-paper text-[11px] md:left-1/2 md:-translate-x-1/2">
                  <span className="wide">{s.no}</span>
                </span>
                <div className={i % 2 ? "md:col-start-2 md:pl-16" : "md:pr-16 md:text-right"}>
                  <p className="label text-smoke">{s.time}</p>
                  <h3 className="wide mt-3 text-[20px] md:text-[24px]">{s.title}</h3>
                  <p className={`mt-3 max-w-md text-[15px] leading-relaxed text-smoke ${i % 2 ? "" : "md:ml-auto"}`}>{s.text}</p>
                  <p className={`mt-4 inline-flex items-center gap-2 rounded-full bg-stone px-3.5 py-2 text-[13px]`}>
                    <span className="size-1.5 rounded-full bg-ember" /> {s.result}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
