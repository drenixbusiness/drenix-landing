import type { Insets } from "./scene/util";

/** Free space around the model for each kind of panel, in pixels. Must match the panels' CSS. */
export function panelInsets(w: number, h: number): { tower: Insets; plan: Insets; zone: Insets } {
  if (w >= 1024) {
    return {
      tower: { left: 430, right: 372, top: 92, bottom: 30 },
      plan: { left: 470, right: 84, top: 96, bottom: 40 },
      zone: { left: 500, right: 84, top: 84, bottom: 48 },
    };
  }
  if (h < 540 && w > h) {
    const left = w * 0.52;
    const side = { left, right: 8, top: 60, bottom: 10 };
    return { tower: side, plan: side, zone: side };
  }
  return {
    tower: { left: 8, right: 8, top: 150, bottom: Math.min(380, h * 0.42) },
    plan: { left: 8, right: 8, top: Math.min(300, h * 0.34), bottom: 120 },
    zone: { left: 8, right: 8, top: 124, bottom: Math.min(470, h * 0.52) },
  };
}

/** Stills of the rooms, rendered from the same 3D office. */
export const roomStill = (id: string) => `/media/rooms-${id}.webp`;
