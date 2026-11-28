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
        <div className="container-x grid items-center gap-6 py-14 md:gap-12 md:py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-5">
            <Image src="/brand/drenix-logo.png" alt="DRENIX logo: a phoenix with open wings" width={900} height={817} sizes="(min-width: 1480px) 400px, (min-width: 1024px) 26.6vw, (min-width: 768px) calc(72vw - 63px), calc(52vw - 21px)" className="mx-auto h-auto w-[52%] md:w-[72%]" />
          </Reveal>
          <p className="text-[19px] leading-[1.5] md:text-[26px] lg:col-span-6 lg:col-start-7">
            The phoenix is the bird that renews itself and comes back stronger. We help companies renew themselves the same way: we replace outdated processes with digital tools and speed up growth.
          </p>
        </div>
      </section>

      <section className="cv container-x py-14 [--cv:760px] md:py-20 md:[--cv:600px] lg:py-28">
        <SectionHead title="How|we work" />
        <ul className="mt-8 grid gap-x-12 gap-y-8 md:mt-12 md:grid-cols-2 md:gap-y-12">
          {values.map((v, i) => (
            <li key={v.title}>
              <Reveal delay={(i % 2) * 0.06} className="flex gap-4 md:gap-5">
                <span className="grid size-11 shrink-0 md:size-12 place-items-center rounded-full bg-ember/15 text-ember-text"><Icon name={valueIcons[i]} className="size-6" /></span>
                <div>
                  <h3 className="text-[20px] font-semibold leading-tight md:text-[22px]">{v.title}</h3>
                  <p className="mt-1.5 max-w-md text-[16px] leading-relaxed text-smoke md:mt-2 md:text-[17px]">{v.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="cv container-x pb-14 [--cv:1080px] md:pb-20 md:[--cv:930px] lg:pb-28">
        <SectionHead title="Ten|departments" text="Each project pulls in the specialists it needs from every floor. You work with one manager." />
        <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hair bg-hair md:mt-12">
          {floors.map((f) => (
            <li key={f.slug} className="bg-stone">
              <Link href={`/services/${f.slug}`} className="group flex h-full flex-col items-start gap-3 p-4 transition-colors hover:bg-paper sm:flex-row sm:gap-5 sm:p-6 md:p-8">
                <Icon name={departmentIcon[f.slug]} className="mt-0.5 size-6 text-ember-text sm:size-7" />
                <span className="flex-1">
                  <span className="block text-[17px] font-semibold sm:text-[20px]">{f.name}</span>
                  <span className="mt-1 block text-[14px] leading-snug text-smoke sm:text-[17px] sm:leading-relaxed">{f.lead}</span>
                </span>
                <Icon name="arrow-right" className="mt-1.5 size-5 transition-transform group-hover:translate-x-1 max-sm:hidden" />
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
