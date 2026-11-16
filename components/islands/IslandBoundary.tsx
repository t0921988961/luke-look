"use client";

import { Component, type ReactNode } from "react";

/** Decorative islands (Canvas, animated mocks) render nothing if they throw, instead of blanking the page. */
export class IslandBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
