import * as THREE from "three";
import { getGpu, type Tier } from "@/lib/perf";

export type Quality = {
  high: boolean;
  integrated: boolean;
  antialias: boolean;
  /** Pixel ratio limits; the governor moves between them. */
  dprMax: number;
  dprMin: number;
  shadow: number;
  campus: string;
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
  private before = 0;
  private useless = 0;
  private off = false;
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
    if (this.off || ms > 200 || ms < 2) return; // tab switch or first frame
    this.ema += (ms - this.ema) * 0.08;
    if (this.ema > 21) {
      this.fast = 0;
      if (++this.slow > 14) this.lower();
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

  private lower() {
    // Frames as slow as before the last step: the phone is in power saving or the processor is the limit.
    // A blurry picture would not help, so give the sharpness back and stop.
    if (this.before && this.ema > this.before * 0.92) this.useless++;
    if (this.useless > 1) {
      this.off = true;
      this.set(this.q.dprMax);
      return;
    }
    this.before = this.ema;
    this.set(this.ratio * 0.84);
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
