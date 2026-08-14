"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import {
  LIFT,
  REST,
  STRIKE_POINT,
  fallPose,
  impactShake,
  liftAngle,
  type StrikePose,
} from "./strike";

// Fetched by the loader at runtime, so the deployment's basePath has to be
// applied by hand — same as the hero statue.
const MODEL_PATH = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/gavel.glb`;

const FOV = 28;

/** Three-quarter view: the handle swings towards the viewer rather than lying
 *  flat across the frame, which is what gives the strike its depth. The swing
 *  itself still happens in the model's own XY plane, now seen at an angle. */
const YAW = -0.44;

/** The bench seen from above: the scene is tipped towards the viewer so the
 *  strike is watched looking down onto the block — the judge's own view of it.
 *  Tipping the model rather than pitching the camera keeps the corner-fit
 *  maths below in the camera's own axes. With the default XYZ Euler order the
 *  pitch lands about the world axis after the yaw, so the pair reads as one
 *  camera orbit: around, then up. */
const PITCH = 0.4;

/** Slack around the swept silhouette, so nothing grazes the canvas edge. */
const PADDING = 1.05;

/** The camera starts this factor beyond its fitted distance and pushes in as
 *  the head winds up, arriving at the fitted framing exactly at the release. */
const DOLLY_FROM = 1.1;

/** Impact tremor, as a fraction of the framed silhouette's height. */
const SHAKE = 0.012;

export type GavelState = {
  /** Scroll progress through the pinned banner, 0–1. */
  progress: number;
  reducedMotion: boolean;
};

export function createGavelState(): GavelState {
  return { progress: 0, reducedMotion: false };
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

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

    clone.rotation.set(PITCH, YAW, 0);

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
    // centre. The animated nodes are deliberately *not* returned: the frame
    // loop reaches them through `parts` below, so nothing it mutates is
    // memoised render output.
    return { model: clone, centre, corners, shakeUnit: SHAKE * (framed.max.y - framed.min.y) };
  }, [scene]);

  // Everything the strike animates, looked up once the model exists. Held in a
  // ref so the frame loop below writes only through refs, never render output.
  const parts = useRef<{
    gavel: THREE.Object3D;
    block: THREE.Object3D;
    model: THREE.Object3D;
  } | null>(null);
  useLayoutEffect(() => {
    const gavel = rig?.model.getObjectByName("gavel");
    const block = rig?.model.getObjectByName("block");
    parts.current = rig && gavel && block ? { gavel, block, model: rig.model } : null;
  }, [rig]);

  // Pull the camera back far enough that the whole swept silhouette projects
  // inside the frame.
  //
  // Fitting the axis-aligned box alone is not enough here: the yaw swings the
  // handle a good half-unit towards the camera, and a corner at +z is viewed
  // from `distance - z` rather than `distance`, so it projects wider than its
  // box coordinate suggests. Solving each corner for the distance that just
  // contains it — and taking the largest — accounts for that.
  const fitDistance = useRef(0);
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

    fitDistance.current = distance;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // The frame loop corrects the dolly before this reaches the screen —
    // useFrame runs ahead of the render the invalidate schedules.
    invalidate();
  }, [camera, rig, size.width, size.height, invalidate]);

  // Seconds since the fall was released; negative while the swing is armed.
  const fall = useRef(-1);
  const applied = useRef<{ pose: StrikePose; progress: number; shake: number }>({
    pose: REST,
    progress: -1,
    shake: 0,
  });

  // The camera is reached through the frame state rather than the `useThree`
  // value above — same as the statue — so the loop mutates nothing that a
  // render produced.
  useFrame((frame, delta) => {
    const rigged = parts.current;
    if (!rigged || !rig || !fitDistance.current) return;
    const state = stateRef.current;
    const progress = clamp01(state.progress);

    let pose: StrikePose;
    let shake = 0;
    if (state.reducedMotion) {
      // Reduced motion holds the resting pose: the gavel already sits down on
      // the block, which is a perfectly good still image of a gavel.
      fall.current = -1;
      pose = REST;
    } else if (progress >= STRIKE_POINT) {
      fall.current = fall.current < 0 ? 0 : fall.current + delta;
      pose = fallPose(fall.current);
      shake = impactShake(fall.current);
    } else {
      fall.current = -1;
      // The wind-up chases the scrubbed target through a short smoothing
      // window (frame-rate independent, like the statue's), so re-arming after
      // a strike reads as the head being raised again rather than snapping to
      // wherever the scrollbar already is.
      const target = liftAngle(progress);
      const angle =
        applied.current.pose.angle +
        (target - applied.current.pose.angle) * (1 - Math.exp(-12 * delta));
      pose = { angle, blockY: 0 };
    }

    const prev = applied.current;
    if (
      pose.angle === prev.pose.angle &&
      pose.blockY === prev.pose.blockY &&
      progress === prev.progress &&
      shake === prev.shake
    ) {
      return;
    }
    applied.current = { pose, progress, shake };

    rigged.gavel.rotation.z = pose.angle;
    rigged.block.position.y = pose.blockY;

    // The slow push-in towards the release point. Z-only, so the lookAt set by
    // the fit above keeps holding.
    const dolly = state.reducedMotion
      ? 1
      : DOLLY_FROM - (DOLLY_FROM - 1) * easeOutCubic(clamp01(progress / STRIKE_POINT));
    frame.camera.position.z = fitDistance.current * dolly;

    // Impact tremor, applied to the model rather than the camera so the fitted
    // lookAt is never disturbed — sideways ring, slight downward thud.
    rigged.model.position.set(
      rig.centre.x + shake * rig.shakeUnit,
      rig.centre.y - Math.abs(shake) * rig.shakeUnit * 0.6,
      rig.centre.z,
    );

    // Keeps frames coming while anything is still settling — including after
    // the canvas has dropped back to on-demand rendering mid-strike.
    invalidate();
  });

  if (!rig) return null;
  return <primitive object={rig.model} position={rig.centre} />;
}

export default function GavelScene({
  stateRef,
  active,
}: {
  stateRef: RefObject<GavelState>;
  /** Whether the banner is on screen. Off screen the canvas renders on demand
   *  only, which is effectively never — scroll writes go to the ref and cost
   *  nothing until the loop is switched back on. */
  active: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "demand"}
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
