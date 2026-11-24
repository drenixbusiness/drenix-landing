"use client";

import { getImageProps } from "next/image";
import { preload } from "react-dom";

/** Where portrait framing takes over. The 3D engine switches at the same ratio. */
const TALL_MEDIA = "(max-aspect-ratio: 17/20)";
const WIDE_MEDIA = "(min-aspect-ratio: 17/20)";

type Props = { wide: string; tall: string; alt?: string; priority?: boolean; className?: string };

/** Full-bleed picture with its own framing for portrait screens. Fills the nearest positioned parent. */
export function ArtPicture({ wide, tall, alt = "", priority = false, className = "" }: Props) {
  const w = getImageProps({ src: wide, alt, fill: true, sizes: "100vw", quality: 75, loading: priority ? "eager" : "lazy" }).props;
  const t = getImageProps({ src: tall, alt, fill: true, sizes: "100vw", quality: 70 }).props;
  if (priority) {
    // getImageProps does not emit preload hints, so ask for the right file early ourselves.
    // This has to be a client component: hints from server components also fire when a link to
    // the page is prefetched, and the picture would be downloaded without being shown.
    preload(w.src, { as: "image", imageSrcSet: w.srcSet, imageSizes: w.sizes, media: WIDE_MEDIA, fetchPriority: "high" });
    preload(t.src, { as: "image", imageSrcSet: t.srcSet, imageSizes: t.sizes, media: TALL_MEDIA, fetchPriority: "high" });
  }
  return (
    <picture>
      <source media={TALL_MEDIA} srcSet={t.srcSet} sizes={t.sizes} />
      <img {...w} alt={alt} fetchPriority={priority ? "high" : undefined} className={`object-cover ${className}`} />
    </picture>
  );
}
