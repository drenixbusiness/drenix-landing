"use client";

import Image, { getImageProps } from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { preload } from "react-dom";
import { floors, towerBox, towerImage } from "@/lib/tower";
import { Scaled } from "@/components/mockups/Scaled";
import { FloorModel, type RoomId } from "./FloorModel";
import { getTier, type Tier } from "@/lib/perf";

const Tower3D = dynamic(() => import("./Tower3D"), { ssr: false });
const Office3D = dynamic(() => import("./Office3D"), { ssr: false });
const MODEL = "/models/tower.glb";
const OFFICE = "/models/office.glb";

const ease = [0.16, 1, 0.3, 1] as const;
const N = floors.length;
const bandH = (towerBox.bottom - towerBox.top) / N;
const bandTop = (i: number) => towerBox.top + i * bandH;
const IMG_H = 84; // svh

// Still frame of the 3D scene: on screen instantly, then the live scene fades in over it
const posterAlt = "DRENIX Tower standing on a meadow below a mountain";
const posterWide = getImageProps({ src: "/media/hero-poster.webp", alt: posterAlt, fill: true, priority: true, quality: 75, sizes: "100vw" }).props;
const posterTall = getImageProps({ src: "/media/hero-poster-portrait.webp", alt: posterAlt, fill: true, priority: true, quality: 70, sizes: "100vw" }).props;

const noop = () => () => {};

function Poster() {
  // getImageProps does not emit preload hints, so request the right poster early ourselves
  preload(posterWide.src, { as: "image", imageSrcSet: posterWide.srcSet, imageSizes: posterWide.sizes, media: "(min-aspect-ratio: 4/5)", fetchPriority: "high" });
  preload(posterTall.src, { as: "image", imageSrcSet: posterTall.srcSet, imageSizes: posterTall.sizes, media: "(max-aspect-ratio: 4/5)", fetchPriority: "high" });
  return (
    <picture>
      <source media="(max-aspect-ratio: 4/5)" srcSet={posterTall.srcSet} sizes={posterTall.sizes} />
      <img {...posterWide} alt={posterAlt} fetchPriority="high" className="object-cover" />
    </picture>
  );
}

/** AURUM’dagi qavat tanlagichiga o‘xshash mini reja belgisi */
function PlanIcon() {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16" aria-hidden>
      <rect x="1" y="1" width="62" height="42" fill="none" stroke="currentColor" strokeOpacity=".5" />
      <path d="M27 1v20M27 27v16M1 22h18M24 22h39M45 22v21" stroke="currentColor" strokeOpacity=".5" fill="none" />
      <rect x="29" y="3" width="14" height="17" fill="currentColor" fillOpacity=".18" />
    </svg>
  );
}

