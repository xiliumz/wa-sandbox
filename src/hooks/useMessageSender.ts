import { useCallback } from 'react';
import type { MediaType, Message } from '@/types/messages';

interface UseMessageSenderOptions {
  postWebhook: (message: Message) => Promise<boolean>;
  updateMessageStatus: (id: string, status: Message['status']) => void;
  sendTextMessage: (content: string) => Message;
  sendMediaMessage: (
    type: MediaType,
    mediaUrl: string,
    file: File,
    caption?: string,
    voice?: boolean,
  ) => Message;
  sendButtonReply: (buttonId: string, buttonTitle: string) => Message;
  sendListReply: (rowId: string, rowTitle: string, rowDescription?: string) => Message;
  onListClose?: () => void;
}

export function useMessageSender(options: UseMessageSenderOptions) {
  const {
    postWebhook,
    updateMessageStatus,
    sendTextMessage,
    sendMediaMessage,
    sendButtonReply,
    sendListReply,
    onListClose,
  } = options;

  const dispatchMessage = useCallback(
    async (message: Message) => {
      const success = await postWebhook(message);
      updateMessageStatus(message.id, success ? 'sent' : 'failed');
    },
    [postWebhook, updateMessageStatus],
  );

  const handleSendText = useCallback(
    async (text: string) => {
      const message = sendTextMessage(text);
      await dispatchMessage(message);
    },
    [sendTextMessage, dispatchMessage],
  );

  const handleSendMedia = useCallback(
    async (type: MediaType, files: File[], caption?: string) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        // Only the first image gets the caption (matching WhatsApp album behavior)
        const fileCaption = i === 0 ? caption : undefined;
        const message = sendMediaMessage(type, url, file, fileCaption);
        await dispatchMessage(message);
      }
    },
    [sendMediaMessage, dispatchMessage],
  );

  const handleSendVoice = useCallback(
    async (blob: Blob) => {
      const file = new File([blob], 'voice.ogg', { type: blob.type || 'audio/ogg' });
      const url = URL.createObjectURL(file);
      const message = sendMediaMessage('audio', url, file, undefined, true);
      await dispatchMessage(message);
    },
    [sendMediaMessage, dispatchMessage],
  );

  const handleButtonClick = useCallback(
    async (buttonId: string, buttonTitle: string) => {
      const message = sendButtonReply(buttonId, buttonTitle);
      await dispatchMessage(message);
    },
    [sendButtonReply, dispatchMessage],
  );

  const handleListSelect = useCallback(
    async (rowId: string, rowTitle: string, rowDescription?: string) => {
      const message = sendListReply(rowId, rowTitle, rowDescription);
      await dispatchMessage(message);
      onListClose?.();
    },
    [sendListReply, dispatchMessage, onListClose],
  );

  return {
    handleSendText,
    handleSendMedia,
    handleSendVoice,
    handleButtonClick,
    handleListSelect,
  };
}
