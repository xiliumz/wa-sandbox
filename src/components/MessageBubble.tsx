import { TextBubble } from './TextBubble';
import { MediaBubble } from './MediaBubble';
import { InteractiveButtonMessageCard } from './InteractiveButtonMessage';
import { InteractiveListMessageCard } from './InteractiveListMessage';
import type { Message } from '@/types/messages';

interface MessageBubbleProps {
  message: Message;
  onButtonClick: (buttonId: string, buttonTitle: string) => void;
  onOpenList: (messageId: string) => void;
}

export function MessageBubble({ message, onButtonClick, onOpenList }: MessageBubbleProps) {
  // Outgoing interactive replies render as simple text bubbles
  if (message.direction === 'outgoing' && message.type === 'interactive_button') {
    return (
      <TextBubble
        content={message.buttonTitle || message.body.text}
        direction="outgoing"
        timestamp={message.timestamp}
        status={message.status}
      />
    );
  }

  if (message.direction === 'outgoing' && message.type === 'interactive_list') {
    return (
      <TextBubble
        content={message.rowTitle || message.body.text}
        direction="outgoing"
        timestamp={message.timestamp}
        status={message.status}
      />
    );
  }

  switch (message.type) {
    case 'text':
      return (
        <TextBubble
          content={message.content}
          direction={message.direction}
          timestamp={message.timestamp}
          status={message.status}
        />
      );
    case 'image':
    case 'video':
    case 'audio':
    case 'document':
      return <MediaBubble message={message} />;
    case 'interactive_button':
      return (
        <InteractiveButtonMessageCard
          message={message}
          onButtonClick={onButtonClick}
        />
      );
    case 'interactive_list':
      return (
        <InteractiveListMessageCard
          message={message}
          onOpenList={onOpenList}
        />
      );
    default:
      return null;
  }
}
