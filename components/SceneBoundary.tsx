"use client";

import { Component, type ReactNode } from "react";

/**
 * Last line of defence around WebGL content. A loader rejection or a driver
 * failure inside a scene must cost that scene only — without a boundary the
 * error unwinds the whole React root and the site goes blank, which is
 * exactly what happened when a CDN 429'd the hero's environment map. Works
 * both around a <Canvas> and inside one: react-three-fiber's reconciler
 * honours class error boundaries the same way react-dom does.
 */
export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
