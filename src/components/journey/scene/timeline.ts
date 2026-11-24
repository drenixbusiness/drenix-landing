import { smooth, smoother } from "./math";

/**
 * Scroll timeline of the journey, in screen heights.
 * Shared by the 3D engine and the text over it, so both always agree.
 */
export const ZONE_COUNT = 6;

export const TL = {
  /** Campus hero gives way to the tower. */
  tower: [0.3, 1.5],
  /** The selected floor is pulled out and the camera rises over it. */
  drawer: [2.0, 3.1],
  /** The world outside dissolves. */
  fade: [2.55, 3.1],
  grow: [2.3, 3.1],
  tint: [3.1, 3.6],
  /** Whole plan, with room labels. */
  plan: [3.15, 4.0],
  zones: 4.1,
  zoneLen: 0.95,
} as const;

export const ZONES_END = TL.zones + ZONE_COUNT * TL.zoneLen;
/** Last scroll position of the journey (the section is one screen taller than this). */
export const TOTAL = ZONES_END + 0.9;

export type Stage = "campus" | "tower" | "open" | "plan" | "zone" | "done";

export function stageAt(u: number): Stage {
  if (u < 0.75) return "campus";
  if (u < TL.drawer[0] + 0.1) return "tower";
  if (u < TL.plan[0] + 0.05) return "open";
  if (u < TL.zones - 0.12) return "plan";
  if (u < ZONES_END + 0.02) return "zone";
  return "done";
}

/** Room index for a scroll position, or -1 outside the room part. */
export function zoneAt(u: number) {
  const s = (u - TL.zones) / TL.zoneLen;
  if (s < -0.13 || s >= ZONE_COUNT + 0.03) return -1;
  return Math.min(ZONE_COUNT - 1, Math.max(0, Math.floor(s + 0.02)));
}

/** Scroll position where a room is fully in view. */
export const zoneStop = (i: number) => TL.zones + (i + 0.5) * TL.zoneLen;
export const PLAN_STOP = (TL.plan[0] + TL.plan[1]) / 2 + 0.15;
export const TOWER_STOP = 1.7;
export const DONE_STOP = ZONES_END + 0.6;

/** How far a room is lifted at a scroll position. */
export function liftAt(u: number) {
  const s = (u - TL.zones) / TL.zoneLen;
  if (s < 0 || s > ZONE_COUNT) return { zone: -1, lift: 0 };
  const i = Math.min(ZONE_COUNT - 1, Math.floor(s));
  const f = s - i;
  return { zone: i, lift: smooth(0.02, 0.24, f) * (1 - smooth(0.8, 0.98, f)) };
}

/** Camera position on the path plan → room 0 … room 5 → plan, as [from, to, t]. -1 and 6 mean the plan. */
export function zonePath(u: number): [number, number, number] {
  const s = (u - TL.zones) / TL.zoneLen;
  if (s <= -0.16) return [-1, -1, 0];
  if (s >= ZONE_COUNT + 0.3) return [ZONE_COUNT, ZONE_COUNT, 0];
  // Moves happen around the border between two rooms; in between the camera rests
  const k = Math.round(s);
  const t = smoother(k - 0.2, k + 0.24, s);
  return [k - 1, k, t];
}
