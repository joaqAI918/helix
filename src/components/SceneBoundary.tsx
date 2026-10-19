import { Component, type ReactNode } from 'react';

// A 3D scene that fails (no WebGL, a model that will not load) must never take the page down with it:
// the section keeps its colour, disc and text, and simply shows no canvas.
export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('3D scene disabled:', error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
