import type { CSSProperties, ElementType, HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number };

/** Appears softly when it enters the screen. Pure CSS: RevealObserver only marks the element. */
export function Reveal({ delay = 0, y, className = "", style, ...rest }: Props) {
  const vars = { ...(delay ? { "--d": `${delay}s` } : null), ...(y !== undefined ? { "--y": `${y}px` } : null) };
  // The observer may mark the element before React reaches it
  return <div className={`reveal ${className}`} style={{ ...style, ...vars } as CSSProperties} suppressHydrationWarning {...rest} />;
}

/** Title whose lines rise one after another. `|` starts a new line. */
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
  /** Above the fold: starts with the first paint instead of waiting for the observer. */
  immediate?: boolean;
}) {
  const lines = text.split("|");
  return (
    <Tag className={className} aria-label={lines.join(" ")}>
      <span className={immediate ? "block" : "lines block"} style={delay && !immediate ? ({ "--d": `${delay}s` } as CSSProperties) : undefined} suppressHydrationWarning aria-hidden>
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.06em]">
            {immediate ? (
              <span className="hero-rise block" style={{ animationDelay: `${delay + i * 0.08}s` }}>{line}</span>
            ) : (
              <span className="block" style={{ "--i": i } as CSSProperties}>{line}</span>
            )}
          </span>
        ))}
      </span>
    </Tag>
  );
}
