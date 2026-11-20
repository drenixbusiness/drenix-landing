import { Lines } from "@/components/ui/Reveal";

/** FAQ: plain <details>, works without JavaScript. */
export function Faq({ items, title = "Frequently|asked|questions" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section className="bg-paper text-graphite">
      <div className="container-x grid gap-12 py-24 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Lines text={title} className="wide text-[6vw] sm:text-[30px] lg:text-[30px] xl:text-[34px]" />
        </div>
        <div className="border-t border-hair lg:col-span-7 lg:col-start-6">
          {items.map((f, i) => (
            <details key={f.q} className="group border-b border-hair">
              <summary className="flex cursor-pointer list-none items-center gap-6 py-6">
                <span className="label w-8 shrink-0 text-smoke">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-lg font-medium">{f.q}</span>
                <span className="relative grid size-8 shrink-0 place-items-center rounded-full border border-hair transition-colors group-open:bg-graphite group-open:text-white">
                  <span className="absolute h-px w-3 bg-current" />
                  <span className="absolute h-3 w-px bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pl-14 text-[15px] leading-relaxed text-smoke">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
