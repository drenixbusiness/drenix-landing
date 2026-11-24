import type { Metadata } from "next";
import Link from "next/link";
import { CTA } from "@/components/sections/CTA";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { Process } from "@/components/sections/Process";
import { Mockup } from "@/components/mockups/Mockups";
import { Icon, departmentIcon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { generalFaq, services } from "@/lib/data";
import { floors } from "@/lib/tower";

export const metadata: Metadata = {
  title: "Services",
  description: "Web and mobile development, design, marketing, business development, startups, AI, DevOps, security, CRM and IT outsourcing.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/services", label: "Services" }]}
        image="hero-services"
        title="Services"
        text="Ten departments, one team. Start with one service or combine several. If you are not sure which one you need, we will figure it out together in a free audit."
        facts={[
          { label: "Engagement", value: "Project or monthly" },
          { label: "Initial audit", value: "Free" },
          { label: "Estimate", value: "In 3–5 days" },
          { label: "Warranty", value: "12 months" },
        ]}
      />

      <section className="container-x py-16 md:py-24">
        <ul>
          {services.map((s, i) => {
            const f = floors[i];
            return (
              <li key={s.slug} className="cv border-t border-hair [--cv:640px] last:border-b md:[--cv:545px]">
                <Reveal delay={0.02}>
                  <Link href={`/services/${s.slug}`} className="group grid gap-8 py-10 md:grid-cols-12 md:items-center md:py-14">
                    <div className="md:col-span-6 lg:col-span-5">
                      <p className="flex items-center gap-4">
                        <span className="wide tabular text-[30px] leading-none">{f.level}</span>
                        <span className="grid size-11 place-items-center rounded-full bg-ember/15 text-ember-text"><Icon name={departmentIcon[s.slug]} className="size-5" /></span>
                        <span className="text-[17px] font-semibold">{f.name}</span>
                      </p>
                      <h2 className="wide mt-5 text-[24px] leading-[1.15] transition-colors group-hover:text-ember-text md:text-[28px]">{s.title}</h2>
                      <p className="mt-4 max-w-md text-[18px] leading-relaxed text-smoke">{s.summary}</p>
                      <p className="mt-5 flex items-center gap-2 text-[16px] text-smoke"><Icon name="clock" className="size-5" />{s.timeline}</p>
                      <span className="mt-5 inline-flex min-h-11 items-center gap-3 text-[16px] font-medium">
                        <span className="underline decoration-graphite/30 underline-offset-[6px] group-hover:decoration-graphite">See how we work</span>
                        <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                    <div className="md:col-span-6 lg:col-start-7">
                      <div className="overflow-hidden rounded-2xl bg-graphite px-5 pt-6 sm:px-8 sm:pt-8">
                        <div className="-mb-6 transition-transform duration-700 ease-out-expo group-hover:-translate-y-1.5">
                          <Mockup kind={s.mock} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      <Process />
      <Faq items={generalFaq} />
      <CTA />
    </>
  );
}
