"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { planRooms, type RoomId } from "./FloorModel";

type Room = {
  id: RoomId;
  img: string;
  alt: string;
  name: string;
  title: string;
  text: string;
  specs: [string, string][];
  href: string;
  cta: string;
  spot: { x: number; y: number; text: string };
};

const rooms: Room[] = [
  {
    id: "view", img: "/media/room-view.webp", alt: "Bright hall with floor-to-ceiling windows",
    name: "Panorama", title: "The city, right outside the window",
    text: "Client meetings, demo days and team discussions happen in this hall.",
    specs: [["Meetings", "By appointment"], ["Hours", "9:00–19:00"], ["Format", "Office or online"]],
    href: "/contact", cta: "Book a meeting", spot: { x: 62, y: 46, text: "Every Friday is demo day" },
  },
  {
    id: "dev", img: "/media/room-dev.webp", alt: "Developer workspace with a city view",
    name: "Engineering", title: "Code, two monitors and a city view",
    text: "Web platforms, mobile apps and backend. We show you a working version every two weeks.",
    specs: [["Stack", "Next.js · Flutter · Go"], ["Sprint", "2 weeks"], ["Warranty", "12 months"]],
    href: "/services/web-and-mobile-development", cta: "Development", spot: { x: 70, y: 40, text: "Code review on every change" },
  },
  {
    id: "design", img: "/media/room-design.webp", alt: "White design studio",
    name: "Design Studio", title: "White walls and one red folder",
    text: "Brands, interfaces and design systems. Every Figma component matches the code.",
    specs: [["Brand", "3–5 weeks"], ["Concepts", "2–3 directions"], ["Tool", "Figma"]],
    href: "/services/ui-ux-design-and-branding", cta: "Design", spot: { x: 18, y: 62, text: "The brand book is in this folder" },
  },
  {
    id: "growth", img: "/media/room-growth.webp", alt: "Bright office with a large screen",
    name: "Growth", title: "Today’s leads, on screen",
    text: "Ads, SMM, SEO and CRM. You see where every lead comes from, with a report every week.",
    specs: [["Start", "1–2 weeks"], ["Channels", "Meta · Google · TG"], ["Reports", "Weekly"]],
    href: "/services/digital-marketing", cta: "Marketing", spot: { x: 62, y: 34, text: "Live dashboard" },
  },
  {
    id: "meeting", img: "/media/room-meeting.webp", alt: "Meeting room with orange chairs",
    name: "Strategy", title: "Orange chairs and big decisions",
    text: "Business audit, growth strategy and sales system. We put the plan into practice ourselves.",
    specs: [["Audit", "2–3 weeks"], ["Result", "Roadmap · KPI"], ["Reviews", "Monthly"]],
    href: "/services/business-development", cta: "Strategy", spot: { x: 50, y: 58, text: "Estimates are agreed here" },
  },
  {
    id: "lounge", img: "/media/room-lounge.webp", alt: "Open office with plants",
    name: "Launchpad", title: "Where ideas are born",
    text: "Support for startups: idea validation, MVP, pitch deck and first customers.",
    specs: [["MVP", "8–12 weeks"], ["Model", "Cash or equity"], ["Intake", "Rolling"]],
    href: "/startups", cta: "Launchpad", spot: { x: 38, y: 52, text: "Weekly sessions with founders" },
  },
  {
    id: "servers", img: "/media/room-servers.webp", alt: "Server aisle",
    name: "Cloud & AI", title: "The room that never switches off",
    text: "Cloud, DevOps, cybersecurity and AI assistants. Monitoring around the clock.",
    specs: [["Monitoring", "24/7"], ["Audit", "1–3 weeks"], ["AI prototype", "2–3 weeks"]],
    href: "/services/ai-and-automation", cta: "AI and cloud", spot: { x: 30, y: 44, text: "Automated deploys" },
  },
];

const R = rooms.length;

function MiniPlan({ active }: { active: RoomId }) {
  return (
    <svg viewBox="-10 -10 1020 660" className="h-[74px] w-[116px]" aria-hidden>
      {planRooms.map((r) => (
        <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.id === active ? "#ec6a26" : "#ece9e3"} fillOpacity={r.id === active ? 0.9 : 1} stroke="#141414" strokeOpacity=".35" strokeWidth="6" />
      ))}
    </svg>
  );
}

