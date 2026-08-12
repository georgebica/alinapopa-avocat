/**
 * The gavel's one-shot strike, as a pure function of time since the trigger.
 *
 * `gavel.glb` is baked so the swing needs no offset group: the gavel node's
 * origin sits at the grip, its rest pose is angle 0 with the striking face flat
 * on the block, and lifting the head is a *negative* rotation about Z (the head
 * hangs on the -X side of the grip, so a negative angle raises it).
 *
 * The shape of the motion is what sells it as a gavel rather than a lever:
 *
 *   lift   slow and deliberate, decelerating into the top — the wind-up
 *   hold   a beat at the top, which is what makes the fall read as a decision
 *   fall   short and accelerating, so the head arrives fast
 *   settle a decaying series of ever-smaller rebounds off the block
 *
 * Times are in seconds from the trigger; the phases are cumulative.
 */

/** How far the head is raised, in radians about Z. ~15 degrees lifts the
 *  striking face about two thirds of the head's own height off the block —
 *  unmistakably a swing, without the cartoon arc a larger angle would give. */
export const LIFT = 0.26;

const LIFT_END = 0.42;
const HOLD_END = 0.52;
const FALL_END = 0.66;

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
 *  animate, and the scene can stop asking for frames. */
const SETTLED = FALL_END + 0.9;

export type StrikePose = {
  /** Rotation about Z for the `gavel` node. 0 is resting on the block. */
  angle: number;
  /** Y offset for the `block` node — its recoil under the hit. */
  blockY: number;
  /** False once the motion has fully settled, so the frame loop can idle. */
  moving: boolean;
};

export const REST: StrikePose = { angle: 0, blockY: 0, moving: false };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** Accelerating, like a fall — the head covers most of the arc at the end. */
const easeInQuad = (t: number) => t * t;

export function strikePose(time: number): StrikePose {
  if (time <= 0) return REST;

  if (time < LIFT_END) {
    return { angle: -LIFT * easeOutCubic(time / LIFT_END), blockY: 0, moving: true };
  }

  if (time < HOLD_END) {
    return { angle: -LIFT, blockY: 0, moving: true };
  }

  if (time < FALL_END) {
    const fall = (time - HOLD_END) / (FALL_END - HOLD_END);
    return { angle: -LIFT * (1 - easeInQuad(fall)), blockY: 0, moving: true };
  }

  const since = time - FALL_END;
  if (since >= SETTLED - FALL_END) return REST;

  // |sin| against a falling exponential: a run of diminishing hops that always
  // returns cleanly to 0 at each contact, which is exactly what a rigid head
  // bouncing on a block does.
  const hops = Math.abs(Math.sin(since * REBOUND_RATE));

  return {
    angle: -LIFT * REBOUND * Math.exp(-REBOUND_DECAY * since) * hops,
    // Rings faster and dies sooner than the gavel above it, so the two are not
    // visibly locked to the same beat.
    blockY: -BLOCK_DIP * Math.exp(-BLOCK_DECAY * since) * Math.abs(Math.sin(since * BLOCK_RATE)),
    moving: true,
  };
}

/** Total run time of the strike, for anything that needs to wait it out. */
export const STRIKE_DURATION = SETTLED;
