import type { CaseStudy } from "@/lib/data";
import { Mockup } from "@/components/mockups/Mockups";

export { StackScroll as CaseStack } from "./StackScroll";

const plates: Record<CaseStudy["plate"], string> = {
  bone: "bg-paper text-graphite",
  ember: "bg-ember-deep text-white",
  umber: "bg-graphite text-white",
  ink: "bg-[#d8ccbc] text-graphite",
};

/** One project in the stack. */
export function CaseSlide({ c, index }: { c: CaseStudy; index: number }) {
  return (
    <div className="sticky top-24 h-[calc(100svh-8rem)] md:top-28" style={{ paddingTop: index * 14 }}>
      <article data-card="" className={`relative flex h-full origin-top flex-col overflow-hidden rounded-[18px] ${plates[c.plate]}`}>
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
        <div data-shade="" className="pointer-events-none absolute inset-0 bg-graphite opacity-0" aria-hidden />
      </article>
    </div>
  );
}
