import type { PanelInsets } from "./scene/engine";

/**
 * Free space around the model for each kind of panel, in pixels.
 * Beside the model on wide screens; on phones above and below it, where the panels are measured (data-block).
 */
export function panelInsets(w: number, h: number, root: Element | null): PanelInsets {
  if (w >= 1024 && w >= h) {
    const edge = Math.max(0, (w - 1480) / 2);
    const plan = { left: edge + 470, right: 84, top: 96, bottom: 40 };
    return {
      tower: w < 1280 ? { left: 336, right: 354, top: 92, bottom: 30 } : { left: edge + 430, right: edge + 372, top: 92, bottom: 30 },
      plan,
      zone: { left: edge + 500, right: 84, top: 84, bottom: 48 },
      done: plan,
    };
  }
  if (h < 540 && w > h) {
    const side = { left: w * 0.52, right: 8, top: 60, bottom: 10 };
    return { tower: side, plan: side, zone: side, done: side };
  }
  // Only panels that have been laid out already (see warmLayers): measuring a hidden one would stall the page
  const block = (name: string) => {
    const el = root?.querySelector<HTMLElement>(`[data-block="${name}"]`);
    return el?.closest("[data-warm]") ? el : null;
  };
  const height = (name: string, guess: number) => block(name)?.offsetHeight || guess;
  const text = block("plan");
  const fit = (top: number, bottom: number) => ({ left: 8, right: 8, top, bottom: Math.max(8, Math.min(bottom, h - top - 110)) });
  return {
    tower: fit(h < 740 ? 138 : 150, height("tower", h * 0.4) + 28),
    // The numbers of the rooms stand above the plan
    plan: fit((text?.offsetHeight ? text.offsetTop + text.offsetHeight : h * 0.3) + 34, 92),
    zone: fit(100, height("zone", h * 0.5) + 22),
    done: fit(122, height("done", h * 0.6) + 26),
  };
}

/** Stills of the rooms, rendered from the same 3D office. */
export const roomStill = (id: string) => `/media/rooms-${id}.webp`;
