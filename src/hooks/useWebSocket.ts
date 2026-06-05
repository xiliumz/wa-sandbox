import { useEffect, useRef } from 'react';
import type { Message } from '@/types/messages';

interface UseWebSocketOptions {
  url: string;
  onMessage: (messages: Message[]) => void;
}

function getClientId(): string {
  let id = sessionStorage.getItem('ws_client_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('ws_client_id', id);
  }
  return id;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  const clientIdRef = useRef(getClientId());

  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!url || !url.startsWith('ws')) return;

    const connect = () => {
      try {
        const wsUrl = new URL(url);
        wsUrl.searchParams.set('clientId', clientIdRef.current);
        const ws = new WebSocket(wsUrl.toString());
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WS] Connected to bridge server');
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'messages' && Array.isArray(payload.data)) {
              onMessageRef.current(payload.data);
            }
          } catch (err) {
            console.error('[WS] Invalid message:', err);
          }
        };

        ws.onclose = () => {
          console.log('[WS] Disconnected, reconnecting in 3s...');
          wsRef.current = null;
          reconnectRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };
  }, [url]);
}
