import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ChatConfig, Message } from '@/types/messages';

function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

async function computeSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const bytes = new Uint8Array(signature);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256=${hex}`;
}

export function useWebhook(config: ChatConfig) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendWebhook = useCallback(async (message: Message): Promise<boolean> => {
    if (!config.webhookUrl) return false;

    const payload = buildWebhookPayload(message, config);
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (config.appSecret) {
      try {
        headers['X-Hub-Signature-256'] = await computeSignature(body, config.appSecret);
      } catch {
        console.warn('Failed to compute webhook signature');
      }
    }

    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers,
        body,
        signal: abortControllerRef.current.signal,
      });

      return response.ok;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false;
      }
      console.error('Webhook POST failed:', error);
      return false;
    }
  }, [config]);

  const testVerification = useCallback(async (): Promise<{ success: boolean; status: number; responseText: string; url: string }> => {
    if (!config.webhookUrl) {
      return { success: false, status: 0, responseText: 'No webhook URL configured', url: '' };
    }

    const url = new URL(config.webhookUrl);
    url.searchParams.set('hub.mode', 'subscribe');
    url.searchParams.set('hub.verify_token', config.verifyToken);
    url.searchParams.set('hub.challenge', '1158201444');

    try {
      const response = await fetch(url.toString(), { method: 'GET' });
      const text = await response.text();
      return {
        success: response.ok && text === '1158201444',
        status: response.status,
        responseText: text,
        url: url.toString(),
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        responseText: error instanceof Error ? error.message : 'Unknown error',
        url: url.toString(),
      };
    }
  }, [config]);

  return { sendWebhook, testVerification };
}

function buildWebhookPayload(message: Message, config: ChatConfig): Record<string, unknown> {
  const baseMessage: Record<string, unknown> = {
    from: config.userPhone,
    id: `wamid.${uuidv4()}`,
    timestamp: getTimestamp().toString(),
  };

  switch (message.type) {
    case 'text':
      baseMessage.type = 'text';
      baseMessage.text = { body: message.content };
      break;
    case 'image':
      baseMessage.type = 'image';
      baseMessage.image = {
        caption: message.caption || '',
        mime_type: message.mimeType || 'image/jpeg',
        sha256: 'simulated_sha256',
        id: `MEDIA_${uuidv4()}`,
        url: message.mediaUrl,
      };
      break;
    case 'video':
      baseMessage.type = 'video';
      baseMessage.video = {
        caption: message.caption || '',
        mime_type: message.mimeType || 'video/mp4',
        sha256: 'simulated_sha256',
        id: `MEDIA_${uuidv4()}`,
        url: message.mediaUrl,
      };
      break;
    case 'audio':
      baseMessage.type = 'audio';
      baseMessage.audio = {
        mime_type: message.mimeType || 'audio/ogg; codecs=opus',
        sha256: 'simulated_sha256',
        id: `MEDIA_${uuidv4()}`,
        url: message.mediaUrl,
        voice: true,
      };
      break;
    case 'document':
      baseMessage.type = 'document';
      baseMessage.document = {
        caption: message.caption || '',
        filename: message.filename || 'file',
        mime_type: message.mimeType || 'application/pdf',
        sha256: 'simulated_sha256',
        id: `MEDIA_${uuidv4()}`,
        url: message.mediaUrl,
      };
      break;
    case 'interactive_button': {
      baseMessage.type = 'interactive';
      baseMessage.interactive = {
        type: 'button_reply',
        button_reply: {
          id: (message as unknown as { buttonId: string }).buttonId || 'btn_unknown',
          title: (message as unknown as { buttonTitle: string }).buttonTitle || 'Unknown',
        },
      };
      break;
    }
    case 'interactive_list': {
      baseMessage.type = 'interactive';
      baseMessage.interactive = {
        type: 'list_reply',
        list_reply: {
          id: (message as unknown as { rowId: string }).rowId || 'row_unknown',
          title: (message as unknown as { rowTitle: string }).rowTitle || 'Unknown',
          description: (message as unknown as { rowDescription: string }).rowDescription || '',
        },
      };
      break;
    }
  }

  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: `WABA_${config.businessPhone}`,
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: config.businessPhone,
                phone_number_id: `PHONE_${config.businessPhone}`,
              },
              contacts: [
                {
                  profile: { name: 'Simulator User' },
                  wa_id: config.userPhone,
                },
              ],
              messages: [baseMessage],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
}
