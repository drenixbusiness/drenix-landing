import { LazyMeetingForm } from "@/components/contact/LazyMeetingForm";
import { ArtPicture } from "@/components/ui/ArtPicture";
import { Lines } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { floors } from "@/lib/tower";

const options = floors.map((f) => ({ value: f.title, label: `${f.level}  ${f.name}: ${f.title}` }));

/** "Book a meeting" over the main entrance of the campus. */
export function CTA({ title = "Book a|meeting", service }: { title?: string; service?: string }) {
  return (
    <section className="cv relative overflow-hidden bg-graphite [--cv:980px] md:[--cv:92svh]" data-header="light">
      <ArtPicture wide="/media/cta.webp" tall="/media/cta-tall.webp" />
      <div className="absolute inset-0 bg-black/25" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent max-lg:bg-gradient-to-b max-lg:from-black/75" aria-hidden />

      <div className="container-x relative grid min-h-[92svh] items-center gap-12 py-24 lg:grid-cols-12 lg:py-28">
        <div className="on-dark text-white lg:col-span-6">
          <Lines text={title} className="wide text-[clamp(28px,8vw,44px)] leading-[1.08] lg:text-[52px]" />
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/90">At our office or online. In a 30-minute call we review your project and give you a concrete proposal.</p>
          <ul className="mt-8 space-y-1">
            <li><a href={site.phoneHref} className="inline-flex min-h-11 items-center text-[17px] font-medium underline decoration-white/40 underline-offset-4 hover:decoration-white">{site.phone}</a></li>
            <li><a href={site.telegramHref} className="inline-flex min-h-11 items-center text-[17px] font-medium underline decoration-white/40 underline-offset-4 hover:decoration-white">Telegram {site.telegram}</a></li>
          </ul>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="rounded-2xl bg-paper p-6 text-graphite md:p-8">
            <LazyMeetingForm options={options} initial={floors.find((f) => f.slug === service)?.title} />
          </div>
        </div>
      </div>
    </section>
  );
}
