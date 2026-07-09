import { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SettingsPanel } from './SettingsPanel';
import { MessageInjector } from './MessageInjector';
import { ListSelectionModal } from './ListSelectionModal';
import { useChatStore } from '@/hooks/useChatStore';
import { useWebhook } from '@/hooks/useWebhook';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMessageSender } from '@/hooks/useMessageSender';
import { findActiveListMessage } from '@/utils/find-active-list-message';
import type { Message } from '@/types/messages';

export function ChatContainer() {
  const store = useChatStore();
  const { postWebhook } = useWebhook(store.config);
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

  const {
    handleSendText,
    handleSendMedia,
    handleSendVoice,
    handleButtonClick,
    handleListSelect,
  } = useMessageSender({
    postWebhook,
    updateMessageStatus: store.updateMessageStatus,
    sendTextMessage: store.sendTextMessage,
    sendMediaMessage: store.sendMediaMessage,
    sendButtonReply: store.sendButtonReply,
    sendListReply: store.sendListReply,
    onListClose: () => setActiveListMessageId(null),
  });

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
