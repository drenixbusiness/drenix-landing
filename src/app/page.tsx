import { HomeJourney } from "@/components/journey/HomeJourney";
import { Poster } from "@/components/journey/Poster";
import { FloorsTable } from "@/components/tower/FloorsTable";
import { Portal } from "@/components/tower/Portal";
import { ProcessLine } from "@/components/tower/ProcessLine";
import { LaunchpadBand } from "@/components/tower/LaunchpadBand";
import { CaseSlide, CaseStack } from "@/components/sections/CaseStack";
import { Faq } from "@/components/sections/Faq";
import { CTA } from "@/components/sections/CTA";
import { SectionHead } from "@/components/ui/Misc";
import { TextLink } from "@/components/ui/Button";
import { cases, generalFaq } from "@/lib/data";
import { floorInfo } from "@/lib/tower";

export default function Home() {
  return (
    <>
      <HomeJourney floors={floorInfo} poster={<Poster />} />
      <FloorsTable />
      <Portal />
      <ProcessLine />

      <section className="bg-stone text-graphite" data-header="dark">
        <div className="container-x pt-14 md:pt-24 lg:pt-32">
          <SectionHead title="Our|work" action={<TextLink href="/projects">All projects</TextLink>} />
          <div className="mt-8 pb-8 md:mt-14 md:pb-16">
            <CaseStack total={cases.length}>
              {cases.map((c, i) => <CaseSlide key={c.slug} c={c} index={i} />)}
            </CaseStack>
          </div>
        </div>
      </section>

      <LaunchpadBand />
      <Faq items={generalFaq} />
      <CTA />
    </>
  );
}
