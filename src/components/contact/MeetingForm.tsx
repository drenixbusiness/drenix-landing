"use client";

import { ErrorSummary } from "@/components/contact/ErrorSummary";
import { Field, Honeypot } from "@/components/contact/Field";
import { useContactForm } from "@/components/contact/useContactForm";
import { Icon } from "@/components/ui/Icon";

/** Short form: name, phone, department. */
export function MeetingForm({ options, initial }: { options: { value: string; label: string }[]; initial?: string }) {
  const { errors, summary, status, onSubmit, onBlur, summaryRef, doneRef } = useContactForm(["name", "phone"], (fd) => ({
    services: [fd.get("service")],
    message: "Meeting request (website)",
  }));

  if (status === "done") {
    return (
      <div className="py-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-ember-deep text-white"><Icon name="check" className="size-7" /></span>
        <h3 ref={doneRef} tabIndex={-1} className="wide mt-6 text-[24px] outline-none">Thank you</h3>
        <p className="mt-2 text-[16px] text-smoke">We will get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
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
            defaultValue={initial ?? options[0].value}
            className="h-12 w-full appearance-none rounded-xl border border-graphite/25 bg-white pl-4 pr-11 text-[16px] focus:border-graphite"
          >
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
  );
}
