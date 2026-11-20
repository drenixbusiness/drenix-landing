import type { ReactNode } from "react";
import { Lines, Reveal } from "./Reveal";

/** Section heading: wide geometric title, optional text and link. */
export function SectionHead({
  title,
  text,
  action,
  className = "",
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-8 lg:grid-cols-12 lg:items-end ${className}`}>
      <div className="lg:col-span-7">
        <Lines text={title} className="wide text-[6.2vw] sm:text-[34px] lg:text-[42px] xl:text-[46px]" />
      </div>
      {(text || action) && (
        <Reveal delay={0.15} className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9">
          {text && <p className="text-[15px] leading-relaxed opacity-70">{text}</p>}
          {action}
        </Reveal>
      )}
    </div>
  );
}
