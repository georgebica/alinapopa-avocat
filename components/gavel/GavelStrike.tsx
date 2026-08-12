"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { createGavelState, type GavelState } from "./GavelScene";
import { STRIKE_DURATION } from "./strike";

// Kept out of the server bundle and off the critical path: this sits at the foot
// of the page, so the three.js payload should never block the banner rendering.
const GavelScene = dynamic(() => import("./GavelScene"), { ssr: false });

/**
 * The gavel in the closing CTA banner. It rests on its block until the banner
 * scrolls into view, strikes once, and then holds the resting pose for good.
 *
 * The strike is fired by writing to a ref rather than by setting state, so the
 * swing itself costs no React renders — the same approach the hero takes. The
 * one piece of real state is `playing`, which exists only to switch the canvas
 * between its on-demand and continuous loops for the duration of the hit.
 */
export function GavelStrike({ className = "" }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const state = useRef<GavelState>(createGavelState());
  const [playing, setPlaying] = useState(false);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    state.current.reducedMotion = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || reducedMotion) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          // A short beat after the banner settles, so the strike reads as its
          // own moment rather than as part of the scroll.
          timer = setTimeout(() => {
            state.current.time = 0;
            setPlaying(true);
            timer = setTimeout(() => setPlaying(false), STRIKE_DURATION * 1000 + 200);
          }, 260);
        }
      },
      // Most of the canvas has to be on screen: triggering on a sliver means the
      // strike is over before the viewer has arrived.
      { threshold: 0.6 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapperRef} aria-hidden="true" className={className}>
      <GavelScene stateRef={state} playing={playing} />
    </div>
  );
}
