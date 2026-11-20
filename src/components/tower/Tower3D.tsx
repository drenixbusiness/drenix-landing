"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { canFetchHuge } from "@/lib/perf";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GroundedSkybox } from "three/examples/jsm/objects/GroundedSkybox.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/**
 * Tayyor 3D minora (public/models/tower.glb) haqiqiy landshaft panoramasi ichida:
 *  - fon: 8K panorama (Poly Haven "Lilienstein", CC0) yerga proyeksiyalangan — minora o‘tloqda turadi,
 *    shisha fasad shu panoramani aks ettiradi;
 *  - yuklanganda kamera pastdan yuqoriga ko‘tarilib minorani "ochadi", keyin sekin aylanadi;
 *  - sichqoncha ostidagi qavat modelning o‘zidan kesib olinadi va tortma kabi tashqariga suriladi
 *    (clipping: asosiy binoda shu qavat yashiriladi, nusxada faqat shu qavat qoladi);
 *  - scroll bo‘yicha kamera ajralib chiqqan qavatga sho‘ng‘iydi.
 */

type Props = {
  src?: string;
  floors: number;
  active: number;
  onHover: (i: number) => void;
  /** 0..1 — scroll bo‘yicha kamera qavatga sho‘ng‘ishi */
  zoom: MotionValue<number>;
  /** Faol qavat yorlig‘i (DOM) — har kadrda ekrandagi joyiga suriladi */
  labelRef?: React.RefObject<HTMLDivElement | null>;
  onReady?: () => void;
  onError?: () => void;
  className?: string;
  /** "high": bloom, 2× pixel ratio, 4K/8K panorama. "mid": phones/tablets — lighter. */
  tier?: "high" | "mid";
  /** Intro progress to start from (0..1). Above 0 when a matching poster is already on screen. */
  introFrom?: number;
};

// Qavatlar modelning qaysi balandlik oralig‘ida (ulushlarda) joylashadi
// (Singapore Office Skyscraper: podium balandlikning ~31% i, tom ~97%)
const BAND_FROM = 0.33;
const BAND_TO = 0.95;

/** Ajralgan qavat qanchaga kattalashadi va kameraga qancha suriladi */
const POP_SCALE = 0.08;
const POP_OUT = 0.32;

/** Panorama: kamera ro‘parasida ochiq ufq (quyosh va tog‘) turishi uchun burilish */
const BG_ROT = Math.PI + 1.45;
/** Panorama olingan balandlik (sahna birligida) — yer tekisligi masshtabi */
const CAPTURE_H = 1.2;
const BG_SMALL = "/hdri/landscape-2k.webp";
const BG_MEDIUM = "/hdri/landscape-4k.webp";
const BG_LARGE = "/hdri/landscape-8k.webp";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
/** Kadr tezligidan mustaqil so‘ndirish */
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

