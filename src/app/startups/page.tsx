import type { Metadata } from "next";
import { PageHero, FactList } from "@/components/sections/PageHero";
import { Mockup } from "@/components/mockups/Mockups";
import { Faq } from "@/components/sections/Faq";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { launchpadStages } from "@/lib/data";

export const metadata: Metadata = {
  title: "For startups — DRENIX Launchpad",
  description: "Idea validation, MVP, pitch deck and investment: a support program for startup founders.",
};

const perks = [
  { title: "Product team", text: "A product manager, designer and developers until you build your own team." },
  { title: "Solid technical foundation", text: "An architecture you won’t have to rewrite later." },
  { title: "Brand and pitch", text: "A brand, pitch deck and demo investors will remember." },
  { title: "First customers", text: "Go-to-market plan, content and ads." },
  { title: "Weekly sessions", text: "On the business model, unit economics and priorities." },
  { title: "Investor introductions", text: "Accelerators, angel investors and funds." },
];

const fit = [
  "You have an idea that solves a real problem",
  "A founder can work on it full time",
  "You are ready to change the product based on market feedback",
  "You want a long-term partner, not a one-off order",
];

const faq = [
  { q: "Do you work for equity?", a: "A mixed model is possible on some projects: part cash, part equity. We look at each case individually." },
  { q: "I only have an idea. Is that enough?", a: "Yes. The program starts with validating the idea." },
  { q: "How long does it take to review an application?", a: "3 business days. Then we invite you to an intro meeting." },
];

export default function StartupsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/startups", label: "Startups" }]}
        image="/media/startup-team.webp"
        title="For startups"
        text="A support program for founders. Idea validation, MVP, brand, marketing and investor relations in one team."
        aside={
          <FactList
            items={[
              { label: "Stages", value: "4" },
              { label: "MVP timeline", value: "8–12 weeks" },
              { label: "Payment model", value: "Cash or cash + equity" },
              { label: "Intake", value: "Rolling" },
            ]}
          />
        }
      >
        <Reveal delay={0.6} className="mt-10">
          <Button href="/contact?service=startup">Apply</Button>
        </Reveal>
      </PageHero>

      <section className="container-x">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-ember px-5 pt-10 sm:px-16 sm:pt-16 lg:px-28">
            <div className="mx-auto -mb-10 max-w-[900px]">
              <Mockup kind="pitch" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-x py-24 md:py-36">
        <SectionHead title="Four|stages" />
        <ol className="mt-16 border-t border-hair">
          {launchpadStages.map((s, i) => (
            <Reveal key={s.no} delay={i * 0.05}>
              <li className="grid gap-3 border-b border-hair py-8 md:grid-cols-12 md:items-baseline">
                <span className="wide text-3xl text-ember md:col-span-3">{s.title}</span>
                <span className="text-xl font-medium md:col-span-3">{s.sub}</span>
                <span className="text-graphite/65 md:col-span-4">{s.text}</span>
                <span className="label text-graphite/50 md:col-span-2 md:text-right">{s.weeks}</span>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-paper text-umber">
        <div className="container-x py-24 md:py-32">
          <SectionHead title="Inside the|program" />
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-umber/15 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.05} className="bg-paper p-7 md:p-9">
                <span className="label text-ember-deep">0{i + 1}</span>
                <h3 className="mt-8 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-umber/70">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 py-24 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="wide text-[6.4vw] sm:text-4xl">You’re a good fit if</h2>
        </div>
        <ul className="self-end border-t border-hair lg:col-span-6 lg:col-start-7">
          {fit.map((f) => (
            <li key={f} className="flex items-center gap-4 border-b border-hair py-5 text-lg">
              <span className="text-ember">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      <Faq items={faq} />
      <CTA title="We look forward to|your application" />
    </>
  );
}
