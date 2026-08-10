"use client";

import { useEffect, useRef } from "react";

// Requested at runtime rather than bundled, so the deployment's basePath has to
// be applied by hand — same reasoning as the hero's GLB.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const sourceFor = (slug: string) => `${BASE}/videos/${slug}.mp4`;

type SaveDataConnection = { saveData?: boolean };

/** Decorative motion is not worth someone's mobile data, or their vestibular system. */
function motionIsUnwelcome() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const { connection } = navigator as Navigator & { connection?: SaveDataConnection };
  return Boolean(connection?.saveData);
}

/* -------------------------------------------------------------------------
 * Spotlight: one playing video per page, no matter how many are on screen.
 *
 * The practice-area bands are tall, but not so tall that two of them can never
 * share a viewport — so "play whatever is visible" would routinely animate two
 * at once, which is the thing the layout exists to avoid. Instead every spotlit
 * video registers here and, on each scroll frame, only the one whose midpoint
 * sits closest to the middle of the viewport is allowed to run. The rest hold a
 * still frame, so attention has exactly one place to go.
 *
 * Kept as module state rather than context because the bands are server
 * components: there is no shared React parent to hang a provider on, and a
 * plain registry avoids making the whole list client-rendered.
 * ---------------------------------------------------------------------- */

type Entry = { video: HTMLVideoElement; src: string };

const spotlit = new Set<Entry>();
let frame = 0;
let listening = false;

function update() {
  frame = 0;
  const viewport = window.innerHeight;
  const middle = viewport / 2;

  let focused: Entry | null = null;
  let shortest = Infinity;

  for (const entry of spotlit) {
    const box = entry.video.getBoundingClientRect();

    // Attach the file a screen early, so the next band is decoded and ready by
    // the time it takes over rather than starting from a cold fetch.
    if (!entry.video.src && box.bottom > -viewport && box.top < viewport * 2) {
      entry.video.src = entry.src;
    }

    if (box.bottom <= 0 || box.top >= viewport) continue;
    const distance = Math.abs((box.top + box.bottom) / 2 - middle);
    if (distance < shortest) {
      shortest = distance;
      focused = entry;
    }
  }

  for (const entry of spotlit) {
    if (entry !== focused) {
      entry.video.pause();
      continue;
    }
    if (!entry.video.src) entry.video.src = entry.src;
    // Rejects if the tab is backgrounded or the decoder is busy; the next
    // scroll frame re-tries, and the poster covers the gap.
    void entry.video.play().catch(() => {});
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}

function joinSpotlight(entry: Entry) {
  spotlit.add(entry);
  if (!listening) {
    listening = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }
  schedule();
}

function leaveSpotlight(entry: Entry) {
  spotlit.delete(entry);
  if (spotlit.size || !listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

type Props = {
  slug: string;
  /**
   * Compete with the other spotlit videos on the page so that only one plays at
   * a time. Without it the video simply plays whenever it is on screen, which
   * suits the handful of related-service cards on a service page.
   */
  spotlight?: boolean;
  className?: string;
};

/**
 * The looping render that illustrates a practice area.
 *
 * Nothing is fetched until it is wanted: the element ships with `preload="none"`
 * and no `src` at all, showing only its poster, and the file is attached when
 * the scheduler below decides it is close enough to matter. Videos that scroll
 * away pause, so live decoders track what is actually visible.
 *
 * The poster is the loop's own first frame, so the swap from still to video is
 * invisible and there is nothing to fade in.
 */
export function PracticeVideo({ slug, spotlight = false, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (motionIsUnwelcome()) return;

    if (spotlight) {
      const entry: Entry = { video, src: sourceFor(slug) };
      joinSpotlight(entry);
      return () => leaveSpotlight(entry);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!video.src) video.src = sourceFor(slug);
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [slug, spotlight]);

  return (
    <video
      ref={ref}
      poster={`${BASE}/videos/${slug}.webp`}
      muted
      loop
      playsInline
      preload="none"
      // Decorative: the band's heading already names the practice area.
      aria-hidden="true"
      tabIndex={-1}
      className={className}
    />
  );
}
