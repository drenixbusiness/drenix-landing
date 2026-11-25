import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { Tier } from "@/lib/perf";
import { DRAWER, Exterior } from "./exterior";
import { Office, PLAN, ZONES, zoneBox } from "./office";
import { getQuality, ResolutionGovernor, type Quality } from "./quality";
import { TL, ZONE_COUNT, liftAt, stageAt, zonePath } from "./timeline";
import { applyPose, clonePose, damp, fitPose, inSlices, mixPose, nextFrame, pose, smooth, smoother, type Insets, type Pose } from "./util";

/** Office units to metres: the plan fills the deck of an open floor. */
const K = 2.36;
const NEAR = 4;
const FAR = 3600;
const STONE = 0xefede8;
const NONE: Insets = { left: 0, right: 0, top: 0, bottom: 0 };

export type JourneyEvents = {
  onProgress?: (f: number) => void;
  onReady?: () => void;
  onError?: () => void;
  onHoverFloor?: (i: number) => void;
  /** A floor was clicked. `direct`: with a mouse, which has already shown the floor by hovering. */
  onPickFloor?: (i: number, direct: boolean) => void;
  onHoverZone?: (i: number) => void;
  onPickZone?: (i: number) => void;
};

export type PanelInsets = { tower: Insets; plan: Insets; zone: Insets; done: Insets };

type Shots = { hero: Pose; tower: Pose; planTop: Pose; plan: Pose; done: Pose; zone: Pose[] };
const shotList = (s: Shots) => [s.hero, s.tower, s.planTop, s.plan, s.done, ...s.zone];

export type JourneyOptions = {
  tier: Tier;
  floors: number;
  floor: number;
  /** "full": campus to office. "office": only the office (department pages). */
  mode?: "full" | "office";
  /** Space taken by panels over the canvas, for the current size. */
  insets?: (w: number, h: number) => PanelInsets;
};

/** Runs the whole 3D story on one canvas. Scroll position goes in, frames come out. */
export class Journey {
  /** Room label elements; the engine only moves them. */
  labelEls: (HTMLElement | null)[] = [];

  private renderer: THREE.WebGLRenderer;
  private q: Quality;
  private ext: Exterior | null = null;
  private office: Office;
  private loader: GLTFLoader;
  private draco: DRACOLoader;
  private gov: ResolutionGovernor;
  // One camera in metres, one in office units. Their depth ranges match, so both scenes share a depth buffer
  private camW = new THREE.PerspectiveCamera(40, 1, NEAR, FAR);
  private camL = new THREE.PerspectiveCamera(40, 1, NEAR / K, FAR / K);
  private timer = new THREE.Timer();
  private raf = 0;
  private w = 1;
  private h = 1;
  private u = 0;
  private uS = -1;
  private floor: number;
  private floorShown: number;
  private sw = -1;
  private ready = false;
  private officeAsked = false;
  private warm: (() => void)[] = [];
  private tall = false;
  private odd = false;
  private busy = 0;
  private disposed = false;
  private visible = true;
  private extShadow = true;
  private stillFrames = 0;
  private shadowWait = 3;
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2(9, 9);
  private pointer = false;
  private moved = false;
  private tilt = new THREE.Vector2();
  private tiltS = new THREE.Vector2();
  private hoverFloor = -1;
  private hoverZone = -1;
  private hoverLift = 0;
  private at = { x: -1, y: -1 };
  private movedAt = 0;
  private down = { x: 0, y: 0, t: 0 };
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private deck = new THREE.Vector3();
  private v = new THREE.Vector3();

  // Camera poses, recomputed when the size or the panels change
  private shots: Shots;
  private goal: Shots | null = null;
  private p = pose({ x: 0, y: 0, z: 0, yaw: 0, pitch: 0, dist: 100 });
  private q1 = clonePose(this.p);
  private local = clonePose(this.p);
  private lastPose = clonePose(this.p);

