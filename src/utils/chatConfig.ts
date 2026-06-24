import type { ChatConfig } from '@/types/messages';
import { DEFAULT_CONFIG } from '@/constants/config';

export function mergeWithDefaultConfig(): ChatConfig {
  try {
    const item = window.localStorage.getItem('wa-chat-config');
    const parsed = item ? (JSON.parse(item) as Partial<ChatConfig>) : {};
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}
