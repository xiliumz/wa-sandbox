import { X } from 'lucide-react';
import { useCallback } from 'react';
import type { InteractiveListMessage } from '@/types/messages';

interface ListSelectionModalProps {
  message: InteractiveListMessage | null;
  onClose: () => void;
  onSelect: (rowId: string, rowTitle: string, rowDescription?: string) => void;
}

export function ListSelectionModal({ message, onClose, onSelect }: ListSelectionModalProps) {
  const handleSelect = useCallback((rowId: string, rowTitle: string, rowDescription?: string) => {
    onSelect(rowId, rowTitle, rowDescription);
    onClose();
  }, [onSelect, onClose]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-white w-full max-w-sm mx-4 sm:rounded-xl
        rounded-t-xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{message.header?.text || 'Options'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body hint */}
        {message.body.text && (
          <div className="px-4 py-2 bg-gray-50">
            <p className="text-sm text-gray-600">{message.body.text}</p>
          </div>
        )}

        {/* Sections */}
        <div className="overflow-y-auto flex-1 py-2">
          {message.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h4>
                </div>
              )}
              <div className="divide-y divide-gray-100">
                {section.rows.map((row) => (
                  <button
                    key={row.id}
                    onClick={() => handleSelect(row.id, row.title, row.description)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">{row.title}</p>
                    {row.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{row.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Tap an item to select it</p>
        </div>
      </div>
    </div>
  );
}
