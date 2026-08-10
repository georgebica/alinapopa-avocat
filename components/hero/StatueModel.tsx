"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { RotationState } from "./rotationState";

// Requested by the loader at runtime, so it needs the deployment's basePath
// applied by hand — Next only rewrites next/link hrefs and bundled assets.
const MODEL_PATH = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/statue.glb`;

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
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const plan = useRef({ yFrom: 0, yTo: 0 });

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

  // Park the camera: distance sets how much of the statue the frame holds, and
  // the pan endpoints are the heights the scroll travels between.
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !size.height) return;

    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = height / framing.scale;
    let distance = visibleHeight / 2 / Math.tan(vFov / 2);

    if (framing.fitWidth) {
      const aspect = size.width / size.height;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      distance = Math.max(distance, radius / Math.tan(hFov / 2));
    }

    plan.current = { yFrom: framing.panFrom * height, yTo: framing.panTo * height };

    camera.position.set(0, plan.current.yFrom, distance);
    camera.updateProjectionMatrix();
  }, [camera, size, height, radius, framing]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const rotation = rotationRef.current;
    const follow = Math.min(1, delta * 6);

    const bob = rotation.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
    const targetRotation = rotation.base + rotation.sweep + bob;
    // Damped follow so scroll-driven motion doesn't feel jittery frame to frame.
    group.rotation.y += (targetRotation - group.rotation.y) * follow;

    // Dolly the camera down the statue as the sequence advances.
    const { yFrom, yTo } = plan.current;
    const targetY = yFrom + (yTo - yFrom) * rotation.progress;
    state.camera.position.y += (targetY - state.camera.position.y) * follow;
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} position={offset} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
