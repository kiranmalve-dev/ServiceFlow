import { useState, useEffect } from "react";

/**
 * Returns a debounced copy of `value` that only updates after
 * the user has stopped changing it for `delay` milliseconds.
 *
 * @param value - The value to debounce (string, number, object, etc.)
 * @param delay - Debounce delay in ms (default: 400)
 *
 * @example
 * const debouncedSearch = useDebounce(search, 400);
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
