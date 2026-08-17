// next-sitemap always emits a `Host:` directive built from siteUrl. That
// legacy Yandex directive expects a bare hostname; a full URL with scheme and
// sub-path is non-standard noise every crawler either ignores or misparses,
// so it is stripped from the generated file after the fact.
//
//   node scripts/fix-robots.mjs out
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] ?? "out";
const file = join(outDir, "robots.txt");

const robots = await readFile(file, "utf8");
const cleaned = robots
  .split("\n")
  .filter((line) => !/^(Host:|# Host)/i.test(line))
  .join("\n")
  .replace(/\n{3,}/g, "\n\n");

await writeFile(file, cleaned);
console.log("[fix-robots] stripped Host directive from robots.txt");
