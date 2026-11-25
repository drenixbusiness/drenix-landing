import * as THREE from "three";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ZoneId } from "@/lib/departments";
import type { Quality } from "./quality";
import { drawScreens } from "./screens";
import { along, clamp01, damp, disposeTree, lerp, loadReflections, pickTriangles, type Box } from "./util";

/**
 * The office inside a floor, as an architect's model.
 * 20 units wide, floor at y = 0, centred; the long side runs along x.
 *
 * Walls grow out of the plate, the white model fills with colour, and one room at a time
 * is lifted out of the plan like a tile (cut with clipping planes, so nothing is duplicated on disk).
 */

type Zone = {
  id: ZoneId;
  /** Cut lines of the room in plan; they run along the outside faces of its walls. */
  box: [x0: number, x1: number, z0: number, z1: number];
  /** Label anchor in plan. */
  at: [x: number, z: number];
  /** Direction the room is seen from. */
  yaw: number;
  pitch: number;
};

/** Order follows the life of a project: brief, plan, research, make, test, deliver. */
export const ZONES: Zone[] = [
  { id: "lounge", box: [-10.3, -4.27, -6.3, -0.17], at: [-6.6, -3], yaw: -30, pitch: 42 },
  { id: "meeting", box: [-8.75, -3.91, -0.35, 4.3], at: [-6.2, 2.1], yaw: 26, pitch: 44 },
  { id: "focus", box: [-4.26, 0.61, -0.4, 6.3], at: [-1.7, 2.1], yaw: 30, pitch: 44 },
  { id: "west", box: [-4.37, 1.45, -6.3, -0.4], at: [-1.4, -3.2], yaw: 24, pitch: 44 },
  { id: "east", box: [1.45, 7.3, -6.3, -1.1], at: [4.4, -3.6], yaw: 20, pitch: 44 },
  { id: "lead", box: [4.27, 10.3, -1.34, 5.4], at: [7, 1.9], yaw: 34, pitch: 44 },
];

/** Whole plan, as a box to frame. */
export const PLAN: Box = { x0: -10.4, x1: 10.4, y0: -0.4, y1: 3.2, z0: -6.4, z1: 6.4 };

export const zoneBox = (i: number): Box => {
  const [x0, x1, z0, z1] = ZONES[i].box;
  return { x0: Math.max(x0, -10.2), x1: Math.min(x1, 10.2), y0: LIFT - 0.4, y1: LIFT + 2.3, z0: Math.max(z0, -6.2), z1: Math.min(z1, 6.2) };
};

/** How high the room in focus rises, and what is left of the height of the others. */
export const LIFT = 2.1;
const SINK = 0.2;
/** Cutaway of the room in focus: near walls are cut at this height, far walls stay. */
const CUT_NEAR = 0.55;
const CUT_FAR = 5.9;

/**
 * Clipping of the room in focus: four sides of the box, hard, then the slanted section, antialiased.
 * The sides run along wall faces, where a soft edge would draw hairlines.
 */
const SECTION_CLIP = `
#if NUM_CLIPPING_PLANES > 4
  for (int i = 0; i < 4; i++) if (dot(vClipPosition, clippingPlanes[i].xyz) > clippingPlanes[i].w) discard;
  float sd = clippingPlanes[4].w - dot(vClipPosition, clippingPlanes[4].xyz);
  float sg = fwidth(sd) * 0.5;
  diffuseColor.a *= smoothstep(-sg, sg, sd);
  if (diffuseColor.a <= 0.0) discard;
#endif
`;

type Uni = {
  uTint: { value: number };
  uMaq: { value: THREE.Color };
};

/** A mesh of the room in focus: lit front faces, and the cut colour on the inside of the walls. */
type Part = {
  front: THREE.Mesh;
  inner: THREE.Mesh | null;
  whole: THREE.BufferGeometry;
  /** Vertices in plan: x and z. */
  xz: [Float32Array, Float32Array] | null;
  /** Only the triangles of one room, made when needed. */
  rooms: (THREE.BufferGeometry | undefined)[];
};

export type OfficeState = {
  /** Base plate fading in over the deck of the floor, 0..1. */
  plate?: number;
  /** Shadow on the ground around the model, 0..1. */
  ground?: number;
  /** Use the lift value as it is, without smoothing. */
  direct?: boolean;
  /** Walls rising out of the plate, 0..1. */
  grow: number;
  /** White model (0) to full colour (1). */
  tint: number;
  /** Room in focus, or -1. */
  zone: number;
  /** How far that room is lifted, 0..1. */
  lift: number;
};

