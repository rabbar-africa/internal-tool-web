export function isValidNonEmptyArray(value: unknown): value is unknown[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => v !== null && v !== undefined && !Number.isNaN(v))
  );
}

/**
 * Practical email check: one @, something either side, and a dotted domain.
 * Deliberately not RFC-complete — the server is the authority, this is just to
 * catch typos before a request goes out.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
