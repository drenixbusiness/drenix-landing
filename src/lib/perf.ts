/**
 * Device performance tier, decided once on the client.
 * - high: desktop with a decent GPU/CPU and network — full 3D, bloom, high-res panorama.
 * - mid: phones, tablets and modest laptops — 3D with a lower pixel ratio, no post-processing.
 * - low: weak devices, Save-Data or slow networks — static poster, no WebGL.
 */
export type Tier = "high" | "mid" | "low";

type NavExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

let cached: Tier | null = null;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function getTier(): Tier {
  if (cached) return cached;
  if (typeof window === "undefined") return "mid";
  const nav = navigator as NavExtras;
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const conn = nav.connection;
  const slowNet = !!conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "");
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 1024;

  if (slowNet || mem <= 2 || cores <= 2 || !hasWebGL()) cached = "low";
  else if (touch || small || mem <= 4 || cores <= 4) cached = "mid";
  else cached = "high";
  return cached;
}

/** Fast network and plenty of memory: worth fetching the 8K panorama. */
export function canFetchHuge() {
  const nav = navigator as NavExtras;
  return getTier() === "high" && (nav.deviceMemory ?? 8) >= 8 && (nav.connection?.effectiveType ?? "4g") === "4g";
}
