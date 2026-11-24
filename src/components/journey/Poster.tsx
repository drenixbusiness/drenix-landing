import { ArtPicture } from "@/components/ui/ArtPicture";

/** Still frame of the 3D campus: on screen instantly, then the live scene fades in over it. */
export function Poster() {
  return (
    <ArtPicture
      priority
      wide="/media/campus-poster.webp"
      tall="/media/campus-poster-portrait.webp"
      alt="The DRENIX tower with its fountain court and gardens below a mountain"
    />
  );
}
