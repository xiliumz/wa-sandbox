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

export function createOutgoingMediaMessage(
  type: MediaType,
  mediaUrl: string,
  file: File,
  caption?: string,
  voice?: boolean,
): MediaMessage {
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

export function createIncomingMediaMessage(
  type: MediaType,
  mediaUrl: string,
  caption?: string,
  mimeType?: string,
  filename?: string,
): MediaMessage {
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

export function createIncomingInteractiveButton(
  body: string,
  buttons: InteractiveButtonOption[],
  header?: { type: 'text' | 'image' | 'video' | 'document'; text?: string; mediaUrl?: string },
  footer?: string,
): InteractiveButtonMessage {
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

export function createIncomingInteractiveList(
  body: string,
  buttonText: string,
  sections: InteractiveListSection[],
  headerText?: string,
  footer?: string,
): InteractiveListMessage {
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
