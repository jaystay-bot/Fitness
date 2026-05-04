"use client";

import { useEffect, useRef } from "react";
// three v0.160 ships JS only. Suppress the implicit-any here; usage is typed locally.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — three module ships without TypeScript declarations
import * as THREEUntyped from "three";

import type { EvidenceTier } from "@/lib/types";

// Local type shim covering only the surface we touch in this component.
type Mountable = { dispose: () => void };
type Vec = { set: (x: number, y: number, z: number) => void };
interface ThreeObject {
  position: Vec & { y: number };
  rotation: { x: number; y: number };
  add: (child: unknown) => void;
}
interface Scene extends ThreeObject {}
interface Group extends ThreeObject {}
interface Mesh extends ThreeObject {}
interface PerspectiveCamera extends ThreeObject {
  lookAt: (x: number, y: number, z: number) => void;
}
interface Renderer {
  setPixelRatio: (n: number) => void;
  setSize: (w: number, h: number, updateStyle?: boolean) => void;
  setClearColor: (color: number, alpha: number) => void;
  render: (scene: Scene, camera: PerspectiveCamera) => void;
  dispose: () => void;
  domElement: HTMLCanvasElement;
}
interface ThreeNS {
  Scene: new () => Scene;
  Group: new () => Group;
  PerspectiveCamera: new (
    fov: number,
    aspect: number,
    near: number,
    far: number,
  ) => PerspectiveCamera;
  WebGLRenderer: new (params?: {
    alpha?: boolean;
    antialias?: boolean;
  }) => Renderer;
  CylinderGeometry: new (
    radiusTop: number,
    radiusBottom: number,
    height: number,
    radialSegments: number,
    heightSegments: number,
  ) => Mountable;
  MeshStandardMaterial: new (params?: {
    color: number;
    roughness?: number;
    metalness?: number;
  }) => Mountable;
  Mesh: new (geometry: Mountable, material: Mountable) => Mesh;
  DirectionalLight: new (color: number, intensity: number) => ThreeObject;
  AmbientLight: new (color: number, intensity: number) => ThreeObject;
}
const THREE = THREEUntyped as unknown as ThreeNS;

const ROTATION_RAD_PER_SEC = 0.3;

const TIER_CAP_HEX: Record<EvidenceTier, number> = {
  Strong: 0xd4ff3a,
  Moderate: 0xff6b35,
  Emerging: 0x0a0a0a,
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SupplementBottle3D({
  name,
  tier,
}: {
  name: string;
  tier: EvidenceTier;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    const width = isDesktop ? 280 : 200;
    const height = isDesktop ? 320 : 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x0a0a0a, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 48, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafaf7,
      roughness: 0.55,
      metalness: 0.05,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.1;

    const capGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 48, 1);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: TIER_CAP_HEX[tier],
      roughness: 0.4,
      metalness: 0.1,
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 1.025;

    group.add(body);
    group.add(cap);
    group.rotation.x = 0.18;
    scene.add(group);

    const directional = new THREE.DirectionalLight(0xfafaf7, 1.05);
    directional.position.set(-3.5, 4, 5);
    scene.add(directional);

    const ambient = new THREE.AmbientLight(0xfafaf7, 0.35);
    scene.add(ambient);

    let raf = 0;
    let last = performance.now();
    let inView = true;

    const renderOnce = () => {
      renderer.render(scene, camera);
    };

    const tick = () => {
      raf = 0;
      if (!inView) return;
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      group.rotation.y += ROTATION_RAD_PER_SEC * dt;
      renderOnce();
      raf = window.requestAnimationFrame(tick);
    };

    let observer: IntersectionObserver | undefined;

    if (reduced) {
      // One static frame, no rotation.
      renderOnce();
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
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      capGeometry.dispose();
      capMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [tier]);

  return (
    <figure className="flex flex-col items-center gap-3">
      <div
        ref={mountRef}
        aria-label={`Three-dimensional rendering of ${name} bottle`}
        role="img"
        className="w-[200px] h-[240px] sm:w-[280px] sm:h-[320px]"
      />
      <figcaption className="font-serif text-lg sm:text-xl text-paper text-center leading-tight">
        {name}
      </figcaption>
    </figure>
  );
}
