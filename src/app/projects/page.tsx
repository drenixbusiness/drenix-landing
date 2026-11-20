import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { CaseCard } from "@/components/sections/CaseCard";
import { CTA } from "@/components/sections/CTA";
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
        image="/media/workspace-city.webp"
        title="Projects"
        text="Every project started from a clear business goal. We share detailed case studies, including numbers and client-approved details, in a meeting."
      />
      <section className="container-x pb-24 md:pb-36">
        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {cases.map((c, i) => (
            <CaseCard key={c.slug} c={c} index={i} />
          ))}
        </div>
      </section>
      <CTA title="Make the next|project yours" />
    </>
  );
}
