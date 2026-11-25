import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "light" | "glass" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-graphite text-white hover:bg-ember-deep",
  light: "bg-white text-graphite hover:bg-stone-2",
  glass: "border border-graphite/25 bg-white/80 text-graphite hover:border-graphite hover:bg-white lg:bg-white/60 lg:backdrop-blur-md",
  outline: "border border-current/45 hover:border-current hover:bg-current/10",
};

type Props = {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
  icon?: IconName;
};

/** Pill button, 48 px high, with an arrow. */
export function Button({ href, children, variant = "primary", className = "", type = "button", disabled, external, icon = "arrow-right" }: Props) {
  const cls = `group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-[clamp(14px,4vw,20px)] text-[15px] font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <Icon name={icon} className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </>
  );
  if (href && external) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>;
  if (href?.startsWith("#")) return <a href={href} className={cls}>{inner}</a>;
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type={type} disabled={disabled} className={cls}>{inner}</button>;
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex min-h-11 items-center gap-2 text-[16px] font-medium ${className}`}>
      <span className="underline decoration-current/30 underline-offset-[6px] transition-colors group-hover:decoration-current">{children}</span>
      <Icon name="arrow-right" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
