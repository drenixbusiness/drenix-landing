import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/lib/site";
import { floors } from "@/lib/tower";
import { Year } from "@/components/ui/Year";

export function Footer() {
  return (
    <footer className="bg-graphite text-white" data-header="light">
      <div className="container-x grid gap-14 pb-16 pt-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/phoenix.png" alt="" width={30} height={30} className="size-[30px]" />
            <Image src="/brand/wordmark-light.png" alt="DRENIX" width={958} height={144} className="h-[13px] w-auto" />
          </div>
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-white/60">
            A ten-floor IT company: development, design, marketing, AI and support for startups.
          </p>
          <div className="mt-8 space-y-1.5">
            <a href={site.phoneHref} className="block hover:text-ember-light">{site.phone}</a>
            <a href={`mailto:${site.email}`} className="block hover:text-ember-light">{site.email}</a>
            <a href={site.telegramHref} className="block hover:text-ember-light">Telegram: {site.telegram}</a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
          <div>
            <p className="label mb-5 text-white/45">Floors</p>
            <ul className="space-y-2.5 text-[15px]">
              {floors.slice(0, 6).map((f) => (
                <li key={f.slug}>
                  <Link href={`/services/${f.slug}`} className="text-white/75 hover:text-white">
                    <span className="mr-2 text-white/35 tabular-nums">{f.level}</span>{f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-5 text-white/45">Pages</p>
            <ul className="space-y-2.5 text-[15px]">
              {nav.map((n) => (
                <li key={n.href}><Link href={n.href} className="text-white/75 hover:text-white">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-5 text-white/45">Social</p>
            <ul className="space-y-2.5 text-[15px]">
              {site.socials.map((s) => (
                <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="text-white/75 hover:text-white">{s.label} ↗</a></li>
              ))}
            </ul>
            <p className="label mb-3 mt-10 text-white/45">Address</p>
            <p className="text-[15px] text-white/75">{site.address}<br />{site.hours}</p>
          </div>
        </div>
      </div>

      <div className="container-x">
        <div className="relative h-px bg-white/15">
          <span className="absolute -left-[5px] -top-[6px] text-[11px] text-white/40">+</span>
          <span className="absolute -right-[5px] -top-[6px] text-[11px] text-white/40">+</span>
        </div>
        <div className="label flex flex-col gap-2 py-6 text-[9px] text-white/45 sm:flex-row sm:justify-between">
          <span>© <Year /> DRENIX</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
