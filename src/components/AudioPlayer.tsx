import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';

function formatAudioDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({
  url,
  isOutgoing,
}: {
  url: string;
  isOutgoing: boolean;
}) {
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
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
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
          <span
            className={cn(
              'text-[10px]',
              isOutgoing ? 'text-white/70' : 'text-gray-500',
            )}
          >
            {formatAudioDuration(currentTime)}
          </span>
          <span
            className={cn(
              'text-[10px]',
              isOutgoing ? 'text-white/70' : 'text-gray-500',
            )}
          >
            {formatAudioDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
