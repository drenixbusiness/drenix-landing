import { processSteps } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Misc";

/** Work process: clear stages in a table layout. */
export function Process({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <section className={light ? "bg-paper text-umber" : "bg-stone"}>
      <div className="container-x py-24 md:py-36">
        <SectionHead
          title="From first|call to|results"
          text="Every stage ends with a concrete result in your hands. The estimate and timeline are agreed before work starts."
        />
        <div className={`mt-16 border-t ${light ? "border-umber/15" : "border-hair"}`}>
          {processSteps.map((s, i) => (
            <Reveal key={s.no} delay={i * 0.05}>
              <div className={`grid gap-3 border-b py-8 md:grid-cols-12 md:items-baseline md:gap-6 ${light ? "border-umber/15" : "border-hair"}`}>
                <span className="wide text-3xl text-ember md:col-span-1">{s.no}</span>
                <h3 className="text-2xl font-semibold md:col-span-3">{s.title}</h3>
                <p className={`md:col-span-4 ${light ? "text-umber/70" : "text-graphite/65"}`}>{s.text}</p>
                <p className="md:col-span-3">
                  <span className={`label block ${light ? "text-umber/45" : "text-graphite/40"}`}>Result</span>
                  {s.result}
                </p>
                <span className={`label md:col-span-1 md:text-right ${light ? "text-umber/55" : "text-graphite/50"}`}>{s.time}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