export class Office {
  readonly scene = new THREE.Scene();
  loaded = false;
  /** Set when something that casts shadows moved. */
  shadowDirty = true;
  private main = new THREE.Group();
  private room = new THREE.Group();
  private grow = new THREE.Group();
  private roomGrow = new THREE.Group();
  private sun: THREE.DirectionalLight;
  private env: THREE.Texture | null = null;
  private maq = new THREE.Color(0xdedad3);
  private uMain: Uni = { uTint: { value: 0 }, uMaq: { value: this.maq } };
  private uRoom: Uni = { uTint: { value: 1 }, uMaq: { value: this.maq } };
  private inside = [0, 1, 2, 3].map(() => new THREE.Plane());
  /** Slanted section through the room in focus. */
  private section = new THREE.Plane();
  private outside = [0, 1, 2, 3].map(() => new THREE.Plane());
  private mats: THREE.Material[] = [];
  private parts: Part[] = [];
  private prep: ReturnType<typeof setTimeout> | undefined;
  private screens: THREE.MeshBasicMaterial[] = [];
  private screenTex: THREE.CanvasTexture;
  private screenCanvas: HTMLCanvasElement;
  private tile: THREE.Mesh;
  private plinth: THREE.Mesh;
  private ground: THREE.Mesh;
  private boxFor = -2;
  private cutOn = true;
  private sectionBase = 0;
  private sectionLen = 1;
  private liftS = 0;
  private last = { grow: -1, lift: -1, zone: -2 };
  private disposed = false;

