"use client";

import Image from "next/image";
import { useState } from "react";
import { services } from "@/lib/data";
import { site } from "@/lib/site";
import { Lines } from "@/components/ui/Reveal";

/** "Book a meeting" card over a panoramic hall photo. */
export function CTA({ title = "Book a|meeting" }: { title?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fd.get("name"), phone: fd.get("phone"), services: [fd.get("service")], message: "Meeting request (website)", website: fd.get("website") }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="relative overflow-hidden" data-header="light">
      <Image src="/media/room-view.webp" alt="Bright hall with a city view" fill quality={75} sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

      <div className="container-x relative grid min-h-[92svh] items-center gap-12 py-28 lg:grid-cols-12">
        <div className="text-white lg:col-span-6">
          <Lines text={title} className="wide text-[8vw] sm:text-[44px] lg:text-[52px]" />
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/85">At our office or online. In a 30-minute call we review your project and give you a concrete proposal.</p>
          <div className="mt-8 space-y-1 text-white/85">
            <a href={site.phoneHref} className="block hover:text-white">{site.phone}</a>
            <a href={site.telegramHref} className="block hover:text-white">Telegram: {site.telegram}</a>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <div className="panel-light rounded-[14px] p-6 text-graphite">
            {status === "done" ? (
              <div className="py-10 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-ember text-white">✓</span>
                <p className="wide mt-6 text-xl">Thank you</p>
                <p className="mt-2 text-sm text-smoke">We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <p className="label">Meeting</p>
                  <p className="label text-[8px] text-smoke">30 min · free</p>
                </div>
                <label className="block">
                  <span className="label text-[8px] text-smoke">Your name</span>
                  <input name="name" required className="mt-1.5 w-full border-b border-hair bg-transparent py-2 outline-none focus:border-graphite" />
                </label>
                <label className="block">
                  <span className="label text-[8px] text-smoke">Phone</span>
                  <input name="phone" type="tel" required placeholder="+998" className="mt-1.5 w-full border-b border-hair bg-transparent py-2 outline-none placeholder:text-smoke/50 focus:border-graphite" />
                </label>
                <label className="block">
                  <span className="label text-[8px] text-smoke">Floor (service)</span>
                  <select name="service" className="mt-1.5 w-full border-b border-hair bg-transparent py-2 outline-none focus:border-graphite">
                    {services.map((s, i) => (
                      <option key={s.slug} value={s.title}>{String(10 - i).padStart(2, "0")} — {s.title}</option>
                    ))}
                  </select>
                </label>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <button type="submit" disabled={status === "sending"} className="label flex h-12 w-full items-center justify-between rounded-full bg-graphite px-5 text-white transition-colors hover:bg-ember disabled:opacity-60">
                  {status === "sending" ? "Sending…" : "Book a meeting"} <span>→</span>
                </button>
                {status === "error" && <p className="text-sm text-ember-deep">Could not send. Please call us instead.</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
