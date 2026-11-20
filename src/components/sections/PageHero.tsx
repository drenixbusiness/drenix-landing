import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Lines } from "@/components/ui/Reveal";

type Props = {
  crumbs?: { href: string; label: string }[];
  title: string;
  text?: string;
  aside?: ReactNode;
  children?: ReactNode;
  /** Full-width background photo (public/media) */
  image?: string;
};

/** Inner page hero: full-bleed photo, wide title, dark glass panel. */
export function PageHero({ crumbs, title, text, aside, children, image = "/media/room-view.webp" }: Props) {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden text-white" data-header="light">
      <div className="kenburns absolute inset-0">
        <Image src={image} alt="" fill quality={75} preload fetchPriority="high" sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="container-x relative pb-14 pt-32 md:pb-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="label mb-10 flex flex-wrap gap-2 text-white/65">
            <Link href="/" className="hover:text-white">Home</Link>
            {crumbs.map((c) => (
              <span key={c.href} className="flex gap-2">
                <span>/</span>
                <Link href={c.href} className="hover:text-white">{c.label}</Link>
              </span>
            ))}
          </nav>
        )}
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Lines as="h1" immediate delay={0.1} text={title} className="wide text-[4.5vw] leading-[1.08] md:text-[4.2vw] lg:text-[3.6vw] 2xl:text-[54px]" />
            {text && <p className="hero-up mt-7 max-w-xl text-[16px] leading-relaxed text-white/85">{text}</p>}
            {children}
          </div>
          {aside && (
            <div style={{ animationDelay: "0.35s" }} className="hero-in panel-dark rounded-[10px] p-5 lg:col-span-4 lg:col-start-9">
              {aside}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Key facts list for the hero panel. */
export function FactList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="text-[13px]">
      {items.map((m, i) => (
        <div key={m.label} className={`flex items-baseline justify-between gap-6 py-2.5 ${i ? "border-t border-white/12" : ""}`}>
          <dt className="text-white/55">{m.label}</dt>
          <dd className="text-right font-medium">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}
