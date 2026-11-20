"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { floors } from "@/lib/tower";
import { serviceImage } from "@/lib/media";
import { SectionHead } from "@/components/ui/Misc";

const filters = [
  { id: "all", label: "All" },
  { id: "build", label: "Build", slugs: ["web-and-mobile-development", "ui-ux-design-and-branding", "cloud-and-devops", "cybersecurity"] },
  { id: "grow", label: "Grow", slugs: ["digital-marketing", "business-development", "crm-and-erp"] },
  { id: "launch", label: "Launch", slugs: ["startup-support", "ai-and-automation", "it-outsourcing"] },
] as const;

/** Styled like an "available units" table on real-estate sites: floors = services. */
export function FloorsTable() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [hover, setHover] = useState(floors[0].slug);
  const list = floors.filter((f) => {
    const flt = filters.find((x) => x.id === filter);
    return !flt || !("slugs" in flt) || (flt.slugs as readonly string[]).includes(f.slug);
  });

  return (
    <section className="bg-stone text-graphite" data-header="dark">
      <div className="container-x py-24 md:py-32">
        <SectionHead
          title="All|floors"
          text="Every floor is its own team and service. Start with one floor or combine several."
        />

        <div className="mt-14 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`label rounded-full border px-4 py-2.5 transition-colors ${filter === f.id ? "border-graphite bg-graphite text-white" : "border-hair hover:border-graphite/50"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="label hidden grid-cols-12 gap-4 border-b border-graphite/80 pb-3 text-smoke md:grid">
              <span className="col-span-2">Floor</span>
              <span className="col-span-4">Service</span>
              <span className="col-span-3">Team</span>
              <span className="col-span-2">Timeline</span>
              <span className="col-span-1 text-right" />
            </div>
            <ul>
              <AnimatePresence initial={false}>
                {list.map((f) => (
                  <motion.li
                    key={f.slug}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onMouseEnter={() => setHover(f.slug)}
                  >
                    <Link href={`/services/${f.slug}`} className={`group grid grid-cols-12 items-center gap-4 border-b border-hair py-5 transition-colors ${hover === f.slug ? "bg-white/60" : ""}`}>
                      <span className="wide col-span-2 pl-2 text-[20px] md:text-[18px]">{f.level}</span>
                      <span className="col-span-10 md:col-span-4">
                        <span className="block font-medium">{f.title}</span>
                        <span className="block text-sm text-smoke">{f.short}</span>
                      </span>
                      <span className="label col-span-6 col-start-3 text-[9px] text-smoke md:col-span-3 md:col-start-auto md:text-graphite">{f.name}</span>
                      <span className="col-span-4 text-sm md:col-span-2">{f.specs[0][1]}</span>
                      <span className="col-span-1 hidden text-right md:block">
                        <span className="inline-grid size-8 place-items-center rounded-full border border-hair transition-all group-hover:border-graphite group-hover:bg-graphite group-hover:text-white">→</span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          {/* Side panel: photo of the selected floor */}
          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-stone-2">
                <AnimatePresence initial={false}>
                  <motion.div key={hover} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
                    <Image src={serviceImage[hover]} alt="" fill quality={75} sizes="30vw" className="object-cover" />
                  </motion.div>
                </AnimatePresence>
                {(() => {
                  const f = floors.find((x) => x.slug === hover)!;
                  return (
                    <div className="panel-light absolute inset-x-3 bottom-3 rounded-[10px] p-4">
                      <div className="flex items-baseline justify-between">
                        <span className="label text-smoke">Floor</span>
                        <span className="wide text-2xl">{f.level}</span>
                      </div>
                      <p className="mt-2 font-medium">{f.title}</p>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hair pt-3 text-[13px]">
                        {f.specs.map(([k, v]) => (
                          <div key={k}>
                            <dt className="label text-[8px] text-smoke">{k}</dt>
                            <dd className="mt-0.5 font-medium">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
