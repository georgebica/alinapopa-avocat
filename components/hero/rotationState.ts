/**
 * Mutable, ref-held scene state — updated on every scroll tick (from the
 * framer-motion scroll subscription) and read inside the r3f render loop, so
 * scrolling never triggers a React re-render.
 */
export type RotationState = {
  /** Resting angle (radians) the statue settles at with zero scroll progress. */
  base: number;
  /** Additional scroll-driven rotation (radians), 0 at the top of the hero. */
  sweep: number;
  /** Raw hero scroll progress, 0–1. Drives the subtle "approach" scale. */
  progress: number;
  /** When true, disables the idle bob and scroll rotation entirely. */
  reducedMotion: boolean;
};

export function createRotationState(): RotationState {
  return { base: 0.35, sweep: 0, progress: 0, reducedMotion: false };
}

/** Total rotation swept across the full pinned scroll — just under a full turn. */
export const TOTAL_SWEEP = Math.PI * 1.75;
