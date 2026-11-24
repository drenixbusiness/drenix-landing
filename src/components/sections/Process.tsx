import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Misc";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps } from "@/lib/data";

/** Work process: clear stages in a table layout. */
export function Process() {
  return (
    <section className="cv bg-paper text-graphite [--cv:1790px] md:[--cv:990px]">
      <div className="container-x py-20 md:py-28">
        <SectionHead title="From first call|to results" text="Every stage ends with a concrete result in your hands. The estimate and timeline are agreed before work starts." />
        <ol className="mt-12 border-t border-hair">
          {processSteps.map((s, i) => (
            <li key={s.no} className="border-b border-hair">
              <Reveal delay={i * 0.04} className="grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-6">
                <span className="tabular text-[20px] font-semibold text-ember-text md:col-span-1">{i + 1}</span>
                <h3 className="text-[22px] font-semibold leading-tight md:col-span-3">{s.title}</h3>
                <p className="text-[17px] leading-relaxed text-smoke md:col-span-4">{s.text}</p>
                <p className="flex gap-2 text-[16px] font-medium md:col-span-2"><Icon name="box" className="mt-0.5 size-5 text-ember-text" />{s.result}</p>
                <p className="flex gap-2 text-[16px] text-smoke md:col-span-2 md:justify-end"><Icon name="clock" className="mt-0.5 size-5" />{s.time}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
