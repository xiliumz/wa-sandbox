import { useState } from 'react';
import { X, MessageSquare, Image, Video, Music, FileText, MousePointerClick, List, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  createIncomingTextMessage,
  createIncomingMediaMessage,
  createIncomingInteractiveButton,
  createIncomingInteractiveList,
} from '@/utils/message-builders';
import type {
  Message,
  MediaType,
  InteractiveButtonOption,
  InteractiveListSection,
} from '@/types/messages';

interface MessageInjectorProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectMessage: (message: Message) => void;
}

type InjectTab = 'text' | 'media' | 'button' | 'list';

interface TabItem {
  id: InjectTab;
  label: string;
  icon: React.ReactNode;
}

interface MediaTypeOption {
  type: MediaType;
  icon: React.ReactNode;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'text', label: 'Text', icon: <MessageSquare size={14} /> },
  { id: 'media', label: 'Media', icon: <Image size={14} /> },
  { id: 'button', label: 'Buttons', icon: <MousePointerClick size={14} /> },
  { id: 'list', label: 'List', icon: <List size={14} /> },
];

const MEDIA_TYPE_OPTIONS: MediaTypeOption[] = [
  { type: 'image', icon: <Image size={16} />, label: 'Image' },
  { type: 'video', icon: <Video size={16} />, label: 'Video' },
  { type: 'audio', icon: <Music size={16} />, label: 'Audio' },
  { type: 'document', icon: <FileText size={16} />, label: 'Document' },
];

const INPUT_CLASS =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg '
  + 'focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-white';
const LABEL_CLASS = 'block text-xs font-medium text-gray-600 mb-1';

