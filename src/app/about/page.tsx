import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTA } from "@/components/sections/CTA";
import { PageHero } from "@/components/sections/PageHero";
import { Process } from "@/components/sections/Process";
import { Button } from "@/components/ui/Button";
import { Icon, departmentIcon } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Misc";
import { Reveal } from "@/components/ui/Reveal";
import { values } from "@/lib/data";
import { floors } from "@/lib/tower";

export const metadata: Metadata = {
  title: "About the company",
  description: "DRENIX is an IT company that brings developers, designers, marketers and business strategists together in one team.",
};

const valueIcons = ["chart", "monitor", "users", "flag"] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/about", label: "Company" }]}
        image="hero-about"
        title="A partner, not a contractor"
        text="Many companies get their website from one agency, their ads from another and their CRM from a third, and nobody is responsible for the overall result. DRENIX brings all of this into one team."
      >
        <Button href="/contact">Book a meeting</Button>
      </PageHero>

      <section className="cv bg-paper [--cv:600px]">
        <div className="container-x grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Image src="/brand/drenix-logo.png" alt="DRENIX logo: a phoenix with open wings" width={900} height={655} sizes="(min-width: 1024px) 32vw, 70vw" className="mx-auto h-auto w-[72%]" />
          </Reveal>
          <p className="text-[21px] leading-[1.5] md:text-[26px] lg:col-span-6 lg:col-start-7">
            The phoenix is the bird that renews itself and comes back stronger. We help companies renew themselves the same way: we replace outdated processes with digital tools and speed up growth.
          </p>
        </div>
      </section>

      <section className="cv container-x py-20 [--cv:880px] md:py-28 md:[--cv:600px]">
        <SectionHead title="How|we work" />
        <ul className="mt-12 grid gap-x-12 gap-y-12 md:grid-cols-2">
          {values.map((v, i) => (
            <li key={v.title}>
              <Reveal delay={(i % 2) * 0.06} className="flex gap-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ember/15 text-ember-text"><Icon name={valueIcons[i]} className="size-6" /></span>
                <div>
                  <h3 className="text-[22px] font-semibold leading-tight">{v.title}</h3>
                  <p className="mt-2 max-w-md text-[17px] leading-relaxed text-smoke">{v.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="cv container-x pb-20 [--cv:1890px] md:pb-28 md:[--cv:930px]">
        <SectionHead title="Ten|departments" text="Each project pulls in the specialists it needs from every floor. You work with one manager." />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-hair bg-hair sm:grid-cols-2">
          {floors.map((f) => (
            <li key={f.slug} className="bg-stone">
              <Link href={`/services/${f.slug}`} className="group flex h-full items-start gap-5 p-6 transition-colors hover:bg-paper md:p-8">
                <Icon name={departmentIcon[f.slug]} className="mt-0.5 size-7 text-ember-text" />
                <span className="flex-1">
                  <span className="block text-[20px] font-semibold">{f.name}</span>
                  <span className="mt-1 block text-[17px] leading-relaxed text-smoke">{f.lead}</span>
                </span>
                <Icon name="arrow-right" className="mt-1.5 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Process />
      <CTA title="Shall we meet?" />
    </>
  );
}
