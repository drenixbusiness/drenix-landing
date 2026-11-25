/** Runs once the page has loaded and the browser has nothing better to do. Returns a function that cancels it. */
export function whenIdle(fn: () => void, timeout = 3000) {
  let idle = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ask = () => {
    // Safari has no requestIdleCallback
    if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(fn, { timeout });
    else timer = setTimeout(fn, 250);
  };
  if (document.readyState === "complete") ask();
  else window.addEventListener("load", ask, { once: true });
  return () => {
    window.removeEventListener("load", ask);
    if (idle) window.cancelIdleCallback(idle);
    clearTimeout(timer);
  };
}

/** Lays out the hidden panels of a tour one by one, so nothing is left for the moment they appear. */
export function warmLayers(root: Element, done: () => void) {
  const list = [...root.querySelectorAll("[data-layer]:not([data-warm])")];
  let stop = () => {};
  const next = () => {
    list.shift()?.setAttribute("data-warm", "");
    stop = whenIdle(list.length ? next : done);
  };
  stop = whenIdle(next);
  return () => stop();
}

const signs = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

/** Runs on the first sign of a visitor: a move, a touch, a scroll or a key. Returns a function that cancels it. */
export function onFirstSign(fn: () => void) {
  const go = () => {
    off();
    fn();
  };
  const off = () => signs.forEach((e) => window.removeEventListener(e, go));
  signs.forEach((e) => window.addEventListener(e, go, { passive: true }));
  return off;
}
