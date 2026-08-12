// Turns the raw gavel OBJ in `source/` into the web-sized `public/models/gavel.glb`
// used by the closing CTA banner.
//
//   node scripts/prepare-gavel.mjs
//
// The master (`source/Labor.obj`, ~3 MB, gitignored) is a 3ds Max export with no
// UVs, no usable materials — every part shares a black `wire_000000000` — and no
// hierarchy beyond five flat groups. Everything the scene needs is therefore
// derived here rather than authored in the file:
//
// 1. GROUPS. `Line001` is the head cylinder, `Object001` the ferrule banding its
//    middle, `Line003` the handle, `Line004` the round sounding block. `Plane001`
//    is a 190-unit ground plane from the original render and is dropped.
//
// 2. POSE. The master ships the gavel frozen mid-swing: the head axis and the
//    handle are both tilted 16.57 degrees about Z (they stay exactly
//    perpendicular), and the head floats above the block. A rotation about the
//    head's lower striking face levels the handle and stands the head upright,
//    which is the pose the animation treats as "struck". Everything then moves so
//    that the block's top face centre is the origin, with the striking face
//    resting on it.
//
// 3. PIVOT. The gavel node's origin is placed at the grip — GRIP_ALONG of the way
//    down the handle — so the component animates the strike with nothing but
//    `rotation.z`, no offset group required.
//
// 4. MATERIAL. Brass rather than the wood the master's textures imply: the banner
//    behind it is burgundy, and a walnut gavel on burgundy is mud. Brass also
//    matches the site's `--gold` accent and the hero statue's bronze.
//
// The output is meshopt-compressed by `gltf-transform` in the same pass, so it
// arrives in the same shape as `statue.glb` and needs no extra loader setup.

import { readFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, quantize, reorder, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "source", "Labor.obj");
const OUT = join(root, "public", "models", "gavel.glb");

/** OBJ group -> the part of the assembly it is. `Plane001` is deliberately absent. */
const PARTS = {
  Line001: { part: "head", material: "brass" },
  Object001: { part: "ferrule", material: "brassDark" },
  Line003: { part: "handle", material: "brass" },
  Line004: { part: "block", material: "brassDark" },
};

/** Which node each part is welded into. The gavel swings; the block never moves. */
const NODES = { head: "gavel", ferrule: "gavel", handle: "gavel", block: "block" };

/** How far along the handle the invisible hand grips, 0 at the head, 1 at the butt. */
const GRIP_ALONG = 0.78;

/** Longest dimension of the assembly at rest, in output units. Keeps the scene
 *  framing in the component independent of the master's arbitrary scale. */
const TARGET_SIZE = 2;

const MATERIALS = {
  // Lifted well above the hero statue's #8d6836: that bronze was tuned for a
  // white page, and the same value on burgundy loses its edges entirely.
  brass: { color: [0.757, 0.627, 0.404], metallic: 0.78, roughness: 0.31 },
  // The ferrule and the block, a stop darker so the head reads as a separate
  // piece from the band around it and from the block underneath.
  brassDark: { color: [0.549, 0.435, 0.259], metallic: 0.72, roughness: 0.42 },
};

// ---------------------------------------------------------------------------
// OBJ parsing
// ---------------------------------------------------------------------------

/**
 * Reads the subset of OBJ the master actually uses: `v`, `vn`, `g` and `f` with
 * `v//vn` references. Faces are n-gons (the master is mostly quads) and are
 * triangulated as a fan, which is safe here because every face is planar and
 * convex — they come from lathed and extruded primitives.
 */
