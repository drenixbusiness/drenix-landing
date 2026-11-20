"use client";

import { useState } from "react";
import { services } from "@/lib/data";

const budgets = ["Under $1,000", "$1,000–5,000", "$5,000–15,000", "Over $15,000", "Not sure yet"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-[14px] transition-colors ${active ? "border-umber bg-umber text-bone" : "border-umber/20 text-umber/80 hover:border-umber/50"}`}
    >
      {children}
    </button>
  );
}

function Field({ label, name, type = "text", required, textarea, placeholder }: { label: string; name: string; type?: string; required?: boolean; textarea?: boolean; placeholder?: string }) {
  const cls = "mt-2 w-full rounded-lg border border-umber/15 bg-white/70 px-4 py-3 text-[16px] text-umber outline-none transition-colors placeholder:text-umber/35 focus:border-ember";
  return (
    <label className="block">
      <span className="text-sm font-medium text-umber/70">{label}{required && <span className="text-ember-deep"> *</span>}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} className={cls} />
      )}
    </label>
  );
}

export function ContactForm({ initialService }: { initialService?: string }) {
  const startupSlug = services.find((s) => s.mock === "pitch")?.slug;
  const init = initialService === "startup" ? startupSlug : initialService;
  const [selected, setSelected] = useState<string[]>(init && services.some((s) => s.slug === init) ? [init] : []);
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          company: fd.get("company"),
          message: fd.get("message"),
          services: selected.map((id) => services.find((s) => s.slug === id)?.title ?? id),
          budget,
          website: fd.get("website"),
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex min-h-[560px] flex-col justify-center rounded-2xl bg-paper p-8 text-umber md:p-12">
        <span className="grid size-14 place-items-center rounded-full bg-ember text-2xl text-ink">✓</span>
        <h2 className="wide mt-8 text-5xl">Thank you!</h2>
        <p className="mt-4 max-w-sm text-lg text-umber/70">We have received your request. A manager will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-9 rounded-2xl bg-paper p-6 text-umber md:p-10">
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-umber/70">Which services do you need?</legend>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <Chip key={s.slug} active={selected.includes(s.slug)} onClick={() => toggle(s.slug)}>{s.title}</Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-umber/70">Estimated budget</legend>
        <div className="flex flex-wrap gap-2">
          {budgets.map((b) => (
            <Chip key={b} active={budget === b} onClick={() => setBudget(budget === b ? "" : b)}>{b}</Chip>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your name" name="name" required />
        <Field label="Phone" name="phone" type="tel" required placeholder="+998" />
        <Field label="Email" name="email" type="email" />
        <Field label="Company" name="company" />
      </div>
      <Field label="About the project" name="message" textarea placeholder="What you want to build, timeline, where things stand now" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="flex flex-col gap-5 border-t border-umber/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-sm text-umber/75">By submitting, you agree to the processing of your personal data.</p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-ember px-7 font-medium text-ink transition-colors hover:bg-ember-deep hover:text-bone disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send request"} <span>→</span>
        </button>
      </div>
      {status === "error" && <p className="text-ember-deep">Could not send. Please try again or call us.</p>}
    </form>
  );
}
