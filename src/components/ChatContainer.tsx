import { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SettingsPanel } from './SettingsPanel';
import { MessageInjector } from './MessageInjector';
import { ListSelectionModal } from './ListSelectionModal';
import { useMessageStore } from '@/hooks/useMessageStore';
import { useConfigStore } from '@/hooks/useConfigStore';
import { useWebhook } from '@/hooks/useWebhook';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMessageSender } from '@/hooks/useMessageSender';
import { findActiveListMessage } from '@/utils/find-active-list-message';
import type { Message } from '@/types/messages';

export function ChatContainer() {
  const messageStore = useMessageStore();
  const configStore = useConfigStore();
  const { postWebhook } = useWebhook(configStore.config);

  const [activeListMessageId, setActiveListMessageId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);

  useWebSocket({
    url: './api/ws',
    phone: configStore.config.userPhone,
    onMessage: (msgs: Message[]) => {
      msgs.forEach((msg) => {
        const exists = messageStore.messages.find((m) => m.id === msg.id);
        if (!exists) {
          messageStore.addMessage({ ...msg, direction: 'incoming', status: 'read' });
        }
      });
    },
  });

  const activeListMessage = findActiveListMessage(messageStore.messages, activeListMessageId);

  const {
    handleSendText,
    handleSendMedia,
    handleSendVoice,
    handleButtonClick,
    handleListSelect,
  } = useMessageSender({
    postWebhook,
    updateMessageStatus: messageStore.updateMessageStatus,
    addMessage: messageStore.addMessage,
    onListClose: () => setActiveListMessageId(null),
  });

  return (
    <div className="flex flex-col h-screen max-h-screen bg-whatsapp-bg">
      <ChatHeader
        businessName={configStore.config.businessName}
        businessPhone={configStore.config.businessPhone}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInjector={() => setIsInjectorOpen(true)}
        onClearChat={messageStore.clearChat}
      />

      <MessageList
        messages={messageStore.messages}
        onButtonClick={handleButtonClick}
        onOpenList={setActiveListMessageId}
      />

      <ChatInput
        onSendText={handleSendText}
        onSendMedia={handleSendMedia}
        onSendVoice={handleSendVoice}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={configStore.config}
        onSave={configStore.setConfig}
      />

      <MessageInjector
        isOpen={isInjectorOpen}
        onClose={() => setIsInjectorOpen(false)}
        onInjectMessage={messageStore.addMessage}
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
