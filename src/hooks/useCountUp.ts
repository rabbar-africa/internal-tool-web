import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Runs a number up to `target`, fast then settling. Starts from 0 on the
 * first value, then from wherever it is when the target changes (a new
 * filter, say). People who ask for reduced motion get the number at once.
 */
export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(() =>
    prefersReducedMotion() ? target : 0,
  );
  const current = useRef(value);

  useEffect(() => {
    const from = current.current;
    if (from === target || prefersReducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }

    let frame = 0;
    // Timed from the first frame: a frame's timestamp can be a little
    // earlier than "now" here, which would start the count below zero.
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      const t = Math.min(Math.max((now - start) / durationMs, 0), 1);
      const next = t === 1 ? target : from + (target - from) * easeOutCubic(t);
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
