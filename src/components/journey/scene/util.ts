import * as THREE from "three";
import { lerp } from "./math";

export * from "./math";

/** Orbit camera pose: where to look, from which direction and how far. Angles in degrees. */
export type Pose = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  dist: number;
  fov: number;
  /** Lens shift (fraction of half the frame): moves the picture without bending verticals. */
  sx: number;
  sy: number;
};

export const pose = (p: Partial<Pose> & Pick<Pose, "x" | "y" | "z" | "yaw" | "pitch" | "dist">): Pose => ({ fov: 30, sx: 0, sy: 0, ...p });

export function mixPose(a: Pose, b: Pose, t: number, out: Pose) {
  out.x = lerp(a.x, b.x, t);
  out.y = lerp(a.y, b.y, t);
  out.z = lerp(a.z, b.z, t);
  out.yaw = lerp(a.yaw, b.yaw, t);
  out.pitch = lerp(a.pitch, b.pitch, t);
  // Distances are mixed geometrically, so zooming feels even
  out.dist = Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), t));
  out.fov = lerp(a.fov, b.fov, t);
  out.sx = lerp(a.sx, b.sx, t);
  out.sy = lerp(a.sy, b.sy, t);
  return out;
}

export const clonePose = (p: Pose): Pose => ({ ...p });

const target = new THREE.Vector3();

/** Places a perspective camera at a pose, including lens shift. */
export function applyPose(camera: THREE.PerspectiveCamera, p: Pose, aspect: number) {
  const yaw = THREE.MathUtils.degToRad(p.yaw);
  const pitch = THREE.MathUtils.degToRad(p.pitch);
  target.set(p.x, p.y, p.z);
  camera.position.set(
    p.x + Math.sin(yaw) * Math.cos(pitch) * p.dist,
    p.y + Math.sin(pitch) * p.dist,
    p.z + Math.cos(yaw) * Math.cos(pitch) * p.dist,
  );
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  camera.fov = p.fov;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  if (p.sx || p.sy) {
    camera.projectionMatrix.elements[8] += p.sx;
    camera.projectionMatrix.elements[9] += p.sy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }
  camera.updateMatrixWorld();
}

