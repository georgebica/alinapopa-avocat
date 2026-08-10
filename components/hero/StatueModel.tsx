"use client";

import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { RotationState } from "./rotationState";

// Requested by the loader at runtime, so it needs the deployment's basePath
// applied by hand — Next only rewrites next/link hrefs and bundled assets.
const MODEL_PATH = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/statue.glb`;

/** Shared with the Canvas camera prop so the framing maths matches the camera. */
export const HERO_FOV = 30;

export type Framing = {
  /**
   * Statue height as a multiple of the frame height. Above 1 the statue
   * deliberately overflows the frame and is cropped — that oversized crop is
   * what the scroll then pans across.
   */
  scale: number;
  /** Camera height at scroll progress 0, in units of statue height (0 = the statue's middle). */
  panFrom: number;
  /** Camera height at scroll progress 1. */
  panTo: number;
  /**
   * Also guarantee the statue's *swept* silhouette fits horizontally. Used where
   * the statue must be wholly visible; the pinned hero leaves it off on purpose.
   */
  fitWidth?: boolean;
};

export function StatueModel({
  rotationRef,
  framing,
}: {
  rotationRef: RefObject<RotationState>;
  framing: Framing;
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const size = useThree((state) => state.size);
  const cameraPlaced = useRef(false);

  const { model, offset, radius, height } = useMemo(() => {
    const clone = scene.clone(true);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9a7748"),
      metalness: 0.78,
      roughness: 0.34,
    });
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.geometry.computeVertexNormals();
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());

    // Widest distance any vertex sits from the vertical spin axis — this, not the
    // static bounding box, is what determines whether the outstretched scales
    // stay inside the frame at every rotation angle.
    let maxRadiusSq = 0;
    const vertex = new THREE.Vector3();
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.updateWorldMatrix(true, false);
      const position = child.geometry.getAttribute("position");
      for (let i = 0; i < position.count; i += 1) {
        vertex.fromBufferAttribute(position, i).applyMatrix4(child.matrixWorld);
        const dx = vertex.x - center.x;
        const dz = vertex.z - center.z;
        const radiusSq = dx * dx + dz * dz;
        if (radiusSq > maxRadiusSq) maxRadiusSq = radiusSq;
      }
    });

    return {
      model: clone,
      // Applied to the model *inside* the spinning group, so the spin axis runs
      // through the bounding-box centre and stays on the frame's centre line.
      offset: center.clone().negate(),
      radius: Math.sqrt(maxRadiusSq),
      height: box.max.y - box.min.y,
    };
  }, [scene]);

  // Where the camera sits: distance decides how much of the statue the frame
  // holds, and the pan endpoints are the heights the scroll travels between.
  // Pure — the values are applied to the camera in the frame loop below.
  const view = useMemo(() => {
    const vFov = THREE.MathUtils.degToRad(HERO_FOV);
    const visibleHeight = height / framing.scale;
    let distance = visibleHeight / 2 / Math.tan(vFov / 2);

    if (framing.fitWidth && size.height > 0) {
      const aspect = size.width / size.height;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      distance = Math.max(distance, radius / Math.tan(hFov / 2));
    }

    return {
      distance,
      yFrom: framing.panFrom * height,
      yTo: framing.panTo * height,
    };
  }, [size.width, size.height, height, radius, framing]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const rotation = rotationRef.current;
    // Exponential smoothing is frame-rate independent, unlike `delta * k`, whose
    // step size balloons whenever a frame is dropped — the usual source of
    // stutter in a scene heavy enough to miss frames.
    const settle = (perSecond: number) => 1 - Math.exp(-perSecond * delta);
    const progress = Math.min(1, Math.max(0, rotation.progress));

    const bob = rotation.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
    const targetRotation = rotation.base + rotation.sweep + bob;
    group.rotation.y += (targetRotation - group.rotation.y) * settle(7);

    // Dolly the camera down the statue as the sequence advances. Tracks tighter
    // than the rotation so the vertical travel stays locked to the scrollbar.
    const camera = state.camera;
    camera.position.x = 0;
    camera.position.z = view.distance;

    const targetY = view.yFrom + (view.yTo - view.yFrom) * progress;
    if (cameraPlaced.current) {
      camera.position.y += (targetY - camera.position.y) * settle(16);
    } else {
      // First frame — and after a reload part-way down the page — start exactly
      // where the scroll says, rather than sweeping in from the top.
      camera.position.y = targetY;
      cameraPlaced.current = true;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} position={offset} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
