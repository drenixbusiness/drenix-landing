import Image from "next/image";
import { launchpadStages } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

/** Startups: a white glass stages panel over a bright open-office photo. */
export function LaunchpadBand() {
  return (
    <section className="relative overflow-hidden" data-header="light">
      <Image src="/media/room-lounge.webp" alt="Bright open office with plants" fill quality={75} sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

      <div className="container-x relative flex min-h-[100svh] flex-col justify-between py-28">
        <Reveal className="max-w-2xl text-white">
          <h2 className="wide text-[7.6vw] leading-[1.06] sm:text-[40px] lg:text-[52px]">Wings for<br />your startup</h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/85">
            Idea validation, MVP, pitch deck and first customers. We work with founders step by step, and on some projects for equity.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Button href="/startups" variant="light">About the program</Button>
            <Button href="/contact?service=startup" variant="outline" className="text-white">Apply</Button>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-16">
          <ol className="panel-light grid gap-px overflow-hidden rounded-[14px] text-graphite sm:grid-cols-2 lg:grid-cols-4">
            {launchpadStages.map((s, i) => (
              <li key={s.no} className={`p-5 ${i ? "lg:border-l lg:border-hair" : ""}`}>
                <div className="flex items-baseline justify-between">
                  <span className="label text-smoke">0{s.no}</span>
                  <span className="label text-[8px] text-smoke">{s.weeks}</span>
                </div>
                <p className="wide mt-5 text-[18px]">{s.title}</p>
                <p className="mt-1 text-sm font-medium">{s.sub}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-smoke">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
