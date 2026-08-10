"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger, in ms, applied when a group of siblings reveals together. */
  delay?: number;
  className?: string;
};

/**
 * Fades and lifts its child into place the first time it scrolls into view.
 *
 * Implemented with an IntersectionObserver writing a data attribute rather than
 * React state: the reveal is a one-shot visual effect, so it should not cost a
 * re-render, and framer-motion is only bundled on the homepage — pulling it into
 * the service pages purely for this would be a poor trade.
 *
 * The hidden starting state is undone for readers without scripting (see the
 * `scripting: none` rule in globals.css) so the content is never stranded
 * invisible.
 */
export function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.dataset.shown = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.dataset.shown = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={{ transitionDelay: `${delay}ms` }}
      className={`translate-y-4 opacity-0 transition-[opacity,transform] duration-700 ease-out data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
}
