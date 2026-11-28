import type { Metadata } from "next";
import { CTA } from "@/components/sections/CTA";
import { CaseCard } from "@/components/sections/CaseCard";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";
import { cases } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects delivered by the DRENIX team: platforms, marketing, AI bots and CRM systems.",
};

export default function CasesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/projects", label: "Projects" }]}
        image="hero-projects"
        title="Projects"
        text="Every project started from a clear business goal. We share detailed case studies, including numbers and client-approved details, in a meeting."
      >
        <Button href="/contact">Ask for a case</Button>
      </PageHero>
      <section className="container-x py-14 md:py-20 lg:py-28">
        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 md:gap-y-16">
          {cases.map((c, i) => (
            <CaseCard key={c.slug} c={c} index={i} />
          ))}
        </div>
      </section>
      <CTA title="Make the next|project yours" />
    </>
  );
}
