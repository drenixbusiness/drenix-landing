"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { nav, site } from "@/lib/site";
import { lockPage } from "@/lib/smoothScroll";
import { whenIdle } from "@/lib/whenIdle";

/**
 * Header: logo and menu on a thin line.
 * White over sections marked `data-header="light"`, dark everywhere else.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // The phone menu is built in a quiet moment: not needed to open the page
  const [menu, setMenu] = useState(false);
  const [light, setLight] = useState(false);
  const [solid, setSolid] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    let raf = 0, last = 0;
    const check = () => {
      raf = 0;
      const els = document.elementsFromPoint(window.innerWidth / 2, 40);
      const host = els.map((e) => e.closest<HTMLElement>("[data-header]")).find(Boolean);
      setLight(host?.dataset.header === "light");
      // Once the page moves the header gets a background, so it never mixes with what passes under it.
      // The 3D sections bring their own veil, until they leave the screen.
      const bare = els.map((e) => e.closest("[data-bare-header]")).find(Boolean);
      setSolid(window.scrollY > 24 && !(bare && bare.getBoundingClientRect().bottom > document.documentElement.clientHeight - 8));
    };
    let late: ReturnType<typeof setTimeout> | undefined;
    // Looking under the header costs a layout: a few times a second is enough, and once more at the end
    const onScroll = () => {
      const now = performance.now();
      if (now - last > 100) {
        last = now;
        raf ||= requestAnimationFrame(check);
      }
      clearTimeout(late);
      late = setTimeout(check, 120);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t = setTimeout(check, 400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t);
      clearTimeout(late);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // Open menu: page does not scroll, focus stays inside, Escape closes
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    lockPage(true);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [toggle, ...(menuRef.current?.querySelectorAll<HTMLElement>("a") ?? [])].filter(Boolean) as HTMLElement[];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lockPage(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    return whenIdle(() => setMenu(true));
  }, []);

  const white = open || light;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${white ? "on-dark text-white" : "text-graphite"} ${solid && !open ? (light ? "bg-graphite/95 lg:bg-graphite/85 lg:backdrop-blur-md" : "bg-stone/98 shadow-[0_1px_0_rgb(20_20_20/0.1)] lg:bg-stone/95 lg:backdrop-blur-md") : ""}`}>
        <div className="container-x">
          <div className="flex h-[68px] items-center justify-between gap-6">
            <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="DRENIX, home">
              <Image src="/brand/phoenix.png" alt="" width={28} height={28} loading="eager" className="size-7" />
              <Image
                src={white ? "/brand/wordmark-light.png" : "/brand/wordmark-dark.png"}
                alt="DRENIX"
                width={958}
                height={144}
                loading="eager"
                sizes="96px"
                className="h-[13px] w-auto"
              />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main menu">
              {nav.filter((n) => n.href !== "/contact").map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-full px-4 text-[16px] font-medium transition-colors hover:bg-current/10 ${active ? "underline decoration-2 underline-offset-[7px]" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/contact" className={`ml-3 flex min-h-11 items-center gap-2 rounded-full px-5 text-[16px] font-medium transition-colors ${white ? "bg-white text-graphite hover:bg-stone-2" : "bg-graphite text-white hover:bg-ember-deep"}`}>
                Contact <Icon name="arrow-up-right" />
              </Link>
            </nav>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="relative grid size-11 place-items-center rounded-full border border-current/40 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[3.5px]"}`} />
              <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[3.5px]"}`} />
            </button>
          </div>
        </div>
      </header>

      {(menu || open) && <div
        id="mobile-menu"
        ref={menuRef}
        inert={!open}
        // Becoming visible is instant, so the first link can take focus; only fading is animated
        className={`on-dark fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-graphite pb-8 pt-24 text-white duration-200 lg:hidden ${open ? "visible opacity-100 transition-opacity" : "invisible opacity-0 transition-[opacity,visibility]"}`}
      >
        <nav className="container-x" aria-label="Mobile menu">
          <ul>
            {nav.map((item, i) => (
              <li
                key={item.href}
                className={`transition-[opacity,translate] ease-out-expo ${open ? "translate-y-0 opacity-100 duration-500" : "translate-y-2.5 opacity-0 duration-200"}`}
                style={{ transitionDelay: open ? `${30 + i * 30}ms` : "0ms" }}
              >
                <Link href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} className="wide flex min-h-16 items-center justify-between border-b border-white/20 text-[21px]">
                  {item.label}
                  <Icon name="arrow-right" className="size-5 text-ember-light" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-x mt-10 text-[17px]">
          <a href={site.phoneHref} className="flex min-h-11 items-center">{site.phone}</a>
          <a href={`mailto:${site.email}`} className="flex min-h-11 items-center">{site.email}</a>
        </div>
      </div>}
    </>
  );
}