/** Interior walkthrough: scrolling moves from room to room. */
export function Walkthrough() {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [idx, setIdx] = useState(0);
  const [level, setLevel] = useState("07");
  // Minorada tanlangan qavat raqami
  useEffect(() => {
    const onFloor = (e: Event) => setLevel((e as CustomEvent<string>).detail);
    window.addEventListener("drenix:floor", onFloor);
    return () => window.removeEventListener("drenix:floor", onFloor);
  }, []);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(p, "change", (v) => setIdx(Math.min(R - 1, Math.max(0, Math.floor(v * R)))));
  // Har bir xona ichida kamera sekin oldinga yuradi
  const dolly = useTransform(p, (v) => 1.03 + (((v * R) % 1) + 1) % 1 * 0.1);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);
  const room = rooms[idx];

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.offsetTop + ((i + 0.15) / R) * (el.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(top, { duration: 1.4 });
    else window.scrollTo({ top, behavior: "smooth" });
  };

  // Minora yoki maketdan kelgan "xonaga kirish" so‘rovi
  useEffect(() => {
    const onRoom = (e: Event) => {
      const id = (e as CustomEvent<RoomId>).detail;
      const i = Math.max(0, rooms.findIndex((r) => r.id === id));
      const el = ref.current;
      if (!el) return;
      const top = el.offsetTop + ((i + 0.15) / R) * (el.offsetHeight - window.innerHeight);
      if (lenis) lenis.scrollTo(top, { duration: 2 });
      else window.scrollTo({ top, behavior: "smooth" });
    };
    window.addEventListener("drenix:room", onRoom);
    return () => window.removeEventListener("drenix:room", onRoom);
  }, [lenis]);

  return (
    <section id="inside" ref={ref} className="relative" style={{ height: `${R * 100}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-stone">
        <AnimatePresence initial={false}>
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <motion.div style={{ scale: dolly }} className="absolute inset-0">
              <Image src={room.img} alt={room.alt} fill quality={75} sizes="100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/35 to-transparent" />

        {/* Yo‘l: qavat / xona */}
        <div className="label absolute inset-x-0 top-[88px] text-center text-graphite/80">
          DRENIX Tower / Floor {level} / <span className="text-graphite">{room.name}</span>
        </div>
        <Link href="/contact" className="label absolute right-5 top-[80px] hidden rounded-full bg-white/85 px-4 py-2.5 text-graphite backdrop-blur hover:bg-white md:right-11 md:block">
          Book a meeting
        </Link>

        {/* Xonadagi nuqta (hotspot) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`spot-${room.id}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="group absolute hidden md:block"
            style={{ left: `${room.spot.x}%`, top: `${room.spot.y}%` }}
          >
            <span className="relative flex size-4 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
              <span className="relative size-2.5 rounded-full bg-white shadow" />
            </span>
            <span className="panel-light absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium text-graphite">
              {room.spot.text}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* AURUM interyer kartasi */}
        <div className="container-x absolute inset-x-0 bottom-24 md:bottom-28">
          <AnimatePresence mode="wait">
            <motion.article
              key={room.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="panel-light w-full max-w-[380px] rounded-[14px] p-5 text-graphite"
            >
              <p className="label text-[10px]">{room.name}</p>
              <h3 className="mt-1.5 text-[22px] font-medium leading-tight tracking-[-0.01em]">{room.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-smoke">{room.text}</p>
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-hair pt-3">
                {room.specs.map(([k, v]) => (
                  <div key={k}>
                    <dt className="label text-[8px] text-smoke">{k}</dt>
                    <dd className="mt-1 text-[12.5px] font-medium leading-snug">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href={room.href} className="label mt-4 flex items-center justify-between rounded-full bg-graphite px-4 py-2.5 text-[9px] text-white transition-colors hover:bg-ember">
                {room.cta} <span>→</span>
              </Link>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Pastki xonalar navigatsiyasi */}
        <div className="absolute inset-x-0 bottom-6 md:bottom-8">
          <div className="container-x flex items-end justify-between gap-6">
            <div className="flex-1 overflow-x-auto [scrollbar-width:none] md:mx-auto md:max-w-[760px] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max justify-between gap-6 px-1">
                {rooms.map((r, i) => (
                  <button key={r.id} onClick={() => go(i)} className={`label pb-2 text-[9px] transition-colors ${i === idx ? "text-white" : "text-white/60 hover:text-white"}`}>
                    <span className={`mx-auto mb-2 block size-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`} />
                    {r.name}
                  </button>
                ))}
              </div>
              <div className="h-px bg-white/30"><motion.div className="h-px bg-white" style={{ width: bar }} /></div>
            </div>
            <div className="panel-light hidden shrink-0 rounded-[10px] p-2 lg:block">
              <MiniPlan active={room.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
