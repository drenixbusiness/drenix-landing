import Image from "next/image";
import Link from "next/link";
import { Year } from "@/components/ui/Year";
import { nav, site } from "@/lib/site";
import { floors } from "@/lib/tower";

const link = "inline-flex min-h-9 items-center text-white/85 transition-colors hover:text-white hover:underline hover:underline-offset-4 lg:min-h-8";
const head = "mb-2 text-[15px] font-semibold text-white lg:mb-4 lg:text-[16px]";
const contact = "inline-flex min-h-11 items-center hover:text-ember-light";

/** Footer. On phones the lists stand in two columns, so the whole footer fits in little more than one screen. */
export function Footer() {
  return (
    <footer className="cv on-dark bg-graphite text-white [--cv:920px] sm:[--cv:760px] lg:[--cv:500px]" data-header="light">
      <div className="container-x grid gap-10 pb-10 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-14 lg:pb-14 lg:pt-20">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/phoenix.png" alt="" width={32} height={32} className="size-8" />
            <Image src="/brand/wordmark-light.png" alt="DRENIX" width={958} height={144} sizes="112px" className="h-[15px] w-auto" />
          </div>
          <p className="mt-4 max-w-xs text-[16px] leading-relaxed text-white/80 lg:mt-6 lg:text-[17px]">
            A ten-floor IT company: development, design, marketing, AI and support for startups.
          </p>
          <ul className="mt-3 text-[16px] lg:mt-5 lg:text-[17px]">
            <li><a href={site.phoneHref} className={contact}>{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className={contact}>{site.email}</a></li>
            <li><a href={site.telegramHref} className={contact}>Telegram {site.telegram}</a></li>
          </ul>
          <p className="mt-2 text-[15px] leading-relaxed text-white/70 lg:mt-4 lg:text-[16px]">
            {site.address}
            <br />
            {site.hours}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-[15px] sm:grid-cols-4 lg:col-span-8 lg:gap-x-8 lg:gap-y-12 lg:text-[16px]">
          <div className="sm:col-span-2">
            <p className={head}>Departments</p>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:gap-y-1">
              {floors.map((f) => (
                <li key={f.slug}><Link href={`/services/${f.slug}`} className={link}>{f.name}</Link></li>
              ))}
            </ul>
          </div>
          {/* Phones: both lists in the column beside the departments. Wider screens: a column each */}
          <div className="space-y-8 sm:contents">
            <div>
              <p className={head}>Pages</p>
              <ul className="lg:space-y-1">
                {nav.map((n) => <li key={n.href}><Link href={n.href} className={link}>{n.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <p className={head}>Social</p>
              <ul className="lg:space-y-1">
                {site.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className={link}>{s.label}<span className="sr-only"> (opens in a new tab)</span></a></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x">
        <div className="flex flex-col gap-1.5 border-t border-white/20 py-5 text-[14px] text-white/70 lg:flex-row lg:justify-between lg:gap-4 lg:py-6 lg:text-[15px]">
          <span>© <Year /> DRENIX. All rights reserved</span>
          {/* Required by the licence of the models */}
          <span>
            3D models based on work by{" "}
            <a href="https://sketchfab.com/3d-models/singapore-office-skyscraper-free-2305f0fe03ba44229a1f768dcb48bd8f" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">99.Miles</a> and{" "}
            <a href="https://sketchfab.com/3d-models/3d-view-office-floor-plan-virtual-reality-83bc80e54f7c4f62849c127e1fe64514" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">webadartist</a>,{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">CC BY 4.0</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
