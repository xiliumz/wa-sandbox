import { useEffect, useRef } from 'react';
import type { Message } from '@/types/messages';

interface UseWebSocketOptions {
  url: string;
  phone: string;
  onMessage: (messages: Message[]) => void;
}

export function useWebSocket({ url, phone, onMessage }: UseWebSocketOptions) {

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);

  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!url) return;

    const connect = () => {
      try {
        const wsUrl = new URL(url, window.location.href);
        if (wsUrl.protocol === 'http:' || wsUrl.protocol === 'https:') {
          wsUrl.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        }
        if (phone) {
          wsUrl.searchParams.set('phone', phone);
        }
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
          if (wsRef.current !== ws) return;
          console.log('[WS] Disconnected, reconnecting in 3s...');
          wsRef.current = null;
          reconnectRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (error) {
        console.error('[WS] Connection failed:', error);
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        const ws = wsRef.current;
        ws.onclose = null;
        ws.onerror = null;
        wsRef.current = null;
        ws.close();
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };
  }, [url, phone]);
}
