"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { firm } from "@/content/firm";
import { CTAButtons } from "./CTAButtons";
import { mapRange } from "./hero/stages";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { createGavelState, type GavelState } from "./gavel/GavelScene";
import { STRIKE_POINT } from "./gavel/strike";

// Kept out of the server bundle and off the critical path: this sits at the foot
// of the page, so the three.js payload should never block the banner rendering.
const GavelScene = dynamic(() => import("./gavel/GavelScene"), { ssr: false });

/**
 * The dark stage the whole closing scene plays on. Pure CSS: a burgundy that
 * falls away to near-black at the edges, one volumetric shaft of warm light
 * angled down towards the gavel, a pool of brass haze behind it, and a dark
 * floor plane whose lit horizon line is the only hint of the surface the block
 * rests on. Everything is gradient-built — no images, so nothing to load and
 * nothing to pixelate.
 *
 * The shaft is handed back through `shaftRef` so the scroll handler can slowly
 * raise the light as the strike approaches.
 */
function Atmosphere({ shaftRef }: { shaftRef?: RefObject<HTMLDivElement | null> }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 105% at 70% 16%, #6b1727 0%, #43101c 45%, rgba(38,8,17,0.4) 70%, transparent 95%), linear-gradient(to bottom, #3d0e1a 0%, #24070f 55%, #150408 100%)",
        }}
      />
      {/* One shaft of warm light, falling from upper right onto the gavel. */}
      <div
        ref={shaftRef}
        className="absolute -top-[25%] right-[2%] h-[150%] w-[38%] -rotate-[16deg] blur-3xl will-change-[opacity]"
        style={{
          opacity: 0.09,
          background:
            "linear-gradient(to bottom, rgba(238,201,142,0.38) 0%, rgba(238,201,142,0.08) 55%, transparent 78%)",
        }}
      />
      {/* Brass haze pooled where the gavel sits, so the render has lit air around it. */}
      <div
        className="absolute right-[-14%] top-[32%] h-[62%] w-[58%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(185,149,92,0.15), transparent 72%)" }}
      />
      {/* The floor: a dark polished plane read only through its falloff and the
          faint lit horizon where it meets the haze. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[36%]"
        style={{
          background: "linear-gradient(to top, rgba(7,2,4,0.9) 0%, rgba(7,2,4,0.4) 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-[32%] h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 12%, rgba(238,201,142,0.1) 42%, rgba(238,201,142,0.22) 68%, transparent 92%)",
        }}
      />
      {/* Vignette, so the corners fall off like a graded film frame. */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(115% 90% at 50% 42%, transparent 52%, rgba(9,2,5,0.6) 100%)",
        }}
      />
    </div>
  );
}

/** Site progression dots: four quiet stops behind us, the gold one is here —
 *  the end of the page. Decoration only, hence hidden from the tree. */
function SectionDots() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5"
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-1 w-1 rounded-full bg-surface/20" />
      ))}
      <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_rgba(185,149,92,0.9)]" />
    </div>
  );
}

/** Eyebrow, headline, supporting line, actions — shared verbatim between the
 *  scrolling scene and the reduced-motion still. */
function ClosingCopy({ actionsRef }: { actionsRef?: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex max-w-xl flex-col items-start gap-5 sm:gap-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold">
        Cabinet de avocat · {firm.city}
      </p>
      <h2 className="text-3xl leading-[1.12] text-surface sm:text-4xl lg:text-5xl">
        {firm.cta.title}
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-surface/65 sm:text-base">
        {firm.cta.text}
      </p>
      <div ref={actionsRef} style={{ opacity: 1 }} className="w-full will-change-[opacity,transform] sm:w-auto">
        <CTAButtons variant="dark" />
      </div>
    </div>
  );
}

/**
 * The closing scene of the site: a pinned scroll sequence, the way the hero is.
 * The section is taller than the screen, its content sticks, and the scrollbar
 * drives the gavel — a cinematic foreground object, head angled towards the
 * camera and already raised, lit hard from one side out of a dark burgundy
 * atmosphere. Composed for the phone first: the gavel owns the lower half of
 * the frame beneath the copy, and desktop is the wide-screen recomposition of
 * that same scene.
 *
 * The scene is fully composed from its first visible pixel: copy readable and
 * the gavel already armed while the section is still sliding into view —
 * nothing waits for the pin to engage, because a viewer mid-entry is already
 * looking at it. The scroll then spends its travel on the one event that
 * matters: the head tenses, crossing the strike point releases the hit
 * (time-based, with rebounds — see `strike.ts` for why the fall is not
 * scrubbed), and the contact actions stamp onto the page with the strike.
 * Scrolling back up re-arms the swing.
 *
 * All scroll-linked styling is written straight to the DOM from one
 * subscription, same as the hero — no React renders per scroll tick. The
 * canvas runs a strictly on-demand loop and is invalidated from the same
 * subscription, so the GPU works only on ticks where something moved.
 */
