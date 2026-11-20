"use client";

import type { CSSProperties } from "react";

/**
 * AURUM’dagi oq maket qavat — sof CSS 3D. Ofis rejasi 1000×640 birlikda chiziladi,
 * devorlar va mebellar uch yuzali (ust, old, o‘ng) qutilar sifatida quriladi.
 */

export type RoomId = "view" | "dev" | "design" | "growth" | "meeting" | "lounge" | "servers";

type Room = { id: RoomId; name: string; x: number; y: number; w: number; h: number; floor: string };

export const planRooms: Room[] = [
  { id: "dev", name: "Engineering", x: 0, y: 0, w: 430, h: 300, floor: "#ecebe8" },
  { id: "design", name: "Design", x: 430, y: 0, w: 270, h: 300, floor: "#efe9e2" },
  { id: "meeting", name: "Strategy", x: 700, y: 0, w: 300, h: 260, floor: "#ebe5de" },
  { id: "servers", name: "Cloud & AI", x: 700, y: 260, w: 300, h: 140, floor: "#e7e9eb" },
  { id: "lounge", name: "Launchpad", x: 0, y: 300, w: 430, h: 340, floor: "#e6d9c7" },
  { id: "growth", name: "Growth", x: 430, y: 300, w: 270, h: 340, floor: "#ecebe8" },
  { id: "view", name: "Panorama", x: 700, y: 400, w: 300, h: 240, floor: "#efe9e2" },
];

const WALL = 64;

type BoxSpec = { x: number; y: number; w: number; d: number; h: number; c: string; z?: number; glass?: boolean };

function shade(c: string, pct: number) {
  return `color-mix(in srgb, ${c} ${pct}%, #3a3530)`;
}

/** Uch yuzali quti: ust, old (+y) va o‘ng (+x). */
function Box({ x, y, w, d, h, c, z = 0, glass }: BoxSpec) {
  const face: CSSProperties = { position: "absolute", transformOrigin: "0 0", backfaceVisibility: "visible" };
  const alpha = glass ? 0.35 : 1;
  return (
    <>
      <div style={{ ...face, left: x, top: y, width: w, height: d, background: c, opacity: glass ? 0.5 : 1, transform: `translateZ(${z + h}px)` }} />
      <div
        style={{
          ...face, left: x, top: y + d, width: w, height: h, opacity: alpha,
          background: glass ? "linear-gradient(180deg, rgba(200,225,235,0.9), rgba(170,200,215,0.7))" : `linear-gradient(180deg, ${shade(c, 92)}, ${shade(c, 84)})`,
          transform: `translateZ(${z}px) rotateX(90deg)`,
        }}
      />
      <div
        style={{
          ...face, left: x + w, top: y, width: d, height: h, opacity: alpha,
          background: glass ? "linear-gradient(180deg, rgba(190,215,228,0.9), rgba(160,190,205,0.7))" : `linear-gradient(180deg, ${shade(c, 82)}, ${shade(c, 74)})`,
          transform: `translateZ(${z}px) rotateZ(90deg) rotateX(90deg)`,
        }}
      />
    </>
  );
}

const W = (x1: number, y1: number, x2: number, y2: number, opts: Partial<BoxSpec> = {}): BoxSpec =>
  x1 === x2
    ? { x: x1 - 5, y: y1, w: 10, d: y2 - y1, h: WALL, c: "#f6f4f0", ...opts }
    : { x: x1, y: y1 - 5, w: x2 - x1, d: 10, h: WALL, c: "#f6f4f0", ...opts };

const walls: BoxSpec[] = [
  // Tashqi devorlar (orqa tomon) — balandroq, oynali
  { x: -12, y: -12, w: 1012, d: 12, h: WALL + 10, c: "#f8f6f2" },
  { x: -12, y: 0, w: 12, d: 640, h: WALL + 10, c: "#f8f6f2" },
  // Ichki to‘siqlar (eshik o‘rinlari bilan)
  W(430, 0, 430, 120), W(430, 175, 430, 300),
  W(700, 0, 700, 90, { glass: true }), W(700, 150, 700, 260, { glass: true }),
  W(700, 300, 700, 400),
  W(0, 300, 170, 300), W(235, 300, 430, 300), W(430, 300, 560, 300), W(620, 300, 700, 300),
  W(760, 260, 1000, 260, { glass: true }),
  W(700, 400, 870, 400),
  W(430, 390, 430, 640),
];

const desk = (x: number, y: number, w = 150): BoxSpec[] => [
  { x, y, w, d: 44, h: 26, c: "#fbfaf8" },
  { x: x + 20, y: y + 6, w: 34, d: 5, h: 22, c: "#2a2a2c", z: 26 },
  { x: x + w - 54, y: y + 6, w: 34, d: 5, h: 22, c: "#2a2a2c", z: 26 },
  { x: x + 25, y: y + 54, w: 24, d: 24, h: 18, c: "#2f2f31" },
  { x: x + w - 50, y: y + 54, w: 24, d: 24, h: 18, c: "#2f2f31" },
];

const plant = (x: number, y: number, s = 26): BoxSpec[] => [
  { x, y, w: s, d: s, h: 18, c: "#d8d2c8" },
  { x: x - 6, y: y - 6, w: s + 12, d: s + 12, h: 34, c: "#6f8a5b", z: 18 },
];

