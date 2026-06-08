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
  /** Present on outgoing button-reply messages */
  buttonId?: string;
  buttonTitle?: string;
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
  /** Present on outgoing list-reply messages */
  rowId?: string;
  rowTitle?: string;
  rowDescription?: string;
}

export type Message = TextMessage | MediaMessage | InteractiveButtonMessage | InteractiveListMessage;

export interface ChatConfig {
  webhookUrl: string;
  verifyToken: string;
  appSecret: string;
  wsUrl: string;
  backendApiUrl: string;
  pollInterval: number;
  userPhone: string;
  businessPhone: string;
  businessName: string;
}


