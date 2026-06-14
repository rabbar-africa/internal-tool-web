import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Configuration for each URL state parameter
 */
interface UrlStateConfig<T> {
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

/**
 * Type-safe URL state configuration object
 */
type UrlStateSchema<T extends Record<string, any>> = {
  [K in keyof T]: UrlStateConfig<T[K]>;
};

/**
 * Default serializers for common types
 */
const defaultSerializers = {
  string: (value: string) => value,
  number: (value: number) => String(value),
  boolean: (value: boolean) => String(value),
  array: (value: any[]) => JSON.stringify(value),
  object: (value: object) => JSON.stringify(value),
};

/**
 * Default deserializers for common types
 */
const defaultDeserializers = {
  string: (value: string) => value,
  number: (value: string) => Number(value),
  boolean: (value: string) => value === "true",
  array: (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  },
  object: (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  },
};

/**
 * Hook that syncs state with URL query parameters
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useUrlState({
 *   page: { defaultValue: 1 },
 *   limit: { defaultValue: 10 },
 *   search: { defaultValue: '' },
 *   status: { defaultValue: 'active' },
 * });
 *
 * // Update single value
 * setFilters({ page: 2 });
 *
 * // Update multiple values
 * setFilters({ page: 1, limit: 20 });
 *
 * // Update with function
 * setFilters(prev => ({ ...prev, page: prev.page + 1 }));
 * ```
 */
export function useUrlState<T extends Record<string, any>>(
  schema: UrlStateSchema<T>,
  options: {
    /**
     * Whether to replace the current history entry instead of pushing a new one
     * @default false
     */
    replace?: boolean;
    /**
     * Key prefix to avoid conflicts with other query params
     * @default undefined
     */
    prefix?: string;
    /**
     * Whether to remove default values from URL to keep it clean
     * @default true
     */
    removeDefaults?: boolean;
  } = {},
): [T, (updates: Partial<T> | ((prev: T) => Partial<T>)) => void, () => void] {
  const { replace = false, prefix = "", removeDefaults = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Parse current URL params into state object
   */
  const state = useMemo(() => {
    const result = {} as T;

    for (const [key, config] of Object.entries(schema) as [
      keyof T,
      UrlStateConfig<any>,
    ][]) {
      const paramKey = prefix ? `${prefix}${String(key)}` : String(key);
      const urlValue = searchParams.get(paramKey);

      if (urlValue !== null) {
        // Deserialize from URL
        if (config.deserialize) {
          result[key] = config.deserialize(urlValue);
        } else {
          // Auto-detect type and use default deserializer
          const defaultValue = config.defaultValue;
          if (typeof defaultValue === "number") {
            result[key] = defaultDeserializers.number(urlValue) as T[keyof T];
          } else if (typeof defaultValue === "boolean") {
            result[key] = defaultDeserializers.boolean(urlValue) as T[keyof T];
          } else if (Array.isArray(defaultValue)) {
            result[key] = defaultDeserializers.array(urlValue) as T[keyof T];
          } else if (
            typeof defaultValue === "object" &&
            defaultValue !== null
          ) {
            result[key] = defaultDeserializers.object(urlValue) as T[keyof T];
          } else {
            result[key] = urlValue as T[keyof T];
          }
        }
      } else {
        // Use default value
        result[key] = config.defaultValue;
      }
    }

    return result;
  }, [searchParams, schema, prefix]);

  /**
   * Update URL params
   */
  const setState = useCallback(
    (updates: Partial<T> | ((prev: T) => Partial<T>)) => {
      const newState = typeof updates === "function" ? updates(state) : updates;

      setSearchParams(
        (prevParams) => {
          const newParams = new URLSearchParams(prevParams);

          for (const [key, value] of Object.entries(newState)) {
            const config = schema[key as keyof T];
            if (!config) continue;

            const paramKey = prefix ? `${prefix}${key}` : key;

            // Remove if value equals default and removeDefaults is true
            if (removeDefaults && value === config.defaultValue) {
              newParams.delete(paramKey);
              continue;
            }

            // Serialize and set
            let serialized: string;
            if (config.serialize) {
              serialized = config.serialize(value);
            } else {
              // Auto-detect type and use default serializer
              if (typeof value === "number") {
                serialized = defaultSerializers.number(value);
              } else if (typeof value === "boolean") {
                serialized = defaultSerializers.boolean(value);
              } else if (Array.isArray(value)) {
                serialized = defaultSerializers.array(value);
              } else if (typeof value === "object" && value !== null) {
                serialized = defaultSerializers.object(value);
              } else {
                serialized = String(value);
              }
            }

            newParams.set(paramKey, serialized);
          }

          return newParams;
        },
        { replace },
      );
    },
    [state, schema, prefix, replace, removeDefaults, setSearchParams],
  );

  /**
   * Reset to default values
   */
  const resetState = useCallback(() => {
    setSearchParams(
      (prevParams) => {
        const newParams = new URLSearchParams(prevParams);

        for (const key of Object.keys(schema)) {
          const paramKey = prefix ? `${prefix}${key}` : key;
          newParams.delete(paramKey);
        }

        return newParams;
      },
      { replace },
    );
  }, [schema, prefix, replace, setSearchParams]);

  return [state, setState, resetState];
}

/**
 * Simplified hook for single URL parameter
 *
 * @example
 * ```tsx
 * const [page, setPage] = useUrlParam('page', 1);
 * setPage(2);
 * ```
 */
export function useUrlParam<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    replace?: boolean;
  } = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serialize, deserialize, replace } = options;

  const [state, setState, resetState] = useUrlState(
    {
      [key]: {
        defaultValue,
        serialize,
        deserialize,
      },
    } as any,
    { replace },
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const newValue =
        typeof value === "function"
          ? (value as (prev: T) => T)(state[key])
          : value;
      setState({ [key]: newValue } as any);
    },
    [key, state, setState],
  );

  return [state[key], setValue, resetState];
}