/** Convex hull of points in the plane (monotone chain). */
export function hull2(pts: [number, number][]) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [], up: [number, number][] = [];
  for (const q of pts) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const q = pts[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** Safari before 17 ignores the options of createImageBitmap. */
function canDecodeOffThread() {
  if (typeof createImageBitmap !== "function") return false;
  const ua = navigator.userAgent;
  return !/^((?!chrome|android).)*safari/i.test(ua) || Number(/Version\/(\d+)/.exec(ua)?.[1] ?? 0) >= 17;
}

/** Loads a texture without blocking the page: decoding happens in the background. */
export async function loadTexture(url: string): Promise<THREE.Texture> {
  if (!canDecodeOffThread()) return new THREE.TextureLoader().loadAsync(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const image = await createImageBitmap(await res.blob(), { imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });
  const t = new THREE.Texture(image);
  t.flipY = false;
  t.needsUpdate = true;
  // Once it is on the GPU, the decoded copy only takes memory
  t.onUpdate = () => {
    t.onUpdate = null;
    image.close();
  };
  return t;
}

/** Lets the browser draw a frame and answer the visitor between two pieces of work. */
export const nextFrame = () => new Promise<void>((ok) => requestAnimationFrame(() => ok()));

/** Runs a list of small jobs a few milliseconds at a time. Stops when `alive` says so. */
export async function inSlices<T>(list: T[], job: (item: T) => void, alive: () => boolean, budget = 6) {
  let t0 = performance.now();
  for (const item of list) {
    if (!alive()) return;
    job(item);
    if (performance.now() - t0 > budget) {
      await nextFrame();
      t0 = performance.now();
    }
  }
}

/**
 * Reflections prepared in advance (the PMREM of three.js, saved as a picture): the six faces of a cube from left to
 * right, from mirror to rough from top to bottom. Making them on a phone means a long pause at the start.
 */
export async function loadReflections(url: string, size: number) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const sheet = await createImageBitmap(await res.blob());
  const levels: ImageBitmap[][] = [];
  for (let s = size, y = 0; s >= 4; y += s, s /= 2) {
    levels.push(await Promise.all([0, 1, 2, 3, 4, 5].map((f) => createImageBitmap(sheet, f * s, y, s, s))));
  }
  sheet.close();
  const t = new THREE.CubeTexture(levels[0]);
  // three.js counts the levels after the first one, so there is a spare one at the end
  t.mipmaps = levels.slice(1).map((image, i) => ({ image, width: size >> i })) as unknown as THREE.CubeTexture[];
  t.isPMREMTexture = true;
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
  t.onUpdate = () => {
    t.onUpdate = null;
    levels.flat().forEach((b) => b.close());
  };
  return t;
}

/** Position of every vertex along one world axis (0 x, 1 y, 2 z). */
export function along(g: THREE.BufferGeometry, m: THREE.Matrix4, axis: 0 | 1 | 2) {
  const pos = g.getAttribute("position"), e = m.elements, n = pos.count;
  const a = e[axis], b = e[axis + 4], c = e[axis + 8], d = e[axis + 12];
  const out = new Float32Array(n);
  const raw = pos.array;
  // Plain numbers, as the Draco decoder leaves them: no need to go through the accessors
  if (raw instanceof Float32Array && raw.length === n * 3) for (let k = 0, i = 0; k < n; k++, i += 3) out[k] = a * raw[i] + b * raw[i + 1] + c * raw[i + 2] + d;
  else for (let k = 0; k < n; k++) out[k] = a * pos.getX(k) + b * pos.getY(k) + c * pos.getZ(k) + d;
  return out;
}

/**
 * Triangles that reach into a range, as a new geometry that shares the vertices of the old one.
 * `beyond` has, for every vertex, one bit for each side of the range it lies beyond.
 */
export function pickTriangles(whole: THREE.BufferGeometry, beyond: Uint8Array) {
  const n = beyond.length;
  const src = whole.index ? (whole.index.array as Uint16Array | Uint32Array) : null;
  const total = src ? src.length : n;
  const out = n > 65535 ? new Uint32Array(total) : new Uint16Array(total);
  let c = 0;
  if (src) {
    for (let k = 0; k < total; k += 3) {
      const a = src[k], b = src[k + 1], d = src[k + 2];
      if (beyond[a] & beyond[b] & beyond[d]) continue;
      out[c++] = a;
      out[c++] = b;
      out[c++] = d;
    }
  } else {
    for (let k = 0; k < total; k += 3) {
      if (beyond[k] & beyond[k + 1] & beyond[k + 2]) continue;
      out[c++] = k;
      out[c++] = k + 1;
      out[c++] = k + 2;
    }
  }
  const g = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(whole.attributes)) g.setAttribute(name, attr);
  g.setIndex(new THREE.BufferAttribute(out.slice(0, c), 1));
  g.boundingSphere = whole.boundingSphere;
  g.boundingBox = whole.boundingBox;
  return g;
}

export const asArray = (m: THREE.Material | THREE.Material[]) => (Array.isArray(m) ? m : [m]);

/** Frees geometries, materials and textures of a whole subtree. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    if (!m.material) return;
    for (const mat of asArray(m.material)) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}

/** Free part of the frame, in CSS pixels left for panels around it. */
export type Insets = { left: number; right: number; top: number; bottom: number };

export type Box = { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };

const r3 = new THREE.Vector3(), u3 = new THREE.Vector3(), f3 = new THREE.Vector3(), d3 = new THREE.Vector3();

/** Pose that frames a box inside the free part of a w × h viewport. */
export function fitPose(b: Box, view: { yaw: number; pitch: number; fov: number }, w: number, h: number, inset: Insets, tight = 1): Pose {
  const yaw = THREE.MathUtils.degToRad(view.yaw), pitch = THREE.MathUtils.degToRad(view.pitch);
  f3.set(-Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  r3.set(Math.cos(yaw), 0, -Math.sin(yaw));
  u3.crossVectors(r3, f3);
  const c = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, z: (b.z0 + b.z1) / 2 };
  const t = Math.tan(THREE.MathUtils.degToRad(view.fov) / 2);
  const ax = Math.max(0.2, 1 - (inset.left + inset.right) / w) * tight;
  const ay = Math.max(0.2, 1 - (inset.top + inset.bottom) / h) * tight;
  let dist = 1;
  for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) {
    d3.set(x - c.x, y - c.y, z - c.z);
    const f = d3.dot(f3);
    dist = Math.max(dist, Math.abs(d3.dot(r3)) / (ax * t * (w / h)) - f, Math.abs(d3.dot(u3)) / (ay * t) - f);
  }
  return {
    ...c, yaw: view.yaw, pitch: view.pitch, dist, fov: view.fov,
    sx: -(inset.left - inset.right) / w,
    sy: (inset.top - inset.bottom) / h,
  };
}
