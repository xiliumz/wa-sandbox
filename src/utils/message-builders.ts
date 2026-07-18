import type {
  TextMessage,
  MediaMessage,
  InteractiveButtonMessage,
  InteractiveListMessage,
  MediaType,
  InteractiveButtonOption,
  InteractiveListSection,
} from '@/types/messages';

interface MessageStamp {
  id: string;
  timestamp: number;
}

function createMessageStamp(): MessageStamp {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
}

export function createOutgoingTextMessage(content: string): TextMessage {
  return {
    ...createMessageStamp(),
    type: 'text',
    direction: 'outgoing',
    content,
    status: 'sending',
  };
}

interface OutgoingMediaOptions {
  type: MediaType;
  mediaUrl: string;
  file: File;
  caption?: string;
  /** True for recorded voice notes (maps to Meta's `audio.voice` flag); regular audio files omit it. */
  voice?: boolean;
}

export function createOutgoingMediaMessage(options: OutgoingMediaOptions): MediaMessage {
  const { type, mediaUrl, file, caption, voice } = options;
  return {
    ...createMessageStamp(),
    type,
    direction: 'outgoing',
    mediaUrl,
    caption,
    mimeType: file.type,
    filename: file.name,
    fileSize: file.size,
    voice,
    status: 'sending',
  };
}

export function createOutgoingButtonReply(buttonId: string, buttonTitle: string): InteractiveButtonMessage {
  return {
    ...createMessageStamp(),
    type: 'interactive_button',
    direction: 'outgoing',
    body: { text: buttonTitle },
    buttons: [],
    buttonId,
    buttonTitle,
    status: 'sending',
  };
}

export function createOutgoingListReply(
  rowId: string,
  rowTitle: string,
  rowDescription?: string,
): InteractiveListMessage {
  return {
    ...createMessageStamp(),
    type: 'interactive_list',
    direction: 'outgoing',
    body: { text: rowTitle },
    buttonText: 'Select',
    sections: [],
    rowId,
    rowTitle,
    rowDescription: rowDescription || '',
    status: 'sending',
  };
}

export function createIncomingTextMessage(content: string): TextMessage {
  return {
    ...createMessageStamp(),
    type: 'text',
    direction: 'incoming',
    content,
    status: 'read',
  };
}

interface IncomingMediaOptions {
  type: MediaType;
  mediaUrl: string;
  caption?: string;
  mimeType?: string;
  filename?: string;
}

export function createIncomingMediaMessage(options: IncomingMediaOptions): MediaMessage {
  const { type, mediaUrl, caption, mimeType, filename } = options;
  return {
    ...createMessageStamp(),
    type,
    direction: 'incoming',
    mediaUrl,
    caption,
    mimeType,
    filename,
    status: 'read',
  };
}

interface IncomingInteractiveButtonOptions {
  body: string;
  buttons: InteractiveButtonOption[];
  header?: { type: 'text' | 'image' | 'video' | 'document'; text?: string; mediaUrl?: string };
  footer?: string;
}

export function createIncomingInteractiveButton(
  options: IncomingInteractiveButtonOptions,
): InteractiveButtonMessage {
  const { body, buttons, header, footer } = options;
  return {
    ...createMessageStamp(),
    type: 'interactive_button',
    direction: 'incoming',
    header,
    body: { text: body },
    footer: footer ? { text: footer } : undefined,
    buttons,
    status: 'read',
  };
}

interface IncomingInteractiveListOptions {
  body: string;
  buttonText: string;
  sections: InteractiveListSection[];
  headerText?: string;
  footer?: string;
}

export function createIncomingInteractiveList(
  options: IncomingInteractiveListOptions,
): InteractiveListMessage {
  const { body, buttonText, sections, headerText, footer } = options;
  return {
    ...createMessageStamp(),
    type: 'interactive_list',
    direction: 'incoming',
    header: headerText ? { type: 'text', text: headerText } : undefined,
    body: { text: body },
    footer: footer ? { text: footer } : undefined,
    buttonText,
    sections,
    status: 'read',
  };
}
