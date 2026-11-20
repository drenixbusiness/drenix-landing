import type { CaseStudy } from "@/lib/data";
import { Mockup } from "@/components/mockups/Mockups";
import { Reveal } from "@/components/ui/Reveal";

const plates: Record<CaseStudy["plate"], string> = {
  bone: "bg-stone-2",
  ember: "bg-ember",
  umber: "bg-umber",
  ink: "bg-[#e9c9cf]",
};

/** Project card: product mockup on a colored plate. */
export function CaseCard({ c, index = 0 }: { c: CaseStudy; index?: number }) {
  return (
    <Reveal delay={(index % 2) * 0.08}>
      <article className="group">
        <div className={`relative overflow-hidden rounded-2xl ${plates[c.plate]} px-6 pt-10 sm:px-12 sm:pt-14`}>
          <div className="relative -mb-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
            <Mockup kind={c.mock} />
          </div>
        </div>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <h3 className="text-xl font-medium md:text-2xl">{c.title}</h3>
            <p className="mt-1.5 text-graphite/50">{c.client} · {c.services.join(", ")}</p>
          </div>        </div>
      </article>
    </Reveal>
  );
}
