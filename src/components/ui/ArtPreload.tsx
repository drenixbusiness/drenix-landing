"use client";

import { preload } from "react-dom";

/**
 * Asks for the right file of a picture early: getImageProps does not emit preload hints.
 * A client component, because hints from server components also fire when a link to the page is prefetched,
 * and the picture would be downloaded without being shown.
 */
export function ArtPreload({ src, set, media }: { src: string; set?: string; media: string }) {
  preload(src, { as: "image", imageSrcSet: set, imageSizes: "100vw", media, fetchPriority: "high" });
  return null;
}
