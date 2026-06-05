import { useState, useCallback, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SettingsPanel } from './SettingsPanel';
import { MessageInjector } from './MessageInjector';
import { ListSelectionModal } from './ListSelectionModal';
import { useChatStore } from '@/hooks/useChatStore';
import { useWebhook } from '@/hooks/useWebhook';
import type { Message, MediaType } from '@/types/messages';

export function ChatContainer() {
  const store = useChatStore();
  const { sendWebhook } = useWebhook(store.config);
  const [activeListMessageId, setActiveListMessageId] = useState<string | null>(null);

  // Simple polling implementation inline
  useEffect(() => {
    if (!store.config.backendApiUrl) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(store.config.backendApiUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data)) return;

        data.forEach((msg: Message) => {
          if (!store.messages.find((m) => m.id === msg.id)) {
            store.addMessage({ ...msg, direction: 'incoming', status: 'read' });
          }
        });
      } catch {
        // Ignore polling errors
      }
    }, store.config.pollInterval);

    return () => clearInterval(interval);
  }, [store.config.backendApiUrl, store.config.pollInterval, store.messages, store.addMessage]);

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
    async (type: MediaType, file: File) => {
      const url = URL.createObjectURL(file);
      const message = store.sendMediaMessage(type, url, file);
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
        onClose={() => {
          store.setIsSettingsOpen(false);
        }}
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
