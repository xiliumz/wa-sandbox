import { useEffect, useRef, useCallback } from 'react';
import type { ChatConfig, Message } from '@/types/messages';

export function usePollMessages(
  config: ChatConfig,
  onMessagesReceived: (messages: Message[]) => void
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!config.backendApiUrl) return;

    try {
      const response = await fetch(config.backendApiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) return;

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        onMessagesReceived(data as Message[]);
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [config.backendApiUrl, onMessagesReceived]);

  useEffect(() => {
    if (!config.backendApiUrl) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(poll, config.pollInterval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config.backendApiUrl, config.pollInterval, poll]);
}