export function CTABanner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const shaftRef = useRef<HTMLDivElement>(null);
  const state = useRef<GavelState>(createGavelState());

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    state.current.reducedMotion = reducedMotion;
    if (reducedMotion) state.current.progress = 0;
  }, [reducedMotion]);

  const apply = useCallback((progress: number) => {
    state.current.progress = progress;
    // One render per scroll write. Progress only changes while the section is
    // inside its scroll window, so this never wakes the canvas for a banner
    // that is off screen.
    state.current.invalidate();

    // The actions are what the strike delivers: they stamp in with the hit.
    // Rendered visible for no-JS and reduced-motion readers; this handler is
    // what hides them beforehand.
    if (actionsRef.current) {
      const stamped = mapRange(progress, [STRIKE_POINT, STRIKE_POINT + 0.1], [0, 1]);
      actionsRef.current.style.opacity = String(stamped);
      actionsRef.current.style.transform = `translateY(${(1 - stamped) * 16}px) scale(${
        0.94 + stamped * 0.06
      })`;
      // Invisible buttons must not swallow taps meant for the page.
      actionsRef.current.style.pointerEvents = stamped < 0.5 ? "none" : "auto";
    }

    // The key light swells towards the strike, then holds.
    if (shaftRef.current) {
      shaftRef.current.style.opacity = String(
        mapRange(progress, [0.04, STRIKE_POINT], [0.05, 0.16])
      );
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!reducedMotion) apply(progress);
  });

  // A reload part-way down the page lands mid-sequence: seed every scroll-linked
  // style from the real position rather than waiting for the first scroll event.
  useEffect(() => {
    if (!reducedMotion) apply(scrollYProgress.get());
  }, [reducedMotion, scrollYProgress, apply]);

  // Reduced motion gets a calm single screen: the same graded atmosphere, the
  // gavel resting on its block as a still, already in its final framing.
  if (reducedMotion) {
    return (
      <section className="relative overflow-hidden">
        <Atmosphere />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14 lg:px-16">
          <ClosingCopy />
          <div aria-hidden="true" className="h-[200px] w-full sm:h-[260px] lg:h-[360px]">
            <GavelScene stateRef={state} />
          </div>
        </div>
        <SectionDots />
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative" style={{ height: "150vh" }}>
      <div className="sticky top-16 h-[calc(100svh-4rem)] min-h-[560px] overflow-hidden">
        <Atmosphere shaftRef={shaftRef} />

        {/* The gavel layer. Not a grid cell: a foreground object allowed to
            break the content container. Sized for the phone first — a large
            close object filling the lower half of the frame, pulled up under
            the copy so the two share the frame instead of splitting it — with
            desktop as the tall slab bleeding off the right edge. Fully visible
            from the first pixel of the section; only the strike is animated.
            Ordered before the copy in the DOM and aria-hidden, so it never
            interrupts the reading order. */}
        <div
          aria-hidden="true"
          className="absolute bottom-[-4svh] left-1/2 h-[62svh] w-[120%] -translate-x-1/2 sm:h-[64svh] sm:w-[105%] lg:bottom-auto lg:left-auto lg:right-[-7%] lg:top-1/2 lg:h-[92svh] lg:w-[62%] lg:-translate-y-1/2 lg:translate-x-0"
        >
          {/* Brass halo and a diffuse floor pool, so the render sits in lit
              space on a surface instead of floating on the grade. */}
          <div
            className="absolute left-1/2 top-1/2 aspect-square h-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(216,178,124,0.2) 0%, rgba(216,178,124,0.05) 45%, transparent 70%)",
            }}
          />
          <div className="absolute bottom-[6%] left-1/2 h-[7%] w-[52%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-xl" />
          <GavelScene stateRef={state} />
        </div>

        {/* The copy layer, floated over the scene rather than gridded against
            it: the upper half of the frame on a phone (the gavel owns the
            lower), vertically centred on the left on desktop. */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-start px-6 pt-[6svh] sm:px-10 lg:justify-center lg:px-16 lg:pt-0">
          <ClosingCopy actionsRef={actionsRef} />
        </div>

        <SectionDots />
      </div>
    </section>
  );
}
