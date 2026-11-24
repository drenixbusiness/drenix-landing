"use client";

import { useEffect } from "react";

/** Marks .reveal and .lines elements once they enter the screen. One observer for the whole site. */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "-8% 0px" },
    );
    const scan = () => document.querySelectorAll(".reveal:not([data-in]), .lines:not([data-in])").forEach((el) => io.observe(el));
    scan();

    // Pages opened later, and parts of a page that arrive late
    let raf = 0;
    const mo = new MutationObserver(() => {
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        scan();
      });
    });
    mo.observe(document.getElementById("content") ?? document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
