import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Mockup } from "@/components/mockups/Mockups";
import { Faq } from "@/components/sections/Faq";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { launchpadStages } from "@/lib/data";

export const metadata: Metadata = {
  title: "For startups — DRENIX Launchpad",
  description: "Idea validation, MVP, pitch deck and investment: a support program for startup founders.",
};

const perks = [
  { icon: "users", title: "Product team", text: "A product manager, designer and developers until you build your own team." },
  { icon: "layers", title: "Solid technical foundation", text: "An architecture you won’t have to rewrite later." },
  { icon: "pen", title: "Brand and pitch", text: "A brand, pitch deck and demo investors will remember." },
  { icon: "chart", title: "First customers", text: "Go-to-market plan, content and ads." },
  { icon: "compass", title: "Weekly sessions", text: "On the business model, unit economics and priorities." },
  { icon: "rocket", title: "Investor introductions", text: "Accelerators, angel investors and funds." },
] as const;

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
        image="hero-startups"
        title="For startups"
        text="A support program for founders. Idea validation, MVP, brand, marketing and investor relations in one team."
        facts={[
          { label: "Stages", value: "4" },
          { label: "MVP timeline", value: "8–12 weeks" },
          { label: "Payment model", value: "Cash or cash + equity" },
          { label: "Intake", value: "Rolling" },
        ]}
      >
        <Button href="/contact?service=startup">Apply</Button>
        <Button href="/services/startup-support" variant="glass">Launchpad floor</Button>
      </PageHero>

      <section className="cv container-x pb-14 pt-8 [--cv:330px] md:py-20 md:[--cv:860px] lg:py-28">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-ember-deep px-5 pt-10 sm:px-16 sm:pt-16 lg:px-28">
            <div className="mx-auto -mb-10 max-w-[900px]">
              <Mockup kind="pitch" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="cv container-x pb-14 [--cv:960px] md:pb-20 md:[--cv:700px] lg:pb-28">
        <SectionHead title="Four|stages" />
        <ol className="mt-8 border-t border-hair md:mt-12">
          {launchpadStages.map((s, i) => (
            <li key={s.no} className="border-b border-hair">
              <Reveal delay={i * 0.05} className="grid gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-3 md:py-8">
                <h3 className="wide text-[24px] text-ember-text md:col-span-3">{s.title}</h3>
                <p className="text-[19px] font-semibold md:col-span-3">{s.sub}</p>
                <p className="text-[17px] leading-relaxed text-smoke md:col-span-4">{s.text}</p>
                <p className="flex gap-2 text-[16px] text-smoke md:col-span-2 md:justify-end"><Icon name="clock" className="mt-0.5 size-5" />{s.weeks}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="cv bg-paper [--cv:900px] md:[--cv:700px]">
        <div className="container-x py-14 md:py-20 lg:py-28">
          <SectionHead title="Inside the|program" />
          <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2 md:mt-12 md:gap-y-12 lg:grid-cols-3">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.05} className="flex gap-4 sm:block">
                <Icon name={p.icon} className="size-7 shrink-0 text-ember-text sm:size-8" />
                <div>
                  <h3 className="text-[19px] font-semibold sm:mt-4 sm:text-[20px]">{p.title}</h3>
                  <p className="mt-1.5 text-[16px] leading-relaxed text-smoke sm:mt-2 sm:text-[17px]">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cv container-x grid gap-6 py-14 [--cv:520px] md:gap-10 md:py-20 md:[--cv:490px] lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          <h2 className="wide text-[clamp(26px,7vw,38px)] leading-[1.1]">You’re a good fit if</h2>
        </div>
        <ul className="self-end border-t border-hair lg:col-span-6 lg:col-start-7">
          {fit.map((f) => (
            <li key={f} className="flex items-start gap-4 border-b border-hair py-4 text-[17px] leading-snug md:py-5 md:text-[18px]">
              <Icon name="check" className="mt-0.5 size-5 text-ember-text" />
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
