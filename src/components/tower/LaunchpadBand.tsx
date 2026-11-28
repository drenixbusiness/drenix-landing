import { ArtPicture } from "@/components/ui/ArtPicture";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { launchpadStages } from "@/lib/data";

/**
 * Startups: the garden pavilion of the campus and the four stages of the program.
 * Wide screens: the picture behind the text. Phones and tablets held upright: the picture as a band above it,
 * so the text does not stand on a veiled photo with empty space around it.
 */
export function LaunchpadBand() {
  return (
    <section className="cv relative overflow-hidden bg-stone text-graphite [--cv:1180px] md:[--cv:1300px] desk:[--cv:100svh]">
      <div className="relative aspect-[3/2] desk:absolute desk:inset-0 desk:aspect-auto">
        <ArtPicture wide="/media/hero-startups.webp" tall="/media/hero-startups.webp" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-stone desk:hidden" aria-hidden />
      </div>
      <div className="pointer-events-none absolute inset-0 hidden desk:block" aria-hidden>
        <div className="absolute inset-y-0 left-0 w-[70%] bg-gradient-to-r from-stone/95 via-stone/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone to-transparent" />
      </div>

      <div className="container-x relative flex flex-col gap-10 pb-14 md:pb-20 desk:min-h-[100svh] desk:justify-between desk:gap-16 desk:py-28">
        <Reveal className="max-w-xl">
          <h2 className="wide text-[clamp(28px,8vw,42px)] leading-[1.08] desk:text-[52px]">Wings for<br />your startup</h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-graphite/85 desk:mt-6 desk:text-[18px]">
            Idea validation, MVP, pitch deck and first customers. We work with founders step by step, and on some projects for equity.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 desk:mt-8">
            <Button href="/startups">About the program</Button>
            <Button href="/contact?service=startup" variant="glass">Apply</Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ol className="panel-light grid grid-cols-2 overflow-hidden rounded-2xl lg:grid-cols-4">
            {launchpadStages.map((s, i) => (
              <li key={s.no} className={`border-hair p-4 sm:p-6 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                <p className="wide text-[17px] sm:text-[20px]">{s.title}</p>
                <p className="mt-1 text-[15px] font-semibold sm:text-[16px]">{s.sub}</p>
                <p className="mt-2 text-[14px] leading-snug text-smoke sm:text-[15px] sm:leading-relaxed">{s.text}</p>
                <p className="mt-3 flex items-center gap-2 text-[14px] sm:mt-4 sm:text-[15px]"><Icon name="clock" className="size-4 text-ember-text sm:size-5" />{s.weeks}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
