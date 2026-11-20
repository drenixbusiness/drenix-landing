import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "light" | "dark" | "outline" | "ember";

const variants: Record<Variant, string> = {
  primary: "bg-graphite text-white hover:bg-ember",
  dark: "bg-graphite text-white hover:bg-ember",
  ember: "bg-ember text-white hover:bg-graphite",
  light: "bg-white text-graphite hover:bg-white/85",
  outline: "border border-current/30 hover:border-current/70",
};

type Props = {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
};

/** AURUM uslubidagi pill tugma: mayda keng harflar va strelka. */
export function Button({ href, children, variant = "primary", className = "", type = "button", disabled, external }: Props) {
  const cls = `label group inline-flex h-11 items-center gap-3 rounded-full px-5 transition-colors duration-300 disabled:opacity-60 ${variants[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
    </>
  );
  if (href && external) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>;
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type={type} disabled={disabled} className={cls}>{inner}</button>;
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`label group inline-flex items-center gap-2 ${className}`}>
      <span className="border-b border-current/30 pb-1 transition-colors group-hover:border-current">{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  );
}
