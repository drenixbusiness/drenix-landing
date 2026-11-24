import { Icon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Misc";
import { Reveal } from "@/components/ui/Reveal";

function Spark({ d }: { d: number[] }) {
  const max = Math.max(...d), min = Math.min(...d);
  const pts = d.map((v, i) => `${(i / (d.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="#b23c0c" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

const stats = [
  { k: "Leads this month", v: "1,284", d: "18% more than in October", s: [12, 14, 13, 18, 17, 22, 26, 25, 31] },
  { k: "Visitors who became clients", v: "14.2%", d: "3.1 points more", s: [8, 9, 9, 10, 11, 11, 12, 13, 14] },
  { k: "Page load", v: "0.8 s", d: "42% faster", s: [20, 18, 17, 15, 12, 11, 9, 8, 8] },
  { k: "Uptime", v: "99.98%", d: "last 30 days", s: [9, 9, 9, 8, 9, 9, 9, 9, 9] },
];

const card = "rounded-2xl border border-hair bg-paper";

/** Preview of the client portal. The numbers are sample interface data. */
export function Portal() {
  return (
    <section className="cv bg-stone-2 text-graphite [--cv:1740px] md:[--cv:850px]">
      <div className="container-x py-20 md:py-28">
        <SectionHead title="Your project|at a glance" text="Every client gets a personal portal: tasks, deadlines, ad results and site status, all in real time. Below is an example." />

        <Reveal y={40} className="mt-12">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="rounded-2xl bg-graphite p-6 text-white md:col-span-8 md:p-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[16px] text-white/80">Sprint 6, day 9</p>
                  <p className="mt-4 text-[26px] font-semibold leading-tight md:text-[34px]">Online store project<br />ahead of schedule</p>
                  <p className="mt-3 max-w-md text-[17px] leading-relaxed text-white/80">Checkout and catalog are done. Next demo: Friday, 15:00.</p>
                </div>
                <div className="relative hidden size-36 shrink-0 sm:block">
                  <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f39a4a" strokeWidth="6" strokeLinecap="round" pathLength="100" strokeDasharray="68 100" />
                  </svg>
                  <p className="absolute inset-0 grid place-content-center text-center">
                    <span className="text-[30px] font-semibold leading-none tracking-tight">68%</span>
                    <span className="mt-1 text-[14px] text-white/80">complete</span>
                  </p>
                </div>
              </div>
            </div>

            <div className={`${card} p-6 md:col-span-4`}>
              <p className="text-[20px] font-semibold">Friday, 14 November</p>
              <ul className="mt-5 space-y-2.5">
                {[["10:00", "Design review"], ["15:00", "Sprint demo"], ["17:30", "Ad performance report"]].map(([t, e]) => (
                  <li key={t} className="flex items-center gap-4 rounded-xl bg-stone px-4 py-3 text-[16px]">
                    <Icon name="clock" className="size-5 text-ember-text" />
                    <span className="tabular text-smoke">{t}</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {stats.map((s) => (
              <div key={s.k} className={`${card} p-5 md:col-span-6 xl:col-span-3`}>
                <p className="text-[15px] text-smoke">{s.k}</p>
                <p className="tabular mt-2 text-[30px] font-semibold leading-none tracking-tight">{s.v}</p>
                <p className="mt-2 text-[15px] text-smoke">{s.d}</p>
                <div className="mt-4"><Spark d={s.s} /></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
