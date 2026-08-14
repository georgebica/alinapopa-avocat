/**
 * The gavel's strike, split into two regimes that meet at `STRIKE_POINT`.
 *
 * The wind-up is scrubbed: scroll progress through the pinned banner lifts the
 * head, and scrolling back lowers it again, exactly as the hero's scroll turns
 * the statue. The fall is not scrubbed — a drop that tracked the scrollbar
 * would read as the head being *lowered*, not striking — so crossing the
 * strike point releases a short time-based fall with rebounds, and crossing
 * back above it re-arms the swing for the next pass.
 *
 * `gavel.glb` is baked so the swing needs no offset group: the gavel node's
 * origin sits at the grip, its rest pose is angle 0 with the striking face flat
 * on the block, and lifting the head is a *negative* rotation about Z (the head
 * hangs on the -X side of the grip, so a negative angle raises it).
 */

/** Full lift, in radians about Z. ~24 degrees — a touch more arc than a polite
 *  tap, which the scrubbed wind-up and the raised camera both earn: the viewer
 *  watches the head climb, so the climb has to be worth watching. */
export const LIFT = 0.42;

/** Progress at which the wind-up reaches full lift. The gap from here to the
 *  strike point holds the head loaded at the top — scroll travel spent hanging,
 *  which is what makes the release read as a decision rather than an accident. */
const WINDUP_END = 0.42;

/** Scroll progress at which the fall fires. */
export const STRIKE_POINT = 0.56;

/** Duration of the released fall, in seconds. Short: the head arrives fast. */
const FALL_TIME = 0.13;

/** First rebound, as a fraction of LIFT. Each later one is smaller again. */
const REBOUND = 0.17;
/** Rebounds per second, and how fast their envelope decays. */
const REBOUND_RATE = 24;
const REBOUND_DECAY = 9;

/** Vertical squash of the block at impact, in scene units. Deliberately tiny:
 *  it is read as impact, not as the block being made of rubber. */
const BLOCK_DIP = 0.012;
const BLOCK_RATE = 40;
const BLOCK_DECAY = 16;

/** Once the rebounds are below a fraction of a degree there is nothing left to
 *  animate, and the pose collapses to exact REST so the scene can go quiet. */
const REBOUND_WINDOW = 0.9;

export type StrikePose = {
  /** Rotation about Z for the `gavel` node. 0 is resting on the block. */
  angle: number;
  /** Y offset for the `block` node — its recoil under the hit. */
  blockY: number;
};

export const REST: StrikePose = { angle: 0, blockY: 0 };

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** Soft at both ends, so the scrubbed lift neither jolts off the block nor
 *  slams into its top stop. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Accelerating, like a fall — the head covers most of the arc at the end. */
const easeInQuad = (t: number) => t * t;

/** The scrubbed wind-up: head angle as a pure function of scroll progress,
 *  valid below the strike point. Reversible by construction. */
export function liftAngle(progress: number): number {
  return -LIFT * easeInOutCubic(clamp01(progress / WINDUP_END));
}

/** The released strike: pose as a function of seconds since the release. */
export function fallPose(time: number): StrikePose {
  if (time <= 0) return { angle: -LIFT, blockY: 0 };

  if (time < FALL_TIME) {
    return { angle: -LIFT * (1 - easeInQuad(time / FALL_TIME)), blockY: 0 };
  }

  const since = time - FALL_TIME;
  if (since >= REBOUND_WINDOW) return REST;

  // |sin| against a falling exponential: a run of diminishing hops that always
  // returns cleanly to 0 at each contact, which is exactly what a rigid head
  // bouncing on a block does.
  const hops = Math.abs(Math.sin(since * REBOUND_RATE));

  return {
    angle: -LIFT * REBOUND * Math.exp(-REBOUND_DECAY * since) * hops,
    // Rings faster and dies sooner than the gavel above it, so the two are not
    // visibly locked to the same beat.
    blockY: -BLOCK_DIP * Math.exp(-BLOCK_DECAY * since) * Math.abs(Math.sin(since * BLOCK_RATE)),
  };
}

/** Signed camera-shake envelope for the same clock as `fallPose`: 0 until the
 *  head makes contact, ±1 at the hit, effectively gone by half a second. The
 *  scene scales it into scene units. */
export function impactShake(time: number): number {
  const since = time - FALL_TIME;
  if (since < 0) return 0;
  return Math.exp(-8 * since) * Math.cos(since * 70);
}
