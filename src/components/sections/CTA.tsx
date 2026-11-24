"use client";

import { ErrorSummary, Field, Honeypot } from "@/components/contact/Field";
import { useContactForm } from "@/components/contact/useContactForm";
import { ArtPicture } from "@/components/ui/ArtPicture";
import { Icon } from "@/components/ui/Icon";
import { Lines } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { floors } from "@/lib/tower";

/** "Book a meeting" over the main entrance of the campus. */
export function CTA({ title = "Book a|meeting", service }: { title?: string; service?: string }) {
  const { errors, summary, status, onSubmit, onBlur, summaryRef, doneRef } = useContactForm(["name", "phone"], (fd) => ({
    services: [fd.get("service")],
    message: "Meeting request (website)",
  }));

  return (
    <section className="cv relative overflow-hidden bg-graphite [--cv:980px] md:[--cv:92svh]" data-header="light">
      <ArtPicture wide="/media/cta.webp" tall="/media/cta-tall.webp" />
      <div className="absolute inset-0 bg-black/25" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent max-lg:bg-gradient-to-b max-lg:from-black/75" aria-hidden />

      <div className="container-x relative grid min-h-[92svh] items-center gap-12 py-24 lg:grid-cols-12 lg:py-28">
        <div className="on-dark text-white lg:col-span-6">
          <Lines text={title} className="wide text-[clamp(28px,8vw,44px)] leading-[1.08] lg:text-[52px]" />
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/90">At our office or online. In a 30-minute call we review your project and give you a concrete proposal.</p>
          <ul className="mt-8 space-y-1">
            <li><a href={site.phoneHref} className="inline-flex min-h-11 items-center text-[17px] font-medium underline decoration-white/40 underline-offset-4 hover:decoration-white">{site.phone}</a></li>
            <li><a href={site.telegramHref} className="inline-flex min-h-11 items-center text-[17px] font-medium underline decoration-white/40 underline-offset-4 hover:decoration-white">Telegram {site.telegram}</a></li>
          </ul>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="rounded-2xl bg-paper p-6 text-graphite md:p-8">
            {status === "done" ? (
              <div className="py-8 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-ember-deep text-white"><Icon name="check" className="size-7" /></span>
                <h3 ref={doneRef} tabIndex={-1} className="wide mt-6 text-[24px] outline-none">Thank you</h3>
                <p className="mt-2 text-[16px] text-smoke">We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[20px] font-semibold">Short meeting</h3>
                  <p className="text-[15px] text-smoke">30 minutes, free</p>
                </div>
                {summary && Object.keys(errors).length > 0 && <ErrorSummary ref={summaryRef} errors={errors} prefix="cta" />}
                <Field id="cta-name" label="Your name" name="name" required autoComplete="name" error={errors.name} onBlur={onBlur} />
                <Field id="cta-phone" label="Phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="+998" error={errors.phone} onBlur={onBlur} />
                <div>
                  <label htmlFor="cta-service" className="text-[15px] font-medium">Department</label>
                  <div className="relative mt-1.5">
                    <select
                      id="cta-service"
                      name="service"
                      defaultValue={floors.find((f) => f.slug === service)?.title ?? floors[0].title}
                      className="h-12 w-full appearance-none rounded-xl border border-graphite/25 bg-white pl-4 pr-11 text-[16px] focus:border-graphite"
                    >
                      {floors.map((f) => <option key={f.slug} value={f.title}>{`${f.level}  ${f.name}: ${f.title}`}</option>)}
                    </select>
                    <Icon name="arrow-down" className="pointer-events-none absolute right-4 top-4 size-4" />
                  </div>
                </div>
                <Honeypot />
                {status === "error" && (
                  <p role="alert" className="flex items-start gap-2 text-[15px] text-[#8c1d18]"><Icon name="alert" className="mt-0.5 size-5" /> Not sent. Try again or call us.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex min-h-12 w-full items-center justify-between rounded-full bg-graphite px-6 text-[16px] font-medium text-white transition-colors hover:bg-ember-deep disabled:cursor-progress disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Book a meeting"} <Icon name="arrow-right" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