  constructor(private mount: HTMLElement, private o: JourneyOptions, private ev: JourneyEvents) {
    this.floor = this.floorShown = o.floor;
    this.q = getQuality(o.tier);
    this.shots = this.frames(1, 1);
    this.renderer = new THREE.WebGLRenderer({ antialias: this.q.antialias, powerPreference: "high-performance", stencil: false });
    const r = this.renderer;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.1;
    r.localClippingEnabled = true;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.shadowMap.autoUpdate = false;
    r.autoClear = false;
    r.setClearColor(STONE, 1);
    // Asking the driver for compile messages stalls the page; only useful while developing
    r.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    const c = r.domElement;
    c.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y";
    c.setAttribute("aria-hidden", "true");
    mount.appendChild(c);

    this.draco = new DRACOLoader();
    this.draco.setDecoderPath("/draco/");
    this.draco.setWorkerLimit(this.q.high ? 4 : 2);
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.draco);
    this.gov = new ResolutionGovernor(r, this.q, () => this.layout());
    if (o.mode !== "office") this.ext = new Exterior(r, this.q, o.floors, o.floor, STONE);
    this.office = new Office(this.q, o.floor);

    c.addEventListener("pointermove", this.onMove, { passive: true });
    c.addEventListener("pointerleave", this.onLeave);
    c.addEventListener("pointerdown", this.onDown, { passive: true });
    c.addEventListener("pointerup", this.onUp, { passive: true });
    c.addEventListener("webglcontextlost", this.onLost);
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(mount);
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }, { rootMargin: "10% 0px" });
    this.io.observe(mount);
    this.layout();
    void this.start();
  }

  /* ---------- public ---------- */

  /** Scroll position in screen heights. */
  setScroll(u: number) {
    this.u = u;
    if (this.uS < 0) this.uS = u;
  }

  setFloor(i: number) {
    if (i === this.floor) return;
    this.floor = i;
    this.ext?.setActive(i);
    if (this.o.mode !== "office" && this.uS < TL.grow[0]) {
      this.floorShown = i;
      this.office.setDepartment(i);
    } else {
      // Inside the office: the walls go down, the screens change, the walls come back
      this.sw = this.sw < 0 ? 0 : Math.min(this.sw, 0.5);
    }
    this.stillFrames = 0;
  }

  /** The panels have changed size: the picture glides into the free space that is left. */
  refit() {
    if (this.w < 2 || this.disposed) return;
    this.goal = this.frames(this.w, this.h);
    this.stillFrames = 0;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    const c = this.renderer.domElement;
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerleave", this.onLeave);
    c.removeEventListener("pointerdown", this.onDown);
    c.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("webglcontextlost", this.onLost);
    this.ext?.dispose();
    this.office.dispose();
    this.draco.dispose();
    this.renderer.dispose();
    // Phones allow only a few WebGL contexts: give this one back at once
    this.renderer.forceContextLoss();
    c.remove();
  }

  /* ---------- loading ---------- */

  private async start() {
    const alive = () => !this.disposed;
    try {
      if (this.ext) {
        await this.ext.load(this.loader, this.tall, (f) => this.ev.onProgress?.(f));
        if (this.disposed) return;
        // The phone may have been turned while loading
        void this.ext.setView(this.tall);
        this.pose(this.u);
        await this.prepare(this.ext.scene, this.camW, alive);
        if (this.disposed) return;
      } else {
        await this.loadOffice();
        // Behind the still picture: the parts are drawn one by one, so the first real frame is light
        await inSlices(this.office.warmSteps(), (step) => {
          step();
          this.drawWarm();
        }, alive);
        if (this.disposed) return;
      }
      this.timer.update();
      this.loop();
    } catch {
      if (!this.disposed) this.ev.onError?.();
    }
  }

  /**
   * Gets a scene ready for its first frame in small steps: textures, shaders, then buffers.
   * All at once it would freeze a phone for half a second, in the middle of the first swipe.
   */
  private async prepare(scene: THREE.Scene, camera: THREE.Camera, alive: () => boolean) {
    const r = this.renderer;
    const meshes: THREE.Mesh[] = [];
    const textures = new Set<THREE.Texture>();
    const oneOf = new Map<THREE.Material, THREE.Mesh>();
    scene.traverseVisible((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      meshes.push(m);
      const mat = m.material as THREE.Material;
      if (!oneOf.has(mat)) oneOf.set(mat, m);
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture && v.image) textures.add(v);
    });
    await inSlices([...textures], (t) => r.initTexture(t), alive);
    await inSlices([...oneOf.values()], (m) => r.compile(m, camera, scene), alive);
    if (!alive()) return;
    await r.compileAsync(scene, camera);
    // First draws: a few objects per frame, into one pixel behind the poster
    const shadow = this.extShadow;
    for (const m of meshes) m.visible = false;
    await inSlices(meshes, (m) => {
      m.visible = true;
      this.onePixel(() => r.render(scene, camera));
      m.visible = false;
    }, alive);
    for (const m of meshes) m.visible = true;
    if (!alive()) return;
    await nextFrame();
    if (shadow) {
      r.shadowMap.needsUpdate = true;
      this.onePixel(() => r.render(scene, camera));
      this.extShadow = false;
    }
    await nextFrame();
  }

  private onePixel(draw: () => void) {
    const r = this.renderer;
    r.setScissorTest(true);
    r.setScissor(0, 0, 1, 1);
    r.setViewport(0, 0, 1, 1);
    draw();
    r.setScissorTest(false);
    r.setViewport(0, 0, this.w, this.h);
  }

  private async loadOffice() {
    if (this.officeAsked) return;
    this.officeAsked = true;
    await this.office.load(this.loader);
    if (this.disposed) return;
    this.pose(this.u);
    const alive = () => !this.disposed;
    const seen = new Set<THREE.Material>();
    const list: THREE.Mesh[] = [];
    this.office.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && !seen.has(m.material as THREE.Material)) {
        seen.add(m.material as THREE.Material);
        list.push(m);
      }
    });
    await inSlices(list, (m) => this.renderer.compile(m, this.camL, this.office.scene), alive);
    if (this.disposed) return;
    await this.renderer.compileAsync(this.office.scene, this.camL);
    if (this.ext) this.warm = this.office.warmSteps();
    this.stillFrames = 0;
  }

  /** One small step of getting the office ready. Steps run faster as the visitor comes closer to the floor. */
  private warmStep(u: number) {
    let n = u > 1.4 ? 2 : 1;
    while (n-- && this.warm.length) {
      this.warm.shift()!();
      if (this.warm.length) this.drawWarm();
    }
  }

  private drawWarm() {
    const r = this.renderer;
    r.shadowMap.needsUpdate = true;
    this.onePixel(() => r.render(this.office.scene, this.camL));
  }

  /* ---------- layout ---------- */

  private layout() {
    const w = this.mount.clientWidth, h = this.mount.clientHeight;
    if (!w || !h) return;
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h, false);
    this.stillFrames = 0;
    const tall = w / h < 0.85;
    if (tall !== this.tall) {
      this.tall = tall;
      if (this.ext?.loaded) void this.ext.setView(tall);
    }
    this.shots = this.frames(w, h);
    this.goal = null;
  }

  private frames(w: number, h: number): Shots {
    const tall = w / h < 0.85;
    const free = this.o.insets?.(w, h) ?? { tower: NONE, plan: NONE, zone: NONE, done: NONE };
    const plan = { yaw: tall ? 112 : 29, pitch: tall ? 56 : 48, fov: 26 };
    return {
      // Campus: the vertical framing is the same for every width, so it matches the poster image
      hero: tall
        ? pose({ x: 0, y: 12, z: -8, yaw: 16, pitch: 0, dist: 270, fov: 48, sy: 0.68 })
        : pose({ x: 1, y: 11, z: 0, yaw: 20, pitch: 0, dist: 142, fov: 46, sy: 0.62, sx: -0.02 }),
      tower: fitPose({ x0: -28, x1: 28, y0: 33, y1: 108, z0: -56, z1: -20 }, { yaw: tall ? 20 : 27, pitch: 6, fov: 30 }, w, h, free.tower, 1.06),
      planTop: fitPose(PLAN, { yaw: tall ? 96 : 20, pitch: 66, fov: 26 }, w, h, free.plan, 1.2),
      plan: fitPose(PLAN, plan, w, h, free.plan, 1.2),
      done: fitPose(PLAN, plan, w, h, free.done, 1.2),
      zone: ZONES.map((z, i) => fitPose(zoneBox(i), { yaw: z.yaw, pitch: tall ? z.pitch + 6 : z.pitch, fov: 26 }, w, h, free.zone, 0.97)),
    };
  }

  private glide(dt: number) {
    if (!this.goal) return;
    const k = 1 - Math.exp(-7 * dt);
    const to = shotList(this.goal);
    let far = 0;
    shotList(this.shots).forEach((a, i) => {
      const b = to[i];
      far = Math.max(far, Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z), Math.abs(a.dist - b.dist), Math.abs(a.sx - b.sx) + Math.abs(a.sy - b.sy));
      mixPose(a, b, k, a);
    });
    if (far > 0.004) return;
    this.shots = this.goal;
    this.goal = null;
  }

  /** Writes both cameras for a scroll position. */
  private pose(u: number, dYaw = 0, dY = 0) {
    const full = !!this.ext;
    const a = smoother(TL.tower[0], TL.tower[1], u);
    const shots = this.shots;
    mixPose(shots.hero, shots.tower, a, this.p);
    this.p.yaw += dYaw;
    this.p.y += dY;
    const b = full ? smoother(TL.drawer[0], TL.drawer[1], u) : 1;
    if (this.ext) this.ext.drawerDeck(this.floor, this.deck);
    // Into office space: the drawer is the origin
    const q = this.q1;
    Object.assign(q, this.p);
    q.x = (this.p.x - this.deck.x) / K;
    q.y = (this.p.y - this.deck.y) / K;
    q.z = (this.p.z - this.deck.z) / K;
    q.dist = this.p.dist / K;
    const settle = smoother(TL.drawer[1] - 0.35, TL.plan[0] + 0.5, u);
    mixPose(shots.planTop, shots.plan, full ? settle : 1, this.local);
    mixPose(q, this.local, b, this.local);

    const [from, to, t] = zonePath(u);
    const at = (i: number) => (i < 0 ? null : i >= ZONE_COUNT ? shots.done : shots.zone[i]);
    const f = at(from), g = at(to);
    if (f || g) {
      mixPose(f ?? shots.plan, g ?? shots.plan, t, this.local);
    }
    const L = this.local;
    const aspect = this.w / this.h;
    applyPose(this.camL, L, aspect);
    if (full) {
      const W = this.q1;
      Object.assign(W, L);
      W.x = L.x * K + this.deck.x;
      W.y = L.y * K + this.deck.y;
      W.z = L.z * K + this.deck.z;
      W.dist = L.dist * K;
      applyPose(this.camW, W, aspect);
      // While the drawer is still moving, the office moves with it
      const late = (DRAWER - this.ext!.slide) / K;
      if (u > TL.drawer[0] - 0.3 && u < TL.drawer[1] + 0.2 && late > 0.001) {
        this.camL.position.z += late;
        this.camL.updateMatrixWorld();
      }
    }
  }

  /* ---------- frame ---------- */

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || this.disposed) return;
    // Phones: the campus at rest only sways a little, half the frames are enough and keep the phone cool
    const now = performance.now();
    if (Math.abs(this.u - this.uS) > 0.001 || this.ext?.moving || now - this.movedAt < 100) this.busy = now;
    const half = !this.q.high && this.ready && !!this.ext && now - this.busy > 700 && this.uS < TL.drawer[0];
    this.odd = !this.odd;
    if (half && this.odd) return;
    this.timer.update();
    const raw = this.timer.getDelta();
    const dt = Math.min(raw, 0.05);
    const time = this.timer.getElapsed();
    const full = !!this.ext;

    this.uS = damp(this.uS < 0 ? this.u : this.uS, this.u, 7, dt);
    if (Math.abs(this.uS - this.u) < 0.0004) this.uS = this.u;
    const u = this.uS;

    if (full && !this.officeAsked && (u > 0.25 || time > 1)) void this.loadOffice().catch(() => {});

    this.glide(dt);
    const outside = full ? 1 - smooth(TL.fade[0], TL.fade[1], u) : 0;
    // Small life of the camera on the campus: idle drift and parallax
    this.tiltS.x = damp(this.tiltS.x, this.tilt.x, 2, dt);
    this.tiltS.y = damp(this.tiltS.y, this.tilt.y, 2, dt);
    if (outside > 0) this.pose(u, Math.sin(time * 0.13) * 1.1 + this.tiltS.x * 2.2, this.tiltS.y * 1.6);
    else this.pose(u);

    this.hover(u);

    // Floor change inside the office
    let sink = 0;
    if (this.sw >= 0) {
      this.sw += dt / 1.1;
      if (this.sw >= 0.5 && this.floorShown !== this.floor) {
        this.floorShown = this.floor;
        this.office.setDepartment(this.floor);
      }
      sink = this.sw < 0.5 ? smooth(0, 0.46, this.sw) : 1 - smooth(0.54, 1, this.sw);
      if (this.sw >= 1) this.sw = -1;
    }

    const inOffice = this.office.loaded && (!full || u > TL.grow[0] - 0.1);
    // Arrived before the office was warm: finish it now
    if (inOffice && this.warm.length) {
      this.warm.at(-1)!();
      this.warm.length = 0;
      this.office.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.visible = true; });
    }
    if (inOffice) {
      const l = liftAt(u);
      const planStage = stageAt(u) === "plan";
      this.hoverLift = damp(this.hoverLift, planStage && this.hoverZone >= 0 ? 0.17 : 0, 10, dt);
      const hoverOn = l.zone < 0 && this.hoverLift > 0.004 && this.hoverShown >= 0;
      this.office.update(dt, {
        plate: full ? smooth(TL.fade[0] + 0.05, TL.fade[1] - 0.2, u) : 1,
        ground: full ? smooth(TL.fade[1] - 0.2, TL.fade[1] + 0.1, u) : 1,
        grow: (full ? smooth(TL.grow[0], TL.grow[1], u) : 1) * (1 - sink),
        tint: (full ? smooth(TL.tint[0], TL.tint[1], u) : 1) * (1 - sink),
        zone: hoverOn ? this.hoverShown : l.zone,
        lift: hoverOn ? this.hoverLift : l.lift * (1 - sink),
        direct: hoverOn,
      });
    }

    const r = this.renderer;
    if (this.warm.length && full && !inOffice) this.warmStep(u);
    if (outside > 0.001 && this.ext) {
      this.ext.update(dt, time, {
        near: smoother(TL.tower[0], TL.tower[1], u),
        drawer: smoother(TL.drawer[0] - 0.25, TL.drawer[1] - 0.25, u),
        open: smooth(TL.drawer[0] + 0.3, TL.drawer[1] - 0.25, u),
        gone: smooth(TL.fade[0] + 0.05, TL.fade[1] - 0.15, u),
      });
      r.setRenderTarget(null);
      r.clear();
      if (this.extShadow) {
        r.shadowMap.needsUpdate = true;
        this.extShadow = false;
      }
      this.ext.setFade(1 - outside);
      r.render(this.ext.scene, this.camW);
      if (inOffice) this.drawOffice();
      this.stillFrames = 0;
      if (!half) this.gov.tick(raw);
    } else if (inOffice) {
      // Nothing moves in the office between scrolls: skip identical frames
      if (this.samePose() && !this.office.shadowDirty && this.sw < 0) this.stillFrames++;
      else this.stillFrames = 0;
      if (this.stillFrames < 4) {
        r.clear();
        this.drawOffice();
        if (this.stillFrames === 0) this.gov.tick(raw);
      }
    } else {
      r.clear();
    }

    if (!this.ready && (full ? outside > 0 || inOffice : inOffice)) {
      this.ready = true;
      this.ev.onReady?.();
    }
    this.placeLabels(u);
  };

  private drawOffice() {
    // Phones: while things move, the shadow follows every third frame
    if (this.office.shadowDirty && (this.q.high || ++this.shadowWait >= 3)) {
      this.renderer.shadowMap.needsUpdate = true;
      this.office.shadowDirty = false;
      this.shadowWait = 0;
    }
    this.renderer.render(this.office.scene, this.camL);
  }

  private samePose() {
    const a = this.local, b = this.lastPose;
    const same = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z) + Math.abs(a.yaw - b.yaw) + Math.abs(a.pitch - b.pitch) + Math.abs(a.dist - b.dist) + Math.abs(a.sx - b.sx) + Math.abs(a.sy - b.sy) < 0.0008;
    Object.assign(b, a);
    return same;
  }

  private placeLabels(u: number) {
    const on = this.office.loaded && u > TL.plan[0] - 0.1 && u < TL.zones + 0.1;
    if (!on) return;
    for (let i = 0; i < ZONE_COUNT; i++) {
      const el = this.labelEls[i];
      if (!el) continue;
      const [x, z] = ZONES[i].at;
      this.v.set(x, 0.3 + (this.hoverShown === i ? this.hoverLift * 2 : 0), z).project(this.camL);
      el.style.transform = `translate(${((this.v.x * 0.5 + 0.5) * this.w).toFixed(1)}px, ${((-this.v.y * 0.5 + 0.5) * this.h).toFixed(1)}px)`;
    }
  }

  /* ---------- pointer ---------- */

  private hoverShown = -1;

  private hover(u: number) {
    const stage = stageAt(u);
    const c = this.renderer.domElement;
    if (!this.pointer) {
      this.setHoverZone(-1);
      return;
    }
    if (this.ext && u < TL.drawer[0] - 0.05) {
      this.ray.setFromCamera(this.ndc, this.camW);
      const i = this.ext.pick(this.ray.ray);
      c.style.cursor = i >= 0 ? "pointer" : "";
      // Scrolling moves the tower under a resting pointer: that is not a choice
      if (this.moved) {
        if (i >= 0 && i !== this.hoverFloor) {
          this.hoverFloor = i;
          this.ev.onHoverFloor?.(i);
        } else if (i < 0) this.hoverFloor = -1;
      }
      this.setHoverZone(-1);
    } else if (stage === "plan" && this.office.loaded) {
      this.ray.setFromCamera(this.ndc, this.camL);
      const i = this.office.pick(this.ray.ray);
      c.style.cursor = i >= 0 ? "pointer" : "";
      this.setHoverZone(i);
    } else {
      c.style.cursor = "";
      this.setHoverZone(-1);
    }
    this.moved = false;
  }

  /** Also used by the room labels, so keyboard focus lifts a room too. */
  setHoverZone(i: number) {
    if (i === this.hoverZone) return;
    this.hoverZone = i;
    if (i >= 0) this.hoverShown = i;
    this.stillFrames = 0;
    this.ev.onHoverZone?.(i);
  }

  private track(e: PointerEvent) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (e.clientX !== this.at.x || e.clientY !== this.at.y) {
      this.moved = true;
      this.movedAt = performance.now();
    }
    this.at = { x: e.clientX, y: e.clientY };
    this.track(e);
    this.tilt.copy(this.ndc);
    this.pointer = true;
  };

  private onLeave = () => {
    this.pointer = false;
    this.hoverFloor = -1;
    this.tilt.set(0, 0);
  };

  private onDown = (e: PointerEvent) => {
    this.down = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };

  private onUp = (e: PointerEvent) => {
    // A tap, not a scroll or a drag
    if (Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) > 9 || e.timeStamp - this.down.t > 500) return;
    this.track(e);
    if (this.ext && this.uS < TL.drawer[0] - 0.05) {
      this.ray.setFromCamera(this.ndc, this.camW);
      const i = this.ext.pick(this.ray.ray);
      if (i >= 0) this.ev.onPickFloor?.(i, e.pointerType === "mouse");
    } else if (stageAt(this.uS) === "plan" && this.office.loaded) {
      this.ray.setFromCamera(this.ndc, this.camL);
      const i = this.office.pick(this.ray.ray);
      if (i >= 0) this.ev.onPickZone?.(i);
    }
  };

  private onLost = (e: Event) => {
    e.preventDefault();
    if (!this.disposed) this.ev.onError?.();
  };
}
