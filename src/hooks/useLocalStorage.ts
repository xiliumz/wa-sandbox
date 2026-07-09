import { useState, useEffect } from 'react';

/**
 * React state hook backed by `localStorage`.
 *
 * @param key - The localStorage key to read/write.
 * @param initialValue - Value used when no stored value exists, or a function
 *   that receives the parsed stored value (or `null`) and returns the initial value.
 * @returns A tuple of [storedValue, setStoredValue] synced with localStorage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | ((stored: T | null) => T),
): [T, (value: T | ((prev: T) => T)) => void] {
  const resolveInitial = (stored: T | null): T => {
    return typeof initialValue === 'function'
      ? (initialValue as (stored: T | null) => T)(stored)
      : (stored ?? initialValue);
  };

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      const parsed = item ? (JSON.parse(item) as T) : null;
      return resolveInitial(parsed);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return resolveInitial(null);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
