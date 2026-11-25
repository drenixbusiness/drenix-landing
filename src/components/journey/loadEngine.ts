import { canRender3D } from "@/lib/perf";

/**
 * The 3D engine, in its own JavaScript file. A software renderer would stutter: then it is not even downloaded,
 * and the pictures take over.
 */
export async function loadEngine() {
  if (!canRender3D()) throw new Error("WebGL 2 is not available");
  const engine = await import("./scene/engine");
  // Reading the file took a while on a phone: let it draw a frame before the scene is built
  await new Promise<void>((ok) => requestAnimationFrame(() => setTimeout(ok)));
  return engine;
}
