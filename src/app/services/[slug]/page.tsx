import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHero, FactList } from "@/components/sections/PageHero";
import { Mockup } from "@/components/mockups/Mockups";
import { Faq } from "@/components/sections/Faq";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { getService, services } from "@/lib/data";
import { serviceImage } from "@/lib/media";

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
  if (!s) notFound();

  const idx = services.findIndex((x) => x.slug === s.slug);
  const next = services[(idx + 1) % services.length];

  return (
    <>
      <PageHero
        crumbs={[{ href: "/services", label: "Services" }, { href: `/services/${s.slug}`, label: s.title }]}
        image={serviceImage[s.slug]}
        title={s.title}
        text={s.summary}
        aside={
          <FactList
            items={[
              { label: "Timeline", value: s.timeline },
              { label: "Estimate", value: "3–5 days after the intro call" },
              { label: "Contract", value: "With deliverables and deadlines" },
            ]}
          />
        }
      >
        <Reveal delay={0.6} className="mt-10">
          <Button href={`/contact?service=${s.slug}`}>Request this service</Button>
        </Reveal>
      </PageHero>

      <section className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[14px] bg-graphite px-5 pt-10 sm:px-16 sm:pt-16 lg:px-28">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(60%_80%_at_50%_100%,rgba(236,106,38,0.25),transparent)]" />
            <div className="relative mx-auto -mb-10 max-w-[900px]">
              <Mockup kind={s.mock} />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-x grid gap-10 py-24 md:py-32 lg:grid-cols-12">
        <p className="label text-graphite/65 lg:col-span-3">How we work</p>
        <Reveal className="lg:col-span-8">
          <p className="text-2xl leading-[1.35] md:text-[34px]">{s.description}</p>
        </Reveal>
      </section>

      <section className="container-x pb-24 md:pb-32">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-hair bg-hair md:grid-cols-2">
          {s.features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 0.06} className="bg-stone p-8 md:p-10">
              <span className="label text-ember">0{i + 1}</span>
              <h2 className="mt-8 text-2xl font-semibold">{f.title}</h2>
              <p className="mt-2 max-w-md text-lg text-graphite/65">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper text-umber">
        <div className="container-x grid gap-14 py-24 md:py-32 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label mb-6 opacity-60">What you get</p>
            <ul className="border-t border-umber/15">
              {s.deliverables.map((d) => (
                <li key={d} className="flex items-center gap-4 border-b border-umber/15 py-4 text-lg font-medium">
                  <span className="size-1.5 rounded-full bg-ember" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="label mb-6 opacity-60">Technologies</p>
            <div className="flex flex-wrap gap-2">
              {s.tools.map((t) => (
                <span key={t} className="rounded-full border border-umber/20 px-4 py-2 text-[15px]">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="container-x"><div className="h-px bg-umber/15" /></div>
      </section>

      <Faq items={s.faq} title="Questions" />

      <section className="container-x py-16">
        <Link href={`/services/${next.slug}`} className="group flex items-end justify-between gap-6 border-b border-hair pb-10">
          <span>
            <span className="label text-graphite/65">Next service</span>
            <span className="wide mt-3 block text-[4.6vw] transition-colors group-hover:text-ember md:text-[3.6vw] 2xl:text-[52px]">{next.title}</span>
          </span>
          <span className="text-4xl transition-transform group-hover:translate-x-2">→</span>
        </Link>
      </section>

      <CTA />
    </>
  );
}
