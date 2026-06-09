import { Send, Paperclip, Mic, X, FileText, Image, Video, Music } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { MediaType } from '@/types/messages';

interface PreviewFile {
  file: File;
  type: MediaType;
  url: string;
}

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendMedia: (type: MediaType, files: File[], caption?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendText, onSendMedia, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [mediaCaption, setMediaCaption] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (previewFiles.length > 0) {
      const type = previewFiles[0].type;
      const files = previewFiles.map((p) => p.file);
      const caption = mediaCaption.trim() || undefined;
      onSendMedia(type, files, caption);
      previewFiles.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviewFiles([]);
      setMediaCaption('');
      setShowAttach(false);
    } else if (text.trim()) {
      onSendText(text.trim());
      setText('');
    }
  }, [text, previewFiles, mediaCaption, onSendText, onSendMedia]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleFileSelect = useCallback((type: MediaType, accept: string) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = accept;
    fileInputRef.current.dataset.type = type;
    fileInputRef.current.multiple = type === 'image';
    fileInputRef.current.click();
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !fileInputRef.current?.dataset.type) return;

    const type = fileInputRef.current.dataset.type as MediaType;
    const previews = files.map((file) => ({
      file,
      type,
      url: URL.createObjectURL(file),
    }));
    setPreviewFiles((prev) => [...prev, ...previews]);
    setShowAttach(false);
    e.target.value = '';
  }, []);

  const clearPreview = useCallback(() => {
    previewFiles.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviewFiles([]);
    setMediaCaption('');
  }, [previewFiles]);

  const removePreview = useCallback((index: number) => {
    setPreviewFiles((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const attachOptions: { type: MediaType; label: string; icon: React.ReactNode; accept: string }[] = [
    { type: 'image', label: 'Photo', icon: <Image size={20} />, accept: 'image/*' },
    { type: 'video', label: 'Video', icon: <Video size={20} />, accept: 'video/*' },
    { type: 'audio', label: 'Audio', icon: <Music size={20} />, accept: 'audio/*' },
    { type: 'document', label: 'Document', icon: <FileText size={20} />, accept: '*' },
  ];

  const hasPreview = previewFiles.length > 0;
  const previewType = hasPreview ? previewFiles[0].type : null;

  return (
    <div className="bg-[#f0f2f5] px-4 py-2 relative">
      {hasPreview && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {previewFiles.length} {previewType}{previewFiles.length > 1 ? 's' : ''} selected
            </span>
            <button onClick={clearPreview} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {previewType === 'image' && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {previewFiles.map((p, i) => (
                <div key={i} className="relative group">
                  <img
                    src={p.url}
                    alt={`preview ${i + 1}`}
                    className="h-24 w-full rounded-lg object-cover bg-gray-50"
                  />
                  <button
                    onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {previewType === 'video' && previewFiles.map((p, i) => (
            <div key={i} className="relative mb-2">
              <video src={p.url} className="max-h-40 rounded-lg w-full" controls />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {previewType === 'audio' && previewFiles.map((p, i) => (
            <div key={i} className="relative mb-2">
              <audio src={p.url} className="w-full" controls />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {previewType === 'document' && previewFiles.map((p, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-2 relative">
              <FileText size={24} className="text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{p.file.name}</p>
                <p className="text-xs text-gray-500">{(p.file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => removePreview(i)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <div className="mt-2">
            <input
              type="text"
              value={mediaCaption}
              onChange={(e) => setMediaCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-gray-50"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            onClick={() => setShowAttach(!showAttach)}
            className={cn(
              'p-2 rounded-full transition-colors mb-1',
              showAttach ? 'bg-gray-300 text-gray-700' : 'text-gray-500 hover:bg-gray-200'
            )}
            disabled={disabled}
          >
            {showAttach ? <X size={20} /> : <Paperclip size={20} />}
          </button>

          {showAttach && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px]">
              {attachOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleFileSelect(opt.type, opt.accept)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-lg px-3 py-2 max-h-32 overflow-y-auto">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasPreview ? 'Add caption above...' : 'Message'}
            className="w-full outline-none text-sm text-gray-800 placeholder-gray-500 bg-transparent"
            disabled={disabled || hasPreview}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !hasPreview)}
          className={cn(
            'p-2 rounded-full mb-1 transition-colors',
            text.trim() || hasPreview
              ? 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark'
              : 'text-gray-500 hover:bg-gray-200'
          )}
        >
          {text.trim() || hasPreview ? <Send size={20} /> : <Mic size={20} />}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
