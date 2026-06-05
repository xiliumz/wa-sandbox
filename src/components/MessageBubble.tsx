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
