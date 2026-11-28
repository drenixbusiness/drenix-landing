import type { CaseStudy } from "@/lib/data";
import { Mockup } from "@/components/mockups/Mockups";
import { Reveal } from "@/components/ui/Reveal";

const plates: Record<CaseStudy["plate"], string> = {
  bone: "bg-stone-2",
  ember: "bg-ember-deep",
  umber: "bg-graphite",
  ink: "bg-[#d8ccbc]",
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
        <h2 className="mt-5 text-[20px] font-semibold leading-snug md:mt-6 md:text-[25px]">{c.title}</h2>
        <p className="mt-1.5 text-[16px] text-smoke md:mt-2 md:text-[17px]">{c.client}: {c.services.join(", ")}</p>
      </article>
    </Reveal>
  );
}
