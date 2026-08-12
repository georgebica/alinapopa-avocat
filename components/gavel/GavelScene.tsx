"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { LIFT, REST, strikePose, type StrikePose } from "./strike";

// Fetched by the loader at runtime, so the deployment's basePath has to be
// applied by hand — same as the hero statue.
const MODEL_PATH = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/gavel.glb`;

const FOV = 28;

/** Three-quarter view: the handle swings towards the viewer rather than lying
 *  flat across the frame, which is what gives the strike its depth. The swing
 *  itself still happens in the model's own XY plane, now seen at an angle. */
const YAW = -0.44;

/** Slack around the swept silhouette, so nothing grazes the canvas edge. */
const PADDING = 1.05;

export type GavelState = {
  /** Seconds since the strike was triggered; negative means "not yet". */
  time: number;
  reducedMotion: boolean;
};

export function createGavelState(): GavelState {
  return { time: -1, reducedMotion: false };
}

function Gavel({ stateRef }: { stateRef: RefObject<GavelState> }) {
  const { scene } = useGLTF(MODEL_PATH);
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  const rig = useMemo(() => {
    const clone = scene.clone(true);
    const gavel = clone.getObjectByName("gavel");
    const block = clone.getObjectByName("block");
    // The asset is built by `scripts/prepare-gavel.mjs` and always carries both
    // nodes. If it somehow does not, this is decoration at the foot of the page
    // and it drops out silently rather than taking the banner down with it.
    if (!gavel || !block) return null;

    clone.rotation.y = YAW;

    // Frame the *swept* silhouette, not the resting one: the head is at its
    // highest at full lift, and framing the rest pose alone would crop it.
    const swept = new THREE.Box3();
    for (const angle of [0, -LIFT]) {
      gavel.rotation.z = angle;
      clone.updateMatrixWorld(true);
      swept.union(new THREE.Box3().setFromObject(clone));
    }
    gavel.rotation.z = 0;
    clone.updateMatrixWorld(true);

    const centre = swept.getCenter(new THREE.Vector3()).negate();
    // The swept box as the camera will actually see it: centred on the origin,
    // which is where the group's own offset puts it.
    const framed = swept.clone().translate(centre);
    const corners: THREE.Vector3[] = [];
    for (const x of [framed.min.x, framed.max.x]) {
      for (const y of [framed.min.y, framed.max.y]) {
        for (const z of [framed.min.z, framed.max.z]) {
          corners.push(new THREE.Vector3(x, y, z));
        }
      }
    }

    // `centre` is applied to the group so the swept box lands on the canvas
    // centre. The `gavel` and `block` handles are deliberately *not* returned:
    // the frame loop reaches them through `parts` below, so nothing it mutates
    // is memoised render output.
    return { model: clone, centre, corners };
  }, [scene]);

  // The two nodes the strike animates, looked up once the model exists. Held in
  // a ref so the frame loop below writes only to refs, never to render output.
  const parts = useRef<{ gavel: THREE.Object3D; block: THREE.Object3D } | null>(null);
  useLayoutEffect(() => {
    const gavel = rig?.model.getObjectByName("gavel");
    const block = rig?.model.getObjectByName("block");
    parts.current = gavel && block ? { gavel, block } : null;
  }, [rig]);

  // Pull the camera back far enough that the whole swept silhouette projects
  // inside the frame.
  //
  // Fitting the axis-aligned box alone is not enough here: the yaw swings the
  // handle a good half-unit towards the camera, and a corner at +z is viewed
  // from `distance - z` rather than `distance`, so it projects wider than its
  // box coordinate suggests. Solving each corner for the distance that just
  // contains it — and taking the largest — accounts for that.
  useLayoutEffect(() => {
    if (!rig || !size.height) return;
    const tanV = Math.tan(THREE.MathUtils.degToRad(FOV) / 2);
    const tanH = tanV * (size.width / size.height);

    let distance = 0;
    for (const corner of rig.corners) {
      distance = Math.max(
        distance,
        (PADDING * Math.abs(corner.x)) / tanH + corner.z,
        (PADDING * Math.abs(corner.y)) / tanV + corner.z,
      );
    }

    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, rig, size.width, size.height, invalidate]);

  const applied = useRef<StrikePose>(REST);

  useFrame((_, delta) => {
    const rigged = parts.current;
    if (!rigged) return;
    const state = stateRef.current;
    // Reduced motion holds the resting pose: the gavel already sits down on the
    // block, which is a perfectly good still image of a gavel.
    const pose = state.reducedMotion || state.time < 0
      ? REST
      : strikePose((state.time += delta));

    if (pose.angle === applied.current.angle && pose.blockY === applied.current.blockY) return;
    applied.current = pose;

    rigged.gavel.rotation.z = pose.angle;
    rigged.block.position.y = pose.blockY;
    // Covers the hand-off back to the on-demand loop, so the settled pose is
    // guaranteed to reach the screen even if the last frame lands late.
    invalidate();
  });

  if (!rig) return null;
  return <primitive object={rig.model} position={rig.centre} />;
}

export default function GavelScene({
  stateRef,
  playing,
}: {
  stateRef: RefObject<GavelState>;
  playing: boolean;
}) {
  return (
    <Canvas
      // Runs the loop only for the ~1.5s the strike lasts. Either side of that
      // the canvas redraws on demand and costs nothing, which matters for a
      // decorative element this far down the page.
      frameloop={playing ? "always" : "demand"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4], fov: FOV }}
    >
      <ambientLight intensity={0.55} />
      {/* Warm key from above-right, roughly where the banner's own light would
          be coming from, and a cool rim to pull the brass off the burgundy. */}
      <directionalLight position={[2.4, 3.2, 2.6]} intensity={2.1} color="#fff1d8" />
      <directionalLight position={[-2.8, 1.2, -1.6]} intensity={0.7} color="#c8b6d4" />

      <Suspense fallback={null}>
        <Gavel stateRef={stateRef} />
        {/* Built from lightformers rather than a preset: metal needs something
            to reflect, and this avoids the network fetch a preset HDR costs. */}
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={2.6} color="#fff0d5" position={[0, 3, 2]} scale={[6, 3, 1]} />
          <Lightformer intensity={1.1} color="#ffd7b0" position={[3.5, 0.5, 1]} scale={[3, 4, 1]} />
          <Lightformer intensity={0.7} color="#8e5a66" position={[-3.5, -1, -1]} scale={[4, 4, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_PATH);
