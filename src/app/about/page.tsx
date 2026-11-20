import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/sections/PageHero";
import { Process } from "@/components/sections/Process";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Misc";
import { values } from "@/lib/data";

export const metadata: Metadata = {
  title: "About the company",
  description: "DRENIX is an IT company that brings developers, designers, marketers and business strategists together in one team.",
};

const teams = [
  { name: "Engineering", text: "Web, mobile, backend, DevOps and QA" },
  { name: "Design", text: "Brand, interfaces, motion" },
  { name: "Growth", text: "Ads, SMM, SEO and analytics" },
  { name: "Strategy", text: "Business analysis, consulting and Launchpad" },
  { name: "Delivery", text: "Project managers: your single point of contact" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/about", label: "Company" }]}
        image="/media/tashkent.webp"
        title="A partner, not a contractor"
        text="Many companies get their website from one agency, their ads from another and their CRM from a third, and nobody is responsible for the overall result. DRENIX brings all of this into one team."
      />

      <section className="bg-paper text-umber">
        <div className="container-x grid items-center gap-14 py-24 md:py-32 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="grid aspect-square place-items-center rounded-2xl bg-paper">
              <Image src="/brand/drenix-logo.png" alt="DRENIX logo" width={900} height={655} className="h-auto w-[72%]" />
            </div>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-2xl leading-[1.35] md:text-[32px]">
              The phoenix is the bird that renews itself and comes back stronger. We help companies renew themselves the same way: we replace outdated processes with digital tools and speed up growth.
            </p>
          </div>
        </div>
      </section>

      <section className="container-x py-24 md:py-32">
        <SectionHead title="How|we work" />
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-hair bg-hair md:grid-cols-2">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={(i % 2) * 0.06} className="bg-stone p-8 md:p-10">
              <span className="label text-ember">0{i + 1}</span>
              <h3 className="mt-8 text-2xl font-semibold">{v.title}</h3>
              <p className="mt-2 max-w-md text-lg text-graphite/65">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x pb-24 md:pb-32">
        <SectionHead title="Five|departments" text="Each project pulls in the specialists it needs from every department. You work with one manager." />
        <ul className="mt-16 border-t border-hair">
          {teams.map((t) => (
            <li key={t.name} className="grid gap-2 border-b border-hair py-7 md:grid-cols-12 md:items-baseline">
              <span className="wide text-2xl md:col-span-5 md:text-3xl">{t.name}</span>
              <span className="text-lg text-graphite/65 md:col-span-7">{t.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <Process tone="light" />
      <CTA title="Shall we meet?" />
    </>
  );
}
