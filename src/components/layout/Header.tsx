"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";

/**
 * Header: logo, hairline and a compact menu.
 * Switches between white and dark based on the `data-header` attribute of the section beneath it.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(true);
  const [solid, setSolid] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const els = document.elementsFromPoint(window.innerWidth / 2, 40);
      const host = els.map((e) => e.closest<HTMLElement>("[data-header]")).find(Boolean);
      setLight(host?.dataset.header === "light");
      setSolid(host?.dataset.header === "solid");
    };
    let late: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
      // The section attribute may change after scrolling, so check once more
      clearTimeout(late);
      late = setTimeout(check, 120);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t = setTimeout(check, 400);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); clearTimeout(t); cancelAnimationFrame(raf); };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const tone = open || light ? "text-white" : "text-graphite";

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${tone} ${solid && !open ? "bg-stone/80 backdrop-blur-md" : ""}`}>
        <div className="container-x">
          <div className="flex h-[68px] items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5" aria-label="DRENIX, home">
              <Image src="/brand/phoenix.png" alt="" width={26} height={26} priority className="size-[26px]" />
              <Image
                src={open || light ? "/brand/wordmark-light.png" : "/brand/wordmark-dark.png"}
                alt="DRENIX"
                width={958}
                height={144}
                priority
                className="h-[12px] w-auto"
              />
            </Link>

            <nav className="hidden items-center gap-9 lg:flex" aria-label="Main menu">
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`label transition-opacity ${active ? "opacity-100" : "opacity-70 hover:opacity-100"}`}>
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/contact" className="label flex h-9 items-center gap-2 rounded-full border border-current/40 px-4 transition-colors hover:bg-current/10">
                Get in touch <span aria-hidden>↗</span>
              </Link>
            </nav>

            <button
              onClick={() => setOpen((o) => !o)}
              className="relative grid size-10 place-items-center rounded-full border border-current/30 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className={`absolute h-px w-4 bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
              <span className={`absolute h-px w-4 bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
            </button>
          </div>
          {/* Hairline with "+" marks */}
          <div className="relative hidden h-px bg-current/25 md:block">
            <span className="absolute -left-[5px] -top-[5px] text-[11px] leading-none opacity-70">+</span>
            <span className="absolute -right-[5px] -top-[5px] text-[11px] leading-none opacity-70">+</span>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-between bg-graphite pb-8 pt-24 text-white lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <nav className="container-x flex flex-col" aria-label="Mobile menu">
              {nav.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                  <Link href={item.href} className="wide flex items-center justify-between border-b border-white/15 py-5 text-xl">
                    {item.label}
                    <span className="text-ember">→</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="container-x space-y-1 text-white/70">
              <a href={site.phoneHref} className="block">{site.phone}</a>
              <a href={`mailto:${site.email}`} className="block">{site.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
