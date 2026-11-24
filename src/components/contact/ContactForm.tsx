"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { services } from "@/lib/data";
import { site } from "@/lib/site";
import { ErrorSummary, Field, Honeypot, TextArea } from "./Field";
import { useContactForm } from "./useContactForm";

const budgets = ["Under $1,000", "$1,000–5,000", "$5,000–15,000", "Over $15,000", "Not sure yet"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] transition-colors ${active ? "border-graphite bg-graphite text-white" : "border-graphite/25 text-graphite hover:border-graphite"}`}
    >
      {active && <Icon name="check" className="size-4" />}
      {children}
    </button>
  );
}

export function ContactForm({ initialService }: { initialService?: string }) {
  const startupSlug = services.find((s) => s.mock === "pitch")?.slug;
  const init = initialService === "startup" ? startupSlug : initialService;
  const [selected, setSelected] = useState<string[]>(init && services.some((s) => s.slug === init) ? [init] : []);
  const [budget, setBudget] = useState("");
  const { errors, summary, status, onSubmit, onBlur, summaryRef, doneRef } = useContactForm(["name", "phone", "email"], (fd) => ({
    company: fd.get("company"),
    message: fd.get("message"),
    services: selected.map((id) => services.find((s) => s.slug === id)?.title ?? id),
    budget,
  }));

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (status === "done") {
    return (
      <div className="flex min-h-[460px] flex-col justify-center rounded-2xl bg-paper p-8 md:p-12">
        <span className="grid size-14 place-items-center rounded-full bg-ember-deep text-white"><Icon name="check" className="size-7" /></span>
        <h2 ref={doneRef} tabIndex={-1} className="wide mt-8 text-[30px] outline-none md:text-[40px]">Thank you!</h2>
        <p className="mt-4 max-w-sm text-[18px] text-smoke">We have received your request. A manager will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-9 rounded-2xl bg-paper p-6 md:p-10">
      {summary && Object.keys(errors).length > 0 && <ErrorSummary ref={summaryRef} errors={errors} prefix="contact" />}

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="contact-name" label="Your name" name="name" required autoComplete="name" error={errors.name} onBlur={onBlur} />
        <Field id="contact-phone" label="Phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="+998" error={errors.phone} onBlur={onBlur} />
        <Field id="contact-email" label="Email" name="email" type="email" inputMode="email" autoComplete="email" error={errors.email} onBlur={onBlur} />
        <Field id="contact-company" label="Company" name="company" autoComplete="organization" />
      </div>

      <fieldset>
        <legend className="mb-3 text-[15px] font-medium">Which services do you need?</legend>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <Chip key={s.slug} active={selected.includes(s.slug)} onClick={() => toggle(s.slug)}>{s.title}</Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-[15px] font-medium">Estimated budget</legend>
        <div className="flex flex-wrap gap-2">
          {budgets.map((b) => (
            <Chip key={b} active={budget === b} onClick={() => setBudget(budget === b ? "" : b)}>{b}</Chip>
          ))}
        </div>
      </fieldset>

      <TextArea id="contact-message" label="About the project" name="message" placeholder="What you want to build, timeline, where things stand now" />
      <Honeypot />

      {status === "error" && (
        <p role="alert" className="flex items-start gap-3 rounded-xl border border-[#b3261e]/40 bg-[#fdf1ef] p-4 text-[15px] text-[#8c1d18]">
          <Icon name="alert" className="mt-0.5 size-5" />
          <span>The request was not sent. Check the connection and try again, or call <a href={site.phoneHref} className="font-medium underline underline-offset-4">{site.phone}</a>.</span>
        </p>
      )}

      <div className="flex flex-col gap-5 border-t border-hair pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[14px] text-smoke">By submitting, you agree to the processing of your personal data.</p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-graphite px-7 text-[16px] font-medium text-white transition-colors hover:bg-ember-deep disabled:cursor-progress disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send request"} <Icon name="arrow-right" />
        </button>
      </div>
    </form>
  );
}
