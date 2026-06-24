"use client";

import { useEffect, useMemo, useRef } from "react";
// three ships JS only in this project's setup; we type the surface we touch
// locally below and suppress the missing-declarations error on the import.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — three module ships without TypeScript declarations
import * as THREEUntyped from "three";

import type { BodySystem } from "@/lib/types";

// ---- Local THREE type shim (only the surface this component uses) ----------
interface V3 {
  set: (x: number, y: number, z: number) => void;
  setScalar: (n: number) => void;
  x: number;
  y: number;
  z: number;
}
interface Obj3D {
  position: V3;
  rotation: { x: number; y: number; z: number };
  scale: V3;
  add: (o: unknown) => void;
}
interface Disposable {
  dispose: () => void;
}
interface Geometry extends Disposable {
  setAttribute: (name: string, attr: unknown) => void;
}
interface Renderer {
  setPixelRatio: (n: number) => void;
  setSize: (w: number, h: number, updateStyle?: boolean) => void;
  setClearColor: (color: number, alpha: number) => void;
  render: (scene: unknown, camera: unknown) => void;
  dispose: () => void;
  domElement: HTMLCanvasElement;
}
interface MatParams {
  color: number;
  transparent?: boolean;
  opacity?: number;
  blending?: number;
  depthWrite?: boolean;
  wireframe?: boolean;
}
interface ThreeNS {
  Scene: new () => Obj3D;
  Group: new () => Obj3D;
  PerspectiveCamera: new (
    fov: number,
    aspect: number,
    near: number,
    far: number,
  ) => Obj3D & { lookAt: (x: number, y: number, z: number) => void };
  WebGLRenderer: new (p?: { alpha?: boolean; antialias?: boolean }) => Renderer;
  BufferGeometry: new () => Geometry;
  Float32BufferAttribute: new (arr: number[], itemSize: number) => unknown;
  LineBasicMaterial: new (p: MatParams) => Disposable;
  LineSegments: new (g: Geometry, m: Disposable) => Obj3D;
  SphereGeometry: new (r: number, w: number, h: number) => Geometry;
  MeshBasicMaterial: new (p: MatParams) => Disposable;
  Mesh: new (g: Geometry, m: Disposable) => Obj3D;
  AdditiveBlending: number;
}
const THREE = THREEUntyped as unknown as ThreeNS;

// ---- Palette ---------------------------------------------------------------
const BONE = 0x5fd8ff; // holographic cyan
const JOINT = 0x9af0ff; // brighter cyan
const LIME = 0xc6ff3a; // active target
const ROSE = 0xff3b6b; // warning target
const SCAN = 0x7fe9ff;

type Triple = [number, number, number];

// Anchor points (skeleton-local space, y up) for each body system node.
const REGION_POS: Record<BodySystem, Triple> = {
  brain: [0, 1.52, 0.08],
  heart: [-0.16, 0.52, 0.18],
  liver: [0.22, 0.2, 0.18],
  gut: [0, -0.02, 0.2],
  muscles: [0.5, 0.22, 0.06],
  bones: [0, -1.05, 0.06],
  immune: [0, 0.78, 0.16],
  skin: [-0.46, 0.62, 0.12],
};

const JOINTS: Triple[] = [
  [-0.46, 1.02, 0], [0.46, 1.02, 0], // shoulders
  [-0.6, 0.5, 0.03], [0.6, 0.5, 0.03], // elbows
  [-0.585, -0.02, 0.06], [0.585, -0.02, 0.06], // wrists
  [-0.26, -0.52, 0], [0.26, -0.52, 0], // hips
  [-0.2, -1.15, 0.03], [0.2, -1.15, 0.03], // knees
  [-0.18, -1.62, 0.05], [0.18, -1.62, 0.05], // ankles
];

