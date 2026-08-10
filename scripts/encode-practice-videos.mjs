// Turns the 1080p practice-area renders in `source/` into the web-sized loops
// under `public/videos/`, plus a poster still for each.
//
//   node scripts/encode-practice-videos.mjs
//
// Needs ffmpeg on PATH (or an $FFMPEG override, or a local `ffmpeg-static`).
// The masters are ~20 MB in total and live in the gitignored `source/`; only
// the ~1.5 MB of output committed under `public/videos/` is used by the build.
//
// Two things happen here that matter for how the grid looks:
//
// 1. The masters carry an AAC track that nothing ever plays, and Safari will
//    refuse to autoplay a file that has audio unless it is explicitly muted.
//    Dropping the track (`-an`) removes that failure mode at the source.
//
// 2. The masters are *nearly* loops — the render orbits back to roughly its
//    starting pose, but not exactly. Cutting straight from frame 95 to frame 0
//    is a visible hitch, and on a wall of nine cards looping every few seconds
//    that hitch is all you see. So the tail is crossfaded over the head: the
//    first OVERLAP seconds are dropped from the front and dissolved back in
//    over the end, which makes the last frame land exactly on the first. Costs
//    OVERLAP seconds of duration and leaves a brief double-exposure on the
//    clips whose endpoints drift most (fiscal, civil), which reads as a soft
//    dissolve rather than a cut.

import { execFile } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE_DIR = join(root, "source");
const OUT_DIR = join(root, "public", "videos");

/** Seconds of tail dissolved back over the head to close the loop. */
const OVERLAP = 0.5;
/** Master length, in seconds. Output runs SOURCE_DURATION - OVERLAP. */
const SOURCE_DURATION = 4;
/**
 * Exact 16:9, both axes even (h.264 needs even). Sized 2x the 544px panel of a
 * practice-area band on a 1152px container, so it stays sharp on a retina
 * screen at the largest size it is shown; the related-service cards on service
 * pages draw the same file down to roughly a third of that.
 */
const WIDTH = 1088;
const HEIGHT = 612;
/** Smooth studio renders, so a slacker quantiser costs little at this size. */
const CRF = 28;

/** Master file (in `source/`) keyed by the service slug it illustrates. */
const CLIPS = {
  "drept-comercial-si-afaceri": "dreptcomercial.mp4",
  "drept-fiscal-si-administrativ": "dreptfiscal.mp4",
  "drept-civil-si-dreptul-familiei": "dreptcivil.mp4",
  "dreptul-muncii": "dreptulmuncii.mp4",
  "executari-silite-si-recuperare-creante": "executarisilite.mp4",
  "dreptul-asigurarilor-si-accidente-rutiere": "dreptauto.mp4",
  "drept-contraventional": "dreptcontraventional.mp4",
  "drept-bancar-si-insolventa": "dreptbancar.mp4",
  // Straight off the generator, name and all.
  "proprietate-intelectuala": "Light_bulb_representing_intellec…_1080p_202608101503.mp4",
};

async function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try {
    await run("ffmpeg", ["-version"]);
    return "ffmpeg";
  } catch {
    try {
      return createRequire(import.meta.url)("ffmpeg-static");
    } catch {
      throw new Error(
        "ffmpeg not found. Install it, set $FFMPEG to the binary, or `npm i -D ffmpeg-static`."
      );
    }
  }
}

/**
 * Drop the first OVERLAP seconds, then dissolve them back over the tail so the
 * clip ends on the frame it starts on.
 */
function seamlessLoop() {
  const offset = SOURCE_DURATION - 2 * OVERLAP;
  return [
    `[0:v]trim=start=0:end=${OVERLAP},setpts=PTS-STARTPTS[head]`,
    `[0:v]trim=start=${OVERLAP},setpts=PTS-STARTPTS[rest]`,
    `[rest][head]xfade=transition=fade:duration=${OVERLAP}:offset=${offset}[looped]`,
    `[looped]scale=${WIDTH}:${HEIGHT}:flags=lanczos,format=yuv420p[out]`,
  ].join(";");
}

async function main() {
  const ffmpeg = await findFfmpeg();
  await mkdir(OUT_DIR, { recursive: true });

  const present = new Set(await readdir(SOURCE_DIR).catch(() => []));
  const missing = Object.values(CLIPS).filter((file) => !present.has(file));
  if (missing.length) {
    throw new Error(`Missing masters in source/:\n  ${missing.join("\n  ")}`);
  }

  for (const [slug, file] of Object.entries(CLIPS)) {
    const input = join(SOURCE_DIR, file);

    await run(ffmpeg, [
      "-y", "-v", "error",
      "-i", input,
      "-filter_complex", seamlessLoop(),
      "-map", "[out]",
      "-an",
      "-c:v", "libx264",
      "-profile:v", "high",
      "-crf", String(CRF),
      "-preset", "slow",
      "-r", "24",
      "-movflags", "+faststart",
      join(OUT_DIR, `${slug}.mp4`),
    ]);

    // Poster is the loop's own first frame, so the handoff from still to video
    // is invisible even if the file is slow to arrive.
    await run(ffmpeg, [
      "-y", "-v", "error",
      "-i", input,
      "-filter_complex", `[0:v]trim=start=${OVERLAP},setpts=PTS-STARTPTS,scale=${WIDTH}:${HEIGHT}:flags=lanczos[out]`,
      "-map", "[out]",
      "-frames:v", "1",
      "-quality", "72",
      join(OUT_DIR, `${slug}.webp`),
    ]);

    console.log(`${slug}  <-  ${file}`);
  }

  console.log(`\nWrote ${Object.keys(CLIPS).length} loops + posters to public/videos/`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
