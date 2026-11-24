"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { floors } from "@/lib/tower";
import { Poster } from "./Poster";
import { RoomGrid } from "./RoomGrid";
import { roomStill } from "./layout";
import { FloorChips, FloorSelect, ghostBtn, solidBtn } from "./parts";

/**
 * The same story without 3D and without scroll effects: for weak devices, slow networks,
 * browsers without WebGL and visitors who asked for less motion.
 */
export function JourneyStatic({ floor, onFloor }: { floor: number; onFloor: (i: number) => void }) {
  const f = floors[floor];
  const d = f.department;
  const toRooms = () => document.getElementById("departments")?.scrollIntoView({ block: "start" });

  return (
    <section aria-label="DRENIX campus and departments">
      <div className="relative h-[100svh] min-h-[560px] overflow-hidden bg-stone">
        <Poster />
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-stone/85 via-stone/45 to-transparent lg:block" />
          <div className="absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-stone/95 via-stone/60 to-transparent lg:h-28 lg:from-stone/60" />
        </div>
        <div className="container-x relative flex h-full flex-col pt-[88px] lg:justify-center lg:pt-[69px]">
          <h1 className="wide text-[clamp(30px,8.6vw,44px)] leading-[1.06] text-graphite lg:text-[clamp(44px,4vw,64px)]">
            Rise to<br />a new<br />level
          </h1>
          <p className="mt-4 max-w-[25rem] text-[16px] leading-relaxed text-graphite/85 lg:mt-6 lg:text-[18px]">
            A ten-floor IT company. Every floor is a department. Pick one and see how we work, room by room.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5 lg:mt-8">
            <button type="button" onClick={toRooms} className={solidBtn}>Choose a floor <Icon name="arrow-down" /></button>
            <Link href="/contact" className={ghostBtn}>Book a meeting</Link>
          </div>
        </div>
      </div>

      <div id="departments" className="container-x scroll-mt-[-72px] py-20 md:py-28">
        <h2 className="wide text-[26px] leading-[1.12] text-graphite md:text-[38px]">Ten floors, ten departments</h2>
        <div className="mt-8 hidden md:block"><FloorChips active={floor} onPick={onFloor} /></div>
        <div className="mt-6 md:hidden"><FloorSelect active={floor} onPick={onFloor} /></div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[24px] font-semibold leading-tight">{d.name}</p>
            <p className="mt-3 text-[17px] leading-relaxed text-smoke">{d.about}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href={`/contact?service=${f.slug}`} className={solidBtn}>Start with {f.name} <Icon name="arrow-right" /></Link>
              <Link href={`/services/${f.slug}`} className={ghostBtn}>Department page</Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <Image src={roomStill("plan")} alt={`Plan of the ${f.name} office with six rooms`} width={1600} height={1000} quality={75} sizes="(min-width: 1024px) 55vw, 100vw" className="h-auto w-full rounded-2xl" />
          </div>
        </div>

        <div className="mt-12"><RoomGrid department={d} /></div>
      </div>
    </section>
  );
}
