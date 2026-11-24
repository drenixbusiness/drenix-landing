import Image from "next/image";
import Link from "next/link";
import { Year } from "@/components/ui/Year";
import { nav, site } from "@/lib/site";
import { floors } from "@/lib/tower";

const link = "inline-flex min-h-8 items-center text-white/85 transition-colors hover:text-white hover:underline hover:underline-offset-4";
const head = "mb-4 text-[16px] font-semibold text-white";

export function Footer() {
  return (
    <footer className="cv on-dark bg-graphite text-white [--cv:1310px] lg:[--cv:500px]" data-header="light">
      <div className="container-x grid gap-14 pb-14 pt-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/phoenix.png" alt="" width={32} height={32} className="size-8" />
            <Image src="/brand/wordmark-light.png" alt="DRENIX" width={958} height={144} sizes="112px" className="h-[15px] w-auto" />
          </div>
          <p className="mt-6 max-w-xs text-[17px] leading-relaxed text-white/80">
            A ten-floor IT company: development, design, marketing, AI and support for startups.
          </p>
          <ul className="mt-6 text-[17px]">
            <li><a href={site.phoneHref} className="inline-flex min-h-11 items-center hover:text-ember-light">{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center hover:text-ember-light">{site.email}</a></li>
            <li><a href={site.telegramHref} className="inline-flex min-h-11 items-center hover:text-ember-light">Telegram {site.telegram}</a></li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 text-[16px] sm:grid-cols-4 lg:col-span-8">
          <div className="col-span-2">
            <p className={head}>Departments</p>
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {floors.map((f) => (
                <li key={f.slug}><Link href={`/services/${f.slug}`} className={link}>{f.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className={head}>Pages</p>
            <ul className="space-y-1">
              {nav.map((n) => <li key={n.href}><Link href={n.href} className={link}>{n.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className={head}>Social</p>
            <ul className="space-y-1">
              {site.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className={link}>{s.label}<span className="sr-only"> (opens in a new tab)</span></a></li>)}
            </ul>
            <p className="mt-8 text-white/80">{[site.address, ...site.hours.split(", ")].map((l) => <span key={l} className="block">{l}</span>)}</p>
          </div>
        </div>
      </div>

      <div className="container-x">
        <div className="flex flex-col gap-2 border-t border-white/20 py-6 text-[15px] text-white/75 sm:flex-row sm:justify-between">
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
