"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Tayyor izometrik ofis modeli (public/models/office.glb).
 * AURUM’dagi oq maket uslubiga keltiriladi: to‘yingan ranglar (yashil devorlar va h.k.)
 * iliq oq rangga o‘tkaziladi, yog‘och va to‘q sariq aksentlar saqlanadi.
 */

export type OfficeLabel = { id: string; name: string; no: string; x: number; z: number };

/**
 * Xonalar markazlari — maket normallashtirilgandan keyingi koordinatalarda
 * (kenglik 20 birlik, markaz 0;0). Tepadan render qilingan reja bo‘yicha o‘lchangan.
 */
export const officeLabels: OfficeLabel[] = [
  { id: "view", no: "01", name: "Panorama", x: -6.7, z: -3.9 },
  { id: "dev", no: "02", name: "Engineering", x: -2.2, z: -3.7 },
  { id: "growth", no: "03", name: "Growth", x: 4.3, z: -3.7 },
  { id: "meeting", no: "04", name: "Strategy", x: -6.5, z: 2.1 },
  { id: "design", no: "05", name: "Design", x: -2.2, z: 2.1 },
  { id: "servers", no: "06", name: "Cloud & AI", x: 2.4, z: 2.5 },
  { id: "lounge", no: "07", name: "Launchpad", x: 7.2, z: 2.1 },
];

