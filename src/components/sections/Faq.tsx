import { Icon } from "@/components/ui/Icon";
import { Lines } from "@/components/ui/Reveal";

/** FAQ: plain <details>, works without JavaScript. */
export function Faq({ items, title = "Frequently|asked|questions" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section className="cv bg-paper text-graphite [--cv:620px]">
      <div className="container-x grid gap-6 py-14 md:gap-10 md:py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4">
          <Lines text={title} className="wide text-[clamp(26px,7vw,34px)] leading-[1.08] lg:text-[34px]" />
        </div>
        <div className="border-t border-hair lg:col-span-7 lg:col-start-6">
          {items.map((f) => (
            <details key={f.q} className="group border-b border-hair">
              <summary className="flex min-h-16 list-none items-center justify-between gap-6 py-4 md:py-5">
                <span className="text-[18px] font-medium leading-snug md:text-[19px]">{f.q}</span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-graphite/20 transition-colors group-open:bg-graphite group-open:text-white">
                  <Icon name="plus" className="size-5 transition-transform duration-300 group-open:rotate-45" />
                </span>
              </summary>
              <p className="max-w-[42rem] pb-6 text-[16px] leading-relaxed text-smoke md:pb-7 md:text-[17px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
