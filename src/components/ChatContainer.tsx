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
import type { Message, MediaType } from '@/types/messages';

export function ChatContainer() {
  const store = useChatStore();
  const { sendWebhook } = useWebhook(store.config);
  const [activeListMessageId, setActiveListMessageId] = useState<string | null>(null);

  // Real-time incoming messages via WebSocket bridge
  useWebSocket({
    url: store.config.wsUrl || '',
    onMessage: (msgs: Message[]) => {
      msgs.forEach((msg) => {
        const exists = store.messages.find((m) => m.id === msg.id);
        if (!exists) {
          store.addMessage({ ...msg, direction: 'incoming', status: 'read' });
        }
      });
    },
  });

  const activeListMessage = store.messages.find(
    (m): m is Message & { type: 'interactive_list' } =>
      m.id === activeListMessageId && m.type === 'interactive_list'
  ) || null;

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
        onOpenSettings={() => store.setIsSettingsOpen(true)}
        onOpenInjector={() => store.setIsInjectorOpen(true)}
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
        disabled={false}
      />

      <SettingsPanel
        isOpen={store.isSettingsOpen}
        onClose={() => store.setIsSettingsOpen(false)}
        config={store.config}
        onSave={store.setConfig}
      />

      <MessageInjector
        isOpen={store.isInjectorOpen}
        onClose={() => store.setIsInjectorOpen(false)}
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
