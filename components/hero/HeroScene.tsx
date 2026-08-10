"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useRef, type RefObject } from "react";
import * as THREE from "three";
import { StatueModel, HERO_FOV, type Framing } from "./StatueModel";
import type { RotationState } from "./rotationState";

type Variant = "desktop" | "mobile" | "static";

type Props = {
  rotationRef: RefObject<RotationState>;
  variant?: Variant;
};

/**
 * In the pinned hero the statue is deliberately taller than the frame, so it
 * reads as monumental and the scroll can travel down it — starting high, with
 * clear space above the head for the headline, and ending low on the robe and
 * plinth once the copy has moved below the figure. Phones use a smaller multiple
 * because the statue's outstretched scales are wider than it is tall, and a
 * narrow viewport crops them hard.
 *
 * The `static` (reduced-motion) variant instead shows the whole statue, fitted
 * to its own block with no pan at all.
 */
const FRAMING: Record<Variant, Framing> = {
  desktop: { scale: 1.55, panFrom: 0.34, panTo: -0.16 },
  mobile: { scale: 1.2, panFrom: 0.28, panTo: -0.16 },
  static: { scale: 0.86, panFrom: 0, panTo: 0, fitWidth: true },
};

/** Keeps the key/fill rig at the camera's height, so the lit side of the statue
 *  travels with the dolly instead of falling into shadow at the bottom. */
function TrackingLights() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.position.y = camera.position.y;
  });

  return (
    <group ref={ref}>
      {/* Key light — warm, high and slightly forward, like a museum spot. */}
      <directionalLight position={[3, 4, 2.5]} intensity={1.55} color="#fff2dc" />
      {/* Cool fill from behind-left to separate the bronze from the white ground. */}
      <directionalLight position={[-3.5, 1.5, -2]} intensity={0.5} color="#9db8d9" />
      {/* Low bounce, as if reflected off the plinth. */}
      <pointLight position={[0, -1.8, 1.6]} intensity={0.28} color="#c9a679" />
    </group>
  );
}

export default function HeroScene({ rotationRef, variant = "desktop" }: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: HERO_FOV }}
    >
      <ambientLight intensity={0.32} />
      <TrackingLights />

      <Suspense fallback={null}>
        <StatueModel rotationRef={rotationRef} framing={FRAMING[variant]} />
        <Environment preset="studio" environmentIntensity={0.42} />
      </Suspense>
    </Canvas>
  );
}
