import type { ChatConfig } from '@/types/messages';

export const DEFAULT_CONFIG: ChatConfig = {
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:3000/webhook',
  verifyToken: import.meta.env.VITE_VERIFY_TOKEN || 'test_verify_token',
  appSecret: import.meta.env.VITE_APP_SECRET || '',
  userPhone: import.meta.env.VITE_USER_PHONE || '6281234567890',
  businessPhone: import.meta.env.VITE_BUSINESS_PHONE || '15550000000',
  businessName: 'Business Account',
};
