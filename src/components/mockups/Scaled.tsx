import type { CSSProperties, ReactNode } from "react";

/** Draws a mockup at a fixed size and scales it to the width of its container, so it looks the same on every screen. */
export function Scaled({ width, height, children, className = "" }: { width: number; height: number; children: ReactNode; className?: string }) {
  return (
    <div className={`scaled relative w-full ${className}`} style={{ aspectRatio: `${width} / ${height}`, "--w": `${width}px` } as CSSProperties}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width, height }}>
        {children}
      </div>
    </div>
  );
}
