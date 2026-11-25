import * as THREE from "three";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Quality } from "./quality";
import { along, clamp01, damp, disposeTree, hull2, lerp, loadReflections, loadTexture, nextFrame, pickTriangles } from "./util";

/**
 * The campus: headquarters tower, fountain court and gardens on a meadow.
 * One unit is one metre. The front of the tower faces +z.
 *
 * A floor is a horizontal band of the facade. Hovering slides it out a little; scrolling pulls it
 * out like a drawer. The band is cut with clipping planes: the building hides it, a copy shows only it.
 */

/** Height range of the ten department floors on the facade. */
export const BAND_FROM = 34.4;
export const BAND_TO = 100;
/** Tower footprint (facade only), used for picking and for the drawer. */
export const TOWER = { x0: -26.2, x1: 26.2, z0: -55.6, z1: -21.6 };
const CENTER = new THREE.Vector3((TOWER.x0 + TOWER.x1) / 2, 0, (TOWER.z0 + TOWER.z1) / 2);

/** How far a hovered floor slides out close by, and how far the open drawer travels (metres). */
const POP = 5.2;
export const DRAWER = 41;
/** The same from the court. Seen from below, the top floor must not hide the sign above it. */
const POP_FAR = 3.2;
const POP_FAR_TOP = 1.3;

const PANO_ROT = Math.PI + 1.45;
/** Height the panorama was "shot" from, in scene metres. Controls the scale of the ground. */
const CAPTURE_H = 11;
const GROUND_Y = -1.5;
/** Radius of the opaque part of the lawn around the plinth. */
const MEADOW = 320;

/** Radius of the sky, and the part of the panorama the camera can see: cut out of the 8K original, sharp and small. */
const SKY = 1500;
const VIEW = {
  wide: { file: "/hdri/view-wide.webp", u0: 0.755, u1: 1.07 },
  tall: { file: "/hdri/view-tall.webp", u0: 0.835, u1: 1 },
};
const steps = (from: number, to: number, n: number) => Array.from({ length: n }, (_, i) => from + ((to - from) * i) / n);
/** Rows of the dome, in degrees from the zenith: close together around the horizon, where the flat ground bends up. */
const HORIZON = [90, 90.15, 90.3, 90.45, 90.63, 90.8, 91, 91.3, 91.7, 92.3, 93];
const SKY_ROWS = [...steps(0, 90, 12), ...HORIZON, 95, 98, 103, 110, 120, 140, 180];
const VIEW_ROWS = [...steps(50, 90, 16), ...HORIZON];

/** Rough or self-lit surfaces do not need physically based shading: Lambert looks the same and costs far less. */
const MATTE = /^(matte|foliage|lawn|hedge|gravel|travertine|sandstone|basalt|temp|Trimsheet|stream|glow|material_0|Interior|Emmsive)$/;

