import { useCallback } from 'react';
import type { ChatConfig, Message } from '@/types/messages';

export function useWebhook(config: ChatConfig) {

  const postWebhook = useCallback(async (message: Message): Promise<boolean> => {
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
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers,
        body,
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook POST failed:', error);
      return false;
    }
  }, [config]);

  return { postWebhook };
}

function buildWebhookPayload(message: Message, config: ChatConfig): Record<string, unknown> {
  const baseMessage: Record<string, unknown> = {
    from: config.userPhone,
    id: `wamid.${crypto.randomUUID()}`,
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
        id: `MEDIA_${crypto.randomUUID()}`,
        url: message.mediaUrl,
      };
      break;
    case 'video':
      baseMessage.type = 'video';
      baseMessage.video = {
        caption: message.caption || '',
        mime_type: message.mimeType || 'video/mp4',
        sha256: 'simulated_sha256',
        id: `MEDIA_${crypto.randomUUID()}`,
        url: message.mediaUrl,
      };
      break;
    case 'audio':
      baseMessage.type = 'audio';
      baseMessage.audio = {
        mime_type: message.mimeType || 'audio/ogg; codecs=opus',
        sha256: 'simulated_sha256',
        id: `MEDIA_${crypto.randomUUID()}`,
        url: message.mediaUrl,
        voice: message.voice || false,
      };
      break;
    case 'document':
      baseMessage.type = 'document';
      baseMessage.document = {
        caption: message.caption || '',
        filename: message.filename || 'file',
        mime_type: message.mimeType || 'application/pdf',
        sha256: 'simulated_sha256',
        id: `MEDIA_${crypto.randomUUID()}`,
        url: message.mediaUrl,
      };
      break;
    case 'interactive_button': {
      baseMessage.type = 'interactive';
      baseMessage.interactive = {
        type: 'button_reply',
        button_reply: {
          id: message.buttonId || 'btn_unknown',
          title: message.buttonTitle || 'Unknown',
        },
      };
      break;
    }
    case 'interactive_list': {
      baseMessage.type = 'interactive';
      baseMessage.interactive = {
        type: 'list_reply',
        list_reply: {
          id: message.rowId || 'row_unknown',
          title: message.rowTitle || 'Unknown',
          description: message.rowDescription || '',
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
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const bytes = new Uint8Array(signature);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256=${hex}`;
}
