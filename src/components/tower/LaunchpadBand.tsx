import { ArtPicture } from "@/components/ui/ArtPicture";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { launchpadStages } from "@/lib/data";

/** Startups: the garden pavilion of the campus and the four stages of the program. */
export function LaunchpadBand() {
  return (
    <section className="cv relative overflow-hidden bg-stone text-graphite [--cv:1290px] md:[--cv:100svh]">
      <ArtPicture wide="/media/hero-startups.webp" tall="/media/hero-startups-tall.webp" />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-stone/95 via-stone/70 to-transparent lg:w-[70%]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone to-transparent" />
      </div>

      <div className="container-x relative flex min-h-[100svh] flex-col justify-between gap-16 py-24 lg:py-28">
        <Reveal className="max-w-xl">
          <h2 className="wide text-[clamp(28px,8vw,42px)] leading-[1.08] lg:text-[52px]">Wings for<br />your startup</h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-graphite/85 lg:text-[18px]">
            Idea validation, MVP, pitch deck and first customers. We work with founders step by step, and on some projects for equity.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Button href="/startups">About the program</Button>
            <Button href="/contact?service=startup" variant="glass">Apply</Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ol className="panel-light grid overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
            {launchpadStages.map((s, i) => (
              <li key={s.no} className={`p-6 ${i ? "border-t border-hair sm:border-t-0 lg:border-l" : ""}`}>
                <p className="wide text-[20px]">{s.title}</p>
                <p className="mt-1 text-[16px] font-semibold">{s.sub}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-smoke">{s.text}</p>
                <p className="mt-4 flex items-center gap-2 text-[15px]"><Icon name="clock" className="size-5 text-ember-text" />{s.weeks}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
