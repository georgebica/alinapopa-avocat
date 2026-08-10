/**
 * Scroll-linked reveal timing for the hero's narrative stages.
 *
 * Each stage owns a band of the hero's 0–1 scroll progress and crossfades with
 * its neighbours. Values are pure functions of progress, so they can be applied
 * imperatively on every scroll tick without React re-renders.
 */

export type Band = {
  /** Progress at which the stage starts fading in (use a negative value for "visible from the top"). */
  inStart: number;
  inEnd: number;
  outStart: number;
  outEnd: number;
};

export const STAGE_BANDS: Band[] = [
  { inStart: -0.2, inEnd: -0.1, outStart: 0.2, outEnd: 0.31 },
  { inStart: 0.28, inEnd: 0.39, outStart: 0.55, outEnd: 0.66 },
  { inStart: 0.63, inEnd: 0.74, outStart: 1.2, outEnd: 1.3 },
];

/** Distance (px) a stage travels as it enters from below / exits upward. */
const TRAVEL = 22;

export type StageStyle = {
  opacity: number;
  y: number;
  scale: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function stageStyle(progress: number, band: Band): StageStyle {
  const entering = clamp01((progress - band.inStart) / (band.inEnd - band.inStart));
  const exiting = clamp01((progress - band.outStart) / (band.outEnd - band.outStart));

  const opacity = entering * (1 - exiting);
  // Enters rising from below, leaves continuing upward — never reverses direction.
  const y = (1 - entering) * TRAVEL - exiting * TRAVEL;
  const scale = 0.985 + entering * 0.015;

  return { opacity, y, scale };
}

export function mapRange(
  value: number,
  [inMin, inMax]: [number, number],
  [outMin, outMax]: [number, number]
) {
  const t = clamp01((value - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
}
