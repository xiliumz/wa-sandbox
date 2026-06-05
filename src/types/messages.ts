export type MessageDirection = 'incoming' | 'outgoing';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface BaseMessage {
  id: string;
  direction: MessageDirection;
  timestamp: number;
  status?: MessageStatus;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
}

export interface MediaMessage extends BaseMessage {
  type: MediaType;
  mediaUrl: string;
  caption?: string;
  mimeType?: string;
  filename?: string;
  fileSize?: number;
}

export interface InteractiveButtonOption {
  id: string;
  title: string;
}

export interface InteractiveButtonMessage extends BaseMessage {
  type: 'interactive_button';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    mediaUrl?: string;
  };
  body: { text: string };
  footer?: { text: string };
  buttons: InteractiveButtonOption[];
}

export interface InteractiveListRow {
  id: string;
  title: string;
  description?: string;
}

export interface InteractiveListSection {
  title?: string;
  rows: InteractiveListRow[];
}

export interface InteractiveListMessage extends BaseMessage {
  type: 'interactive_list';
  header?: { type: 'text'; text: string };
  body: { text: string };
  footer?: { text: string };
  buttonText: string;
  sections: InteractiveListSection[];
}

export type Message = TextMessage | MediaMessage | InteractiveButtonMessage | InteractiveListMessage;

export interface ChatConfig {
  webhookUrl: string;
  verifyToken: string;
  backendApiUrl: string;
  pollInterval: number;
  userPhone: string;
  businessPhone: string;
  businessName: string;
}

export const DEFAULT_CONFIG: ChatConfig = {
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:3000/webhook',
  verifyToken: import.meta.env.VITE_VERIFY_TOKEN || 'test_verify_token',
  backendApiUrl: import.meta.env.VITE_BACKEND_API_URL || '',
  pollInterval: Number(import.meta.env.VITE_POLL_INTERVAL) || 3000,
  userPhone: import.meta.env.VITE_USER_PHONE || '6281234567890',
  businessPhone: import.meta.env.VITE_BUSINESS_PHONE || '15550000000',
  businessName: 'Business Account',
};
