import { MoreVertical, Settings, Trash2, ArrowLeft } from 'lucide-react';
interface ChatHeaderProps {
  businessName: string;
  businessPhone: string;
  onOpenSettings: () => void;
  onOpenInjector: () => void;
  onClearChat: () => void;
}

export function ChatHeader({
  businessName,
  businessPhone,
  onOpenSettings,
  onOpenInjector,
  onClearChat,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-whatsapp-green-dark text-white shadow-md z-10">
      <div className="flex items-center gap-3">
        <button className="p-1 hover:bg-white/10 rounded-full transition-colors md:hidden">
          <ArrowLeft size={20} />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-400
            rounded-full border-2 border-whatsapp-green-dark"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight">{businessName}</span>
          <span className="text-xs text-white/70">+{businessPhone}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenInjector}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Inject incoming message"
        >
          <span className="text-xs font-medium px-2">Inject</span>
        </button>
        <button
          onClick={onClearChat}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Clear chat"
        >
          <Trash2 size={18} />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
