import { useState, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SettingsPanel } from './SettingsPanel';
import { MessageInjector } from './MessageInjector';
import { ListSelectionModal } from './ListSelectionModal';
import { useChatStore } from '@/hooks/useChatStore';
import { useWebhook } from '@/hooks/useWebhook';
import { useWebSocket } from '@/hooks/useWebSocket';
import { findActiveListMessage } from '@/utils/find-active-list-message';
import type { Message, MediaType } from '@/types/messages';

export function ChatContainer() {
  const store = useChatStore();
  const { sendWebhook } = useWebhook(store.config);
  const [activeListMessageId, setActiveListMessageId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);

  // Real-time incoming messages via WebSocket bridge
  useWebSocket({
    url: './api/ws',
    phone: store.config.userPhone,
    onMessage: (msgs: Message[]) => {
      msgs.forEach((msg) => {
        const exists = store.messages.find((m) => m.id === msg.id);
        if (!exists) {
          store.addMessage({ ...msg, direction: 'incoming', status: 'read' });
        }
      });
    },
  });

  const activeListMessage = findActiveListMessage(store.messages, activeListMessageId);

  const handleSendText = useCallback(
    async (text: string) => {
      const message = store.sendTextMessage(text);
      const success = await sendWebhook(message);
      store.updateMessageStatus(message.id, success ? 'sent' : 'failed');
    },
    [store, sendWebhook]
  );

  const handleSendMedia = useCallback(
    async (type: MediaType, files: File[], caption?: string) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        // Only the first image gets the caption (matching WhatsApp album behavior)
        const fileCaption = i === 0 ? caption : undefined;
        const message = store.sendMediaMessage(type, url, file, fileCaption);
        const success = await sendWebhook(message);
        store.updateMessageStatus(message.id, success ? 'sent' : 'failed');
      }
    },
    [store, sendWebhook]
  );

  const handleSendVoice = useCallback(
    async (blob: Blob) => {
      const file = new File([blob], 'voice.ogg', { type: blob.type || 'audio/ogg' });
      const url = URL.createObjectURL(file);
      const message = store.sendMediaMessage('audio', url, file, undefined, true);
      const success = await sendWebhook(message);
      store.updateMessageStatus(message.id, success ? 'sent' : 'failed');
    },
    [store, sendWebhook]
  );

  const handleButtonClick = useCallback(
    async (buttonId: string, buttonTitle: string) => {
      const message = store.sendButtonReply(buttonId, buttonTitle);
      const success = await sendWebhook(message);
      store.updateMessageStatus(message.id, success ? 'sent' : 'failed');
    },
    [store, sendWebhook]
  );

  const handleListSelect = useCallback(
    async (rowId: string, rowTitle: string, rowDescription?: string) => {
      const message = store.sendListReply(rowId, rowTitle, rowDescription);
      const success = await sendWebhook(message);
      store.updateMessageStatus(message.id, success ? 'sent' : 'failed');
      setActiveListMessageId(null);
    },
    [store, sendWebhook]
  );

  return (
    <div className="flex flex-col h-screen max-h-screen bg-whatsapp-bg">
      <ChatHeader
        businessName={store.config.businessName}
        businessPhone={store.config.businessPhone}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInjector={() => setIsInjectorOpen(true)}
        onClearChat={store.clearChat}
      />

      <MessageList
        messages={store.messages}
        onButtonClick={handleButtonClick}
        onOpenList={setActiveListMessageId}
      />

      <ChatInput
        onSendText={handleSendText}
        onSendMedia={handleSendMedia}
        onSendVoice={handleSendVoice}
        disabled={false}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={store.config}
        onSave={store.setConfig}
      />

      <MessageInjector
        isOpen={isInjectorOpen}
        onClose={() => setIsInjectorOpen(false)}
        onInjectText={store.receiveTextMessage}
        onInjectMedia={store.receiveMediaMessage}
        onInjectButton={store.receiveInteractiveButton}
        onInjectList={store.receiveInteractiveList}
      />

      <ListSelectionModal
        message={activeListMessage}
        isOpen={!!activeListMessageId}
        onClose={() => setActiveListMessageId(null)}
        onSelect={handleListSelect}
      />
    </div>
  );
}
