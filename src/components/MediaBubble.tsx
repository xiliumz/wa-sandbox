import { FileText, Music, Download, Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { MediaMessage } from '@/types/messages';

interface MediaBubbleProps {
  message: MediaMessage;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAudioDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function AudioPlayer({ url, isOutgoing }: { url: string; isOutgoing: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration || 0);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 p-2 min-w-[220px]">
      <button
        onClick={togglePlay}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
          isOutgoing
            ? 'bg-white/30 text-white hover:bg-white/40'
            : 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark',
        )}
      >
        {isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" className="ml-0.5" />
        )}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="relative h-1 rounded-full bg-black/10 overflow-hidden">
          <div
            className={cn(
              'absolute top-0 left-0 h-full rounded-full transition-all',
              isOutgoing ? 'bg-white/70' : 'bg-whatsapp-green',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className={cn('text-[10px]', isOutgoing ? 'text-white/70' : 'text-gray-500')}>
            {formatAudioDuration(currentTime)}
          </span>
          <span className={cn('text-[10px]', isOutgoing ? 'text-white/70' : 'text-gray-500')}>
            {formatAudioDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MediaBubble({ message }: MediaBubbleProps) {
  const { type, mediaUrl, caption, filename, fileSize, direction, timestamp, voice } = message;
  const isOutgoing = direction === 'outgoing';

  const renderMedia = () => {
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
                <audio src={mediaUrl} className="w-full max-w-[200px]" controls />
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
              <p className="text-sm font-medium text-gray-700 truncate">{filename || 'Document'}</p>
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
          <span className="text-[10px] text-gray-500">{formatTime(timestamp)}</span>
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
