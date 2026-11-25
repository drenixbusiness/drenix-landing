import { SectionHead } from "@/components/ui/Misc";
import { floorInfo } from "@/lib/tower";
import { FloorsList } from "./FloorsList";

/** All departments as a list. */
export function FloorsTable() {
  return (
    <section className="cv bg-stone text-graphite [--cv:1400px]">
      <div className="container-x py-20 md:py-28">
        <SectionHead title="All|departments" text="Every floor is its own team. Start with one, or combine several in one project: you still talk to one manager." />
        <FloorsList floors={floorInfo} />
      </div>
    </section>
  );
}