type Props = {
  src?: string;
  labels?: OfficeLabel[];
  onPick?: (id: string) => void;
  /** 0..1 — scroll bo‘yicha kamera aylanishi va yaqinlashishi */
  progress: MotionValue<number>;
  onReady?: () => void;
  onError?: () => void;
  className?: string;
  /** Render only while the plan is on screen — saves GPU while the tower is shown */
  live?: boolean;
  tier?: "high" | "mid";
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function toAurum(mat: THREE.MeshStandardMaterial) {
  const c = mat.color;
  if (!c) return;
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  // Yashil/ko‘k/binafsha devorlar — oq maketga; yog‘och (to‘q sariq-jigarrang) saqlanadi
  const isWoodOrAccent = hsl.h > 0.02 && hsl.h < 0.12;
  if (hsl.s > 0.35 && !isWoodOrAccent) {
    c.setHSL(0.08, 0.1, Math.max(0.82, hsl.l));
  }
  // Oq devorlar biroz iliq kulrang — soyalar ko‘rinsin, "kuyib" ketmasin
  if (hsl.l > 0.9 && hsl.s < 0.1) c.setHSL(0.08, 0.06, 0.86);
  mat.roughness = Math.max(mat.roughness ?? 0.6, 0.6);
  mat.envMapIntensity = 0.45;
}

export default function Office3D({ src = "/models/office.glb", labels = officeLabels, onPick, progress, onReady, onError, className = "", live = true, tier = "high" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelEls = useRef<(HTMLDivElement | null)[]>([]);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);
  useEffect(() => { readyRef.current = onReady; errorRef.current = onError; }, [onReady, onError]);
  const liveRef = useRef(live);
  useEffect(() => { liveRef.current = live; }, [live]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const high = tier === "high";
    const renderer = new THREE.WebGLRenderer({ antialias: high || window.devicePixelRatio < 1.5, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, high ? 2 : 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);

    // Asosiy yorug‘lik — past burchakdan, uzun yumshoq soyalar beradi (maket fotosuratidagi kabi)
    const sun = new THREE.DirectionalLight(0xfff0e2, 3.2);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(high ? 4096 : 1536);
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 5;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xfffaf4, 0x8f877d, 0.55));

    const pmrem = new THREE.PMREMGenerator(renderer);
    // Procedural studio lighting: same soft reflections as an HDR, with nothing to download
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.8;

    // Soya tushadigan "stol" — maket ostidagi yumshoq soya
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pivot = new THREE.Group();
    scene.add(pivot);
    const build = new THREE.Group();
    build.scale.y = 0.02;
    const tints = new Map<THREE.MeshStandardMaterial, THREE.Color>();
    const maquette = new THREE.Color(0xeeebe6);
    let R = 10;

    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const s = 20 / Math.max(size.x, size.z);
        model.scale.setScalar(s);
        const b2 = new THREE.Box3().setFromObject(model);
        const c = b2.getCenter(new THREE.Vector3());
        model.position.set(-c.x, -b2.min.y, -c.z);
        R = 9.4;
        model.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          m.castShadow = true;
          m.receiveShadow = true;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => {
            const sm = mat as THREE.MeshStandardMaterial;
            toAurum(sm);
            // Oq maketdan rangli ofisga o‘tish uchun yakuniy rangni eslab qolamiz
            if (sm.color && !tints.has(sm)) tints.set(sm, sm.color.clone());
          });
        });
        // Devorlar poldan "o‘sib" chiqadi — guruhni y bo‘yicha cho‘zamiz
        build.add(model);
        pivot.add(build);
        // Maket ostidagi oq poydevor plita (AURUM'dagi kabi)
        const fb = new THREE.Box3().setFromObject(model);
        const fsz = fb.getSize(new THREE.Vector3());
        const plinth = new THREE.Mesh(
          new THREE.BoxGeometry(fsz.x + 0.8, 0.5, fsz.z + 0.8),
          new THREE.MeshStandardMaterial({ color: 0xf2efea, roughness: 0.9 }),
        );
        plinth.position.set(0, -0.25, 0);
        plinth.receiveShadow = true;
        plinth.castShadow = false;
        pivot.add(plinth);
        ground.position.y = -0.5;
        const sc = sun.shadow.camera as THREE.OrthographicCamera;
        sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 120;
        sun.position.set(-16, 26, 18);
        layout();
        setShown(true);
        readyRef.current?.();
      },
      undefined,
      () => errorRef.current?.(),
    );

    let portrait = false;
    const layout = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      portrait = aspect < 0.9;
      // Portret ekranda maket 90° buriladi — uzun tomoni vertikal, kenglik bo‘yicha sig‘diramiz
      const view = portrait ? (R * 1.02) / aspect : R;
      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;
      camera.updateProjectionMatrix();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(mount);

    const timer = new THREE.Timer();
    let raf = 0;
    let pS = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      timer.update();
      if (!visible || !liveRef.current) return;
      const t = timer.getElapsed();
      const dt = Math.min(timer.getDelta(), 0.05);
      pS += (progress.get() - pS) * (1 - Math.exp(-5 * dt));
      const p = pS;
      // 1) devorlar o‘sadi, 2) oq maket ranglarga to‘ladi, 3) kamera tepadan izometriyaga tushadi
      const grow = smooth(0.02, 0.2, p);
      const tint = smooth(0.16, 0.42, p);
      const land = smooth(0, 0.34, p);
      build.scale.y = 0.02 + 0.98 * grow;
      tints.forEach((to, mat) => mat.color.copy(maquette).lerp(to, tint));
      if (labelsRef.current) labelsRef.current.style.opacity = String(smooth(0.2, 0.3, p));
      // Yuqoridan, ochiq tomondan: mebel devorlar ortida qolmaydi
      const yaw = THREE.MathUtils.degToRad((portrait ? 112 : 28) + (1 - land) * 38 - p * 18 + Math.sin(t * 0.2) * 1.5);
      const pitch = THREE.MathUtils.degToRad(84 - land * 28 - p * 6);
      const dist = 40;
      camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
      camera.lookAt(0, 0.6, 0);
      camera.zoom = 0.74 + land * 0.16 + p * 0.18;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      // Yorliqlar: xona polidagi nuqta ekranning qayerida
      const w = mount.clientWidth, h = mount.clientHeight;
      labels.forEach((l, i) => {
        const el = labelEls.current[i];
        if (!el) return;
        proj.set(l.x, 0.15, l.z).project(camera);
        el.style.transform = `translate(${(proj.x * 0.5 + 0.5) * w}px, ${(-proj.y * 0.5 + 0.5) * h}px)`;
      });
    };
    const proj = new THREE.Vector3();
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      draco.dispose();
      envRT.dispose();
      pmrem.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, progress, labels, tier]);

  return (
    <div className={`${className.includes("absolute") ? "" : "relative"} ${className}`}>
      <div ref={mountRef} className="absolute inset-0" />
      {/* Xona yorliqlari — AURUM’dagi kabi: poldagi nuqta, ingichka chiziq va pill */}
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${shown ? "opacity-100" : "opacity-0"}`}>
        <div ref={labelsRef} className="absolute inset-0 opacity-0">
        {labels.map((l, i) => (
          <div key={l.id} ref={(el) => { labelEls.current[i] = el; }} className="absolute left-0 top-0 will-change-transform">
            <span className="absolute -left-[4px] -top-[4px] size-2 rounded-full bg-graphite ring-4 ring-white/70" />
            <span className="absolute bottom-0 left-0 h-9 w-px -translate-y-1 bg-graphite/50" />
            <button
              type="button"
              onClick={() => onPick?.(l.id)}
              className="label group pointer-events-auto absolute bottom-10 left-0 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white/95 p-1 sm:py-1.5 sm:pl-1.5 sm:pr-3 text-[9px] text-graphite shadow-[0_8px_24px_-8px_rgba(20,20,20,0.35)] backdrop-blur transition-colors hover:bg-graphite hover:text-white"
            >
              <span className="grid size-5 place-items-center rounded-full bg-stone text-[8px] text-graphite transition-colors group-hover:bg-ember group-hover:text-white">{l.no}</span>
              <span className="hidden sm:inline">{l.name}</span>
            </button>
          </div>
        ))}
        </div>
      </div>
      {/* Mobil: xonalar ro‘yxati (yorliqlarda faqat raqam) */}
      <div className={`absolute inset-x-4 bottom-0 flex flex-wrap justify-center gap-1.5 transition-opacity duration-700 sm:hidden ${shown ? "opacity-100" : "opacity-0"}`}>
        {labels.map((l) => (
          <button key={l.id} type="button" onClick={() => onPick?.(l.id)} className="label flex items-center gap-1.5 rounded-full bg-white/90 py-1 pl-1 pr-2.5 text-[8px] text-graphite">
            <span className="grid size-4 place-items-center rounded-full bg-stone text-[7px]">{l.no}</span>
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
