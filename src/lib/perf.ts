/**
 * Device performance tier, decided once on the client from what the browser tells for free.
 * - high: desktop with a capable CPU and network: full 3D, shadows, high-res panorama.
 * - mid: phones, tablets and modest laptops: lighter models, smaller shadows, lower pixel ratio.
 * - low: weak devices, Save-Data or slow networks: static images, no WebGL.
 * The graphics card is checked separately, right before the 3D starts (see canRender3D).
 */
export type Tier = "high" | "mid" | "low";
export type Gpu = "discrete" | "integrated" | "weak" | "none";

type NavExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

let cachedTier: Tier | null = null;
let cachedGpu: Gpu | null = null;

/** Software renderers and very old mobile GPUs: 3D would stutter. */
const WEAK_GPU = /swiftshader|llvmpipe|software|basic render|mali-[34]\d\d|mali-t[678]\d\d|adreno \(tm\) [345]\d\d|powervr sgx|videocore|gma |hd graphics (2|3|4)\d{3}/i;
const INTEGRATED_GPU = /intel|uhd|iris|radeon\(tm\) graphics|radeon(\(tm\))? vega|amd radeon graphics|microsoft/i;

export function getGpu(): Gpu {
  if (cachedGpu) return cachedGpu;
  if (typeof window === "undefined") return "integrated";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return (cachedGpu = "none");
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    cachedGpu = WEAK_GPU.test(name) ? "weak" : INTEGRATED_GPU.test(name) ? "integrated" : "discrete";
  } catch {
    cachedGpu = "none";
  }
  return cachedGpu;
}

export function getTier(): Tier {
  if (cachedTier) return cachedTier;
  if (typeof window === "undefined") return "mid";
  const nav = navigator as NavExtras;
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const conn = nav.connection;
  const slowNet = !!conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "");
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 1024;

  if (slowNet || mem <= 2 || cores <= 2) cachedTier = "low";
  else if (touch || small || mem <= 4 || cores <= 4) cachedTier = "mid";
  else cachedTier = "high";
  return cachedTier;
}

/** False without WebGL 2 or with a software renderer. Creates a WebGL context, which is slow: ask only when it matters. */
export function canRender3D() {
  const gpu = getGpu();
  return gpu !== "none" && gpu !== "weak";
}

/* ---------- Reduced motion, as an external store for React ---------- */

const REDUCED = "(prefers-reduced-motion: reduce)";

export function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export const prefersReducedMotion = () => window.matchMedia(REDUCED).matches;
