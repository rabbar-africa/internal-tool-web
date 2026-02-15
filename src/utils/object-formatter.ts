export function removeFalsyAndEmptyArrayFields<T>(obj: T): Partial<T> {
  const cleanedObject: Partial<T> = {};

  Object.entries(obj as any).forEach(([key, value]) => {
    // Always keep numbers (including 0)
    if (typeof value === "number") {
      cleanedObject[key] = value;
    }
    // Keep truthy values or non-empty arrays
    else if (value && !(Array.isArray(value) && value.length === 0)) {
      cleanedObject[key] = value;
    }
  });

  return cleanedObject;
}
