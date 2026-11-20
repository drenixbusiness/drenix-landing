import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Lines } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with DRENIX: free consultation, reply within 24 hours.",
};

async function FormWithParams({ searchParams }: { searchParams: PageProps<"/contact">["searchParams"] }) {
  const sp = await searchParams;
  return <ContactForm initialService={typeof sp.service === "string" ? sp.service : undefined} />;
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
    <section className="pt-[72px]">
      <div className="container-x grid gap-16 pb-24 pt-14 md:pb-32 md:pt-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Lines as="h1" immediate delay={0.1} text="Contact" className="wide text-[12vw] md:text-[6vw] lg:text-[4.4vw] 2xl:text-[68px]" />
          <p className="hero-up mt-8 max-w-md text-xl leading-relaxed text-graphite/70">
            Fill in the form or reach us however suits you. We reply within 24 hours.
          </p>
          <div style={{ animationDelay: "0.3s" }} className="hero-in mt-12">
            <dl className="border-t border-hair">
              {rows.map((r) => (
                <div key={r.k} className="flex items-baseline justify-between gap-6 border-b border-hair py-4">
                  <dt className="label text-graphite/65">{r.k}</dt>
                  <dd className="text-right text-lg">
                    {r.href ? <a href={r.href} className="transition-colors hover:text-ember">{r.v}</a> : r.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div style={{ animationDelay: "0.2s" }} className="hero-in lg:col-span-7">
          <Suspense fallback={<ContactForm />}>
            <FormWithParams searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
