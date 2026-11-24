import Link from "next/link";
import type { ReactNode } from "react";
import { ArtPicture } from "@/components/ui/ArtPicture";
import { Lines } from "@/components/ui/Reveal";

type Props = {
  crumbs?: { href: string; label: string }[];
  title: string;
  text?: string;
  /** Short facts in a strip at the bottom. */
  facts?: { label: string; value: string }[];
  /** First cell of the strip. */
  badge?: ReactNode;
  /** Buttons under the text. */
  children?: ReactNode;
  /** Campus picture in public/media, without extension. A "-tall" version must exist next to it. */
  image: string;
};

/** Inner page hero: campus picture, dark title on a light veil, strip of facts. */
export function PageHero({ crumbs, title, text, facts, badge, children, image }: Props) {
  return (
    <div className="relative">
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-stone text-graphite">
        <ArtPicture priority wide={`/media/${image}.webp`} tall={`/media/${image}-tall.webp`} />
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-stone/95 via-stone/60 to-transparent lg:block" />
          <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-stone via-stone/75 to-transparent lg:h-36 lg:from-stone lg:via-stone/70" />
        </div>

        <div className={`container-x relative flex flex-1 flex-col pb-8 pt-[96px] lg:justify-center lg:pt-[69px] ${facts ? "lg:pb-[130px]" : ""}`}>
          <div className="max-w-[44rem]">
            {crumbs && (
              <nav aria-label="Breadcrumb" className="mb-4 lg:mb-7">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-graphite/75">
                  <li><Link href="/" className="inline-flex min-h-8 items-center hover:text-graphite hover:underline">Home</Link></li>
                  {crumbs.map((c, i) => (
                    <li key={c.href} className="flex items-center gap-2">
                      <span aria-hidden>/</span>
                      <Link href={c.href} aria-current={i === crumbs.length - 1 ? "page" : undefined} className="inline-flex min-h-8 items-center hover:text-graphite hover:underline">{c.label}</Link>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <Lines as="h1" immediate delay={0.05} text={title} className="wide text-[clamp(26px,7.4vw,40px)] leading-[1.1] lg:text-[clamp(38px,3.6vw,56px)]" />
            {text && <p className="hero-up mt-4 max-w-xl text-[16px] leading-relaxed text-graphite/85 lg:mt-6 lg:text-[18px]">{text}</p>}
            {children && <div className="hero-in mt-6 flex flex-wrap gap-2.5 lg:mt-8" style={{ animationDelay: "0.25s" }}>{children}</div>}
          </div>
        </div>
      </section>

      {/* Over the picture on wide screens, under it on phones so nothing is covered */}
      {facts && (
        <div className="container-x pt-5 lg:absolute lg:inset-x-0 lg:bottom-8 lg:pt-0">
          <div style={{ animationDelay: "0.35s" }} className="hero-in panel-light rounded-2xl lg:flex lg:items-stretch">
            {badge && <div className="flex items-center gap-4 border-b border-hair p-4 lg:border-b-0 lg:border-r lg:px-7 lg:py-5">{badge}</div>}
            <dl className="grid px-4 py-2 sm:grid-cols-2 sm:gap-x-8 lg:flex-1 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none lg:gap-0 lg:p-0">
              {facts.map((m, i) => (
                <div key={m.label} className={`flex items-baseline justify-between gap-4 py-2.5 lg:block lg:px-7 lg:py-5 ${i ? "lg:border-l lg:border-hair" : ""}`}>
                  <dt className="text-[15px] text-smoke">{m.label}</dt>
                  <dd className="text-right text-[16px] font-semibold lg:mt-0.5 lg:text-left lg:text-[17px]">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

