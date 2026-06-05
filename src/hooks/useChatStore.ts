import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import type {
  Message,
  ChatConfig,
  TextMessage,
  MediaMessage,
  InteractiveButtonMessage,
  InteractiveListMessage,
  MediaType,
  InteractiveButtonOption,
  InteractiveListSection,
} from '@/types/messages';
import { DEFAULT_CONFIG } from '@/constants/config';

function mergeWithDefaultConfig(): ChatConfig {
  try {
    const item = window.localStorage.getItem('wa-chat-config');
    const parsed = item ? (JSON.parse(item) as Partial<ChatConfig>) : {};
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useChatStore() {
  const [messages, setMessages] = useLocalStorage<Message[]>('wa-chat-messages', []);
  const [config, setConfig] = useLocalStorage<ChatConfig>('wa-chat-config', mergeWithDefaultConfig);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, [setMessages]);

  const sendTextMessage = useCallback((content: string) => {
    const message: TextMessage = {
      id: uuidv4(),
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
    file: File
  ) => {
    const message: MediaMessage = {
      id: uuidv4(),
      type,
      direction: 'outgoing',
      mediaUrl,
      caption: '',
      mimeType: file.type,
      filename: file.name,
      fileSize: file.size,
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message);
    return message;
  }, [addMessage]);

  const sendButtonReply = useCallback((buttonId: string, buttonTitle: string) => {
    const message: TextMessage & { buttonId: string; buttonTitle: string } = {
      id: uuidv4(),
      type: 'text',
      direction: 'outgoing',
      content: buttonTitle,
      buttonId,
      buttonTitle,
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message as unknown as Message);
    return message as unknown as Message;
  }, [addMessage]);

  const sendListReply = useCallback((rowId: string, rowTitle: string, rowDescription?: string) => {
    const message: TextMessage & { rowId: string; rowTitle: string; rowDescription: string } = {
      id: uuidv4(),
      type: 'text',
      direction: 'outgoing',
      content: rowTitle,
      rowId,
      rowTitle,
      rowDescription: rowDescription || '',
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message as unknown as Message);
    return message as unknown as Message;
  }, [addMessage]);

  const updateMessageStatus = useCallback((id: string, status: Message['status']) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  }, [setMessages]);

  const receiveTextMessage = useCallback((content: string) => {
    const message: TextMessage = {
      id: uuidv4(),
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
    filename?: string
  ) => {
    const message: MediaMessage = {
      id: uuidv4(),
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
    footer?: string
  ) => {
    const message: InteractiveButtonMessage = {
      id: uuidv4(),
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
    footer?: string
  ) => {
    const message: InteractiveListMessage = {
      id: uuidv4(),
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
    isSettingsOpen,
    setIsSettingsOpen,
    isInjectorOpen,
    setIsInjectorOpen,
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
