import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Misc";

function Spark({ d, color = "#141414" }: { d: number[]; color?: string }) {
  const max = Math.max(...d), min = Math.min(...d);
  const pts = d.map((v, i) => `${(i / (d.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-9 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const stats = [
  { k: "Leads", v: "1,284", d: "+18%", s: [12, 14, 13, 18, 17, 22, 26, 25, 31] },
  { k: "Conversion", v: "14.2%", d: "+3.1%", s: [8, 9, 9, 10, 11, 11, 12, 13, 14] },
  { k: "Page load", v: "0.8 s", d: "−42%", s: [20, 18, 17, 15, 12, 11, 9, 8, 8] },
  { k: "Uptime", v: "99.98%", d: "30 days", s: [9, 9, 9, 8, 9, 9, 9, 9, 9] },
];

const frost = "rounded-[18px] border border-white/60 bg-white/45 shadow-[0_20px_60px_-30px_rgba(80,30,40,0.45)] backdrop-blur-xl";

/**
 * Glassy dashboard: frosted glass cards over a pink sky.
 * A preview of the client portal; the numbers are sample UI data.
 */
export function Portal() {
  return (
    <section className="relative overflow-hidden text-graphite" data-header="dark">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #efede8 0%, #fbd8df 22%, #f4b8c8 60%, #e9a5bf 100%)" }} />
      <div className="absolute -left-[10%] top-[30%] size-[60vw] rounded-full bg-[radial-gradient(circle,rgba(255,190,160,0.55),transparent_65%)]" />
      <div className="absolute -right-[15%] top-[10%] size-[55vw] rounded-full bg-[radial-gradient(circle,rgba(230,150,190,0.5),transparent_65%)]" />

      <div className="container-x relative py-24 md:py-36">
        <SectionHead
          title="Your project|at a glance"
          text="Every client gets a personal portal: tasks, deadlines, ad results and site status, all in real time."
        />

        <Reveal y={50} className="mt-14">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="relative overflow-hidden rounded-[18px] p-6 text-white shadow-[0_30px_80px_-30px_rgba(160,40,20,0.6)] md:col-span-8 md:p-8" style={{ background: "linear-gradient(135deg, #f0783a 0%, #e0502a 55%, #c93c22 100%)" }}>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="label flex items-center gap-2 text-white/85"><span className="size-1.5 rounded-full bg-white" /> Sprint 6 · Day 9</p>
                  <p className="mt-5 text-[26px] font-medium leading-tight md:text-[34px]">Online store project<br />ahead of schedule</p>
                  <p className="mt-3 max-w-md text-[15px] text-white/80">Checkout and catalog are done. Next demo: Friday, 15:00.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="label rounded-full bg-white px-4 py-2.5 text-graphite">View demo ↗</span>
                    <span className="label rounded-full border border-white/50 px-4 py-2.5">PDF report</span>
                  </div>
                </div>
                <div className="relative hidden size-36 shrink-0 sm:block">
                  <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="5" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="68 100" />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div><p className="text-[28px] font-semibold tracking-tight">68%</p><p className="label mt-1 text-[8px] text-white/75">complete</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${frost} p-6 md:col-span-4`}>
              <div className="flex items-baseline justify-between">
                <p className="wide text-3xl">14</p>
                <p className="label text-smoke">Friday · November</p>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d, i) => (
                  <div key={d} className={`rounded-lg py-2 ${i === 4 ? "bg-graphite text-white" : "bg-white/60"}`}>
                    <p className="opacity-70">{d}</p>
                    <p className="mt-1 font-medium">{10 + i}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {[["10:00", "Design review"], ["15:00", "Sprint demo"], ["17:30", "Ad performance report"]].map(([t, e]) => (
                  <div key={t} className="flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2.5">
                    <span className="tabular-nums text-smoke">{t}</span>
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>

            {stats.map((s) => (
              <div key={s.k} className={`${frost} p-5 md:col-span-3`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-smoke">{s.k}</p>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px]">{s.d}</span>
                </div>
                <p className="mt-3 text-[28px] font-semibold tracking-tight">{s.v}</p>
                <div className="mt-3"><Spark d={s.s} /></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