/** Tekislikdagi nuqtalarning qavariq qobig‘i (monotone chain) */
function hull2(pts: [number, number][]) {
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

const asArray = (m: THREE.Material | THREE.Material[]) => (Array.isArray(m) ? m : [m]);

export default function Tower3D({ src = "/models/tower.glb", floors, active, onHover, zoom, labelRef, onReady, onError, className = "", tier = "high", introFrom = 0 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const hoverRef = useRef(onHover);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { hoverRef.current = onHover; }, [onHover]);
  // Callback’lar ref’da — sahna har renderda qayta yaratilmasligi uchun
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);
  useEffect(() => { readyRef.current = onReady; errorRef.current = onError; }, [onReady, onError]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    const high = tier === "high";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio, high ? 2 : 1.25);

    // On high-DPI phones MSAA costs a lot and the extra pixels already smooth edges
    const renderer = new THREE.WebGLRenderer({ antialias: high || window.devicePixelRatio < 1.5, powerPreference: high ? "high-performance" : "default" });
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    renderer.setClearColor(0xb9cbe4, 1);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1200);
    const timer = new THREE.Timer();

    // ---------- Landshaft panoramasi (avval 4K, desktopda keyin 8K) ----------
    const pmrem = new THREE.PMREMGenerator(renderer);
    let envRT: THREE.WebGLRenderTarget | null = null;
    let sky: GroundedSkybox | null = null;
    const texLoader = new THREE.TextureLoader();
    const applyBg = (tex: THREE.Texture) => {
      if (disposed) { tex.dispose(); return; }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (!sky) {
        sky = new GroundedSkybox(tex, CAPTURE_H, 900, high ? 256 : 128);
        sky.position.y = CAPTURE_H;
        sky.rotation.y = BG_ROT;
        sky.renderOrder = -1;
        scene.add(sky);
      } else {
        const mat = sky.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.map = tex;
        mat.needsUpdate = true;
      }
      envRT?.dispose();
      envRT = pmrem.fromEquirectangular(tex);
      scene.environment = envRT.texture;
      scene.environmentRotation.y = BG_ROT;
    };
    // 2K first (fast); on desktop sharper versions arrive later, once the scene is on screen
    let bgReady = false;
    let announce = false;
    let modelReady = false;
    const upgrades: ReturnType<typeof setTimeout>[] = [];
    const maybeReady = () => {
      if (!bgReady || !modelReady || readyAt >= 0) return;
      readyAt = timer.getElapsed();
      // Tell the page only after the first frame is drawn, so the poster never fades to an empty canvas
      announce = true;
      // Phones/tablets get the 4K panorama a bit later; only strong desktops go to 8K
      upgrades.push(setTimeout(() => texLoader.load(BG_MEDIUM, (t) => {
        applyBg(t);
        if (high && canFetchHuge() && renderer.capabilities.maxTextureSize >= 8192) {
          upgrades.push(setTimeout(() => texLoader.load(BG_LARGE, applyBg), 4000));
        }
      }), high ? 2500 : 4000));
    };
    texLoader.load(BG_SMALL, (t) => {
      applyBg(t);
      bgReady = true;
      maybeReady();
    }, undefined, () => { bgReady = true; maybeReady(); });

    // Quyosh panoramadagi quyosh tomonda — minora orqasidan iliq kontur beradi
    const sun = new THREE.DirectionalLight(0xffe2c4, 2.0);
    sun.position.set(-18, 14, -30);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xdbe6ff, 0.7);
    fill.position.set(20, 12, 34);
    scene.add(fill);
    scene.add(new THREE.HemisphereLight(0xd6e4ff, 0x56663c, 0.5));

    // ---------- Post-processing: yorug‘lik chizig‘i "nur sochadi" ----------
    let composer: EffectComposer | null = null;
    let bloom: UnrealBloomPass | null = null;
    if (high) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.35, 0.3, 1.0);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
    }

    const root = new THREE.Group();
    scene.add(root);
    let H = 10; // normallashtirilgan balandlik
    let halfW = 1;
    const shaftCenter = new THREE.Vector3();
    const shaftSize = new THREE.Vector3(1, 1, 1);
    let model: THREE.Object3D | null = null;
    const meshes: THREE.Mesh[] = [];
    let ringY = 0;
    let readyAt = -1;
    let baseDist = 40;
    const bandH = () => (H * (BAND_TO - BAND_FROM)) / floors;
    const floorY = (i: number) => H * BAND_TO - bandH() * (i + 0.5); // i=0 — eng yuqori qavat

    // ---------- Qavatni kesib olish: clipping tekisliklari (dunyo koordinatalarida) ----------
    // Asosiy bino: [past; yuqori] oralig‘i yashiriladi (ikkala shart bajarilganda kesiladi)
    const cutTop = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const cutBot = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    // Nusxa: faqat shu oraliq qoladi
    const keepTop = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const keepBot = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const setBand = (yMid: number) => {
      const top = yMid + bandH() / 2, bot = yMid - bandH() / 2;
      cutTop.constant = -top;
      cutBot.constant = bot;
      keepTop.constant = top;
      keepBot.constant = -bot;
    };

    // Ajralgan qavat: model nusxasi
    const slice = new THREE.Group();
    const sliceMats: THREE.MeshStandardMaterial[] = [];
    slice.visible = false;
    scene.add(slice);
    // Pol plitalari: binoning ichida, tashqariga chiqmaydi (qavat ostida/ustida va bo‘shliq chetlarida)
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x4a4d52, roughness: 0.85, metalness: 0.05, envMapIntensity: 0.4 });
    const slabs: THREE.Mesh[] = [];
    let verts = new Float32Array(0);
    let slabFloor = -1;
    /** Qavat kesimi: shu qavat oralig‘idagi uchlarning XZ qobig‘i, binoning shakliga mos, biroz ichkarida */
    const slabGeoFor = (i: number) => {
      const bh = bandH(), yc = floorY(i);
      const pts: [number, number][] = [];
      for (let k = 0; k < verts.length; k += 3) {
        const y = verts[k + 1];
        if (y > yc - bh / 2 && y < yc + bh / 2) pts.push([verts[k] - shaftCenter.x, verts[k + 2] - shaftCenter.z]);
      }
      const h = pts.length >= 3 ? hull2(pts) : [];
      if (h.length < 3) return new THREE.BoxGeometry(shaftSize.x * 0.97, bh * 0.05, shaftSize.z * 0.97);
      let cx = 0, cz = 0;
      h.forEach(([x, z]) => { cx += x; cz += z; });
      cx /= h.length; cz /= h.length;
      const inset = 0.985;
      const shape = new THREE.Shape(h.map(([x, z]) => new THREE.Vector2(cx + (x - cx) * inset, cz + (z - cz) * inset)));
      const th = bh * 0.05;
      const g = new THREE.ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 1 });
      // Shakl XY tekisligida (y = z) — XZ ga aylantirib, qalinlik bo‘yicha markazlash
      g.rotateX(Math.PI / 2);
      g.translate(0, th / 2, 0);
      return g;
    };
    const updateSlabs = (i: number) => {
      if (i === slabFloor || !slabs.length) return;
      slabFloor = i;
      const g = slabGeoFor(i);
      slabs[0].geometry.dispose();
      slabs.forEach((m) => (m.geometry = g));
    };
    const gap = new THREE.Group();
    gap.visible = false;
    scene.add(gap);

    // Kadr: minora deyarli butun balandlikni egallaydi, kamera pastdan qaraydi
    const layout = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      composer?.setSize(w, h);
      bloom?.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const fovR = THREE.MathUtils.degToRad(30);
      const dist = H / 0.86 / 2 / Math.tan(fovR / 2);
      // Tor ekranda kenglik bo‘yicha ham sig‘dirish
      const distW = (halfW * 2) / (camera.aspect < 0.8 ? 0.68 : 0.5) / 2 / (Math.tan(fovR / 2) * camera.aspect);
      baseDist = Math.max(dist, distW);
    };

    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        // O‘lchash va normallashtirish: balandlik = 10 birlik, poydevor y=0, markaz x=z=0
        const box = new THREE.Box3().setFromObject(model);
        model.scale.setScalar(10 / box.getSize(new THREE.Vector3()).y);
        const box2 = new THREE.Box3().setFromObject(model);
        const c = box2.getCenter(new THREE.Vector3());
        model.position.set(-c.x, -box2.min.y, -c.z);
        const fin = new THREE.Box3().setFromObject(model);
        H = fin.getSize(new THREE.Vector3()).y;
        // Podiumdan yuqoridagi uchlar bo‘yicha minora tanasining chegaralari
        model.updateMatrixWorld(true);
        const v = new THREE.Vector3();
        const shaft = new THREE.Box3();
        const all: number[] = [];
        model.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          const pos = m.geometry.getAttribute("position");
          for (let k = 0; k < pos.count; k++) {
            v.fromBufferAttribute(pos, k).applyMatrix4(m.matrixWorld);
            if (v.y > H * (BAND_FROM + 0.04)) shaft.expandByPoint(v);
            if (v.y > H * BAND_FROM - 1 && v.y < H * BAND_TO + 1) all.push(v.x, v.y, v.z);
          }
        });
        verts = new Float32Array(all);
        if (shaft.isEmpty()) shaft.copy(fin);
        shaft.getSize(shaftSize);
        shaft.getCenter(shaftCenter);
        shaftCenter.y = 0;
        halfW = Math.max(shaftSize.x, shaftSize.z) / 2;

        // Materiallar: shisha panoramani aks ettirsin, ichki qism iliq yonsin
        model.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          meshes.push(m);
          asArray(m.material).forEach((mat) => {
            const sm = mat as THREE.MeshStandardMaterial;
            const name = sm.name ?? "";
            if (name === "GLASS_BUILDING") {
              sm.metalness = 0.55;
              sm.roughness = 0.16;
              sm.envMapIntensity = 1.4;
            } else if (name === "Interior" || name === "Emmsive") {
              sm.emissive = new THREE.Color(0xffc690);
              sm.emissiveMap = sm.map;
              sm.emissiveIntensity = 0.8;
            } else if ("envMapIntensity" in sm) {
              sm.envMapIntensity = 1.1;
            }
          });
        });

        // Nusxa: faqat tanlangan qavat (o‘z materiallari bilan — iliqroq yonadi)
        const copy = model.clone(true);
        copy.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          const mats = asArray(m.material).map((mat) => {
            const sm = (mat as THREE.MeshStandardMaterial).clone();
            sm.clippingPlanes = [keepTop, keepBot];
            sm.clipShadows = true;
            sliceMats.push(sm);
            return sm;
          });
          m.material = Array.isArray(m.material) ? mats : mats[0];
        });
        // Asosiy bino: tanlangan qavat oralig‘i kesiladi
        model.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          asArray(m.material).forEach((mat) => {
            mat.clippingPlanes = [cutTop, cutBot];
            mat.clipIntersection = true;
          });
        });
        root.add(model);

        // Nusxa minora markazi atrofida kattalashadi
        copy.position.x -= shaftCenter.x;
        copy.position.z -= shaftCenter.z;
        slice.add(copy);
        for (let k = 0; k < 4; k++) {
          const m = new THREE.Mesh(new THREE.BufferGeometry(), slabMat);
          slabs.push(m);
          (k < 2 ? slice : gap).add(m);
        }
        gap.position.set(shaftCenter.x, 0, shaftCenter.z);
        slice.visible = true;
        updateSlabs(activeRef.current);
        ringY = floorY(activeRef.current);
        setBand(ringY);
        layout();
        modelReady = true;
        maybeReady();
      },
      undefined,
      () => errorRef.current?.(),
    );

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(mount);

    // Sichqoncha: qavatni aniqlash va parallaks
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2(9, 9);
    const tilt = new THREE.Vector2();
    const tiltS = new THREE.Vector2();
    let pointerInside = false;
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      tilt.copy(ndc);
      pointerInside = true;
    };
    const onLeave = () => { pointerInside = false; tilt.set(0, 0); };
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(mount);

    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    const heroPos = new THREE.Vector3();
    const heroLook = new THREE.Vector3();
    const near = new THREE.Vector3();
    const nearLook = new THREE.Vector3();
    const out = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    let zS = 0;
    let pop = 0;
    let popV = 0;
    let lastActive = activeRef.current;
    let lastHover = -1;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      timer.update();
      const t = timer.getElapsed();
      const dt = Math.min(timer.getDelta(), 0.05);
      zS = damp(zS, zoom.get(), 5, dt);
      // Fully dived in: the interior photo covers the canvas, so stop drawing
      if (zS > 0.995 && zoom.get() >= 0.999) return;
      const ez = zS;
      const bh = bandH();

      // Ray-cast: qaysi qavat ustidamiz (faqat hero holatida)
      if (pointerInside && meshes.length && ez < 0.05) {
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(meshes, false)[0];
        if (hit) {
          const i = Math.floor((H * BAND_TO - hit.point.y) / bh);
          if (i >= 0 && i < floors && i !== lastHover) {
            lastHover = i;
            hoverRef.current(i);
          }
          mount.style.cursor = "pointer";
        } else {
          mount.style.cursor = "";
        }
      }

      // ---------- Ajralgan qavat ----------
      // Qavat almashganda: avvalgisi binoga kirib ketadi, kesik yangi qavatga suriladi, so‘ng tortma kabi chiqadi
      const goalY = floorY(activeRef.current);
      if (activeRef.current !== lastActive) {
        lastActive = activeRef.current;
        popV -= 2.2;
      }
      const travel = Math.min(1, Math.abs(goalY - ringY) / (bh * 0.5));
      // Kesik faqat qavat deyarli ichkarida bo‘lganda siljiydi — chok ko‘rinmaydi
      if (pop < 0.15 || travel < 0.02) ringY = damp(ringY, goalY, 6, dt);
      if (Math.abs(goalY - ringY) < 0.001) ringY = goalY;
      const popGoal = readyAt < 0 ? 0 : travel > 0.02 ? 0 : 1;
      popV += (popGoal - pop) * 60 * dt;
      popV *= Math.exp(-10 * dt);
      pop = Math.max(-0.05, pop + popV * dt);
      setBand(ringY);

      // Kamera tomon (gorizontal) yo‘nalish — qavat aynan tomoshabinga qarab chiqadi
      out.set(camera.position.x - shaftCenter.x, 0, camera.position.z - shaftCenter.z).normalize();
      const s = 1 + POP_SCALE * pop;
      slice.position.set(shaftCenter.x, 0, shaftCenter.z).addScaledVector(out, POP_OUT * halfW * pop);
      slice.scale.set(s, 1, s);
      const frontZ = slice.position.z + shaftSize.z * 0.5 * s;
      if (slabs.length) {
        if (Math.abs(goalY - ringY) < 1e-3) updateSlabs(activeRef.current);
        const th = bh * 0.05;
        // Ajralgan qavatning poli va shifti (chegaradan ichkarida)
        slabs[0].position.y = ringY - bh / 2 + th / 2;
        slabs[1].position.y = ringY + bh / 2 - th / 2;
        // Binodagi bo‘shliq: pastki qismning tepasi, yuqori qismning osti
        slabs[2].position.y = ringY - bh / 2 - th / 2;
        slabs[3].position.y = ringY + bh / 2 + th / 2;
        gap.visible = pop > 0.01;
      }

      // ---------- Kamera ----------
      tiltS.x = damp(tiltS.x, tilt.x, 1.8, dt);
      tiltS.y = damp(tiltS.y, tilt.y, 1.8, dt);
      // Kirish animatsiyasi: pastdan, yaqindan, burchakdan — joyiga ko‘tariladi
      const k = readyAt < 0 ? 0 : reduced ? 1 : easeInOut(introFrom + (1 - introFrom) * clamp01((t - readyAt) / (4.4 * (1 - introFrom * 0.6))));
      const idle = reduced ? 0 : Math.sin(t * 0.11) * 0.1 + Math.sin(t * 0.05) * 0.05;
      const yaw = 0.34 + idle + tiltS.x * 0.1 + (1 - k) * 0.85;
      const dist = baseDist * (0.55 + 0.45 * k);
      const camY = THREE.MathUtils.lerp(H * 0.05, H * 0.16 + tiltS.y * H * 0.05, k);
      heroPos.set(shaftCenter.x + Math.sin(yaw) * dist, camY, shaftCenter.z + Math.cos(yaw) * dist);
      heroLook.set(shaftCenter.x, THREE.MathUtils.lerp(H * 0.8, H * 0.55, k), shaftCenter.z);

      // Sho‘ng‘ish: avval qavat ro‘parasiga, keyin uning ichiga
      const d1 = smooth(0, 0.62, ez);
      const d2 = smooth(0.5, 1, ez);
      near.set(slice.position.x, ringY, frontZ + THREE.MathUtils.lerp(halfW * 3.4, -shaftSize.z * 0.1, d2));
      nearLook.set(slice.position.x, ringY, shaftCenter.z - shaftSize.z);
      camPos.copy(heroPos).lerp(near, d1);
      camLook.copy(heroLook).lerp(nearLook, d1);
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      const fov = 30 + d2 * 22;
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }

      if (composer) composer.render(dt);
      else renderer.render(scene, camera);
      if (announce) {
        announce = false;
        readyRef.current?.();
      }

      // DOM yorlig‘i: ajralgan qavatning chap qirrasi ekranda qayerda
      if (labelRef?.current && model) {
        tmp.set(slice.position.x - shaftSize.x * 0.5 * s - 0.05, ringY, frontZ).project(camera);
        const x = (tmp.x * 0.5 + 0.5) * mount.clientWidth;
        const y = (-tmp.y * 0.5 + 0.5) * mount.clientHeight;
        labelRef.current.style.transform = `translate(${x}px, ${y}px)`;
        labelRef.current.style.opacity = ez > 0.04 || k < 0.6 || pop < 0.5 ? "0" : "1";
      }
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      upgrades.forEach(clearTimeout);
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("pointerleave", onLeave);
      draco.dispose();
      envRT?.dispose();
      pmrem.dispose();
      composer?.dispose();
      if (sky) (sky.material as THREE.MeshBasicMaterial).map?.dispose();
      sliceMats.forEach((m) => m.dispose());
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, floors, zoom, labelRef, tier, introFrom]);

  return <div ref={mountRef} className={className} />;
}
