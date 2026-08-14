"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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

/** Bookends the hero's JUSTIȚIE: the page opens on justice, closes on the verdict. */
const WATERMARK = "VERDICT";

/**
 * The closing CTA, rebuilt as a pinned scroll sequence the way the hero is:
 * the section is taller than the screen, its content sticks, and the scrollbar
 * drives the gavel. Scrolling winds the head up; crossing the strike point
 * releases the hit (time-based, with rebounds — see `strike.ts` for why the
 * fall is not scrubbed); and the contact stamps the CTA buttons onto the page.
 * Scrolling back up re-arms the swing.
 *
 * All scroll-linked styling is written straight to the DOM from one
 * subscription, same as the hero — no React renders per scroll tick. The one
 * piece of real state is `onScreen`, which switches the canvas between its
 * on-demand and continuous loops so the WebGL loop never runs for a banner
 * nobody is looking at.
 */
export function CTABanner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLParagraphElement>(null);
  const gavelWrapRef = useRef<HTMLDivElement>(null);
  const state = useRef<GavelState>(createGavelState());
  const [onScreen, setOnScreen] = useState(false);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    state.current.reducedMotion = reducedMotion;
    if (reducedMotion) state.current.progress = 0;
  }, [reducedMotion]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      // A little early, so the first frames of the wind-up are never missed.
      { rootMargin: "120px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const apply = useCallback((progress: number) => {
    state.current.progress = progress;

    // The copy arrives early, while the gavel is still winding up behind it.
    if (copyRef.current) {
      const arrive = mapRange(progress, [0.03, 0.22], [0, 1]);
      copyRef.current.style.opacity = String(arrive);
      copyRef.current.style.transform = `translateY(${(1 - arrive) * 28}px)`;
    }

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

    if (watermarkRef.current) {
      watermarkRef.current.style.opacity = String(mapRange(progress, [0, 0.5], [0.04, 0.1]));
      watermarkRef.current.style.letterSpacing = `${mapRange(progress, [0, 1], [0.02, 0.1])}em`;
    }

    // A slight parallax rise for the gavel column, so the render enters the
    // frame as part of the scroll rather than sitting inert in its cell.
    if (gavelWrapRef.current) {
      const rise = mapRange(progress, [0, 0.35], [1, 0]);
      gavelWrapRef.current.style.transform = `translateY(${rise * 34}px)`;
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

  // Reduced motion gets the previous banner: a calm single screen, the gavel
  // resting on its block as a still image.
  if (reducedMotion) {
    return (
      <section className="bg-burgundy px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[3fr_2fr] lg:gap-14">
          <div className="flex flex-col items-start gap-6 text-left">
            <h2 className="text-surface text-2xl lg:text-4xl">{firm.cta.title}</h2>
            <p className="max-w-2xl text-base leading-relaxed text-surface/80">{firm.cta.text}</p>
            <CTAButtons variant="dark" />
          </div>
          <div aria-hidden="true" className="h-[170px] w-full sm:h-[210px] lg:h-[260px]">
            <GavelScene stateRef={state} active={false} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative bg-burgundy" style={{ height: "230vh" }}>
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] min-h-[540px] flex-col justify-center overflow-hidden">
        <p
          ref={watermarkRef}
          aria-hidden="true"
          style={{ opacity: 0.04 }}
          className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center font-display text-[20vw] font-medium leading-none text-surface lg:text-[13vw]"
        >
          {WATERMARK}
        </p>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 px-6 sm:px-10 lg:grid-cols-[3fr_2fr] lg:gap-14 lg:px-16">
          <div
            ref={copyRef}
            style={{ opacity: 1 }}
            className="flex flex-col items-start gap-6 text-left will-change-[opacity,transform]"
          >
            <h2 className="text-surface text-2xl lg:text-4xl">{firm.cta.title}</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-surface/80 sm:text-base">
              {firm.cta.text}
            </p>
            <div
              ref={actionsRef}
              style={{ opacity: 1 }}
              className="w-full will-change-[opacity,transform] sm:w-auto"
            >
              <CTAButtons variant="dark" />
            </div>
          </div>

          {/* Purely decorative, and ordered last so it never comes between the
              copy and the actions in the reading order on a phone. */}
          <div
            ref={gavelWrapRef}
            aria-hidden="true"
            className="relative h-[22vh] min-h-[150px] w-full will-change-transform sm:h-[30vh] lg:h-[54vh]"
          >
            {/* Brass halo and a soft floor shadow, so the render sits in lit
                space instead of floating on flat burgundy. */}
            <div
              className="absolute left-1/2 top-1/2 aspect-square h-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(201,166,121,0.22) 0%, rgba(201,166,121,0.05) 45%, rgba(124,29,46,0) 70%)",
              }}
            />
            {/* Sits under the sounding block, which the camera fit lands left of
                the canvas centre and a little past halfway down. */}
            <div className="absolute left-[30%] top-[64%] h-[8%] w-[38%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-md" />
            <GavelScene stateRef={state} active={onScreen} />
          </div>
        </div>
      </div>
    </section>
  );
}