// Build the skeleton as a flat list of line-segment vertex pairs.
function buildBones(): number[] {
  const v: number[] = [];
  const seg = (a: Triple, b: Triple) => v.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const poly = (pts: Triple[]) => {
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1]);
  };

  // Spine + vertebra ticks
  const spineTop = 1.18, spineBot = -0.5, NV = 9;
  let prev: Triple = [0, spineTop, 0];
  for (let i = 1; i <= NV; i++) {
    const y = spineTop + (spineBot - spineTop) * (i / NV);
    const cur: Triple = [0, y, 0];
    seg(prev, cur);
    seg([-0.045, y, 0], [0.045, y, 0]);
    prev = cur;
  }
  // Neck
  seg([0, 1.34, 0], [0, 1.18, 0]);
  // Clavicles
  seg([0, 1.12, 0], [-0.46, 1.02, 0]);
  seg([0, 1.12, 0], [0.46, 1.02, 0]);
  // Arms
  poly([[-0.46, 1.02, 0], [-0.6, 0.5, 0.03], [-0.585, -0.02, 0.06], [-0.58, -0.18, 0.08]]);
  poly([[0.46, 1.02, 0], [0.6, 0.5, 0.03], [0.585, -0.02, 0.06], [0.58, -0.18, 0.08]]);
  // Hands (small splay)
  for (const s of [-1, 1]) {
    const wx = s * 0.58;
    for (const dx of [-0.04, 0, 0.04]) seg([wx, -0.18, 0.08], [wx + dx, -0.3, 0.1]);
  }
  // Ribcage: sternum + 4 ribs per side
  seg([0, 0.98, 0.09], [0, 0.18, 0.09]);
  for (let k = 0; k < 4; k++) {
    const yTop = 0.92 - k * 0.2;
    const rx = 0.42 - k * 0.03;
    const drop = 0.34, N = 10;
    const left: Triple[] = [], right: Triple[] = [];
    for (let j = 0; j <= N; j++) {
      const a = Math.PI * (j / N);
      const x = Math.sin(a) * rx;
      const y = yTop - ((1 - Math.cos(a)) / 2) * drop;
      const z = Math.sin(a) * 0.1;
      left.push([-x, y, z]);
      right.push([x, y, z]);
    }
    poly(left);
    poly(right);
  }
  // Pelvis
  seg([0, -0.5, 0], [-0.26, -0.52, 0]);
  seg([0, -0.5, 0], [0.26, -0.52, 0]);
  poly([[-0.26, -0.52, 0], [-0.2, -0.66, 0.05], [0, -0.62, 0.06], [0.2, -0.66, 0.05], [0.26, -0.52, 0]]);
  // Legs
  poly([[-0.26, -0.52, 0], [-0.2, -1.15, 0.03], [-0.18, -1.62, 0.05]]);
  poly([[0.26, -0.52, 0], [0.2, -1.15, 0.03], [0.18, -1.62, 0.05]]);
  // Feet
  seg([-0.18, -1.62, 0.05], [-0.18, -1.7, 0.2]);
  seg([0.18, -1.62, 0.05], [0.18, -1.7, 0.2]);

  return v;
}

// Horizontal circle (x-z plane) as line-segment pairs — the moving scan ring.
function buildRing(radius: number, segments: number): number[] {
  const v: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    v.push(Math.cos(a0) * radius, 0, Math.sin(a0) * radius);
    v.push(Math.cos(a1) * radius, 0, Math.sin(a1) * radius);
  }
  return v;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface ActiveRegion {
  system: BodySystem;
  warning: boolean;
}

