import { Send, Paperclip, Mic, X, FileText, Image, Video, Music } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { MediaType } from '@/types/messages';

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendMedia: (type: MediaType, file: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendText, onSendMedia, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: File; type: MediaType; url: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (previewFile) {
      onSendMedia(previewFile.type, previewFile.file);
      setPreviewFile(null);
      setShowAttach(false);
    } else if (text.trim()) {
      onSendText(text.trim());
      setText('');
    }
  }, [text, previewFile, onSendText, onSendMedia]);

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
    fileInputRef.current.click();
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileInputRef.current?.dataset.type) return;

    const type = fileInputRef.current.dataset.type as MediaType;
    const url = URL.createObjectURL(file);
    setPreviewFile({ file, type, url });
    setShowAttach(false);
    e.target.value = '';
  }, []);

  const clearPreview = useCallback(() => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  }, [previewFile]);

  const attachOptions: { type: MediaType; label: string; icon: React.ReactNode; accept: string }[] = [
    { type: 'image', label: 'Photo', icon: <Image size={20} />, accept: 'image/*' },
    { type: 'video', label: 'Video', icon: <Video size={20} />, accept: 'video/*' },
    { type: 'audio', label: 'Audio', icon: <Music size={20} />, accept: 'audio/*' },
    { type: 'document', label: 'Document', icon: <FileText size={20} />, accept: '*' },
  ];

  return (
    <div className="bg-[#f0f2f5] px-4 py-2 relative">
      {previewFile && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 capitalize">{previewFile.type} Preview</span>
            <button onClick={clearPreview} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          {previewFile.type === 'image' && (
            <img src={previewFile.url} alt="preview" className="max-h-40 rounded-lg object-contain bg-gray-50" />
          )}
          {previewFile.type === 'video' && (
            <video src={previewFile.url} className="max-h-40 rounded-lg w-full" controls />
          )}
          {previewFile.type === 'audio' && (
            <audio src={previewFile.url} className="w-full" controls />
          )}
          {previewFile.type === 'document' && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText size={24} className="text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{previewFile.file.name}</p>
                <p className="text-xs text-gray-500">{(previewFile.file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}
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
            placeholder="Message"
            className="w-full outline-none text-sm text-gray-800 placeholder-gray-500 bg-transparent"
            disabled={disabled || !!previewFile}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !previewFile)}
          className={cn(
            'p-2 rounded-full mb-1 transition-colors',
            text.trim() || previewFile
              ? 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark'
              : 'text-gray-500 hover:bg-gray-200'
          )}
        >
          {text.trim() || previewFile ? <Send size={20} /> : <Mic size={20} />}
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
