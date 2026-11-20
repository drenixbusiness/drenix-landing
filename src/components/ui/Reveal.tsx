"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ElementType } from "react";

type Props = HTMLMotionProps<"div"> & { delay?: number; y?: number };

/** Ko‘rinishga kirganda yumshoq paydo bo‘lish. */
export function Reveal({ delay = 0, y = 24, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Sarlavha qatorlari pastdan ko‘tariladi. `|` — yangi qator. */
export function Lines({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const lines = text.split("|");
  const trigger = immediate
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "-8% 0px" } };

  return (
    <Tag className={className} aria-label={lines.join(" ")}>
      <motion.span className="block" initial="hidden" {...trigger} aria-hidden>
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="block"
              variants={{
                hidden: { y: "105%" },
                show: { y: "0%", transition: { duration: 1, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