export function TowerJourney() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(3);
  const [touched, setTouched] = useState(false);
  const [stage, setStage] = useState<"hero" | "plan">("hero");
  // 3D tower when the device can handle it; the poster stays on weak devices or if loading fails
  const [model, setModel] = useState<"load" | "ready" | "none">("load");
  const [office, setOffice] = useState<"load" | "ready" | "none">("load");
  const tier = useSyncExternalStore<Tier | null>(noop, getTier, () => null);
  const [start3d, setStart3d] = useState(false);
  const [officeOn, setOfficeOn] = useState(false);
  const [officeLive, setOfficeLive] = useState(false);
  const [deep, setDeep] = useState(false);
  useEffect(() => {
    if (getTier() === "low") return;
    // WebGL is heavy (three.js parse, model decode, shader compile). The poster already
    // looks identical, so the 3D scene starts on the visitor's first sign of life
    // (mouse move, touch, scroll, key) instead of competing with the first load.
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(() => setStart3d(true), { timeout: 300 });
      else timer = setTimeout(() => setStart3d(true), 50);
    };
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);
  const lite = tier === "low";
  const tier3d = tier === "high" ? "high" : "mid";
  const f = floors[active];

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [moving, setMoving] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    setStage(v > 0.44 ? "plan" : "hero");
    setMoving(v > 0.02);
    // The office model loads a little before it is needed and only draws while visible
    if (v > 0.18) setOfficeOn(true);
    if (v > 0.04) setDeep(true);
    setOfficeLive(v > 0.38);
  });

  // Kamera: qavatga sho‘ng‘ish
  const ui = useTransform(p, [0.02, 0.1], [1, 0]);
  const uiY = useTransform(p, [0.02, 0.1], [0, -40]);
  const zoom = useTransform(p, [0.06, 0.4], [1, 9], { ease: (t) => t * t * t });
  const blur = useTransform(p, [0.28, 0.4], ["blur(0px)", "blur(10px)"]);
  const zoom3d = useTransform(p, [0.03, 0.34], [0, 1]);
  // Fasad orqali o‘tgach — qavat ichi (kamera harakati davom etadi)
  const inside = useTransform(p, [0.27, 0.33], [0, 1]);
  const insideScale = useTransform(p, [0.27, 0.46], [1.35, 1]);
  const insideCap = useTransform(p, [0.31, 0.35, 0.39, 0.43], [0, 1, 1, 0]);
  const insideCapY = useTransform(p, [0.31, 0.43], [30, -30]);
  const white = useTransform(p, [0.4, 0.46], [0, 1]);
  // Oq maket
  const planOpacity = useTransform(p, [0.44, 0.5], [0, 1]);
  const planScale = useTransform(p, [0.4, 0.85], [0.5, 0.84]);
  const planRotate = useTransform(p, [0.4, 1], [-12, 4]);
  const planY = useTransform(p, [0.4, 1], [60, -10]);
  const captionOpacity = useTransform(p, [0.56, 0.62], [0, 1]);
  const levelText = useTransform(p, [0.52, 0.64], [0, 1]);
  const officeP = useTransform(p, [0.44, 1], [0, 1]);

  // Foydalanuvchi tegmaguncha qavatlar o‘z-o‘zidan almashadi
  // Hero'dan pastga tushilganda to‘xtaydi — reja va interyerdagi qavat raqami o‘zgarmasin
  useEffect(() => {
    if (touched || moving) return;
    const id = setInterval(() => setActive((a) => (a + 1) % N), 3600);
    return () => clearInterval(id);
  }, [touched, moving]);

  // Interyer bo‘limiga tanlangan qavatni xabar qilamiz
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("drenix:floor", { detail: floors[active].level }));
  }, [active]);

  const pick = (i: number) => { setTouched(true); setActive((i + N) % N); };
  // Rasm pastga tekislangan va ekran balandligining IMG_H qismini egallaydi
  const originY = `calc(${100 - IMG_H}svh + ${(bandTop(active) + bandH / 2) * IMG_H}svh)`;

  // Interyer bo‘limi shu hodisani tinglaydi va kerakli xonaga aylantiradi
  const toWalkthrough = (id?: RoomId) => {
    window.dispatchEvent(new CustomEvent<RoomId>("drenix:room", { detail: id ?? "view" }));
  };

  return (
    <section ref={ref} className="relative h-[420svh]" data-header={stage === "hero" ? "light" : undefined}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-stone">
        {/* ---------- 1. Minora ---------- */}
        {/* Osmon — pushti pastel gradiyent */}
        <div
          className="absolute inset-0"
          style={{
            background:
              model === "none"
                ? "linear-gradient(180deg, #fedde6 0%, #fed3d8 26%, #fbbdc4 46%, #eca3c1 72%, #d898b2 100%)"
                : "linear-gradient(180deg, #7f9fcf 0%, #b4c8e4 40%, #e3e8ee 62%, #7c9558 78%, #4c6533 100%)",
          }}
          aria-hidden
        />

        {/* Poster: instant first paint; on weak devices it also does the dive */}
        {model !== "none" && (
          <motion.div
            style={lite ? { scale: zoom, filter: blur, transformOrigin: "50% 48%" } : undefined}
            className={`absolute inset-0 transition-opacity duration-700 ${model === "ready" ? "opacity-0" : "opacity-100"}`}
            aria-hidden
          >
            <Poster />
          </motion.div>
        )}

        {/* 3D minora (tayyor model) */}
        {start3d && !lite && model !== "none" && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${model === "ready" ? "opacity-100" : "opacity-0"}`}>
            <Tower3D
              tier={tier3d}
              introFrom={0.9}
              src={MODEL}
              floors={N}
              active={active}
              onHover={pick}
              zoom={zoom3d}
              onReady={() => setModel("ready")}
              onError={() => setModel("none")}
              className="absolute inset-0"
            />
            {/* Shahar tumani — minora poydevori shu tumandan chiqib turadi */}
            <motion.div style={{ opacity: ui }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          </div>
        )}

        {/* Photo tower — only if the 3D model failed to load */}
        {model === "none" && (
        <motion.div
          style={{ filter: blur, scale: zoom, transformOrigin: `50% ${originY}` }}
          className={`absolute inset-0 transition-opacity duration-1000 ${model === "none" ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              height: `${IMG_H}svh`,
              aspectRatio: `${towerImage.w} / ${towerImage.h}`,
              maskImage: "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent), linear-gradient(to bottom, transparent, #000 16%)",
              maskComposite: "intersect",
              WebkitMaskImage: "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent), linear-gradient(to bottom, transparent, #000 16%)",
              WebkitMaskComposite: "source-in",
            }}
          >
            <Image src={towerImage.src} alt="DRENIX Tower against a pink evening sky" fill quality={75} sizes="160vw" className="object-cover" />

            {/* Qavat chiziqlari */}
            <div className="absolute" style={{ left: `${towerBox.left * 100}%`, width: `${(towerBox.right - towerBox.left) * 100}%`, top: `${towerBox.top * 100}%`, bottom: 0 }}>
              {floors.map((fl, i) => {
                const on = i === active;
                return (
                  <button
                    key={fl.slug}
                    type="button"
                    onMouseEnter={() => pick(i)}
                    onFocus={() => pick(i)}
                    onClick={() => pick(i)}
                    aria-label={`Floor ${fl.level}: ${fl.title}`}
                    className="group absolute inset-x-0 cursor-pointer"
                    style={{ top: `${(i / N) * 100}%`, height: `${100 / N}%` }}
                  >
                    <span className={`absolute inset-0 transition-all duration-500 ${on ? "bg-white/18 shadow-[0_0_40px_rgba(255,255,255,0.35)]" : "bg-transparent group-hover:bg-white/8"}`} />
                    <span className={`absolute inset-x-0 top-0 h-px transition-opacity duration-500 ${on ? "bg-white opacity-100" : "bg-white/40 opacity-0 group-hover:opacity-100"}`} />
                    <span className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-500 ${on ? "bg-white opacity-100" : "opacity-0"}`} />
                    {/* Chap tomondagi qavat belgisi */}
                    <span className={`absolute right-full top-1/2 flex -translate-y-1/2 items-center gap-2 pr-2 transition-all duration-500 ${on ? "opacity-100" : "opacity-0"}`}>
                      <span className="wide text-[11px] text-white md:text-[13px]">{fl.level}</span>
                      <span className="h-px w-8 bg-white md:w-16" />
                    </span>
                    {/* Chap chetdagi mayda shtrixlar */}
                    <span className="absolute -left-2 top-1/2 h-px w-1.5 bg-white/60" />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
        )}

        {/* O‘qilishi uchun yengil soyalar */}
        <motion.div style={{ opacity: ui }} className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/15" />
        <motion.div style={{ opacity: ui }} className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
        <motion.div style={{ opacity: ui }} className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/45 lg:hidden" />

        {/* ---------- Hero UI ---------- */}
        <motion.div style={{ opacity: ui, y: uiY }} className="pointer-events-none absolute inset-0 text-white">
          <div className="container-x relative flex h-full flex-col pt-[69px]">
            <div className="grid flex-1 items-center gap-8 lg:grid-cols-12">
              <div className="pointer-events-auto max-w-xl lg:col-span-5">
                <h1 className="wide text-[8.2vw] leading-[1.05] sm:text-[6vw] lg:text-[3.9vw] 2xl:text-[60px]">
                  {["Rise to", "a new", "level"].map((l, i) => (
                    <span key={l} className="block overflow-hidden">
                      <span className={`hero-rise block ${i === 2 ? "opacity-85" : ""}`} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                        {l}
                      </span>
                    </span>
                  ))}
                </h1>
                <p className="hero-up mt-6 max-w-[22rem] text-[15px] leading-relaxed text-white/90">
                  A ten-floor IT company. Every floor has its own team: development, design, marketing, AI and more. Pick the floor you need.
                </p>
                <div className="hero-in mt-8 flex flex-wrap gap-2.5" style={{ animationDelay: "0.35s" }}>
                  <button onClick={() => toWalkthrough()} className="label flex h-11 items-center gap-3 rounded-full bg-white px-5 text-graphite transition-colors hover:bg-white/85">
                    Step inside <span aria-hidden>→</span>
                  </button>
                  <Link href="/contact" className="label flex h-11 items-center rounded-full bg-black/35 px-5 backdrop-blur-md transition-colors hover:bg-black/55">
                    Book a meeting
                  </Link>
                </div>
              </div>

              {/* ---------- AURUM paneli ---------- */}
              <aside
                style={{ animationDelay: "0.5s" }}
                className="hero-in panel-dark pointer-events-auto hidden w-[300px] justify-self-end rounded-[10px] p-5 lg:col-span-4 lg:col-start-9 lg:block xl:w-[320px]"
                onMouseEnter={() => setTouched(true)}
              >
                <div className="flex items-start justify-between">
                  <p className="label text-white/60">Floor · Service</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => pick(active - 1)} className="grid size-6 place-items-center rounded-full border border-white/25 text-[11px] hover:bg-white/10" aria-label="Floor up">↑</button>
                    <button onClick={() => pick(active + 1)} className="grid size-6 place-items-center rounded-full border border-white/25 text-[11px] hover:bg-white/10" aria-label="Floor down">↓</button>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="flex items-start">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={f.level}
                        initial={{ y: 24, opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: -24, opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.45, ease }}
                        className="wide text-[56px] leading-none"
                      >
                        {f.level}
                      </motion.span>
                    </AnimatePresence>
                    <span className="label ml-1 mt-1 text-white/50">/10</span>
                  </div>
                  <div className="text-white/80">
                    <PlanIcon />
                    <p className="label mt-1 text-right text-[8px] text-white/50">3D plan</p>
                  </div>
                </div>
                <motion.div key={f.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <p className="text-[17px] font-semibold">{f.name}</p>
                      <p className="label text-[8px] text-white/55">{f.level}.01 – {f.level}.06</p>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/70">{f.title}. {f.short}.</p>
                    <dl className="mt-4 border-t border-white/12 text-[13px]">
                      {f.specs.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 border-b border-white/12 py-2">
                          <dt className="text-white/55">{k}</dt>
                          <dd className="text-right font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                </motion.div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="label flex items-center gap-2 text-[9px] text-white/60">
                    <span className="flex gap-0.5">
                      {floors.map((x, i) => (
                        <span key={x.slug} className={`h-1 w-1 rounded-full ${i === active ? "bg-white" : "bg-white/25"}`} />
                      ))}
                    </span>
                    {String(active + 1).padStart(2, "0")}/{N}
                  </div>
                  <Link href={`/services/${f.slug}`} className="label flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[9px] text-graphite hover:bg-white/85">
                    Details →
                  </Link>
                </div>
              </aside>
            </div>

            {/* Mobil: tanlangan qavat */}
            <div className="pointer-events-auto mb-5 flex items-center justify-between gap-4 rounded-2xl bg-black/35 p-3 backdrop-blur-md lg:hidden">
              <div className="flex items-center gap-3">
                <span className="wide text-2xl">{f.level}</span>
                <span className="text-sm leading-tight">{f.title}</span>
              </div>
              <Link href={`/services/${f.slug}`} className="label shrink-0 rounded-full bg-white px-3 py-2 text-[9px] text-graphite">Enter →</Link>
            </div>

            {/* Pastki raqamlar */}
            <dl style={{ animationDelay: "0.6s" }} className="hero-in mb-7 hidden items-stretch gap-0 md:flex">
              {[["10", "Floors"], ["24", "Hour response"], ["12", "Month warranty"], ["0", "Cost of audit"]].map(([v, l], i) => (
                <div key={l} className={`pr-8 ${i ? "border-l border-white/30 pl-8" : ""}`}>
                  <dd className="wide text-[28px] leading-none">{v}</dd>
                  <dt className="label mt-2 text-[9px] text-white/75">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>

        {/* ---------- 2. Qavat ichi: fasaddan o‘tgandan keyingi kadr ---------- */}
        <motion.div style={{ opacity: inside }} className="pointer-events-none absolute inset-0 overflow-hidden bg-[#2a2026]">
          <motion.div style={{ scale: insideScale }} className="absolute inset-0">
            {/* Loaded once the user starts scrolling — not needed for the first screen */}
            {deep && <Image src="/media/room-view.webp" alt="" fill quality={75} sizes="100vw" className="object-cover" />}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />
          <motion.div style={{ opacity: insideCap, y: insideCapY }} className="absolute inset-0 grid place-items-center text-center text-white">
            <div>
              <p className="wide text-[clamp(34px,6vw,88px)] leading-none">{f.name}</p>
              <p className="mx-auto mt-5 max-w-sm text-[15px] text-white/85">{f.title}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ---------- 3. Oq o‘tish ---------- */}
        <motion.div style={{ opacity: white }} className="pointer-events-none absolute inset-0 bg-stone" />

        {/* ---------- 3. Oq maket qavat ---------- */}
        <motion.div style={{ opacity: planOpacity }} className={`absolute inset-0 ${stage === "plan" ? "" : "pointer-events-none"}`}>
          <div className="absolute inset-x-0 top-[96px] text-center">
            <motion.p style={{ opacity: captionOpacity }} className="label text-smoke">
              DRENIX Tower / Floor {f.level} / Office plan
            </motion.p>
          </div>
          {!lite && office !== "none" ? (
            officeOn && <Office3D
              tier={tier3d}
              live={officeLive}
              src={OFFICE}
              progress={officeP}
              onPick={(id) => toWalkthrough(id as RoomId)}
              onReady={() => setOffice("ready")}
              onError={() => setOffice("none")}
              className={`absolute inset-x-0 bottom-24 top-24 transition-opacity duration-700 ${office === "ready" ? "opacity-100" : "opacity-0"}`}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <motion.div style={{ scale: planScale, rotate: planRotate, y: planY }} className="w-[min(94vw,1040px)]">
                <Scaled width={1000} height={640}>
                  <FloorModel onPick={(id) => toWalkthrough(id)} />
                </Scaled>
              </motion.div>
            </div>
          )}
          <motion.p style={{ opacity: levelText }} className="wide pointer-events-none absolute inset-x-0 bottom-16 text-center max-sm:hidden text-[clamp(28px,4vw,56px)] text-graphite/15">
            Floor {f.level}
          </motion.p>
          <motion.div style={{ opacity: captionOpacity }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <button onClick={() => toWalkthrough()} className="label flex items-center gap-3 rounded-full bg-graphite px-5 py-3 text-white transition-colors hover:bg-ember">
              View the rooms <span>↓</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