export function MessageInjector({
  isOpen,
  onClose,
  onInjectMessage,
}: MessageInjectorProps) {
  const [activeTab, setActiveTab] = useState<InjectTab>('text');

  // Text state
  const [textContent, setTextContent] = useState('Hello from simulator!');

  // Media state
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [mediaUrl, setMediaUrl] = useState('https://picsum.photos/400/300');
  const [mediaCaption, setMediaCaption] = useState('');

  // Button state
  const [buttonBody, setButtonBody] = useState('Do you want to proceed?');
  const [buttonHeader, setButtonHeader] = useState('');
  const [buttonFooter, setButtonFooter] = useState('');
  const [buttons, setButtons] = useState<InteractiveButtonOption[]>([
    { id: 'btn_yes', title: 'Yes' },
    { id: 'btn_no', title: 'No' },
  ]);

  // List state
  const [listBody, setListBody] = useState('Please select an option:');
  const [listHeader, setListHeader] = useState('');
  const [listFooter, setListFooter] = useState('');
  const [listButtonText, setListButtonText] = useState('Select Option');
  const [sections, setSections] = useState<InteractiveListSection[]>([
    {
      title: 'Options',
      rows: [
        { id: 'opt_1', title: 'Option 1', description: 'First option description' },
        { id: 'opt_2', title: 'Option 2', description: 'Second option description' },
      ],
    },
  ]);

  if (!isOpen) return null;

  const handleInjectText = () => {
    if (textContent.trim()) {
      onInjectMessage(createIncomingTextMessage(textContent.trim()));
      setTextContent('');
      onClose();
    }
  };

  const handleInjectMedia = () => {
    if (mediaUrl.trim()) {
      onInjectMessage(
        createIncomingMediaMessage(mediaType, mediaUrl.trim(), mediaCaption.trim() || undefined),
      );
      onClose();
    }
  };

  const handleInjectButton = () => {
    if (buttonBody.trim() && buttons.length > 0) {
      onInjectMessage(
        createIncomingInteractiveButton(
          buttonBody.trim(),
          buttons,
          buttonHeader.trim() ? { type: 'text', text: buttonHeader.trim() } : undefined,
          buttonFooter.trim() || undefined,
        ),
      );
      onClose();
    }
  };

  const handleInjectList = () => {
    if (listBody.trim() && sections.length > 0) {
      onInjectMessage(
        createIncomingInteractiveList(
          listBody.trim(),
          listButtonText.trim() || 'Select Option',
          sections,
          listHeader.trim() || undefined,
          listFooter.trim() || undefined,
        ),
      );
      onClose();
    }
  };

  const addButton = () => {
    setButtons([...buttons, { id: `btn_${Date.now()}`, title: `Button ${buttons.length + 1}` }]);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: 'id' | 'title', value: string) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], [field]: value };
    setButtons(updated);
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}`,
        rows: [{ id: `row_${Date.now()}`, title: 'New Row', description: '' }],
      },
    ]);
  };

  const addRow = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].rows.push({
      id: `row_${Date.now()}`,
      title: `Row ${updated[sectionIndex].rows.length + 1}`,
      description: '',
    });
    setSections(updated);
  };

  const updateRow = (
    sectionIndex: number,
    rowIndex: number,
    field: 'id' | 'title' | 'description',
    value: string,
  ) => {
    const updated = [...sections];
    updated[sectionIndex].rows[rowIndex] = {
      ...updated[sectionIndex].rows[rowIndex],
      [field]: value,
    };
    setSections(updated);
  };

  const removeRow = (sectionIndex: number, rowIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].rows = updated[sectionIndex].rows.filter((_, i) => i !== rowIndex);
    if (updated[sectionIndex].rows.length === 0) {
      updated.splice(sectionIndex, 1);
    }
    setSections(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Inject Incoming Message</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-whatsapp-green text-whatsapp-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'text' && (
            <div>
              <label className={LABEL_CLASS}>Message Text</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={4}
                className={cn(INPUT_CLASS, 'resize-none')}
                placeholder="Enter message text..."
              />
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>Media Type</label>
                <div className="flex gap-2">
                  {MEDIA_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => setMediaType(opt.type)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors',
                        mediaType === opt.type
                          ? 'border-whatsapp-green bg-green-50 text-whatsapp-green'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600',
                      )}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Media URL</label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Caption (optional)</label>
                <input
                  type="text"
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Add a caption..."
                />
              </div>
            </div>
          )}

          {activeTab === 'button' && (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>Header (optional)</label>
                <input
                  type="text"
                  value={buttonHeader}
                  onChange={(e) => setButtonHeader(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Header text"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Body</label>
                <textarea
                  value={buttonBody}
                  onChange={(e) => setButtonBody(e.target.value)}
                  rows={3}
                  className={cn(INPUT_CLASS, 'resize-none')}
                  placeholder="Message body text"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Footer (optional)</label>
                <input
                  type="text"
                  value={buttonFooter}
                  onChange={(e) => setButtonFooter(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Footer text"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Buttons (max 3)</label>
                <div className="space-y-2">
                  {buttons.map((btn, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={btn.id}
                        onChange={(e) => updateButton(index, 'id', e.target.value)}
                        className={cn(INPUT_CLASS, 'flex-1')}
                        placeholder="Button ID"
                      />
                      <input
                        type="text"
                        value={btn.title}
                        onChange={(e) => updateButton(index, 'title', e.target.value)}
                        className={cn(INPUT_CLASS, 'flex-[2]')}
                        placeholder="Button Title"
                      />
                      <button
                        onClick={() => removeButton(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={buttons.length <= 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {buttons.length < 3 && (
                    <button
                      onClick={addButton}
                      className="flex items-center gap-1.5 text-sm
                      text-whatsapp-green hover:text-whatsapp-green-dark transition-colors"
                    >
                      <Plus size={14} />
                      Add Button
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS}>Header (optional)</label>
                <input
                  type="text"
                  value={listHeader}
                  onChange={(e) => setListHeader(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Header text"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Body</label>
                <textarea
                  value={listBody}
                  onChange={(e) => setListBody(e.target.value)}
                  rows={2}
                  className={cn(INPUT_CLASS, 'resize-none')}
                  placeholder="Message body text"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Footer (optional)</label>
                <input
                  type="text"
                  value={listFooter}
                  onChange={(e) => setListFooter(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Footer text"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Action Button Text</label>
                <input
                  type="text"
                  value={listButtonText}
                  onChange={(e) => setListButtonText(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Select Option"
                />
              </div>

              <div className="space-y-4">
                <label className={LABEL_CLASS}>Sections & Rows</label>
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <input
                      type="text"
                      value={section.title || ''}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[sectionIndex].title = e.target.value;
                        setSections(updated);
                      }}
                      className={cn(INPUT_CLASS, 'font-medium')}
                      placeholder="Section title"
                    />
                    <div className="space-y-2 pl-2 border-l-2 border-gray-100">
                      {section.rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={row.id}
                              onChange={(e) => updateRow(sectionIndex, rowIndex, 'id', e.target.value)}
                              className={INPUT_CLASS}
                              placeholder="Row ID"
                            />
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => updateRow(sectionIndex, rowIndex, 'title', e.target.value)}
                              className={INPUT_CLASS}
                              placeholder="Row Title"
                            />
                            <input
                              type="text"
                              value={row.description || ''}
                              onChange={(e) => updateRow(sectionIndex, rowIndex, 'description', e.target.value)}
                              className={INPUT_CLASS}
                              placeholder="Description (optional)"
                            />
                          </div>
                          <button
                            onClick={() => removeRow(sectionIndex, rowIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addRow(sectionIndex)}
                        className="flex items-center gap-1.5 text-xs
                        text-whatsapp-green hover:text-whatsapp-green-dark transition-colors"
                      >
                        <Plus size={12} />
                        Add Row
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSection}
                  className="flex items-center gap-1.5 text-sm
                  text-whatsapp-green hover:text-whatsapp-green-dark transition-colors"
                >
                  <Plus size={14} />
                  Add Section
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              switch (activeTab) {
                case 'text': handleInjectText(); break;
                case 'media': handleInjectMedia(); break;
                case 'button': handleInjectButton(); break;
                case 'list': handleInjectList(); break;
              }
            }}
            className="w-full bg-whatsapp-green text-white py-2.5 rounded-lg
            font-medium text-sm hover:bg-whatsapp-green-dark transition-colors"
          >
            Inject Message
          </button>
        </div>
      </div>
    </div>
  );
}
