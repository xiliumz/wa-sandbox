import { useCallback } from 'react';
import {
  createOutgoingTextMessage,
  createOutgoingMediaMessage,
  createOutgoingButtonReply,
  createOutgoingListReply,
} from '@/utils/message-builders';
import type { MediaType, Message } from '@/types/messages';

interface UseMessageSenderOptions {
  postWebhook: (message: Message) => Promise<boolean>;
  updateMessageStatus: (id: string, status: Message['status']) => void;
  addMessage: (message: Message) => void;
  onListClose?: () => void;
}

export function useMessageSender(options: UseMessageSenderOptions) {
  const { postWebhook, updateMessageStatus, addMessage, onListClose } = options;

  const dispatchMessage = useCallback(
    async (message: Message) => {
      const success = await postWebhook(message);
      updateMessageStatus(message.id, success ? 'sent' : 'failed');
    },
    [postWebhook, updateMessageStatus],
  );

  const handleSendText = useCallback(
    async (text: string) => {
      const message = createOutgoingTextMessage(text);
      addMessage(message);
      await dispatchMessage(message);
    },
    [addMessage, dispatchMessage],
  );

  const handleSendMedia = useCallback(
    async (type: MediaType, files: File[], caption?: string) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        const fileCaption = i === 0 ? caption : undefined;
        const message = createOutgoingMediaMessage({ type, mediaUrl: url, file, caption: fileCaption });
        addMessage(message);
        await dispatchMessage(message);
      }
    },
    [addMessage, dispatchMessage],
  );

  const handleSendVoice = useCallback(
    async (blob: Blob) => {
      const file = new File([blob], 'voice.ogg', { type: blob.type || 'audio/ogg' });
      const url = URL.createObjectURL(file);
      const message = createOutgoingMediaMessage({ type: 'audio', mediaUrl: url, file, voice: true });
      addMessage(message);
      await dispatchMessage(message);
    },
    [addMessage, dispatchMessage],
  );

  const handleButtonClick = useCallback(
    async (buttonId: string, buttonTitle: string) => {
      const message = createOutgoingButtonReply(buttonId, buttonTitle);
      addMessage(message);
      await dispatchMessage(message);
    },
    [addMessage, dispatchMessage],
  );

  const handleListSelect = useCallback(
    async (rowId: string, rowTitle: string, rowDescription?: string) => {
      const message = createOutgoingListReply(rowId, rowTitle, rowDescription);
      addMessage(message);
      await dispatchMessage(message);
      onListClose?.();
    },
    [addMessage, dispatchMessage, onListClose],
  );

  return {
    handleSendText,
    handleSendMedia,
    handleSendVoice,
    handleButtonClick,
    handleListSelect,
  };
}
