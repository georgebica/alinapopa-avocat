/**
 * Next 16 writes per-segment RSC prefetch payloads into nested `__next.*`
 * directories (e.g. `servicii/__next.servicii/$d$slug/__PAGE__.txt`), but the
 * client requests them as a single dot-joined filename
 * (`servicii/__next.servicii.$d$slug.__PAGE__.txt`). A Next server maps between
 * the two; a plain static host such as GitHub Pages cannot, so every prefetch
 * 404s and navigation degrades to a full page reload.
 *
 * This copies each payload to the flat name the client actually asks for.
 * It only ever *adds* files, and skips any that already exist, so it is a no-op
 * if a future Next version emits the flat names itself.
 */
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const OUT_DIR = process.argv[2] ?? "out";

if (!existsSync(OUT_DIR)) {
  console.error(`[flatten-rsc] "${OUT_DIR}" not found — run the build first.`);
  process.exit(1);
}

let created = 0;
let skipped = 0;

/** Collect every file under `dir`, as paths relative to it. */
function filesUnder(dir, prefix = []) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const next = [...prefix, entry.name];
    if (entry.isDirectory()) {
      results.push(...filesUnder(join(dir, entry.name), next));
    } else {
      results.push(next);
    }
  }
  return results;
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const full = join(dir, entry.name);

    if (entry.name.startsWith("__next.")) {
      // Flatten this payload directory into sibling dot-joined files.
      for (const segments of filesUnder(full)) {
        const flatName = [entry.name, ...segments].join(".");
        const target = join(dir, flatName);
        if (existsSync(target)) {
          skipped += 1;
          continue;
        }
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(join(full, ...segments), target);
        created += 1;
      }
      // Nested `__next.*` dirs are already covered by filesUnder above.
      continue;
    }

    walk(full);
  }
}

walk(OUT_DIR);

// The root-level payload is already emitted flat; sanity-check we found others.
const rootFlat = join(OUT_DIR, "__next.__PAGE__.txt");
if (created === 0 && !existsSync(rootFlat)) {
  console.warn("[flatten-rsc] no payloads found — has the export format changed?");
}

console.log(
  `[flatten-rsc] wrote ${created} flattened prefetch payload(s)` +
    (skipped ? `, ${skipped} already present` : "")
);

// Verify the models survived the export — both are requested at runtime by URL,
// so a missing file would only show up in production as an empty hero or an
// empty closing banner, with nothing failing loudly at build time.
for (const name of ["statue.glb", "gavel.glb"]) {
  const model = join(OUT_DIR, "models", name);
  if (!existsSync(model)) {
    console.error(`[flatten-rsc] expected ${model} to exist in the export.`);
    process.exit(1);
  }
  const sizeMb = statSync(model).size / 1024 / 1024;
  console.log(`[flatten-rsc] ${name} present (${sizeMb.toFixed(2)} MB)`);
}
