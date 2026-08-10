import type { NextConfig } from "next";
import path from "node:path";

/**
 * Deployed as a static export to GitHub Pages under a project repo, so the site
 * is served from a sub-path. `basePath` makes next/link and the asset pipeline
 * emit that prefix; without it every stylesheet and route 404s on Pages.
 *
 * Override with PAGES_BASE_PATH="" when serving from a domain root (a custom
 * domain or a <user>.github.io repo).
 */
const basePath = process.env.PAGES_BASE_PATH ?? "/alinapopa-avocat";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // next/link and the asset pipeline apply basePath automatically, but URLs we
  // fetch ourselves at runtime (the GLB the hero loader requests) do not — this
  // exposes the prefix so those can be built explicitly.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Pages has no image optimisation server; export requires the raw files.
  images: { unoptimized: true },
  // Emits directory/index.html, which Pages serves for extension-less URLs.
  trailingSlash: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
