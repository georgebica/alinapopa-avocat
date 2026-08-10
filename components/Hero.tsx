"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { firm } from "@/content/firm";
import { CTAButtons } from "./CTAButtons";
import { createRotationState, TOTAL_SWEEP } from "./hero/rotationState";
import { STAGE_BANDS, WORD_FILL_RANGE, mapRange, stageStyle } from "./hero/stages";
import { useMediaQuery } from "@/lib/useMediaQuery";

const HeroScene = dynamic(() => import("./hero/HeroScene"), { ssr: false });

const WATERMARK = "JUSTIȚIE";

const STAGES = [
  {
    id: "positioning",
    body: firm.positioning,
  },
  {
    id: "closing",
    body: `Cabinet de avocatură fondat în ${firm.founded}, membru al ${firm.barGenitive}. Peste ${firm.yearsOfExperience} ani de consultanță juridică și reprezentare în litigii, fiecare speță fiind analizată individual, cu confidențialitate deplină și atenție la obiectivele dumneavoastră.`,
  },
];

const CLOSING_WORDS = STAGES[1].body.split(" ");

/** Opacity of a word before the scroll sweep reaches it. */
const DIM_WORD_OPACITY = 0.28;

export function Hero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const watermarkRef = useRef<HTMLParagraphElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const topScrimRef = useRef<HTMLDivElement>(null);
  const bottomScrimRef = useRef<HTMLDivElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const rotationState = useRef(createRotationState());

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    rotationState.current.reducedMotion = reducedMotion;
    if (reducedMotion) {
      rotationState.current.sweep = 0;
      rotationState.current.progress = 0;
    }
  }, [reducedMotion]);

  // All scroll-linked styling is written straight to the DOM from this single
  // subscription. Binding motion values to `style` instead would route them
  // through framer-motion's WAAPI path, which eases toward each target over a
  // fixed real-time duration rather than tracking scroll 1:1 — visibly laggy on
  // fast scrolls. Direct writes keep every element locked to scroll position.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reducedMotion) return;

    rotationState.current.sweep = progress * TOTAL_SWEEP;
    rotationState.current.progress = progress;

    STAGE_BANDS.forEach((band, index) => {
      const node = stageRefs.current[index];
      if (!node) return;
      const { opacity, y, scale } = stageStyle(progress, band);
      node.style.opacity = String(opacity);
      node.style.transform = `translateY(${y}px) scale(${scale})`;
      // Fully faded stages must not swallow taps from the CTAs beneath them.
      node.style.pointerEvents = opacity < 0.05 ? "none" : "auto";
    });

    // Light the closing paragraph one word at a time. Each word gets its own
    // slice of the fill range, with the fractional remainder easing that word in
    // so the edge of the sweep is soft rather than a hard on/off boundary.
    const fill = mapRange(progress, WORD_FILL_RANGE, [0, 1]) * CLOSING_WORDS.length;
    wordRefs.current.forEach((node, index) => {
      if (!node) return;
      const lit = Math.min(1, Math.max(0, fill - index));
      node.style.opacity = String(DIM_WORD_OPACITY + lit * (1 - DIM_WORD_OPACITY));
    });

    if (watermarkRef.current) {
      watermarkRef.current.style.opacity = String(mapRange(progress, [0, 0.55], [0.07, 0.17]));
      watermarkRef.current.style.letterSpacing = `${mapRange(progress, [0, 1], [0, 0.06])}em`;
    }

    if (glowRef.current) {
      glowRef.current.style.opacity = String(mapRange(progress, [0, 0.6], [0.55, 1]));
    }

    if (topScrimRef.current) {
      topScrimRef.current.style.opacity = String(mapRange(progress, [0.1, 0.4], [1, 0.15]));
    }

    if (bottomScrimRef.current) {
      bottomScrimRef.current.style.opacity = String(mapRange(progress, [0.15, 0.45], [0.75, 1]));
    }

    if (mobileBarRef.current) {
      // Slides away as the hero hands over to the page, and comes back if the
      // viewer scrolls up into the sequence again.
      const retreat = mapRange(progress, [0.94, 1], [0, 1]);
      mobileBarRef.current.style.transform = `translateY(${retreat * 100}%)`;
      mobileBarRef.current.style.opacity = String(1 - retreat);
      mobileBarRef.current.style.pointerEvents = retreat > 0.5 ? "none" : "auto";
    }
  });

  // Reduced motion gets a calm, stacked hero: nothing pinned, nothing overlapping,
  // the statue simply sits in its own block between the copy and the CTAs.
  if (reducedMotion) {
    return (
      <section className="relative overflow-hidden border-b border-line bg-surface px-6 py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-burgundy sm:text-xs">
            {firm.legalName} · {firm.city}
          </p>
          <h1 className="text-balance text-[1.7rem] leading-[1.15] text-ink sm:text-[2rem] lg:text-[3.5rem]">
            {firm.positioning}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-charcoal-muted">
            {STAGES[1].body}
          </p>

          <div className="relative my-2 h-[38vh] min-h-[240px] w-full">
            <p
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center font-display text-[23vw] font-medium leading-none text-burgundy opacity-[0.09] lg:text-[15vw]"
            >
              {WATERMARK}
            </p>
            <div className="pointer-events-none absolute inset-0">
              <HeroScene rotationRef={rotationState} variant="static" />
            </div>
          </div>

          <CTAButtons className="justify-center" />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrapperRef}
      className="relative border-b border-line bg-surface"
      style={{ height: "320vh" }}
    >
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] min-h-[600px] flex-col overflow-hidden">
        {/* Museum light behind the statue. */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[92vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: 0.55,
            background:
              "radial-gradient(circle, rgba(185,149,92,0.28) 0%, rgba(124,29,46,0.07) 48%, rgba(255,255,255,0) 72%)",
          }}
        />

        <p
          ref={watermarkRef}
          aria-hidden="true"
          style={{ opacity: 0.07 }}
          className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center font-display text-[23vw] font-medium leading-none text-burgundy lg:text-[15vw]"
        >
          {WATERMARK}
        </p>

        {/* The statue, centred and filling the frame on every breakpoint. */}
        <div className="pointer-events-none absolute inset-0">
          <HeroScene rotationRef={rotationState} variant={isDesktop ? "desktop" : "mobile"} />
        </div>

        {/* Cream scrims keep the copy legible over the bronze. Each fades in only
            while its half of the frame actually holds text, so the statue stays
            clean the rest of the time. */}
        <div
          ref={topScrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[44%]"
          style={{
            opacity: 1,
            background:
              "linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 40%, rgba(255,255,255,0.72) 64%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div
          ref={bottomScrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] lg:h-[46%]"
          style={{
            opacity: 0.75,
            // Solid under the CTA stack, with the falloff concentrated in the top
            // third so it never veils the statue's face.
            background:
              "linear-gradient(to top, #FFFFFF 0%, #FFFFFF 48%, rgba(255,255,255,0.92) 68%, rgba(255,255,255,0.45) 84%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* pb on phones clears the fixed action bar. */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-between px-6 pb-24 pt-8 text-center lg:pb-10 lg:pt-12">
          {/* Opening copy, above the statue's head. Hands off to the block below
              as the camera dollies down the figure. */}
          <div
            ref={(node) => {
              stageRefs.current[0] = node;
            }}
            className="flex w-full flex-col items-center gap-3 will-change-[opacity,transform]"
            style={{ opacity: 1 }}
          >
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-burgundy sm:text-xs">
              {firm.legalName} · {firm.city}
            </p>
            {/* Slightly tighter than the global H1 at the narrowest widths, where
                it would otherwise run to five lines and reach the statue. */}
            <h1 className="max-w-3xl text-balance text-[1.7rem] leading-[1.15] text-ink sm:text-[2rem] lg:text-[3.5rem]">
              {STAGES[0].body}
            </h1>
          </div>

          {/* Closing copy, beneath the statue. Words light from muted to ink as
              the sequence runs out, so the paragraph resolves as the statue
              settles on its half turn. */}
          <div className="flex w-full flex-col items-center gap-5">
            <div
              ref={(node) => {
                stageRefs.current[1] = node;
              }}
              className="flex w-full justify-center will-change-[opacity,transform]"
              style={{ opacity: 0, transform: "translateY(22px) scale(0.985)" }}
            >
              <p className="max-w-3xl text-balance font-display text-lg font-medium leading-snug text-ink sm:text-xl lg:text-[1.6rem] lg:leading-[1.35]">
                {CLOSING_WORDS.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    ref={(node) => {
                      wordRefs.current[index] = node;
                    }}
                    // Rendered lit so the paragraph is legible without scripting;
                    // the scroll handler dims it long before the stage fades in.
                    className="transition-opacity duration-300 ease-out"
                  >
                    {word}
                    {index < CLOSING_WORDS.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            </div>

            {/* On phones the actions live in the fixed bar below instead, so the
                scroll sequence never pushes them out of thumb reach. */}
            <CTAButtons className="hidden justify-center lg:flex" />
          </div>
        </div>
      </div>

      {/* Phone-only action bar, held against the bottom of the screen for the
          whole hero sequence and retired once the copy has finished. Rendered
          outside the sticky container so it is positioned against the viewport
          rather than that element. */}
      <div
        ref={mobileBarRef}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden"
        style={{ opacity: 1 }}
      >
        <CTAButtons layout="bar" />
      </div>
    </section>
  );
}
