"use client";

import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

/** Vertical line that fills along its parent as the parent passes the screen. */
export function GrowLine({ className = "" }: { className?: string }) {
  const line = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLElement | null>(null);
  useEffect(() => {
    box.current = line.current?.parentElement ?? null;
  }, []);
  useScrollProgress(box, { start: 0.7, end: 0.6 }, (p) => {
    if (line.current) line.current.style.scale = `1 ${p.toFixed(4)}`;
  });
  return <div ref={line} className={className} style={{ scale: "1 0" }} aria-hidden />;
}
