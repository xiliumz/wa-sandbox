import { Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MessageStatus } from '@/types/messages';

interface TextBubbleProps {
  content: string;
  direction: 'incoming' | 'outgoing';
  timestamp: number;
  status?: MessageStatus;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StatusIcon({ status }: { status?: MessageStatus }) {
  if (status === 'sending') return <Clock size={14} className="text-gray-400" />;
  if (status === 'sent') return <Check size={14} className="text-gray-400" />;
  if (status === 'delivered') return <CheckCheck size={14} className="text-gray-400" />;
  if (status === 'read') return <CheckCheck size={14} className="text-blue-500" />;
  if (status === 'failed') return <span className="text-[10px] text-red-500">!</span>;
  return null;
}

export function TextBubble({ content, direction, timestamp, status }: TextBubbleProps) {
  const isOutgoing = direction === 'outgoing';

  return (
    <div className={cn('flex', isOutgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2 shadow-sm relative',
          isOutgoing
            ? 'bg-whatsapp-bubble-outgoing rounded-tr-none'
            : 'bg-whatsapp-bubble-incoming rounded-tl-none'
        )}
      >
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-500">{formatTime(timestamp)}</span>
          {isOutgoing && <StatusIcon status={status} />}
        </div>
        <div
          className={cn(
            'absolute top-0 w-3 h-3',
            isOutgoing ? '-right-[3px] bg-whatsapp-bubble-outgoing' : '-left-[3px] bg-whatsapp-bubble-incoming',
          )}
          style={{
            clipPath: isOutgoing
              ? 'polygon(0 0, 0 100%, 100% 0)'
              : 'polygon(0 0, 100% 0, 100% 100%)',
          }}
        />
      </div>
    </div>
  );
}