/** Part of a sky dome with a flat ground. The same shape as GroundedSkybox of three.js, with fewer triangles. */
function dome(u0: number, u1: number, rows: number[], columns: number) {
  const n = columns + 1, first = rows[0], span = rows[rows.length - 1] - first;
  const pos = new Float32Array(rows.length * n * 3), uv = new Float32Array(rows.length * n * 2);
  const index: number[] = [];
  const y1 = -CAPTURE_H * 1.5;
  let k = 0;
  rows.forEach((deg, r) => {
    const theta = THREE.MathUtils.degToRad(deg);
    const y = SKY * Math.cos(theta);
    const f = y >= 0 ? 1 : y < y1 ? -CAPTURE_H / y : 1 - (y * y) / (3 * y1 * y1);
    for (let c = 0; c < n; c++, k++) {
      const phi = (u0 + ((u1 - u0) * c) / columns) * Math.PI * 2;
      pos[k * 3] = -SKY * Math.cos(phi) * Math.sin(theta) * f;
      pos[k * 3 + 1] = y * f;
      pos[k * 3 + 2] = -SKY * Math.sin(phi) * Math.sin(theta) * f;
      uv[k * 2] = c / columns;
      uv[k * 2 + 1] = 1 - (deg - first) / span;
      if (r && c) index.push(k - n, k - n - 1, k, k - n - 1, k - 1, k);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(index);
  return g;
}

/** Fog this deep is the same at every distance, so it works as a plain fade. */
const FOG_SPAN = 1e7;

type Uniforms = { uTime: { value: number } };

/** All values 0..1. */
export type ExteriorState = {
  /** From the court (0) to right in front of the floors (1). */
  near: number;
  /** How far the selected floor is pulled out. */
  drawer: number;
  /** How much of its facade is lowered. */
  open: number;
  /** The last low wall around it disappears. */
  gone: number;
};

export class Exterior {
  readonly scene = new THREE.Scene();
  loaded = false;
  /** How far the selected floor is out right now, in metres. */
  slide = 0;
  private active = 0;
  private lastActive = 0;
  private bandY = 0;
  private pop = 0;
  private popV = 0;
  private reach = POP_FAR_TOP;
  private sun: THREE.DirectionalLight;
  private fog: THREE.Fog;
  private sky: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> | null = null;
  private view: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> | null = null;
  private viewKind: "" | "wide" | "tall" = "";
  private env: THREE.Texture | null = null;
  private uniforms: Uniforms = { uTime: { value: 0 } };
  private water: THREE.MeshStandardMaterial[] = [];
  private slice = new THREE.Group();
  private gap = new THREE.Group();
  private sliceMats: THREE.Material[] = [];
  /** Facade copies: the whole mesh, and only the triangles of one floor (made when needed). */
  private facade: { mesh: THREE.Mesh; whole: THREE.BufferGeometry; ys: Float32Array | null; floors: (THREE.BufferGeometry | undefined)[] }[] = [];
  private facadeFloor = -1;
  private slabs: THREE.Mesh[] = [];
  private deck: THREE.Mesh | null = null;
  private slabFloor = -1;
  /** Outline of the facade at every height. */
  private wall: Float32Array = new Float32Array(0);
  private outlines: ([number, number][] | undefined)[] = [];
  private disposed = false;
  private box = new THREE.Box3(new THREE.Vector3(TOWER.x0, BAND_FROM, TOWER.z0), new THREE.Vector3(TOWER.x1, BAND_TO, TOWER.z1));
  private hit = new THREE.Vector3();

  // The building hides the band between these planes…
  private cutTop = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private cutBot = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  // …and the copy shows only that band
  private keepTop = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  private keepBot = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  constructor(
    private renderer: THREE.WebGLRenderer,
    private q: Quality,
    private floors: number,
    initial: number,
    fadeColor: number,
  ) {
    this.fog = new THREE.Fog(fadeColor, 0, FOG_SPAN);
    this.scene.fog = this.fog;
    this.active = this.lastActive = initial;
    this.bandY = this.floorY(initial);

    this.sun = new THREE.DirectionalLight(0xffe9d0, 3.7);
    this.sun.position.set(-92, 104, 96);
    this.sun.target.position.set(0, 18, -6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.setScalar(q.shadow);
    const c = this.sun.shadow.camera;
    c.left = -100; c.right = 100; c.top = 104; c.bottom = -84; c.near = 10; c.far = 340;
    c.updateProjectionMatrix();
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = q.shadow > 2000 ? 0.12 : 0.22;
    this.scene.add(this.sun, this.sun.target);
    this.scene.add(new THREE.HemisphereLight(0xcfe0f5, 0x6d7350, 1.15));
    this.scene.environmentIntensity = 0.6;
    this.slice.visible = false;
    this.gap.visible = false;
    this.scene.add(this.slice, this.gap);
  }

  /** A floor is sliding in or out. */
  get moving() {
    return Math.abs(this.popV) > 0.01 || Math.abs(this.floorY(this.active) - this.bandY) > 0.01;
  }

  get bandH() {
    return (BAND_TO - BAND_FROM) / this.floors;
  }

  /** Centre height of a floor; index 0 is the top floor. */
  floorY(i: number) {
    return BAND_TO - this.bandH * (i + 0.5);
  }

  setActive(i: number) {
    this.active = i;
  }

  /** Dissolves the whole scene into the fade colour, 0..1. Costs nothing, unlike a blended full-screen layer. */
  setFade(f: number) {
    const t = 0.5 - Math.sin(Math.asin(1 - 2 * f) / 3); // inverse of smoothstep
    this.fog.near = -t * FOG_SPAN;
    this.fog.far = (1 - t) * FOG_SPAN;
  }

  /** Where the open drawer ends up: centre of its deck, in world space. */
  drawerDeck(i: number, out: THREE.Vector3) {
    return out.set(CENTER.x, this.floorY(i) - this.bandH / 2 + 0.5, CENTER.z + DRAWER);
  }

  /** Floor under the pointer, or -1. */
  pick(ray: THREE.Ray) {
    if (!this.loaded) return -1;
    const p = ray.intersectBox(this.box, this.hit);
    if (!p) return -1;
    const i = Math.floor((BAND_TO - p.y) / this.bandH);
    return i >= 0 && i < this.floors ? i : -1;
  }

  async load(loader: GLTFLoader, tall: boolean, onProgress: (f: number) => void) {
    let a = 0, b = 0, c = 0;
    const report = () => onProgress(a * 0.8 + b * 0.1 + c * 0.1);
    const pano = loadTexture("/hdri/landscape-1k.webp").then((t) => { b = 1; report(); this.setPanorama(t); }, () => {});
    const env = loadReflections("/hdri/env-landscape.webp", 128).then((t) => this.setReflections(t), () => {});
    const view = this.setView(tall).then(() => { c = 1; report(); });
    const model = loader.loadAsync(this.q.campus, (e) => {
      a = e.total ? clamp01(e.loaded / e.total) : Math.min(0.95, e.loaded / 1.9e6);
      report();
    });
    const [gltf] = await Promise.all([model, pano, view, env]);
    if (this.disposed) return;
    await nextFrame();
    if (this.disposed) return;
    this.build(gltf.scene);
    this.loaded = true;
    onProgress(1);
  }

  /** The sharp part of the sky. The upright one is smaller; turning a phone sideways loads the wide one. */
  async setView(tall: boolean) {
    const kind = tall ? "tall" : "wide";
    if (this.viewKind === kind || this.viewKind === "wide") return;
    this.viewKind = kind;
    const { file, u0, u1 } = VIEW[kind];
    try {
      const t = await loadTexture(file);
      if (this.disposed) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      const old = this.view;
      this.view = new THREE.Mesh(dome(u0, u1, VIEW_ROWS, tall ? 24 : 46), new THREE.MeshBasicMaterial({ map: t, depthWrite: false }));
      // Over the soft sky, under the rim of the lawn
      this.place(this.view, 10.5);
      if (old) {
        this.scene.remove(old);
        disposeTree(old);
      }
    } catch {
      this.viewKind = "";
    }
  }

  private place(m: THREE.Mesh, order: number) {
    m.position.y = GROUND_Y + CAPTURE_H - 0.4;
    m.rotation.y = PANO_ROT;
    m.frustumCulled = false;
    // Drawn after the campus, so hidden pixels are skipped
    m.renderOrder = order;
    this.scene.add(m);
  }

  private setReflections(t: THREE.Texture) {
    if (this.disposed) return t.dispose();
    this.env = t;
    this.scene.environment = t;
    this.scene.environmentRotation.y = PANO_ROT;
  }

  private setPanorama(t: THREE.Texture) {
    if (this.disposed) return t.dispose();
    t.colorSpace = THREE.SRGBColorSpace;
    t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter;
    this.sky = new THREE.Mesh(dome(0, 1, SKY_ROWS, 72), new THREE.MeshBasicMaterial({ map: t, depthWrite: false }));
    this.place(this.sky, 10);
  }

  private build(model: THREE.Object3D) {
    const swapped = new Map<THREE.Material, THREE.Material>();
    const cheap = (mat: THREE.MeshStandardMaterial) => {
      let next = swapped.get(mat);
      if (!next) {
        const l = new THREE.MeshLambertMaterial({
          name: mat.name, color: mat.color, map: mat.map, vertexColors: mat.vertexColors, side: mat.side,
          emissive: mat.emissive, emissiveMap: mat.emissiveMap, emissiveIntensity: mat.emissiveIntensity,
          transparent: mat.transparent, opacity: mat.opacity, alphaTest: mat.alphaTest, depthWrite: mat.depthWrite, blending: mat.blending,
        });
        // One pass for both sides: thin see-through things look the same and cost half
        l.forceSinglePass = true;
        if (l.map) l.map.anisotropy = this.q.high ? 8 : 4;
        if (mat.name === "foliage") this.sway(l);
        if (mat.name === "stream") this.flow(l);
        swapped.set(mat, l);
        next = l;
      }
      return next;
    };

    let wall: THREE.Mesh | null = null;
    const sliceable: THREE.Mesh[] = [];
    model.updateMatrixWorld(true);
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.receiveShadow = true;
      const name = (m.material as THREE.Material).name;
      m.castShadow = name !== "water" && name !== "stream" && name !== "Emmsive" && name !== "material_0";
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.forceSinglePass = true;
      if (name === "Emmsive") {
        mat.emissiveIntensity = 1.1;
        mat.depthWrite = false;
      } else if (name === "Interior") mat.emissiveIntensity = 0.5;
      else if (name === "glow") mat.emissiveIntensity = 1.6;
      else if (name === "stream") {
        mat.transparent = true;
        mat.opacity = 0.72;
      }
      if (MATTE.test(name)) m.material = cheap(mat);
      else if (name === "GLASS_BUILDING") {
        mat.metalness = 0.5; mat.roughness = 0.14; mat.envMapIntensity = 3.1;
        mat.color.setScalar(1.3);
        if (mat.map) mat.map.anisotropy = 8;
      } else if (name === "metal") {
        mat.envMapIntensity = 1.15;
        // A touch cooler than the source file, so the bronze does not read as orange in daylight
        mat.color.setRGB(0.93, 1, 1.12);
      } else if (name === "water") {
        mat.envMapIntensity = 1.3;
        if (mat.normalMap) {
          mat.normalMap.wrapS = mat.normalMap.wrapT = THREE.RepeatWrapping;
          mat.normalScale.setScalar(0.5);
        }
        this.water.push(mat);
      }
      let p: THREE.Object3D | null = m;
      while (p && !p.userData.slice) p = p.parent;
      if (p) {
        sliceable.push(m);
        if (name === "GLASS_BUILDING") wall = m;
      }
    });

    if (wall) {
      const g = (wall as THREE.Mesh).geometry.getAttribute("position");
      const mw = (wall as THREE.Mesh).matrixWorld;
      const v = new THREE.Vector3();
      const list: number[] = [];
      for (let i = 0; i < g.count; i++) {
        v.fromBufferAttribute(g, i).applyMatrix4(mw);
        if (v.y > BAND_FROM - 2 && v.y < BAND_TO + 2) list.push(v.x, v.y, v.z);
      }
      this.wall = new Float32Array(list);
    }

    for (const m of sliceable) {
      const copy = m.clone();
      m.updateWorldMatrix(true, false);
      copy.matrixAutoUpdate = true;
      m.matrixWorld.decompose(copy.position, copy.quaternion, copy.scale);
      const cm = (m.material as THREE.Material).clone();
      cm.clippingPlanes = [this.keepTop, this.keepBot];
      this.sliceMats.push(cm);
      copy.material = cm;
      copy.castShadow = false;
      copy.receiveShadow = true;
      this.slice.add(copy);
      this.facade.push({ mesh: copy, whole: copy.geometry, ys: null, floors: [] });
      const mm = m.material as THREE.Material;
      mm.clippingPlanes = [this.cutTop, this.cutBot];
      mm.clipIntersection = true;
    }

    const slabMat = new THREE.MeshLambertMaterial({ color: 0x56585b });
    const deckMat = new THREE.MeshLambertMaterial({ color: 0xe9e4dc });
    for (let k = 0; k < 4; k++) {
      const s = new THREE.Mesh(new THREE.BufferGeometry(), slabMat);
      this.slabs.push(s);
      (k < 2 ? this.slice : this.gap).add(s);
    }
    this.deck = new THREE.Mesh(new THREE.BufferGeometry(), deckMat);
    this.deck.receiveShadow = false;
    this.slice.add(this.deck);

    this.addMeadow(model);
    this.scene.add(model);
    this.slice.visible = true;
    this.updateSlabs(this.active);
    this.setBand(this.bandY, 0, 0);
  }

  /** Lawn around the plinth that fades into the photographed meadow. */
  private addMeadow(model: THREE.Object3D) {
    let map: THREE.Texture | null = null;
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.Material).name === "lawn") map = (m.material as THREE.MeshLambertMaterial).map;
    });
    if (!map) return;
    const tex = (map as THREE.Texture).clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const seg = this.q.high ? 96 : 48;
    const patch = (sh: THREE.WebGLProgramParametersWithUniforms) => {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vW;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvW = position.xz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vW;")
        .replace(
          "#include <map_fragment>",
          `vec3 l1 = texture2D(map, vW / 19.0).rgb;
           vec3 l2 = texture2D(map, vW.yx / 143.0 + 0.31).rgb;
           vec3 g = mix(vec3(dot(l1, vec3(0.34))), l1, 0.6) * vec3(0.92, 0.82, 0.56) + vec3(0.1, 0.112, 0.028);
           float far = smoothstep(60.0, 420.0, length(vW));
           g = mix(g, vec3(0.27, 0.315, 0.095), far * 0.8);
           diffuseColor.rgb *= g * mix(0.86, 1.14, l2.g * 2.2);`,
        )
        .replace(
          "#include <opaque_fragment>",
          `float r = length(vW * vec2(1.0, 0.92));
           diffuseColor.a = 1.0 - smoothstep(520.0, 1090.0, r);
           #include <opaque_fragment>`,
        );
    };
    // Opaque in the middle, drawn before the sky; only the rim is blended.
    // The photographed ground is flat and lower than the lawn up to 330 m, then it rises to the horizon.
    const add = (g: THREE.BufferGeometry, rim: boolean) => {
      const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: rim, depthWrite: !rim });
      mat.onBeforeCompile = patch;
      mat.customProgramCacheKey = () => "meadow";
      const m = new THREE.Mesh(g.rotateX(-Math.PI / 2), mat);
      m.position.y = GROUND_Y;
      m.receiveShadow = true;
      m.renderOrder = rim ? 11 : 9;
      this.scene.add(m);
    };
    add(new THREE.CircleGeometry(MEADOW, seg), false);
    add(new THREE.RingGeometry(MEADOW, 1100, seg, 1), true);
  }

  /** Leaves move slightly in the wind. */
  private sway(mat: THREE.Material) {
    const u = this.uniforms;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = u.uTime;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uTime;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           float ph = position.x * 0.9 + position.z * 1.1;
           #ifdef USE_INSTANCING
             ph += instanceMatrix[3].x * 0.23 + instanceMatrix[3].z * 0.19;
           #endif
           float amp = 0.012 * clamp(position.y, 0.0, 6.0);
           transformed.x += sin(uTime * 1.3 + ph) * amp;
           transformed.z += cos(uTime * 1.1 + ph * 1.3) * amp;`,
        );
    };
  }

  /** Fountain jets shimmer along their length. */
  private flow(mat: THREE.Material) {
    const u = this.uniforms;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = u.uTime;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying vec3 vFl;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvFl = position;\ntransformed.y += sin(uTime * 7.0 + position.x * 5.0 + position.z * 4.0) * 0.025;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying vec3 vFl;")
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           float fl = sin(length(vFl.xz) * 7.0 - uTime * 9.0 + vFl.y * 5.0) * 0.5 + 0.5;
           diffuseColor.a *= 0.55 + 0.45 * fl;`,
        );
    };
  }

  /** Outline of a floor, seen from above. */
  private outline(i: number) {
    const bh = this.bandH, yc = this.floorY(i);
    const pts: [number, number][] = [];
    const seen = new Set<number>();
    for (let k = 0; k < this.wall.length; k += 3) {
      const y = this.wall[k + 1];
      if (y <= yc - bh / 2 || y >= yc + bh / 2) continue;
      // Points above one another count once
      const x = this.wall[k], z = this.wall[k + 2], key = Math.round(x * 20) * 4096 + Math.round(z * 20);
      if (seen.has(key)) continue;
      seen.add(key);
      pts.push([x, z]);
    }
    const h = pts.length >= 3 ? hull2(pts) : [];
    return h.length >= 3 ? h : ([[TOWER.x0, TOWER.z0], [TOWER.x1, TOWER.z0], [TOWER.x1, TOWER.z1], [TOWER.x0, TOWER.z1]] as [number, number][]);
  }

  /** Cross-section of a floor: its outline, slightly inset. */
  private slabGeometry(i: number, inset: number) {
    const h = (this.outlines[i] ??= this.outline(i));
    const shape = new THREE.Shape(h.map(([x, z]) => new THREE.Vector2(CENTER.x + (x - CENTER.x) * inset, CENTER.z + (z - CENTER.z) * inset)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: false, curveSegments: 1 });
    // The shape lies in XY (y = z): turn it into the ground plane
    g.rotateX(Math.PI / 2);
    g.translate(0, 0.2, 0);
    return g;
  }

  private updateSlabs(i: number) {
    if (i === this.slabFloor || !this.slabs.length) return;
    this.slabFloor = i;
    const g = this.slabGeometry(i, 0.984);
    this.slabs[0].geometry.dispose();
    this.slabs.forEach((m) => (m.geometry = g));
    if (this.deck) {
      // Smaller, so its corners do not show through the recesses of the facade
      this.deck.geometry.dispose();
      this.deck.geometry = this.slabGeometry(i, 0.95);
    }
  }

  /** While a floor rests, its copy draws only the triangles of that floor: a tenth of the facade. */
  private showFacade(i: number) {
    if (i === this.facadeFloor) return;
    this.facadeFloor = i;
    for (const f of this.facade) f.mesh.geometry = i < 0 ? f.whole : (f.floors[i] ??= this.floorGeometry(f, i));
  }

  private floorGeometry(f: Exterior["facade"][number], i: number) {
    const top = this.floorY(i) + this.bandH / 2 + 0.05, bot = this.floorY(i) - this.bandH / 2 - 0.05;
    f.mesh.updateMatrix();
    const ys = (f.ys ??= along(f.whole, f.mesh.matrix, 1));
    const beyond = new Uint8Array(ys.length);
    for (let k = 0; k < ys.length; k++) beyond[k] = (ys[k] <= bot ? 1 : 0) | (ys[k] >= top ? 2 : 0);
    return pickTriangles(f.whole, beyond);
  }

  private setBand(y: number, open: number, gone: number) {
    const top = y + this.bandH / 2, bot = y - this.bandH / 2;
    this.cutTop.constant = -top;
    this.cutBot.constant = bot;
    // Opening lowers the facade of the drawer to a low parapet, then the parapet goes too
    this.keepTop.constant = lerp(lerp(top, bot + 1.3, open), bot - 0.3, gone);
    this.keepBot.constant = -bot;
  }

  update(dt: number, t: number, { near, drawer, open, gone }: ExteriorState) {
    this.uniforms.uTime.value = t;
    for (const w of this.water) if (w.normalMap) w.normalMap.offset.set(t * 0.012, t * 0.019);
    if (!this.loaded) return;

    const bh = this.bandH;
    const goalY = this.floorY(this.active);
    if (this.active !== this.lastActive) {
      this.lastActive = this.active;
      this.popV -= 2.4;
    }
    const travel = Math.min(1, Math.abs(goalY - this.bandY) / (bh * 0.5));
    // The cut only moves while the floor is nearly flush, so no seam shows
    if (this.pop < 0.15 || travel < 0.02) this.bandY = damp(this.bandY, goalY, 7, dt);
    if (Math.abs(goalY - this.bandY) < 0.004) this.bandY = goalY;
    const goal = travel > 0.02 ? 0 : 1;
    this.popV += (goal - this.pop) * 60 * dt;
    this.popV *= Math.exp(-10 * dt);
    this.pop = Math.max(-0.05, this.pop + this.popV * dt);
    this.setBand(this.bandY, open, gone);

    this.reach = damp(this.reach, lerp(this.active === 0 ? POP_FAR_TOP : POP_FAR, POP, near), 8, dt);
    const slide = lerp(this.reach * this.pop, DRAWER, drawer);
    this.slide = slide;
    this.slice.position.set(0, 0, slide);
    const rest = Math.abs(goalY - this.bandY) < 0.01;
    if (rest) this.updateSlabs(this.active);
    this.showFacade(rest ? this.active : -1);
    const bot = this.bandY - bh / 2, top = this.bandY + bh / 2;
    if (this.slabs.length) {
      this.slabs[0].position.y = bot + 0.2;
      // The ceiling stays with the tower once the floor becomes a drawer
      this.slabs[1].position.y = top - 0.2;
      this.slabs[1].visible = drawer < 0.04;
      this.slabs[2].position.y = bot - 0.2;
      this.slabs[3].position.y = top + 0.2;
      this.gap.visible = slide > 0.05;
      if (this.deck) {
        this.deck.position.y = bot + 0.24;
        this.deck.visible = drawer > 0.02;
      }
    }
  }

  dispose() {
    this.disposed = true;
    this.env?.dispose();
    this.sliceMats.forEach((m) => m.dispose());
    this.sun.shadow.map?.dispose();
    for (const f of this.facade) [f.whole, ...f.floors].forEach((g) => g?.dispose());
    disposeTree(this.scene);
  }
}