async function parseObj(path) {
  const positions = [];
  const normals = [];
  const groups = new Map();
  let current = null;

  for (const line of (await readFile(path, "utf8")).split(/\r?\n/)) {
    if (line.startsWith("v ")) {
      const [, x, y, z] = line.split(/\s+/);
      positions.push([+x, +y, +z]);
    } else if (line.startsWith("vn ")) {
      const [, x, y, z] = line.split(/\s+/);
      normals.push([+x, +y, +z]);
    } else if (line.startsWith("g ")) {
      const name = line.slice(2).trim();
      current = PARTS[name] ? { faces: [] } : null;
      if (current) groups.set(PARTS[name].part, { ...PARTS[name], faces: current.faces });
    } else if (line.startsWith("f ") && current) {
      const corners = line
        .slice(2)
        .trim()
        .split(/\s+/)
        .map((token) => {
          const [v, , vn] = token.split("/");
          // OBJ indices are 1-based, and negative indices count back from the
          // most recent vertex.
          const at = (raw, list) => {
            const i = parseInt(raw, 10);
            return i < 0 ? list.length + i : i - 1;
          };
          return { v: at(v, positions), vn: vn ? at(vn, normals) : -1 };
        });
      for (let i = 1; i < corners.length - 1; i += 1) {
        current.faces.push([corners[0], corners[i], corners[i + 1]]);
      }
    }
  }

  return { positions, normals, groups };
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Dominant axis of a point cloud, by power iteration on its covariance. This is
 *  what identifies the handle's direction and the head's cylinder axis without
 *  hardcoding numbers measured by hand. */
function principalAxis(points) {
  const n = points.length;
  const mean = [0, 0, 0];
  for (const p of points) for (let k = 0; k < 3; k += 1) mean[k] += p[k] / n;

  const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of points) {
    const d = sub(p, mean);
    for (let a = 0; a < 3; a += 1) for (let b = 0; b < 3; b += 1) cov[a][b] += (d[a] * d[b]) / n;
  }

  let v = [1, 1, 1];
  for (let i = 0; i < 256; i += 1) {
    const w = [0, 0, 0];
    for (let a = 0; a < 3; a += 1) for (let b = 0; b < 3; b += 1) w[a] += cov[a][b] * v[b];
    const len = Math.hypot(...w) || 1;
    v = w.map((x) => x / len);
  }

  let lo = Infinity;
  let hi = -Infinity;
  for (const p of points) {
    const t = dot(sub(p, mean), v);
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  return { mean, axis: v, lo, hi };
}

/** Every distinct position referenced by a part, in master space. */
function pointsOf(group, positions) {
  const seen = new Set();
  const points = [];
  for (const face of group.faces) {
    for (const corner of face) {
      if (seen.has(corner.v)) continue;
      seen.add(corner.v);
      points.push(positions[corner.v]);
    }
  }
  return points;
}

/** Rotation about the Z axis, applied to an [x, y, z] in place of a matrix. */
const rotateZ = ([x, y, z], angle) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * x - s * y, s * x + c * y, z];
};

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

/**
 * Works out the transform that takes the master's mid-swing pose to the rest
 * pose the animation starts from, measuring the tilt off the geometry rather
 * than trusting a constant.
 */
function solvePose({ positions, groups }) {
  const head = principalAxis(pointsOf(groups.get("head"), positions));
  const handle = principalAxis(pointsOf(groups.get("handle"), positions));
  const block = principalAxis(pointsOf(groups.get("block"), positions));

  // The handle points down-and-out in the master; the angle it makes with +X is
  // the tilt to undo. Sign it so the handle ends up along +X, not -X.
  const forward = handle.axis[0] < 0 ? handle.axis.map((n) => -n) : handle.axis;
  const tilt = -Math.atan2(forward[1], forward[0]);

  // Lower end of the head cylinder — the face that meets the block. `lo` and
  // `hi` are ends of the axis, and which one is lower depends on the axis sign.
  const end = (a, t) => [0, 1, 2].map((k) => a.mean[k] + a.axis[k] * t);
  const [low] = [end(head, head.lo), end(head, head.hi)].sort((a, b) => a[1] - b[1]);

  // Block is a flat disc lying in XZ, so its top is simply its highest vertex.
  let blockTop = -Infinity;
  for (const p of pointsOf(groups.get("block"), positions)) {
    if (p[1] > blockTop) blockTop = p[1];
  }

  // Grip: the handle's far end is the butt, the near end meets the head.
  const ends = [end(handle, handle.lo), end(handle, handle.hi)].sort((a, b) => a[0] - b[0]);
  const grip = [0, 1, 2].map((k) => ends[0][k] + (ends[1][k] - ends[0][k]) * GRIP_ALONG);

  return { tilt, strikeFace: low, blockCentre: block.mean, blockTop, grip };
}

/**
 * Builds the two transforms the parts are baked through:
 *   gavel — level the swing, then move the striking face onto the block's top
 *           face centre, then move the grip to the origin so it is the pivot.
 *   block — move the top face centre to the origin.
 * Both are finally scaled so the assembly's longest dimension is TARGET_SIZE.
 */
function buildTransforms(pose, scale) {
  const { tilt, strikeFace, blockCentre, blockTop, grip } = pose;

  // The gavel is levelled about its own striking face, so that face stays put
  // through the rotation and the rest is measured from it.
  const levelled = (p) => {
    const r = rotateZ(sub(p, strikeFace), tilt);
    return [r[0] + strikeFace[0], r[1] + strikeFace[1], r[2] + strikeFace[2]];
  };

  const contact = [blockCentre[0], blockTop, blockCentre[2]];
  const seat = sub(contact, strikeFace);
  const levelledGrip = levelled(grip);
  const pivot = [0, 1, 2].map((k) => levelledGrip[k] + seat[k] - contact[k]);

  return {
    gavel: (p) => {
      const q = levelled(p);
      // Seat onto the block, re-origin at the block's top centre, then at the grip.
      return [0, 1, 2].map((k) => (q[k] + seat[k] - contact[k] - pivot[k]) * scale);
    },
    // Normals only ever see the rotation — translation and uniform scale leave
    // them untouched.
    gavelNormal: (n) => rotateZ(n, tilt),
    block: (p) => [0, 1, 2].map((k) => (p[k] - contact[k]) * scale),
    blockNormal: (n) => n,
    /** Where the gavel node sits, so the baked-at-the-grip mesh lands correctly. */
    pivot: pivot.map((n) => n * scale),
  };
}

