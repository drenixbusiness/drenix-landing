import type { ReactNode } from "react";

/** Fades a panel in and out. Hidden panels cannot be focused or read, and cost no layout until the page is warm. */
export function Layer({ on, className = "", children }: { on: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      data-layer=""
      inert={!on}
      className={`transition-[opacity,translate,visibility,content-visibility] ease-out-expo [transition-behavior:allow-discrete] ${on ? "visible translate-y-0 opacity-100 duration-500" : "layer-off invisible translate-y-3 opacity-0 duration-200"} ${className}`}
    >
      {children}
    </div>
  );
}
