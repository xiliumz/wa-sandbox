import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  ChatConfig,
  Message,
  TextMessage,
  MediaMessage,
  InteractiveButtonMessage,
  InteractiveListMessage,
  MediaType,
  InteractiveButtonOption,
  InteractiveListSection,
} from '@/types/messages';
import { DEFAULT_CONFIG } from '@/constants/config';

function getInitialChatConfig(stored: ChatConfig | null): ChatConfig {
  return stored ? { ...DEFAULT_CONFIG, ...stored } : DEFAULT_CONFIG;
}

export function useChatStore() {
  const [messages, setMessages] = useLocalStorage<Message[]>('wa-chat-messages', []);
  const [config, setConfig] = useLocalStorage<ChatConfig>(
    'wa-chat-config',
    getInitialChatConfig,
  );


  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, [setMessages]);

  const sendTextMessage = useCallback((content: string) => {
    const message: TextMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      direction: 'outgoing',
      content,
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message);
    return message;
  }, [addMessage]);

  const sendMediaMessage = useCallback((
    type: MediaType,
    mediaUrl: string,
    file: File,
    caption?: string,
    voice?: boolean,
  ) => {
    const message: MediaMessage = {
      id: crypto.randomUUID(),
      type,
      direction: 'outgoing',
      mediaUrl,
      caption,
      mimeType: file.type,
      filename: file.name,
      fileSize: file.size,
      voice,
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message);
    return message;
  }, [addMessage]);

  const sendButtonReply = useCallback((buttonId: string, buttonTitle: string) => {
    const message: InteractiveButtonMessage = {
      id: crypto.randomUUID(),
      type: 'interactive_button',
      direction: 'outgoing',
      body: { text: buttonTitle },
      buttons: [],
      buttonId,
      buttonTitle,
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message);
    return message;
  }, [addMessage]);

  const sendListReply = useCallback((rowId: string, rowTitle: string, rowDescription?: string) => {
    const message: InteractiveListMessage = {
      id: crypto.randomUUID(),
      type: 'interactive_list',
      direction: 'outgoing',
      body: { text: rowTitle },
      buttonText: 'Select',
      sections: [],
      rowId,
      rowTitle,
      rowDescription: rowDescription || '',
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message);
    return message;
  }, [addMessage]);

  const updateMessageStatus = useCallback((id: string, status: Message['status']) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m)),
    );
  }, [setMessages]);

  const receiveTextMessage = useCallback((content: string) => {
    const message: TextMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      direction: 'incoming',
      content,
      timestamp: Date.now(),
      status: 'read',
    };
    addMessage(message);
  }, [addMessage]);

  const receiveMediaMessage = useCallback((
    type: MediaType,
    mediaUrl: string,
    caption?: string,
    mimeType?: string,
    filename?: string,
  ) => {
    const message: MediaMessage = {
      id: crypto.randomUUID(),
      type,
      direction: 'incoming',
      mediaUrl,
      caption,
      mimeType,
      filename,
      timestamp: Date.now(),
      status: 'read',
    };
    addMessage(message);
  }, [addMessage]);

  const receiveInteractiveButton = useCallback((
    body: string,
    buttons: InteractiveButtonOption[],
    header?: { type: 'text' | 'image' | 'video' | 'document'; text?: string; mediaUrl?: string },
    footer?: string,
  ) => {
    const message: InteractiveButtonMessage = {
      id: crypto.randomUUID(),
      type: 'interactive_button',
      direction: 'incoming',
      header,
      body: { text: body },
      footer: footer ? { text: footer } : undefined,
      buttons,
      timestamp: Date.now(),
      status: 'read',
    };
    addMessage(message);
  }, [addMessage]);

  const receiveInteractiveList = useCallback((
    body: string,
    buttonText: string,
    sections: InteractiveListSection[],
    headerText?: string,
    footer?: string,
  ) => {
    const message: InteractiveListMessage = {
      id: crypto.randomUUID(),
      type: 'interactive_list',
      direction: 'incoming',
      header: headerText ? { type: 'text', text: headerText } : undefined,
      body: { text: body },
      footer: footer ? { text: footer } : undefined,
      buttonText,
      sections,
      timestamp: Date.now(),
      status: 'read',
    };
    addMessage(message);
  }, [addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return {
    messages,
    config,
    setConfig,
    addMessage,
    sendTextMessage,
    sendMediaMessage,
    sendButtonReply,
    sendListReply,
    updateMessageStatus,
    receiveTextMessage,
    receiveMediaMessage,
    receiveInteractiveButton,
    receiveInteractiveList,
    clearChat,
  };
}
