import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types/messages';

interface MessageListProps {
  messages: Message[];
  onButtonClick: (buttonId: string, buttonTitle: string) => void;
  onOpenList: (messageId: string) => void;
}

export function MessageList({ messages, onButtonClick, onOpenList }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-whatsapp-bg bg-chat-pattern bg-repeat opacity-50">
        <div className="text-center p-6">
          <p className="text-gray-500 text-sm">No messages yet</p>
          <p className="text-gray-400 text-xs mt-1">Send a message or inject a test message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-whatsapp-bg bg-chat-pattern bg-repeat p-4 space-y-1">
      {messages.map((message) => (
        <div key={message.id} className="py-0.5">
          <MessageBubble
            message={message}
            onButtonClick={onButtonClick}
            onOpenList={onOpenList}
          />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
