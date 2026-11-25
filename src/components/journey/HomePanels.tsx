"use client";

import { useCallback, type RefObject } from "react";
import { Icon } from "@/components/ui/Icon";
import { floorInfo, floors } from "@/lib/tower";
import { solidBtn } from "./buttons";
import { Layer } from "./Layer";
import { Directory, DonePanel, Elevator, FloorChips, FloorSelect, PlanPanel } from "./panels";
import { FloorCard } from "./parts";
import { RoomArticle, RoomLabels, RoomNav } from "./rooms";
import { ZONE_COUNT, type Stage } from "./scene/timeline";

type Props = {
  stage: Stage;
  floor: number;
  zone: number;
  hoverZone: number;
  labelEls: RefObject<(HTMLElement | null)[]>;
  onFloor: (i: number) => void;
  onStep: (d: number) => void;
  onEnter: (i: number) => void;
  onEnterCurrent: () => void;
  onZone: (i: number) => void;
  onHoverRoom: (i: number) => void;
};

/** Everything over the 3D scene after the first screen. Its own file with the department texts, loaded after the page. */
export default function HomePanels({ stage, floor, zone, hoverZone, labelEls, onFloor, onStep, onEnter, onEnterCurrent, onZone, onHoverRoom }: Props) {
  const f = floors[floor];
  const inside = stage === "open" || stage === "plan" || stage === "zone" || stage === "done";
  const onNext = useCallback(() => onEnter(floor + 1), [onEnter, floor]);
  const firstRoom = useCallback(() => onZone(0), [onZone]);

  return (
    <>
      {/* ---------- 2. Tower: directory ---------- */}
      <Layer on={stage === "tower"} className="pointer-events-none absolute inset-0 z-10">
        <div className="container-x flex h-full flex-col justify-between pb-4 pt-[84px] desk:justify-center desk:pb-0 desk:pt-[69px] short:pt-[62px]">
          <div className="pointer-events-auto max-w-[23rem] desk:w-[17rem] roomy:w-[23rem]">
            <h2 className="wide text-[22px] leading-[1.15] text-graphite low:text-[20px] short:sr-only desk:text-[28px]">Ten floors, ten departments</h2>
            <div className="hidden desk:block">
              <Directory floors={floorInfo} active={floor} onPreview={onFloor} onEnter={onEnter} />
            </div>
          </div>
          <div data-block="tower" className="pointer-events-auto mx-auto w-full max-w-[560px] space-y-3 desk:hidden short:mx-0 short:w-1/2">
            <div className="tiny:hidden short:hidden"><FloorChips floors={floorInfo} active={floor} onPick={onFloor} /></div>
            <FloorCard floor={floorInfo[floor]} onStep={onStep} onEnter={onEnterCurrent} compact />
          </div>
        </div>
      </Layer>

      {/* ---------- 3. Plan of the floor ---------- */}
      <Layer on={stage === "plan"} className="pointer-events-none absolute inset-0 z-10">
        <RoomLabels floor={f} active={hoverZone} els={labelEls} onHover={onHoverRoom} onPick={onZone} />
      </Layer>
      <Layer on={stage === "plan"} className="pointer-events-none absolute inset-x-0 top-0 z-10 desk:inset-y-0">
        <div className="container-x flex h-full flex-col pt-[132px] desk:justify-center desk:pt-[69px] short:pt-[76px]">
          <div data-block="plan" className="pointer-events-auto desk:w-[26rem] short:w-[46%]">
            <PlanPanel floor={f} zone={hoverZone} onHover={onHoverRoom} onPick={onZone} />
          </div>
        </div>
      </Layer>
      <Layer on={stage === "plan"} className="pointer-events-none absolute inset-x-0 bottom-5 z-10 desk:hidden">
        <div className="container-x">
          <button type="button" onClick={firstRoom} className={`${solidBtn} pointer-events-auto w-full short:w-[46%]`}>
            Walk through the rooms <Icon name="arrow-right" />
          </button>
        </div>
      </Layer>

      {/* ---------- 4. Rooms ---------- */}
      <Layer on={stage === "zone"} className="pointer-events-none absolute inset-0 z-10">
        <div className="container-x flex h-full flex-col justify-end pb-3 desk:justify-center desk:pb-0 desk:pt-[69px]">
          <div data-block="zone" className="panel-light pointer-events-auto mx-auto flex max-h-[66svh] w-full max-w-[560px] flex-col rounded-2xl text-graphite desk:mx-0 desk:max-h-[calc(100svh-120px)] desk:w-[27rem] short:mx-0 short:max-h-[calc(100svh-84px)] short:w-1/2">
            <div className="overflow-y-auto p-5 pb-3 [scrollbar-width:thin] low:p-4 low:pb-2 short:p-4 short:pb-2 flat:p-3 flat:pb-1.5 desk:p-7 desk:pb-4 squat:p-5 squat:pb-3">
              <h2 className="sr-only">Rooms of the {f.name} floor</h2>
              <div className="grid">
                {f.department.zones.map((z, i) => <RoomArticle key={z.id} floor={f} index={i} on={i === zone} />)}
              </div>
            </div>
            <div className="border-t border-hair px-5 py-3 low:px-4 low:py-2 short:px-4 short:py-1.5 flat:py-0.5 desk:px-7 desk:py-4 squat:px-5 squat:py-2.5">
              <RoomNav index={zone} total={ZONE_COUNT} onGo={onZone} />
            </div>
          </div>
        </div>
      </Layer>

      {/* ---------- 5. Result ---------- */}
      <Layer on={stage === "done"} className="pointer-events-none absolute inset-0 z-10">
        <div className="container-x flex h-full flex-col justify-end pb-4 desk:justify-center desk:pb-0 desk:pt-[69px]">
          <div data-block="done" className="panel-light pointer-events-auto mx-auto max-h-[calc(100svh-150px)] w-full max-w-[560px] overflow-y-auto rounded-2xl p-5 low:p-4 tiny:max-h-[calc(100svh-134px)] desk:mx-0 desk:max-h-[calc(100svh-100px)] desk:w-[27rem] desk:p-7 squat:p-5 short:mx-0 short:max-h-[calc(100svh-84px)] short:w-1/2 short:p-4 flat:p-3">
            <DonePanel floor={f} next={floorInfo[(floor + 1) % floorInfo.length]} onNext={onNext} />
          </div>
        </div>
      </Layer>

      {/* ---------- Always there inside the floor ---------- */}
      <Layer on={inside} className="pointer-events-none absolute inset-y-0 right-11 z-20 hidden items-center pt-[69px] desk:flex">
        <div className="pointer-events-auto"><Elevator floors={floorInfo} active={floor} onPick={onFloor} /></div>
      </Layer>
      <Layer on={inside} className="pointer-events-none absolute inset-x-0 top-[76px] z-20 desk:hidden short:z-[60] short:top-3">
        <div className="container-x flex short:justify-center [&>*]:pointer-events-auto"><FloorSelect floors={floorInfo} active={floor} onPick={onFloor} /></div>
      </Layer>
    </>
  );
}
