import * as THREE from "three";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GroundedSkybox } from "three/examples/jsm/objects/GroundedSkybox.js";
import type { Quality } from "./quality";
import { asArray, clamp01, damp, disposeTree, hull2, lerp, loadTexture } from "./util";

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

/** Rough, matte surfaces do not need physically based shading: Lambert looks the same and costs far less. */
const MATTE = /^(matte|foliage|lawn|hedge|gravel|travertine|sandstone|basalt|temp|Trimsheet)$/;

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
  private sky: GroundedSkybox | null = null;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private pmrem: THREE.PMREMGenerator;
  private uniforms: Uniforms = { uTime: { value: 0 } };
  private water: THREE.MeshStandardMaterial[] = [];
  private slice = new THREE.Group();
  private gap = new THREE.Group();
  private sliceMats: THREE.Material[] = [];
  /** Facade copies: the whole mesh, and only the triangles of one floor (made when needed). */
  private facade: { mesh: THREE.Mesh; whole: THREE.BufferGeometry; floors: (THREE.BufferGeometry | undefined)[] }[] = [];
  private facadeFloor = -1;
  private slabs: THREE.Mesh[] = [];
  private deck: THREE.Mesh | null = null;
  private slabFloor = -1;
  private wall: Float32Array = new Float32Array(0);
  private upgrades: ReturnType<typeof setTimeout>[] = [];
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
    this.pmrem = new THREE.PMREMGenerator(renderer);

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

  async load(loader: GLTFLoader, onProgress: (f: number) => void) {
    let a = 0, b = 0;
    const report = () => onProgress(a * 0.82 + b * 0.18);
    const pano = loadTexture("/hdri/landscape-2k.webp").then((t) => { b = 1; report(); this.setPanorama(t); }, () => {});
    const model = loader.loadAsync(this.q.campus, (e) => {
      a = e.total ? clamp01(e.loaded / e.total) : Math.min(0.95, e.loaded / 1.9e6);
      report();
    });
    const [gltf] = await Promise.all([model, pano]);
    if (this.disposed) return;
    this.build(gltf.scene);
    this.loaded = true;
    onProgress(1);
  }

  /** Sharper panoramas, once the scene is on screen. Sending one to the GPU drops a frame or two, so it waits for a calm moment. */
  upgradePanorama(calm: () => boolean) {
    const apply = (t: THREE.Texture) => {
      if (this.disposed) t.dispose();
      else if (calm()) this.setPanorama(t, false);
      else this.upgrades.push(setTimeout(() => apply(t), 250));
    };
    let wait = this.q.high ? 2500 : 4500;
    for (const url of this.q.panoramas) {
      this.upgrades.push(setTimeout(() => {
        if (this.disposed) return;
        if (url.includes("8k") && this.renderer.capabilities.maxTextureSize < 8192) return;
        loadTexture(url).then(apply, () => {});
      }, wait));
      wait += 4500;
    }
  }

  private setPanorama(t: THREE.Texture, env = true) {
    if (this.disposed) return t.dispose();
    t.colorSpace = THREE.SRGBColorSpace;
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    if (!this.sky) {
      this.sky = new GroundedSkybox(t, CAPTURE_H, 1500, this.q.high ? 128 : 96);
      this.sky.position.y = GROUND_Y + CAPTURE_H - 0.4;
      this.sky.rotation.y = PANO_ROT;
      // Drawn after the campus, so hidden pixels are skipped
      this.sky.renderOrder = 10;
      this.scene.add(this.sky);
    } else {
      const m = this.sky.material as THREE.MeshBasicMaterial;
      m.map?.dispose();
      m.map = t;
      m.needsUpdate = true;
    }
    if (env) {
      this.envRT?.dispose();
      this.envRT = this.pmrem.fromEquirectangular(t);
      this.scene.environment = this.envRT.texture;
      this.scene.environmentRotation.y = PANO_ROT;
    }
  }

  private build(model: THREE.Object3D) {
    const swapped = new Map<THREE.Material, THREE.Material>();
    const cheap = (mat: THREE.MeshStandardMaterial) => {
      let next = swapped.get(mat);
      if (!next) {
        const l = new THREE.MeshLambertMaterial({ name: mat.name, color: mat.color, map: mat.map, vertexColors: mat.vertexColors, side: mat.side });
        if (l.map) l.map.anisotropy = this.q.high ? 8 : 4;
        if (mat.name === "foliage") this.sway(l);
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
      if (MATTE.test(name)) m.material = cheap(mat);
      else if (name === "GLASS_BUILDING") {
        mat.metalness = 0.5; mat.roughness = 0.14; mat.envMapIntensity = 3.1;
        mat.color.setScalar(1.3);
        if (mat.map) mat.map.anisotropy = 8;
      } else if (name === "Emmsive") {
        mat.emissiveIntensity = 1.1;
        mat.depthWrite = false;
      } else if (name === "Interior") {
        mat.emissiveIntensity = 0.5;
      } else if (name === "metal") {
        mat.envMapIntensity = 1.15;
        // A touch cooler than the source file, so the bronze does not read as orange in daylight
        mat.color.setRGB(0.93, 1, 1.12);
      } else if (name === "glow") {
        mat.emissiveIntensity = 1.6;
      } else if (name === "water") {
        mat.envMapIntensity = 1.3;
        if (mat.normalMap) {
          mat.normalMap.wrapS = mat.normalMap.wrapT = THREE.RepeatWrapping;
          mat.normalScale.setScalar(0.5);
        }
        this.water.push(mat);
      } else if (name === "stream") {
        mat.transparent = true; mat.opacity = 0.72; mat.roughness = 0.1; mat.envMapIntensity = 1.4;
        this.flow(mat);
      }
      let p: THREE.Object3D | null = m;
      while (p && !p.userData.slice) p = p.parent;
      if (p) {
        sliceable.push(m);
        if (name === "GLASS_BUILDING") wall = m;
      }
    });

    // Outline of the facade at every height, for the floor slabs
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
      this.facade.push({ mesh: copy, whole: copy.geometry, floors: [] });
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

  /** Cross-section of a floor: hull of the facade outline at that height, slightly inset. */
  private slabGeometry(i: number, inset: number) {
    const bh = this.bandH, yc = this.floorY(i);
    const pts: [number, number][] = [];
    for (let k = 0; k < this.wall.length; k += 3) {
      const y = this.wall[k + 1];
      if (y > yc - bh / 2 && y < yc + bh / 2) pts.push([this.wall[k], this.wall[k + 2]]);
    }
    let h = pts.length >= 3 ? hull2(pts) : [];
    if (h.length < 3) h = [[TOWER.x0, TOWER.z0], [TOWER.x1, TOWER.z0], [TOWER.x1, TOWER.z1], [TOWER.x0, TOWER.z1]];
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
    for (const f of this.facade) f.mesh.geometry = i < 0 ? f.whole : (f.floors[i] ??= this.floorGeometry(f.mesh, f.whole, i));
  }

  private floorGeometry(mesh: THREE.Mesh, whole: THREE.BufferGeometry, i: number) {
    const pos = whole.getAttribute("position");
    const src = whole.index;
    const top = this.floorY(i) + this.bandH / 2 + 0.05, bot = this.floorY(i) - this.bandH / 2 - 0.05;
    mesh.updateMatrix();
    const e = mesh.matrix.elements;
    const ys = new Float32Array(pos.count);
    for (let k = 0; k < pos.count; k++) ys[k] = e[1] * pos.getX(k) + e[5] * pos.getY(k) + e[9] * pos.getZ(k) + e[13];
    const n = src ? src.count : pos.count;
    const list: number[] = [];
    for (let k = 0; k < n; k += 3) {
      const a = src ? src.getX(k) : k, b = src ? src.getX(k + 1) : k + 1, c = src ? src.getX(k + 2) : k + 2;
      if (Math.max(ys[a], ys[b], ys[c]) > bot && Math.min(ys[a], ys[b], ys[c]) < top) list.push(a, b, c);
    }
    const g = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(whole.attributes)) g.setAttribute(name, attr);
    g.setIndex(list);
    g.boundingSphere = whole.boundingSphere;
    return g;
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
    this.upgrades.forEach(clearTimeout);
    this.envRT?.dispose();
    this.pmrem.dispose();
    this.sliceMats.forEach((m) => m.dispose());
    this.sun.shadow.map?.dispose();
    for (const m of asArray(this.sky?.material ?? [])) m.dispose();
    for (const f of this.facade) [f.whole, ...f.floors].forEach((g) => g?.dispose());
    disposeTree(this.scene);
  }
}
