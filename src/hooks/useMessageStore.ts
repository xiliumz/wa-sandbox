import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Message } from '@/types/messages';

interface MessageStore {
  /** Persisted chat message history, oldest first. */
  messages: Message[];

  /** Append a message to the chat. */
  addMessage: (message: Message) => void;

  /** Update the delivery status of an existing message by id. */
  updateMessageStatus: (id: string, status: Message['status']) => void;

  /** Remove all messages from the chat. */
  clearChat: () => void;
}

export function useMessageStore(): MessageStore {
  const [messages, setMessages] = useLocalStorage<Message[]>('wa-chat-messages', []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, [setMessages]);

  const updateMessageStatus = useCallback((id: string, status: Message['status']) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m)),
    );
  }, [setMessages]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return {
    messages,
    addMessage,
    updateMessageStatus,
    clearChat,
  };
}
