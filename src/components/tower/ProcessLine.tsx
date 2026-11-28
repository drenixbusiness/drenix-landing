import { GrowLine } from "@/components/ui/GrowLine";
import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Misc";
import { processSteps } from "@/lib/data";

/** Work process: a vertical line that fills as you scroll, with the stages. */
export function ProcessLine() {
  return (
    <section className="bg-paper text-graphite">
      <div className="container-x py-14 md:py-20 lg:py-28">
        <SectionHead title="From first call|to results" text="The estimate and timeline are agreed before work starts. Every stage ends with a concrete result in your hands." />
        <div className="cv relative mt-10 [--cv:960px] md:mt-20 md:[--cv:880px]">
          <div className="absolute bottom-0 left-[23px] top-0 w-px bg-hair md:left-1/2" />
          <GrowLine className="absolute bottom-0 left-[23px] top-0 w-px origin-top bg-ember-deep md:left-1/2" />
          <ol className="space-y-9 md:space-y-16">
            {processSteps.map((s, i) => (
              <li key={s.no} className="reveal relative grid pl-16 md:grid-cols-2 md:pl-0" suppressHydrationWarning>
                <span className="tabular absolute left-0 top-0 grid size-12 place-items-center rounded-full border border-hair bg-paper text-[17px] font-semibold md:left-1/2 md:-translate-x-1/2">{i + 1}</span>
                <div className={i % 2 ? "md:col-start-2 md:pl-16" : "md:pr-16 md:text-right"}>
                  <h3 className="text-[21px] font-semibold leading-tight md:text-[24px]">{s.title}</h3>
                  <p className={`mt-2 max-w-md text-[16px] leading-relaxed text-smoke md:text-[17px] ${i % 2 ? "" : "md:ml-auto"}`}>{s.text}</p>
                  <p className={`mt-3 flex flex-wrap items-center md:mt-4 gap-x-5 gap-y-2 text-[15px] ${i % 2 ? "" : "md:justify-end"}`}>
                    <span className="inline-flex items-center gap-2"><Icon name="clock" className="size-5 text-smoke" />{s.time}</span>
                    <span className="inline-flex items-center gap-2 font-medium"><Icon name="box" className="size-5 text-ember-text" />{s.result}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