// ---------------------------------------------------------------------------
// glTF assembly
// ---------------------------------------------------------------------------

async function main() {
  const parsed = await parseObj(SOURCE);
  const missing = Object.values(PARTS)
    .map(({ part }) => part)
    .filter((part) => !parsed.groups.has(part));
  if (missing.length) throw new Error(`Missing groups in ${SOURCE}: ${missing.join(", ")}`);

  const pose = solvePose(parsed);

  // Measure the assembly at rest, with an identity scale, to derive the real one.
  const unit = buildTransforms(pose, 1);
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (const [part, group] of parsed.groups) {
    const move = NODES[part] === "gavel" ? unit.gavel : unit.block;
    const shift = NODES[part] === "gavel" ? unit.pivot : [0, 0, 0];
    for (const p of pointsOf(group, parsed.positions)) {
      const q = move(p);
      for (let k = 0; k < 3; k += 1) {
        bounds.min[k] = Math.min(bounds.min[k], q[k] + shift[k]);
        bounds.max[k] = Math.max(bounds.max[k], q[k] + shift[k]);
      }
    }
  }
  const scale = TARGET_SIZE / Math.max(...[0, 1, 2].map((k) => bounds.max[k] - bounds.min[k]));
  const transforms = buildTransforms(pose, scale);

  const document = new Document();
  const buffer = document.createBuffer();
  const scene = document.createScene();

  const materials = Object.fromEntries(
    Object.entries(MATERIALS).map(([name, spec]) => [
      name,
      document
        .createMaterial(name)
        .setBaseColorFactor([...spec.color, 1])
        .setMetallicFactor(spec.metallic)
        .setRoughnessFactor(spec.roughness),
    ])
  );

  const meshes = {
    gavel: document.createMesh("gavel"),
    block: document.createMesh("block"),
  };

  for (const [part, group] of parsed.groups) {
    const node = NODES[part];
    const movePosition = node === "gavel" ? transforms.gavel : transforms.block;
    const moveNormal = node === "gavel" ? transforms.gavelNormal : transforms.blockNormal;

    // One vertex per distinct position/normal pair, so the hard edges the master
    // relies on for its bevels survive.
    const lookup = new Map();
    const positions = [];
    const normals = [];
    const indices = [];

    for (const face of group.faces) {
      for (const corner of face) {
        const key = `${corner.v}|${corner.vn}`;
        let index = lookup.get(key);
        if (index === undefined) {
          index = positions.length / 3;
          lookup.set(key, index);
          positions.push(...movePosition(parsed.positions[corner.v]));
          normals.push(...moveNormal(parsed.normals[corner.vn] ?? [0, 1, 0]));
        }
        indices.push(index);
      }
    }

    const primitive = document
      .createPrimitive()
      .setAttribute(
        "POSITION",
        document.createAccessor(`${part}_position`).setType("VEC3")
          .setArray(new Float32Array(positions)).setBuffer(buffer)
      )
      .setAttribute(
        "NORMAL",
        document.createAccessor(`${part}_normal`).setType("VEC3")
          .setArray(new Float32Array(normals)).setBuffer(buffer)
      )
      .setIndices(
        document.createAccessor(`${part}_index`).setType("SCALAR")
          .setArray(new Uint32Array(indices)).setBuffer(buffer)
      )
      .setMaterial(materials[group.material]);

    meshes[node].addPrimitive(primitive);
  }

  scene.addChild(
    document.createNode("gavel").setMesh(meshes.gavel).setTranslation(transforms.pivot)
  );
  scene.addChild(document.createNode("block").setMesh(meshes.block));

  await document.transform(
    dedup(),
    weld(),
    reorder({ encoder: MeshoptEncoder, target: "size" }),
    quantize({ pattern: /^(POSITION|NORMAL)$/ })
  );

  document.createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  document.createExtension(KHRMeshQuantization).setRequired(true);

  await mkdir(dirname(OUT), { recursive: true });
  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
  await io.write(OUT, document);

  const degrees = ((pose.tilt * 180) / Math.PI).toFixed(2);
  console.log(`Levelled the swing by ${degrees} deg, scaled by ${scale.toFixed(4)}.`);
  console.log(`Pivot (grip) at [${transforms.pivot.map((n) => n.toFixed(3)).join(", ")}].`);
  console.log(`Wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
