import { useState, useEffect } from 'react';

/**
 * Detects dead `blob:` object URLs — e.g. media messages restored from
 * localStorage after a reload, whose underlying Blob died with the previous
 * page session. Non-blob URLs are always considered alive; empty or missing
 * URLs (possible in unnormalized server payloads) are considered dead.
 */
export function useBlobUrlAlive(url: string): boolean {
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    if (!url) {
      setAlive(false);
      return;
    }
    if (!url.startsWith('blob:')) {
      setAlive(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(url);
        if (!cancelled) setAlive(response.ok);
      } catch {
        if (!cancelled) setAlive(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return alive;
}