const furniture: BoxSpec[] = [
  // Engineering
  ...desk(40, 50), ...desk(230, 50), ...desk(40, 170), ...desk(230, 170),
  ...plant(385, 250),
  // Design
  { x: 470, y: 80, w: 170, d: 90, h: 26, c: "#fbfaf8" },
  { x: 485, y: 95, w: 60, d: 40, h: 2, c: "#ec6a26", z: 26 },
  { x: 560, y: 100, w: 50, d: 34, h: 2, c: "#2a2a2c", z: 26 },
  { x: 470, y: 8, w: 110, d: 6, h: 44, c: "#ec6a26", z: 10 },
  { x: 480, y: 200, w: 26, d: 26, h: 18, c: "#2f2f31" }, { x: 600, y: 200, w: 26, d: 26, h: 18, c: "#2f2f31" },
  // Strategiya — uzun stol va to‘q sariq kreslolar
  { x: 760, y: 80, w: 190, d: 70, h: 26, c: "#b98b61" },
  ...[0, 1, 2, 3].flatMap((i) => [
    { x: 770 + i * 45, y: 52, w: 24, d: 22, h: 20, c: "#ec6a26" },
    { x: 770 + i * 45, y: 158, w: 24, d: 22, h: 20, c: "#ec6a26" },
  ]),
  { x: 990, y: 70, w: 6, d: 90, h: 40, c: "#2a2a2c", z: 14 },
  // Cloud & AI — server shkaflari
  ...[0, 1, 2, 3, 4].map((i) => ({ x: 730 + i * 50, y: 300, w: 34, d: 60, h: 56, c: "#34363a" })),
  // Launchpad — divan, stol, o‘simliklar
  { x: 50, y: 370, w: 220, d: 60, h: 26, c: "#d9c9b2" },
  { x: 50, y: 430, w: 60, d: 140, h: 26, c: "#d9c9b2" },
  { x: 160, y: 470, w: 100, d: 70, h: 16, c: "#b98b61" },
  { x: 320, y: 420, w: 70, d: 70, h: 26, c: "#ec6a26" },
  ...plant(370, 580), ...plant(20, 590),
  // Growth — ekran devori va stollar
  { x: 445, y: 310, w: 230, d: 6, h: 50, c: "#202022", z: 8 },
  ...desk(465, 380, 200), ...desk(465, 500, 200),
  // Panorama — kreslolar
  { x: 760, y: 470, w: 60, d: 60, h: 24, c: "#d9c9b2" },
  { x: 880, y: 470, w: 60, d: 60, h: 24, c: "#d9c9b2" },
  { x: 830, y: 560, w: 50, d: 50, h: 14, c: "#b98b61" },
  ...plant(950, 590),
];

export function FloorModel({ active, onPick, labels = true }: { active?: RoomId | null; onPick?: (id: RoomId) => void; labels?: boolean }) {
  return (
    <div className="relative" style={{ width: 1000, height: 640, perspective: 2600, perspectiveOrigin: "50% 30%" }}>
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(56deg) rotateZ(-38deg)", transformOrigin: "50% 50%" }}
      >
        {/* Qavat plitasi */}
        <div className="absolute inset-0" style={{ background: "#f3f1ed", boxShadow: "0 60px 120px rgba(40,30,20,0.18)" }} />
        <div className="absolute" style={{ left: 0, top: 640, width: 1000, height: 18, background: "#dcd7cf", transformOrigin: "0 0", transform: "rotateX(-90deg)" }} />
        <div className="absolute" style={{ left: 1000, top: 0, width: 640, height: 18, background: "#cfc9c0", transformOrigin: "0 0", transform: "rotateZ(90deg) rotateX(-90deg)" }} />

        {/* Xona pollari */}
        {planRooms.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick?.(r.id)}
            aria-label={r.name}
            className="absolute transition-[filter] duration-300"
            style={{
              left: r.x, top: r.y, width: r.w, height: r.h, background: r.floor,
              filter: active === r.id ? "brightness(1.03) saturate(1.3)" : undefined,
              outline: active === r.id ? "3px solid rgba(236,106,38,0.8)" : "none",
              outlineOffset: -3,
            }}
          />
        ))}

        {walls.map((b, i) => <Box key={`w${i}`} {...b} />)}
        {furniture.map((b, i) => <Box key={`f${i}`} {...b} />)}

        {/* Kameraga qaragan yorliqlar */}
        {labels &&
          planRooms.map((r) => (
            <div
              key={`l${r.id}`}
              className="absolute"
              style={{ left: r.x + r.w / 2, top: r.y + r.h / 2, transformStyle: "preserve-3d", transform: "translateZ(120px)" }}
            >
              <button
                type="button"
                onClick={() => onPick?.(r.id)}
                className={`label -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 shadow-lg transition-colors ${active === r.id ? "bg-ember text-white" : "bg-white/95 text-graphite hover:bg-graphite hover:text-white"}`}
                style={{ transform: "rotateZ(38deg) rotateX(-56deg)", display: "block" }}
              >
                {r.name}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
