"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon, departmentIcon } from "@/components/ui/Icon";
import type { FloorInfo } from "@/lib/tower";

const filters = [
  { id: "all", label: "All departments", slugs: null },
  { id: "build", label: "Build", slugs: ["web-and-mobile-development", "ui-ux-design-and-branding", "cloud-and-devops", "cybersecurity"] },
  { id: "grow", label: "Grow", slugs: ["digital-marketing", "business-development", "crm-and-erp"] },
  { id: "launch", label: "Launch", slugs: ["startup-support", "ai-and-automation", "it-outsourcing"] },
] as const;

/** Filters, rows, and the picture of the floor whose row is under the pointer or focus. */
export function FloorsList({ floors }: { floors: FloorInfo[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [current, setCurrent] = useState(0);
  const slugs: readonly string[] | null = filters.find((x) => x.id === filter)?.slugs ?? null;

  return (
    <>
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter departments">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-11 rounded-full border px-5 text-[15px] font-medium transition-colors ${filter === f.id ? "border-graphite bg-graphite text-white" : "border-graphite/25 hover:border-graphite"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <ul className="border-t border-graphite/60 lg:col-span-7">
            {floors.map((f, i) => {
              if (slugs && !slugs.includes(f.slug)) return null;
              return (
                <li key={f.slug} className="border-b border-hair">
                  <Link
                    href={`/services/${f.slug}`}
                    onMouseEnter={() => setCurrent(i)}
                    onFocus={() => setCurrent(i)}
                    className={`group flex items-center gap-4 rounded-lg px-2 py-5 transition-colors md:gap-6 md:px-3 ${current === i ? "lg:bg-white/70" : ""}`}
                  >
                    <span className="wide tabular w-9 text-[18px]">{f.level}</span>
                    <Icon name={departmentIcon[f.slug]} className="size-6 text-ember-text max-sm:hidden" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[19px] font-semibold leading-tight">{f.name}</span>
                      <span className="mt-1 block text-[16px] text-smoke">{f.title}</span>
                    </span>
                    <span className="hidden w-32 text-[15px] text-smoke md:block">{f.specs[0][1]}</span>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-graphite/20 transition-colors group-hover:border-graphite group-hover:bg-graphite group-hover:text-white">
                      <Icon name="arrow-right" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* The floor of the current row, pulled out of the tower */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 overflow-hidden rounded-2xl bg-paper">
              <div className="relative aspect-[5/4]">
                {floors.map((f, i) => (
                  // Neighbours are prepared in advance, so moving along the list never shows an empty frame
                  Math.abs(i - current) <= 1 && (
                    <Image
                      key={f.slug}
                      src={`/media/open-floor-${f.level}-card.webp`}
                      alt=""
                      fill
                      quality={75}
                      sizes="(min-width: 1024px) 38vw, 1px"
                      className={`object-cover transition-opacity duration-500 ${i === current ? "opacity-100" : "opacity-0"}`}
                    />
                  )
                ))}
              </div>
              <div className="p-6">
                <p className="text-[20px] font-semibold">{floors[current].name}</p>
                <p className="mt-1.5 text-[16px] leading-relaxed text-smoke">{floors[current].lead}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 border-t border-hair">
                  {floors[current].specs.map(([k, v]) => (
                    <div key={k} className="border-b border-hair py-2.5">
                      <dt className="text-[14px] text-smoke">{k}</dt>
                      <dd className="text-[15px] font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
