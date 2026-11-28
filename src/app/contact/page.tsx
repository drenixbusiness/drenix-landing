import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { ArtPicture } from "@/components/ui/ArtPicture";
import { Lines } from "@/components/ui/Reveal";
import { services as allServices } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with DRENIX: free consultation, reply within 24 hours.",
};

const services = allServices.map(({ slug, title }) => ({ slug, title }));
const startup = allServices.find((s) => s.mock === "pitch")?.slug;

async function FormWithParams({ searchParams }: { searchParams: PageProps<"/contact">["searchParams"] }) {
  const { service } = await searchParams;
  return <ContactForm services={services} initial={service === "startup" ? startup : typeof service === "string" ? service : undefined} />;
}

export default function ContactPage(props: PageProps<"/contact">) {
  const rows = [
    { k: "Telegram", v: site.telegram, href: site.telegramHref },
    { k: "Phone", v: site.phone, href: site.phoneHref },
    { k: "Email", v: site.email, href: `mailto:${site.email}` },
    { k: "Address", v: site.address },
    { k: "Hours", v: site.hours },
  ];

  return (
    <>
      <section className="container-x grid gap-10 pb-14 pt-24 md:pb-20 md:pt-32 lg:grid-cols-12 lg:gap-12 lg:pb-28 lg:pt-36">
        <div className="lg:col-span-5">
          <Lines as="h1" immediate delay={0.05} text="Contact" className="wide text-[clamp(34px,10vw,48px)] leading-[1.1] lg:text-[clamp(44px,4.4vw,64px)]" />
          <p className="hero-up mt-5 max-w-md text-[18px] leading-relaxed text-smoke md:text-[20px]">
            Fill in the form or reach us however suits you. We reply within 24 hours.
          </p>
          <dl className="hero-in mt-8 border-t border-hair md:mt-10" style={{ animationDelay: "0.2s" }}>
            {rows.map((r) => (
              <div key={r.k} className="flex min-h-14 items-center justify-between gap-6 border-b border-hair py-2">
                <dt className="text-[16px] text-smoke">{r.k}</dt>
                <dd className="text-right text-[18px] font-medium">
                  {r.href ? <a href={r.href} className="inline-flex min-h-11 items-center underline decoration-graphite/25 underline-offset-[6px] hover:decoration-graphite">{r.v}</a> : r.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-in lg:col-span-7" style={{ animationDelay: "0.1s" }}>
          <Suspense fallback={<ContactForm services={services} />}>
            <FormWithParams searchParams={props.searchParams} />
          </Suspense>
        </div>
      </section>
      <div className="relative h-[38svh] min-h-[240px] overflow-hidden md:h-[56svh] md:min-h-[320px]">
        <ArtPicture wide="/media/cta.webp" tall="/media/cta-tall.webp" alt="Main entrance of the DRENIX tower" />
      </div>
    </>
  );
}
