export function isValidNonEmptyArray(value: unknown): value is unknown[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => v !== null && v !== undefined && !Number.isNaN(v))
  );
}
