import * as THREE from "three";
import { canFetchHuge, getGpu, type Tier } from "@/lib/perf";

export type Quality = {
  high: boolean;
  integrated: boolean;
  antialias: boolean;
  /** Pixel ratio limits; the governor moves between them. */
  dprMax: number;
  dprMin: number;
  shadow: number;
  campus: string;
  /** Panorama upgrade steps after the first small one. */
  panoramas: string[];
};

export function getQuality(tier: Tier): Quality {
  const high = tier === "high";
  const integrated = getGpu() !== "discrete";
  const dpr = window.devicePixelRatio || 1;
  return {
    high,
    integrated,
    // Multisampling is cheap on phone GPUs and the facade is full of thin lines
    antialias: true,
    dprMax: Math.min(dpr, high ? (integrated ? 1.25 : 2) : 1.5),
    dprMin: Math.min(dpr, high ? 0.7 : 0.75),
    shadow: high ? (integrated ? 2048 : 4096) : 1024,
    campus: high ? "/models/campus.glb" : "/models/campus-lite.glb",
    panoramas: canFetchHuge() ? ["/hdri/landscape-4k.webp", "/hdri/landscape-8k.webp"] : ["/hdri/landscape-4k.webp"],
  };
}

/**
 * Keeps the frame rate up by changing the render resolution.
 * Drops quickly when frames are slow, climbs back carefully when there is headroom.
 */
export class ResolutionGovernor {
  private ema = 16;
  private slow = 0;
  private fast = 0;
  private raises = 0;
  ratio: number;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private q: Quality,
    private onChange: () => void,
  ) {
    this.ratio = q.dprMax;
    renderer.setPixelRatio(this.ratio);
  }

  /** Call once per drawn frame with the real frame time in seconds. */
  tick(dt: number) {
    const ms = dt * 1000;
    if (ms > 200 || ms < 2) return; // tab switch or first frame
    this.ema += (ms - this.ema) * 0.08;
    if (this.ema > 25) {
      this.fast = 0;
      if (++this.slow > 18) this.set(this.ratio * 0.84);
    } else if (this.ema < 13 && this.raises < 3) {
      this.slow = 0;
      if (++this.fast > 240) {
        this.raises++;
        this.set(this.ratio * 1.1);
      }
    } else {
      this.slow = Math.max(0, this.slow - 1);
      this.fast = 0;
    }
  }

  private set(r: number) {
    const next = Math.min(this.q.dprMax, Math.max(this.q.dprMin, r));
    this.slow = 0;
    this.fast = 0;
    this.ema = 16;
    if (Math.abs(next - this.ratio) < 0.02) return;
    this.ratio = next;
    this.renderer.setPixelRatio(next);
    this.onChange();
  }
}
