import { List } from 'lucide-react';
import { formatTime } from '@/utils/format-time';
import type { InteractiveListMessage } from '@/types/messages';

interface InteractiveListMessageProps {
  message: InteractiveListMessage;
  onOpenList: (messageId: string) => void;
}

export function InteractiveListMessageCard({ message, onOpenList }: InteractiveListMessageProps) {
  const { header, body, footer, buttonText, timestamp, id } = message;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg shadow-sm overflow-hidden bg-white relative">
        {header && (
          <div className="px-3 pt-3 pb-1">
            <p className="text-sm font-semibold text-gray-800">{header.text}</p>
          </div>
        )}

        <div className="px-3 py-2">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{body.text}</p>
        </div>

        {footer && (
          <div className="px-3 pb-2">
            <p className="text-xs text-gray-400">{footer.text}</p>
          </div>
        )}

        <div className="border-t border-gray-100" />

        <button
          onClick={() => onOpenList(id)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4
          text-whatsapp-green font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          <List size={16} />
          {buttonText}
        </button>

        <div className="flex items-center justify-end gap-1 px-3 py-1 bg-white">
          <span className="text-[10px] text-gray-500">{formatTime(timestamp)}</span>
        </div>

        <div
          className="absolute top-0 -left-[3px] w-3 h-3 bg-white"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
        />
      </div>
    </div>
  );
}
