import { useState, useEffect } from 'react';

/**
 * React state hook backed by `localStorage`.
 *
 * @param key - The localStorage key to read/write.
 * @param initialValue - Value used when no stored value exists. May be a function.
 * @returns A tuple of [storedValue, setStoredValue] synced with localStorage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const resolveInitial = (): T => {
    return typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  };

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : resolveInitial();
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return resolveInitial();
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
