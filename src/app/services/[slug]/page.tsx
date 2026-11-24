import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DepartmentTour } from "@/components/journey/DepartmentTour";
import { CTA } from "@/components/sections/CTA";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { Mockup } from "@/components/mockups/Mockups";
import { Button } from "@/components/ui/Button";
import { Icon, departmentIcon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { getService, services } from "@/lib/data";
import { floorIndex, floors } from "@/lib/tower";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = getService(slug);
  if (!s) return {};
  return { title: s.title, description: s.summary };
}

export default function ServicePage(props: PageProps<"/services/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <ServiceContent params={props.params} />
    </Suspense>
  );
}

async function ServiceContent({ params }: { params: PageProps<"/services/[slug]">["params"] }) {
  const { slug } = await params;
  const s = getService(slug);
  const i = floorIndex(slug);
  if (!s || i < 0) notFound();

  const f = floors[i];
  const d = f.department;
  const up = floors[(i + floors.length - 1) % floors.length];
  const down = floors[(i + 1) % floors.length];

  return (
    <>
      <PageHero
        crumbs={[{ href: "/services", label: "Services" }, { href: `/services/${s.slug}`, label: d.name }]}
        image={`open-floor-${f.level}`}
        title={s.title}
        text={s.summary}
        facts={f.specs.map(([label, value]) => ({ label, value }))}
        badge={
          <>
            <span className="wide tabular text-[34px] leading-none">{f.level}</span>
            <span className="grid size-10 place-items-center rounded-full bg-ember/15 text-ember-text"><Icon name={departmentIcon[s.slug]} className="size-5" /></span>
            <span className="text-[18px] font-semibold">{d.name}</span>
          </>
        }
      >
        <Button href={`/contact?service=${s.slug}`}>Start a project</Button>
        <Button href="#rooms" variant="glass" icon="arrow-down">See how we work</Button>
      </PageHero>

      {/* What the department is for, and who works in it */}
      <section className="container-x grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <h2 className="wide text-[26px] leading-[1.12] md:text-[36px]">What {d.name} does</h2>
          <p className="mt-6 text-[19px] leading-[1.55] md:text-[21px]">{s.description}</p>
        </Reveal>
        <div className="lg:col-span-5 lg:col-start-8">
          <h3 className="text-[18px] font-semibold">Who works on this floor</h3>
          <ul className="mt-4 border-t border-hair">
            {d.roles.map((r) => (
              <li key={r.name} className="grid gap-1 border-b border-hair py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <span className="font-medium">{r.name}</span>
                <span className="text-smoke">{r.does}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DepartmentTour slug={s.slug} />

      {/* Tasks */}
      <section className="cv bg-paper [--cv:1020px] md:[--cv:700px]">
        <div className="container-x grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <h2 className="wide text-[26px] leading-[1.12] md:text-[36px]">What you can order</h2>
            <dl className="mt-8 border-t border-hair">
              {s.features.map((x) => (
                <div key={x.title} className="border-b border-hair py-5">
                  <dt className="text-[19px] font-semibold">{x.title}</dt>
                  <dd className="mt-1.5 max-w-[34rem] text-[16px] leading-relaxed text-smoke">{x.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Reveal className="lg:sticky lg:top-28 lg:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-graphite px-5 pt-8 sm:px-10 sm:pt-12">
              <div className="-mb-8"><Mockup kind={s.mock} /></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Start, result, measure, tools */}
      <section className="cv container-x grid gap-x-12 gap-y-14 py-20 [--cv:1120px] md:grid-cols-2 md:py-28 md:[--cv:480px] xl:grid-cols-4">
        {([
          ["To start, we need", d.needs, "flag"],
          ["You take home", s.deliverables, "box"],
          ["How we measure the work", d.measures, "chart"],
        ] as const).map(([title, items, icon]) => (
          <div key={title}>
            <Icon name={icon} className="size-7 text-ember-text" />
            <h2 className="mt-4 text-[20px] font-semibold">{title}</h2>
            <ul className="mt-4 space-y-3">
              {items.map((x) => (
                <li key={x} className="flex gap-3 text-[16px] leading-snug"><Icon name="check" className="mt-1 size-4 text-ember-text" />{x}</li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <Icon name="layers" className="size-7 text-ember-text" />
          <h2 className="mt-4 text-[20px] font-semibold">Tools</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {s.tools.map((t) => <li key={t} className="rounded-full border border-hair bg-paper px-4 py-2 text-[15px]">{t}</li>)}
          </ul>
        </div>
      </section>

      {/* Neighbours */}
      <section className="cv container-x pb-20 [--cv:1110px] md:pb-28 md:[--cv:545px]">
        <h2 className="wide text-[26px] leading-[1.12] md:text-[36px]">Works with</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {d.with.map((w) => {
            const n = floors[floorIndex(w.slug)];
            return (
              <li key={w.slug}>
                <Link href={`/services/${w.slug}`} className="group block h-full overflow-hidden rounded-2xl bg-paper transition-shadow hover:shadow-[0_24px_60px_-30px_rgba(20,20,20,0.45)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={`/media/open-floor-${n.level}-card.webp`} alt="" fill quality={70} sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex items-center gap-4 p-5">
                    <Icon name={departmentIcon[w.slug]} className="size-6 text-ember-text" />
                    <span className="flex-1">
                      <span className="block text-[18px] font-semibold">{n.name}</span>
                      <span className="block text-[15px] text-smoke">For {w.why}</span>
                    </span>
                    <Icon name="arrow-right" className="size-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Faq items={s.faq} title="Questions" />

      <nav aria-label="Other floors" className="container-x grid gap-px py-12 sm:grid-cols-2">
        {([[up, "arrow-up", "Floor above"], [down, "arrow-down", "Floor below"]] as const).map(([x, icon, label], k) => (
          <Link key={x.slug} href={`/services/${x.slug}`} className={`group flex items-center gap-5 py-6 ${k ? "sm:justify-end sm:text-right" : ""}`}>
            <span className={`grid size-12 place-items-center rounded-full border border-graphite/20 transition-colors group-hover:bg-graphite group-hover:text-white ${k ? "sm:order-2" : ""}`}><Icon name={icon} className="size-5" /></span>
            <span>
              <span className="block text-[15px] text-smoke">{label}</span>
              <span className="wide block text-[20px] md:text-[24px]">{x.name}</span>
            </span>
          </Link>
        ))}
      </nav>

      <CTA service={s.slug} />
    </>
  );
}