  constructor(q: Quality, department: number) {
    // The picture of the studio light holds a quarter of its brightness
    this.scene.environmentIntensity = 0.42 * 4;

    this.sun = new THREE.DirectionalLight(0xfff1e0, 2.7);
    this.sun.position.set(-11, 22, 13);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.setScalar(q.high ? 2048 : 1024);
    const c = this.sun.shadow.camera;
    c.left = -13.5; c.right = 13.5; c.top = 12; c.bottom = -12; c.near = 1; c.far = 60;
    c.updateProjectionMatrix();
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.035;
    this.sun.shadow.radius = 3;
    this.scene.add(this.sun);
    this.scene.add(new THREE.HemisphereLight(0xfffaf3, 0xb5aca0, 0.75));

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.ShadowMaterial({ opacity: 0.16 }));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.5;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    const plate = new THREE.MeshLambertMaterial({ color: 0xf1eee9, transparent: true, clippingPlanes: this.outside, clipIntersection: true });
    this.plinth = new THREE.Mesh(new THREE.BoxGeometry(20.8, 0.5, 12.9), plate);
    this.plinth.position.y = -0.25;
    this.plinth.receiveShadow = true;
    this.scene.add(this.plinth);
    this.tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.42, 1), new THREE.MeshLambertMaterial({ color: 0xf1eee9 }));
    this.tile.castShadow = true;
    this.room.add(this.tile);

    this.main.add(this.grow);
    this.room.add(this.roomGrow);
    this.room.visible = false;
    this.scene.add(this.main, this.room);

    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 640;
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTex.colorSpace = THREE.SRGBColorSpace;
    this.screenTex.flipY = false;
    this.screenTex.anisotropy = 4;
    this.setDepartment(department);
    this.setCut(false);
  }

  setDepartment(i: number) {
    drawScreens(this.screenCanvas, i);
    this.screenTex.needsUpdate = true;
  }

  async load(loader: GLTFLoader) {
    const env = loadReflections("/hdri/env-studio.webp", 64).catch(() => null);
    const gltf = await loader.loadAsync("/models/office-hq.glb");
    this.env = await env;
    if (this.disposed) {
      this.env?.dispose();
      return;
    }
    this.scene.environment = this.env;
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const src = m.material as THREE.MeshStandardMaterial;
      const name = src.name;
      const make = (u: Uni, planes: THREE.Plane[], hide: boolean) => {
        const mesh = new THREE.Mesh(m.geometry, this.material(src, u));
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m.matrixWorld);
        const mat = mesh.material as THREE.Material;
        mat.clippingPlanes = planes;
        mat.clipIntersection = hide;
        mat.clipShadows = true;
        mesh.castShadow = name !== "glass" && name !== "screen" && name !== "logo";
        mesh.receiveShadow = name !== "screen";
        if (name === "glass" || name === "logo") mesh.renderOrder = 2;
        this.mats.push(mat);
        return mesh;
      };
      m.updateWorldMatrix(true, false);
      this.grow.add(make(this.uMain, this.outside, true));
      const planes = [...this.inside, this.section];
      const front = make(this.uRoom, planes, false);
      this.roomGrow.add(front);
      let inner: THREE.Mesh | null = null;
      if (name !== "glass" && name !== "screen" && name !== "logo") {
        const mat = front.material as THREE.Material;
        mat.side = THREE.FrontSide;
        mat.shadowSide = THREE.DoubleSide;
        inner = new THREE.Mesh(m.geometry, this.cutMaterial(planes));
        inner.matrixAutoUpdate = false;
        inner.matrix.copy(m.matrixWorld);
        this.roomGrow.add(inner);
      }
      this.parts.push({ front, inner, whole: m.geometry, xz: null, rooms: [] });
    });
    this.loaded = true;
    this.shadowDirty = true;
    this.prepare(0);
  }

  /** Solid colour inside cut walls. Slightly nearer than it is, so it wins over the faces of walls that touch. */
  private cutMaterial(planes: THREE.Plane[]) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xec6a26, side: THREE.BackSide, clippingPlanes: planes, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: -10 });
    mat.alphaToCoverage = true;
    mat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace("#include <clipping_planes_fragment>", SECTION_CLIP);
    };
    mat.customProgramCacheKey = () => "office-cut";
    this.mats.push(mat);
    return mat;
  }

  /** Prepares the rooms in small pieces while nothing else happens. */
  private prepare(step: number) {
    const n = this.parts.length;
    if (step >= (ZONES.length + 1) * n) return;
    this.prep = setTimeout(() => {
      if (this.disposed) return;
      const p = this.parts[step % n], zone = Math.floor(step / n) - 1;
      if (zone < 0) this.planOf(p);
      else p.rooms[zone] ??= this.roomGeometry(p, zone);
      this.prepare(step + 1);
    }, 24);
  }

  private planOf(p: Part) {
    return (p.xz ??= [along(p.whole, p.front.matrix, 0), along(p.whole, p.front.matrix, 2)]);
  }

  private roomGeometry(p: Part, zone: number) {
    const [x0, x1, z0, z1] = ZONES[zone].box;
    const [xs, zs] = this.planOf(p);
    const beyond = new Uint8Array(xs.length);
    for (let k = 0; k < xs.length; k++) {
      const x = xs[k], z = zs[k];
      beyond[k] = (x < x0 ? 1 : 0) | (x > x1 ? 2 : 0) | (z < z0 ? 4 : 0) | (z > z1 ? 8 : 0);
    }
    return pickTriangles(p.whole, beyond);
  }

  private material(src: THREE.MeshStandardMaterial, u: Uni): THREE.Material {
    if (src.name === "screen") {
      const mat = new THREE.MeshBasicMaterial({ name: "screen", map: this.screenTex, toneMapped: false });
      this.patch(mat, u);
      this.screens.push(mat);
      return mat;
    }
    if (src.name === "glass") {
      const mat = new THREE.MeshStandardMaterial({ name: "glass", vertexColors: true, transparent: true, roughness: 0.08, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false, forceSinglePass: true });
      this.patch(mat, u);
      return mat;
    }
    if (src.name === "satin") {
      const mat = new THREE.MeshStandardMaterial({ name: "satin", vertexColors: true, roughness: 0.45, metalness: 0.1, side: THREE.DoubleSide });
      this.patch(mat, u);
      return mat;
    }
    const mat = new THREE.MeshLambertMaterial({ name: src.name, color: src.color, map: src.map, vertexColors: src.vertexColors, side: src.name === "logo" ? THREE.FrontSide : THREE.DoubleSide, transparent: src.name === "logo" });
    if (mat.map) mat.map.anisotropy = 4;
    this.patch(mat, u);
    return mat;
  }

  /** White-model tint, and a smooth edge along the section. */
  private patch(mat: THREE.Material, u: Uni) {
    const room = u === this.uRoom && !mat.transparent;
    mat.alphaToCoverage = room;
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uTint;\nuniform vec3 uMaq;")
        .replace("#include <color_fragment>", `#include <color_fragment>
          {
            float lum = dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15));
            diffuseColor.rgb = mix(uMaq * (0.82 + 0.2 * sqrt(lum)), diffuseColor.rgb, uTint);
          }`);
      if (room) sh.fragmentShader = sh.fragmentShader.replace("#include <clipping_planes_fragment>", SECTION_CLIP);
    };
    mat.customProgramCacheKey = () => `office-${room ? 1 : 0}`;
  }

  private setBox(zone: number) {
    const z = ZONES[zone];
    if (!z) return;
    const [x0, x1, z0, z1] = z.box;
    const set = (i: number, nx: number, nz: number, c: number) => {
      this.inside[i].normal.set(nx, 0, nz);
      this.inside[i].constant = c;
      this.outside[i].normal.set(-nx, 0, -nz);
      this.outside[i].constant = -c;
    };
    set(0, 1, 0, -x0);
    set(1, -1, 0, x1);
    set(2, 0, 1, -z0);
    set(3, 0, -1, z1);
    // Slanted section: low towards the viewer, full height at the back
    const yaw = THREE.MathUtils.degToRad(z.yaw);
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    const near = Math.max(x0 * dx, x1 * dx) + Math.max(z0 * dz, z1 * dz);
    const far = Math.min(x0 * dx, x1 * dx) + Math.min(z0 * dz, z1 * dz);
    const k = (CUT_FAR - CUT_NEAR) / (near - far);
    const len = Math.hypot(k * dx, 1, k * dz);
    this.section.normal.set((-k * dx) / len, -1 / len, (-k * dz) / len);
    this.sectionBase = (CUT_NEAR + k * near) / len;
    this.sectionLen = len;
    if (zone !== this.boxFor) {
      this.boxFor = zone;
      const cx0 = Math.max(x0, -10.4), cx1 = Math.min(x1, 10.4), cz0 = Math.max(z0, -6.45), cz1 = Math.min(z1, 6.45);
      this.tile.scale.set(cx1 - cx0 - 0.04, 1, cz1 - cz0 - 0.04);
      this.tile.position.set((cx0 + cx1) / 2, -0.21, (cz0 + cz1) / 2);
      for (const p of this.parts) {
        const g = (p.rooms[zone] ??= this.roomGeometry(p, zone));
        p.front.geometry = g;
        if (p.inner) p.inner.geometry = g;
      }
    }
  }

  /** Without a room in focus the planes are moved away, so nothing is cut and no shader has to change. */
  private setCut(on: boolean) {
    if (on === this.cutOn) return;
    this.cutOn = on;
    if (!on) {
      this.outside.forEach((p) => {
        p.normal.set(1, 0, 0);
        p.constant = 1e5;
      });
    }
  }

  /** Draws the parts one by one into a single pixel, so the first real frame has nothing left to prepare. */
  warmSteps(): (() => void)[] {
    const all = [...this.grow.children, ...this.roomGrow.children];
    const show = (only: THREE.Object3D | null) => {
      for (const o of all) o.visible = !only || o === only;
    };
    return [
      () => {
        this.update(0, { grow: 1, tint: 1, zone: 0, lift: 0.5, direct: true });
        show(all[0]);
      },
      ...all.slice(1).map((o) => () => show(o)),
      () => show(null),
      () => {
        this.update(0, { grow: 0, tint: 0, zone: -1, lift: 0, direct: true });
        this.shadowDirty = true;
      },
    ];
  }

  update(dt: number, s: OfficeState) {
    if (!this.loaded) return;
    this.liftS = s.direct ? s.lift : damp(this.liftS, s.lift, 14, dt);
    if (Math.abs(this.liftS - s.lift) < 0.001) this.liftS = s.lift;
    const plate = s.plate ?? 1;
    const pm = this.plinth.material as THREE.MeshLambertMaterial;
    pm.opacity = plate;
    this.plinth.visible = plate > 0.01;
    const ground = s.ground ?? 1;
    (this.ground.material as THREE.ShadowMaterial).opacity = 0.16 * ground;
    this.ground.visible = ground > 0.01;
    const g = 0.015 + 0.985 * s.grow;
    const active = s.zone >= 0 && this.liftS > 0.002;
    // Everything else sinks into a low white relief
    this.grow.scale.y = g * lerp(1, SINK, clamp01(this.liftS * 1.15));
    this.roomGrow.scale.y = g;
    this.room.visible = active;
    const up = this.liftS * LIFT;
    this.room.position.y = up;
    this.setCut(active);
    if (active) {
      this.setBox(s.zone);
      // The section opens as the room rises
      const open = clamp01(this.liftS * 1.5 - 0.15);
      this.section.constant = this.sectionBase + (up + (1 - open) * 4.6) / this.sectionLen;
    }
    this.uMain.uTint.value = s.tint * (1 - 0.9 * Math.min(1, this.liftS * 1.4));
    this.uRoom.uTint.value = s.tint;
    if (s.grow !== this.last.grow || this.liftS !== this.last.lift || s.zone !== this.last.zone) {
      this.shadowDirty = true;
      this.last = { grow: s.grow, lift: this.liftS, zone: s.zone };
    }
  }

  /** Room under a ray (floor plane), or -1. */
  pick(ray: THREE.Ray) {
    if (Math.abs(ray.direction.y) < 1e-4) return -1;
    const t = (0.6 - ray.origin.y) / ray.direction.y;
    if (t < 0) return -1;
    const x = ray.origin.x + ray.direction.x * t, z = ray.origin.z + ray.direction.z * t;
    return ZONES.findIndex(({ box }) => x > box[0] && x < box[1] && z > box[2] && z < box[3]);
  }

  dispose() {
    this.disposed = true;
    clearTimeout(this.prep);
    for (const p of this.parts) [p.whole, ...p.rooms].forEach((g) => g?.dispose());
    this.env?.dispose();
    this.screenTex.dispose();
    this.sun.shadow.map?.dispose();
    this.mats.forEach((m) => m.dispose());
    disposeTree(this.scene);
  }
}

