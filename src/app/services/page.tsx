import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, FactList } from "@/components/sections/PageHero";
import { Mockup } from "@/components/mockups/Mockups";
import { Process } from "@/components/sections/Process";
import { Faq } from "@/components/sections/Faq";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/ui/Reveal";
import { generalFaq, services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Web and mobile development, design, marketing, business development, startups, AI, DevOps, security, CRM and IT outsourcing.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/services", label: "Services" }]}
        image="/media/tower-glass.webp"
        title="Services"
        text="Start with one service or combine several. If you are not sure which one you need, we will figure it out together in a free audit."
        aside={
          <FactList
            items={[
              { label: "Engagement", value: "Project or monthly" },
              { label: "Initial audit", value: "Free" },
              { label: "Estimate", value: "In 3–5 days" },
              { label: "Warranty", value: "12 months" },
            ]}
          />
        }
      />

      <section className="container-x pb-24 md:pb-36">
        <div className="border-t border-hair">
          {services.map((s) => (
            <Reveal key={s.slug} delay={0.02}>
              <Link href={`/services/${s.slug}`} className="group grid gap-8 border-b border-hair py-10 md:grid-cols-12 md:items-center md:py-12">
                <div className="md:col-span-6 lg:col-span-5">
                  <span className="label text-ember">{s.no}</span>
                  <h2 className="wide mt-3 text-[4.6vw] transition-colors group-hover:text-ember sm:text-[3.6vw] md:text-[2.2vw] lg:text-[2vw] 2xl:text-[30px]">{s.title}</h2>
                  <p className="mt-4 max-w-md text-lg text-graphite/65">{s.summary}</p>
                  <p className="mt-6 text-sm text-graphite/65">{s.timeline}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-medium">
                    <span className="border-b border-graphite/30 pb-0.5 group-hover:border-graphite">Details</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
                <div className="md:col-span-6 lg:col-start-7">
                  <div className="overflow-hidden rounded-[14px] bg-graphite px-5 pt-6 sm:px-8 sm:pt-8">
                    <div className="-mb-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5">
                      <Mockup kind={s.mock} />
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Process tone="light" />
      <Faq items={generalFaq} />
      <CTA />
    </>
  );
}
