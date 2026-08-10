# Alina Popa – Cabinet de Avocat

Website for a law practice in Timișoara, member of Baroul Timiș. Fifteen statically
generated pages in Romanian, built mobile-first, with a scroll-driven 3D hero.

**Live:** https://georgebica.github.io/alinapopa-avocat/

## Stack

- **Next.js 16** (App Router) — every page prerendered, exported as static HTML
- **Tailwind CSS v4** — design tokens defined in `app/globals.css`
- **Three.js** via `@react-three/fiber` / `drei` — the hero statue, lazy-loaded
- **next-sitemap** — generates `sitemap.xml` and `robots.txt` at build time

## Local development

```bash
npm install
npm run dev          # http://localhost:3000/alinapopa-avocat
npm run build        # static export into out/
npm run lint
```

Because the site is deployed under a project sub-path, `next dev` also serves it
from `/alinapopa-avocat` — the bare `http://localhost:3000/` will 404.

## Content

All copy and business data live in typed files, so no CMS is required:

- `content/firm.ts` — single source of truth for name, address, phone, hours,
  values. Everything else (footer, contact page, JSON-LD schema) reads from it,
  so the NAP can never drift out of sync between pages.
- `content/services/*.ts` — one file per practice area (intro, sub-services, FAQ,
  related areas). Adding a tenth practice area is a new data file, not a new page:
  `app/servicii/[slug]/page.tsx` renders them all.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the
static export and publishes `out/` to GitHub Pages.

Two details that a plain static host makes fragile, both handled in the build:

- **`basePath`** — set in `next.config.ts` and exposed to the client as
  `NEXT_PUBLIC_BASE_PATH`. `next/link` and bundled assets get the prefix
  automatically, but URLs requested at runtime do not — the hero's `.glb` builds
  its path from that variable.
- **RSC prefetch payloads** — Next 16 writes them into nested `__next.*`
  directories while the client requests a dot-joined filename. A Next server maps
  between the two; GitHub Pages cannot, so `scripts/flatten-rsc-payloads.mjs`
  copies each payload to the flat name. Without it every prefetch 404s and
  navigation degrades to full page reloads.

### Moving to a custom domain

1. Add `public/CNAME` containing the domain.
2. Set `PAGES_BASE_PATH=""` and `NEXT_PUBLIC_SITE_URL=https://<domain>` in the
   workflow's build step, and `SITE_URL` for next-sitemap.
3. Point the domain's DNS at GitHub Pages, then set it under Settings → Pages.

## Notes

- There is no contact form. GitHub Pages serves static files only, so a form
  would need a third-party endpoint; the contact page leads with phone, WhatsApp
  and email instead. If a form is wanted later, wire it to a service such as
  Formspree or Web3Forms and restore the consent copy in the privacy policy.
- The source model is `source/Lady Justice.glb` (95 MB). The served version,
  `public/models/statue.glb`, is 1.7 MB — simplified and Meshopt-compressed with
  `npx gltf-transform optimize`.
- The hero respects `prefers-reduced-motion`: no pinning, no rotation, and the
  whole statue shown uncropped in its own block.
