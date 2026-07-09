import { Reply } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { InteractiveButtonMessage } from '@/types/messages';

interface InteractiveButtonMessageProps {
  message: InteractiveButtonMessage;
  onButtonClick: (buttonId: string, buttonTitle: string) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function InteractiveButtonMessageCard({ message, onButtonClick }: InteractiveButtonMessageProps) {
  const { header, body, footer, buttons, timestamp } = message;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg shadow-sm overflow-hidden bg-whatsapp-bubble-incoming relative">
        {/* Card content */}
        <div className="bg-white">
          {header?.type === 'image' && header.mediaUrl && (
            <img
              src={header.mediaUrl}
              alt="Header"
              className="w-full h-40 object-cover"
            />
          )}
          {header?.type === 'text' && header.text && (
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
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Action buttons */}
        <div className="bg-white">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              onClick={() => onButtonClick(button.id, button.title)}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 px-4',
                'text-whatsapp-green font-medium text-sm hover:bg-gray-50 transition-colors',
                index !== buttons.length - 1 && 'border-b border-gray-100',
              )}
            >
              <Reply size={16} />
              {button.title}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-1 px-3 py-1 bg-white">
          <span className="text-[10px] text-gray-500">{formatTime(timestamp)}</span>
        </div>

        <div
          className="absolute top-0 -left-[3px] w-3 h-3 bg-whatsapp-bubble-incoming"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
        />
      </div>
    </div>
  );
}