export function AnatomyHologram({ active }: { active: ActiveRegion[] }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // Stable key so the effect only re-runs when the active set really changes.
  const activeKey = useMemo(
    () => active.map((a) => `${a.system}${a.warning ? "!" : ""}`).sort().join(","),
    [active],
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // De-dupe systems (a system can be targeted by several picks).
    const seen = new Map<BodySystem, boolean>();
    for (const a of active) {
      seen.set(a.system, (seen.get(a.system) ?? false) || a.warning);
    }

    const reduced = prefersReducedMotion();
    const isDesktop =
      typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
    const width = isDesktop ? 320 : 260;
    const height = isDesktop ? 400 : 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const disposables: Disposable[] = [];
    const group = new THREE.Group();
    group.rotation.x = 0.12;
    group.scale.setScalar(0.9);
    scene.add(group);

    // Skeleton bones (single draw call).
    const boneGeo = new THREE.BufferGeometry();
    boneGeo.setAttribute("position", new THREE.Float32BufferAttribute(buildBones(), 3));
    const boneMat = new THREE.LineBasicMaterial({
      color: BONE,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.LineSegments(boneGeo, boneMat));
    disposables.push(boneGeo, boneMat);

    // Skull — wireframe sphere.
    const skullGeo = new THREE.SphereGeometry(0.27, 16, 12);
    const skullMat = new THREE.MeshBasicMaterial({
      color: BONE,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const skull = new THREE.Mesh(skullGeo, skullMat);
    skull.position.set(0, 1.5, 0);
    group.add(skull);
    disposables.push(skullGeo, skullMat);

    // Joints — bright additive points.
    const jointGeo = new THREE.SphereGeometry(0.038, 10, 8);
    const jointMat = new THREE.MeshBasicMaterial({
      color: JOINT,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(jointGeo, jointMat);
    for (const [x, y, z] of JOINTS) {
      const j = new THREE.Mesh(jointGeo, jointMat);
      j.position.set(x, y, z);
      group.add(j);
    }

    // Active region nodes — pulsing core + halo.
    const pulse: { mesh: Obj3D; phase: number; base: number }[] = [];
    let phase = 0;
    for (const [system, warn] of seen.entries()) {
      const pos = REGION_POS[system];
      if (!pos) continue;
      const color = warn ? ROSE : LIME;

      const haloGeo = new THREE.SphereGeometry(0.17, 14, 10);
      const haloMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(pos[0], pos[1], pos[2]);
      group.add(halo);
      disposables.push(haloGeo, haloMat);
      pulse.push({ mesh: halo, phase, base: 1 });

      const coreGeo = new THREE.SphereGeometry(0.072, 14, 10);
      const coreMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(pos[0], pos[1], pos[2]);
      group.add(core);
      disposables.push(coreGeo, coreMat);
      pulse.push({ mesh: core, phase, base: 1 });

      phase += 1.1;
    }

    // Moving scan ring.
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(buildRing(0.56, 48), 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: SCAN,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.LineSegments(ringGeo, ringMat);
    group.add(ring);
    disposables.push(ringGeo, ringMat);

    let raf = 0;
    let inView = true;
    const start = performance.now();
    let last = start;

    const frame = (animate: boolean) => {
      const now = performance.now();
      const t = (now - start) / 1000;
      if (animate) {
        const dt = (now - last) / 1000;
        group.rotation.y += 0.45 * dt;
        for (const p of pulse) {
          p.mesh.scale.setScalar(p.base * (1 + 0.28 * Math.sin(t * 2.6 + p.phase)));
        }
        // Scan ring sweeps bottom→top on a loop.
        ring.position.y = -1.55 + ((t * 0.45) % 1) * 3.0;
      }
      last = now;
      renderer.render(scene, camera);
    };

    let observer: IntersectionObserver | undefined;
    const tick = () => {
      raf = 0;
      if (!inView) return;
      frame(true);
      raf = window.requestAnimationFrame(tick);
    };

    if (reduced) {
      ring.position.y = 0;
      frame(false);
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            inView = e.isIntersecting;
            if (inView && raf === 0) {
              last = performance.now();
              raf = window.requestAnimationFrame(tick);
            }
          }
        },
        { threshold: 0 },
      );
      observer.observe(mount);
      raf = window.requestAnimationFrame(tick);
    }

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [activeKey, active]);

  return (
    <div className="relative rounded-2xl border border-[#5fd8ff]/20 overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,rgba(95,216,255,0.12),rgba(8,12,24,0.96)_70%)]">
      <div
        ref={mountRef}
        role="img"
        aria-label="Rotating holographic skeleton highlighting where your stack acts in the body"
        className="mx-auto h-[340px] w-[260px] sm:h-[400px] sm:w-[320px]"
      />
      <span className="pointer-events-none absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-[#7fe9ff]/60">
        Live body scan
      </span>
    </div>
  );
}
