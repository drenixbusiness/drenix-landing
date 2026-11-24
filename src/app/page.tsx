import { HomeJourney } from "@/components/journey/HomeJourney";
import { FloorsTable } from "@/components/tower/FloorsTable";
import { Portal } from "@/components/tower/Portal";
import { ProcessLine } from "@/components/tower/ProcessLine";
import { LaunchpadBand } from "@/components/tower/LaunchpadBand";
import { CaseStack } from "@/components/sections/CaseStack";
import { Faq } from "@/components/sections/Faq";
import { CTA } from "@/components/sections/CTA";
import { SectionHead } from "@/components/ui/Misc";
import { TextLink } from "@/components/ui/Button";
import { cases, generalFaq } from "@/lib/data";

export default function Home() {
  return (
    <>
      <HomeJourney />
      <FloorsTable />
      <Portal />
      <ProcessLine />

      <section className="bg-stone text-graphite" data-header="dark">
        <div className="container-x pt-24 md:pt-32">
          <SectionHead title="Our|work" action={<TextLink href="/projects">All projects</TextLink>} />
          <div className="mt-14 pb-16">
            <CaseStack cases={cases} />
          </div>
        </div>
      </section>

      <LaunchpadBand />
      <Faq items={generalFaq} />
      <CTA />
    </>
  );
}
