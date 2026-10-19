import { useEffect, useRef, useState } from "react";

export interface SpringOptions {
  /** Damping ratio: 1 = critically damped (no overshoot, graceful). <1 adds bounce. */
  damping?: number;
  /** How quickly the value moves toward the target, in seconds. Not a fixed duration. */
  response?: number;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Apple-style spring: animates `value` toward `target` with real physics.
 * - Interruptible: retargeting keeps the current position AND velocity,
 *   so grabbing a moving element never causes a jump ("brick wall").
 * - Critically damped by default (damping 1) — no overshoot unless asked.
 * - Honors prefers-reduced-motion by snapping to the target.
 */
export function useSpring(target: number, { damping = 1, response = 0.35 }: SpringOptions = {}) {
  const [value, setValue] = useState(target);
  const state = useRef({ x: target, v: 0 });
  const targetRef = useRef(target);
  const cfgRef = useRef({ damping, response });
  cfgRef.current = { damping, response };
  targetRef.current = target;

  useEffect(() => {
    if (prefersReducedMotion()) {
      state.current = { x: targetRef.current, v: 0 };
      setValue(targetRef.current);
      return;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const { damping: zeta, response: T } = cfgRef.current;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = targetRef.current;

      // Map Apple's damping/response to harmonic oscillator coefficients.
      const omega = (2 * Math.PI) / Math.max(T, 0.01);
      const k = omega * omega;
      const c = 2 * zeta * omega;

      // Semi-implicit Euler with substeps for stability.
      let { x, v } = state.current;
      const h = dt / 4;
      for (let i = 0; i < 4; i++) {
        const F = -k * (x - t) - c * v;
        v += F * h;
        x += v * h;
      }
      state.current = { x, v };

      if (Math.abs(x - t) < 0.005 && Math.abs(v) < 0.005) {
        state.current = { x: t, v: 0 };
        setValue(t);
        return; // settled — stop ticking
      }
      setValue(x);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}
