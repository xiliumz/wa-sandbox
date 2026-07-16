import { X, Save, Webhook, User } from 'lucide-react';
import { useState } from 'react';
import type { ChatConfig } from '@/types/messages';
import { VerificationTester } from './VerificationTester';
import { Field } from './Field';

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl
        flex flex-col animate-in slide-in-from-right-10">
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

            <Field
              label="Webhook URL (POST)"
              value={form.webhookUrl}
              onChange={(v) => setForm({ ...form, webhookUrl: v })}
              placeholder="http://localhost:3000/webhook"
            />
            <Field
              label="Verify Token"
              value={form.verifyToken}
              onChange={(v) => setForm({ ...form, verifyToken: v })}
              placeholder="your_verify_token"
            />
            <Field
              label="App Secret (for webhook signature)"
              type="password"
              value={form.appSecret}
              onChange={(v) => setForm({ ...form, appSecret: v })}
              placeholder="your_app_secret"
              description="Used to sign outgoing webhooks with X-Hub-Signature-256"
            />
          </div>

          {/* Identity */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-whatsapp-green" />
              Simulator Identity
            </h3>

            <Field
              label="User Phone Number"
              value={form.userPhone}
              onChange={(v) => setForm({ ...form, userPhone: v })}
              placeholder="6281234567890"
            />
            <Field
              label="Business Phone Number"
              value={form.businessPhone}
              onChange={(v) => setForm({ ...form, businessPhone: v })}
              placeholder="15550000000"
            />
            <Field
              label="Business Name"
              value={form.businessName}
              onChange={(v) => setForm({ ...form, businessName: v })}
              placeholder="Business Account"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-4">
          <VerificationTester
            webhookUrl={form.webhookUrl}
            verifyToken={form.verifyToken}
          />
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2
            bg-whatsapp-green text-white py-2.5 rounded-lg font-medium text-sm
            hover:bg-whatsapp-green-dark transition-colors"
          >
            <Save size={16} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
