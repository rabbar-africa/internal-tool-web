import { useCountUp } from "@/hooks/useCountUp";

interface CountUpProps {
  value: number;
  /** Turns the running number into text, e.g. as money. */
  format?: (n: number) => string;
  durationMs?: number;
}

/**
 * A number that counts up to its value. The in-between numbers are whole,
 * so kobo don't flicker; it lands on the exact value.
 */
export function CountUp({
  value,
  format = (n) => n.toLocaleString("en-NG"),
  durationMs,
}: CountUpProps) {
  const shown = useCountUp(value, durationMs);
  return <>{format(shown === value ? value : Math.round(shown))}</>;
}
