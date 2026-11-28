import Image from "next/image";
import { Icon, zoneIcon } from "@/components/ui/Icon";
import type { Department } from "@/lib/departments";
import { roomStill } from "./layout";

/** All rooms of a department as a plain list: the version without 3D and without scroll effects. */
export function RoomGrid({ department }: { department: Department }) {
  return (
    <ol className="grid gap-x-8 gap-y-8 md:gap-y-12 md:grid-cols-2 xl:grid-cols-3">
      {department.zones.map((z, i) => (
        <li key={z.id}>
          <Image src={roomStill(z.id)} alt="" width={1200} height={860} quality={75} sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" className="h-auto w-full rounded-2xl" />
          <div className="mt-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-ember/15 text-ember-text"><Icon name={zoneIcon[z.id]} className="size-5" /></span>
            <p className="text-[15px] font-semibold">{i + 1}. {z.room}</p>
          </div>
          <h3 className="mt-3 text-[21px] font-semibold leading-tight">{z.title}</h3>
          <p className="mt-2 text-[16px] leading-relaxed text-smoke">{z.text}</p>
          <ul className="mt-4 space-y-2">
            {z.tasks.map((t) => (
              <li key={t} className="flex gap-3 text-[15px] leading-snug"><Icon name="check" className="mt-0.5 size-4 text-ember-text" />{t}</li>
            ))}
          </ul>
          <p className="mt-4 text-[15px]"><span className="text-smoke">You get: </span><span className="font-semibold">{z.output}</span></p>
        </li>
      ))}
    </ol>
  );
}
