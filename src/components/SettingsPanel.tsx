import { X, Save, Webhook, Globe, User } from 'lucide-react';
import { useState } from 'react';
import type { ChatConfig } from '@/types/messages';
import { VerificationTester } from './VerificationTester';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChatConfig;
  onSave: (config: ChatConfig) => void;
}

export function SettingsPanel({ isOpen, onClose, config, onSave }: SettingsPanelProps) {
  const [form, setForm] = useState<ChatConfig>(config);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-white";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Webhook Config */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Webhook size={16} className="text-whatsapp-green" />
              Webhook Configuration
            </h3>

            <div>
              <label className={labelClass}>Webhook URL (POST)</label>
              <input
                type="text"
                value={form.webhookUrl}
                onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                className={inputClass}
                placeholder="http://localhost:3000/webhook"
              />
            </div>

            <div>
              <label className={labelClass}>Verify Token</label>
              <input
                type="text"
                value={form.verifyToken}
                onChange={(e) => setForm({ ...form, verifyToken: e.target.value })}
                className={inputClass}
                placeholder="your_verify_token"
              />
            </div>

            <div>
              <label className={labelClass}>App Secret (for webhook signature)</label>
              <input
                type="password"
                value={form.appSecret}
                onChange={(e) => setForm({ ...form, appSecret: e.target.value })}
                className={inputClass}
                placeholder="your_app_secret"
              />
              <p className="text-[11px] text-gray-400 mt-1">Used to sign outgoing webhooks with X-Hub-Signature-256</p>
            </div>
          </div>

          {/* Backend API */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe size={16} className="text-whatsapp-green" />
              Backend Reply API (Optional)
            </h3>

            <div>
              <label className={labelClass}>WebSocket URL (real-time replies)</label>
              <input
                type="text"
                value={form.wsUrl}
                onChange={(e) => setForm({ ...form, wsUrl: e.target.value })}
                className={inputClass}
                placeholder="ws://localhost:3001"
              />
              <p className="text-[11px] text-gray-400 mt-1">Backend POSTs to the bridge server, messages pushed via WebSocket</p>
            </div>

            <div>
              <label className={labelClass}>Backend API URL (GET polling fallback)</label>
              <input
                type="text"
                value={form.backendApiUrl}
                onChange={(e) => setForm({ ...form, backendApiUrl: e.target.value })}
                className={inputClass}
                placeholder="http://localhost:3000/api/messages"
              />
              <p className="text-[11px] text-gray-400 mt-1">Only used if WebSocket URL is empty</p>
            </div>

            <div>
              <label className={labelClass}>Poll Interval (ms)</label>
              <input
                type="number"
                value={form.pollInterval}
                onChange={(e) => setForm({ ...form, pollInterval: Number(e.target.value) || 3000 })}
                className={inputClass}
                min={1000}
                step={500}
              />
            </div>
          </div>

          {/* Identity */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-whatsapp-green" />
              Simulator Identity
            </h3>

            <div>
              <label className={labelClass}>User Phone Number</label>
              <input
                type="text"
                value={form.userPhone}
                onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
                className={inputClass}
                placeholder="6281234567890"
              />
            </div>

            <div>
              <label className={labelClass}>Business Phone Number</label>
              <input
                type="text"
                value={form.businessPhone}
                onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                className={inputClass}
                placeholder="15550000000"
              />
            </div>

            <div>
              <label className={labelClass}>Business Name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className={inputClass}
                placeholder="Business Account"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-4">
          <VerificationTester
            webhookUrl={form.webhookUrl}
            verifyToken={form.verifyToken}
          />
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-whatsapp-green text-white py-2.5 rounded-lg font-medium text-sm hover:bg-whatsapp-green-dark transition-colors"
          >
            <Save size={16} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
