import {
  FileText,
  Music,
  Download,
  ImageOff,
  Image as ImageIcon,
  Film,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useBlobUrlAlive } from '@/hooks/useBlobUrlAlive';
import { AudioPlayer } from './AudioPlayer';
import { formatTime } from '@/utils/format-time';
import type { MediaMessage, MediaType } from '@/types/messages';

const MEDIA_ID_ICONS: Record<MediaType, typeof ImageIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
};

interface MediaBubbleProps {
  message: MediaMessage;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaByIdPlaceholder({
  type,
  mediaId,
}: {
  type: MediaType;
  mediaId: string;
}) {
  const Icon = MEDIA_ID_ICONS[type];
  const shortId = mediaId.length > 20 ? `${mediaId.slice(0, 20)}…` : mediaId;
  return (
    // eslint-disable-next-line @stylistic/max-len
    <div className="flex flex-col items-center justify-center gap-1.5 p-4 min-w-[220px] text-center rounded-t-lg border-2 border-dashed border-gray-300 bg-gray-50">
      <Icon size={28} className="text-gray-400 shrink-0" />
      <p className="text-xs font-medium text-gray-600">Media by ID</p>
      <p className="text-[11px] leading-tight text-gray-500">
        Backend referenced an uploaded media handle
      </p>
      <p className="text-[10px] font-mono text-gray-400 break-all">
        id: {shortId}
      </p>
      <p className="text-[10px] italic text-gray-400">
        Sandbox can&apos;t fetch bytes
      </p>
    </div>
  );
}

export function MediaBubble({ message }: MediaBubbleProps) {
  const {
    type,
    mediaUrl,
    mediaId,
    caption,
    filename,
    fileSize,
    direction,
    timestamp,
    voice,
  } = message;
  const isOutgoing = direction === 'outgoing';
  const isMediaAlive = useBlobUrlAlive(mediaUrl);

  const renderMedia = () => {
    if (!mediaUrl && mediaId) {
      return <MediaByIdPlaceholder type={type} mediaId={mediaId} />;
    }
    if (!isMediaAlive) {
      return (
        <div className="flex items-center gap-2 p-3 min-w-[200px]">
          <ImageOff size={20} className="text-gray-400 shrink-0" />
          <p className="text-xs text-gray-500 italic">
            Media no longer available
          </p>
        </div>
      );
    }
    switch (type) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={mediaUrl}
              alt={caption || 'Image'}
              className="max-w-full rounded-t-lg object-contain bg-gray-100 cursor-pointer"
              onClick={() => window.open(mediaUrl, '_blank')}
            />
          </div>
        );
      case 'video':
        return (
          <video
            src={mediaUrl}
            className="max-w-full rounded-t-lg"
            controls
            preload="metadata"
          />
        );
      case 'audio':
        return (
          <div>
            {voice ? (
              <AudioPlayer url={mediaUrl} isOutgoing={isOutgoing} />
            ) : (
              <div className="flex items-center gap-2 p-2 min-w-[200px]">
                <Music size={24} className="text-gray-400 shrink-0" />
                <audio
                  src={mediaUrl}
                  className="w-full max-w-[200px]"
                  controls
                />
              </div>
            )}
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-t-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={20} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {filename || 'Document'}
              </p>
              <p className="text-xs text-gray-500">{formatSize(fileSize)}</p>
            </div>
            <a
              href={mediaUrl}
              download={filename}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={16} className="text-gray-500" />
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex', isOutgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-lg shadow-sm overflow-hidden relative',
          isOutgoing
            ? 'bg-whatsapp-bubble-outgoing rounded-tr-none'
            : 'bg-whatsapp-bubble-incoming rounded-tl-none',
        )}
      >
        {renderMedia()}
        {(caption || type === 'document') && (
          <div className="px-3 py-1">
            {caption && <p className="text-sm text-gray-800">{caption}</p>}
          </div>
        )}
        <div className="flex items-center justify-end gap-1 px-3 pb-1">
          <span className="text-[10px] text-gray-500">
            {formatTime(timestamp)}
          </span>
        </div>
        <div
          className={cn(
            'absolute top-0 w-3 h-3',
            isOutgoing
              ? '-right-[3px] bg-whatsapp-bubble-outgoing'
              : '-left-[3px] bg-whatsapp-bubble-incoming',
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
