"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { SceneBoundary } from "../SceneBoundary";
import {
  ARMED,
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

/** Wide enough that near geometry visibly looms: the cinematic-lens end of
 *  what the fit maths tolerates, so the head reads as *close*, not just big. */
const FOV = 34;

/** The head hangs on the -X side of the grip, so a *positive* yaw swings it
 *  out of the frame plane towards the camera — head forward, handle receding
 *  into the scene. The swing itself still happens in the model's own XY
 *  plane, now watched almost down the line of the handle. */
const YAW = 0.78;

/** Tipped towards the viewer, but less steeply than a bench seen from above:
 *  closer to eye level, which is what makes the object confrontational rather
 *  than observed. Tipping the model rather than pitching the camera keeps the
 *  corner-fit maths below in the camera's own axes. With the default XYZ Euler
 *  order the pitch lands about the world axis after the yaw, so the pair reads
 *  as one camera orbit: around, then up. */
const PITCH = 0.3;

/** Below 1: the swept silhouette is allowed to graze — even slightly break —
 *  the canvas edge. The banner composes the gavel as a foreground object that
 *  escapes its container, so a polite margin would read as timid. It also
 *  tightens the dead air the swing arc reserves above the resting head. */
const PADDING = 0.9;

/** The camera starts this factor beyond its fitted distance and pushes in as
 *  the head winds up, arriving at the fitted framing exactly at the release. */
const DOLLY_FROM = 1.16;

/** The scroll also steers the yaw: the model starts this much further turned
 *  away and comes round to face the viewer as the strike approaches, settling
 *  at YAW exactly at the release. Small on purpose — the silhouette was fitted
 *  at YAW, and a subtle turn reads as presence where a sweep reads as gimmick. */
const YAW_DRIFT = 0.12;

/** Impact tremor, as a fraction of the framed silhouette's height. */
const SHAKE = 0.012;

export type GavelState = {
  /** The banner's entry progress, 0–1: how much of the section has scrolled
   *  into the viewport, 1 the moment the whole section fits. */
  progress: number;
  reducedMotion: boolean;
  /** Schedules a frame in the canvas's on-demand loop. The scene installs the
   *  real function once mounted; the banner calls it after each scroll write,
   *  so the GPU only ever renders when something actually moved. */
  invalidate: () => void;
};

export function createGavelState(): GavelState {
  return { progress: 0, reducedMotion: false, invalidate: () => {} };
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

  // The banner's scroll handler reaches the on-demand loop through the shared
  // state, so a scroll tick costs one render instead of a running frameloop.
  useEffect(() => {
    const state = stateRef.current;
    state.invalidate = invalidate;
    return () => {
      state.invalidate = () => {};
    };
  }, [stateRef, invalidate]);

  // Seconds since the fall was released; negative while the swing is armed.
  const fall = useRef(-1);
  // Seeded from ARMED, not REST: the head enters the banner already raised,
  // and seeding anything lower would play a visible lift at entry.
  const applied = useRef<{ pose: StrikePose; progress: number; shake: number }>({
    pose: ARMED,
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

    // One eased clock for the approach: the camera pushes in and the model
    // turns to face the viewer on the same curve, so the pair reads as a
    // single slow move that completes exactly at the release. Reduced motion
    // holds the finished framing.
    const approach = state.reducedMotion ? 1 : easeOutCubic(clamp01(progress / STRIKE_POINT));

    // Z-only dolly, so the lookAt set by the fit above keeps holding.
    frame.camera.position.z = fitDistance.current * (DOLLY_FROM - (DOLLY_FROM - 1) * approach);

    // The reflections shift with this too: turning the model under the fixed
    // environment sweeps the highlights along the brass as the user scrolls.
    rigged.model.rotation.y = YAW - YAW_DRIFT * (1 - approach);

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

export default function GavelScene({ stateRef }: { stateRef: RefObject<GavelState> }) {
  return (
    // Strictly on-demand: the banner invalidates through the state on each
    // scroll write, and the frame loop invalidates itself while a strike is
    // still settling. Between those the GPU renders nothing at all — a canvas
    // running "always" through a pinned scroll was the jank, not the cure.
    // The dpr cap is modest for the same reason: on a 3x phone the fill cost
    // of this canvas dwarfs everything else in the section.
    <SceneBoundary>
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4], fov: FOV }}
    >
      {/* Single-source cinematic lighting: one hard golden key from the upper
          right (where the banner's CSS light shaft falls from), a rim from
          behind the opposite shoulder to cut the silhouette out of the dark,
          and only a breath of burgundy bounce so the shadow side keeps its
          form without ever reading as lit. Ambient is close to nothing — the
          deep side is *meant* to fall away into the grade. */}
      <ambientLight intensity={0.18} />
      <directionalLight position={[3.4, 2.8, 2.4]} intensity={3.2} color="#ffdfae" />
      <directionalLight position={[-1.8, 2.6, -2.8]} intensity={1.5} color="#f3cf9a" />
      <directionalLight position={[-3.2, 0.4, 1.4]} intensity={0.3} color="#8e3448" />

      <Suspense fallback={null}>
        <Gavel stateRef={stateRef} />
        {/* Built from lightformers rather than a preset: metal needs something
            to reflect, and this avoids the network fetch a preset HDR costs.
            Deliberately lopsided — a tall warm card on the key side, a sliver
            overhead, and a dim burgundy wall opposite — so the reflections in
            the brass tell the same one-sided story as the lights. */}
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={3} color="#ffe2b0" position={[3, 2.5, 2]} rotation-y={-0.6} scale={[3.5, 5, 1]} />
          <Lightformer intensity={1.2} color="#ffd7a0" position={[0, 4, 1]} scale={[7, 1.5, 1]} />
          <Lightformer intensity={0.4} color="#5c1c2b" position={[-4, -0.5, -1]} scale={[5, 5, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
    </SceneBoundary>
  );
}

useGLTF.preload(MODEL_PATH);
