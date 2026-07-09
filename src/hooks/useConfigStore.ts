import { useLocalStorage } from './useLocalStorage';
import type { ChatConfig } from '@/types/messages';
import { DEFAULT_CONFIG } from '@/constants/config';

function getInitialChatConfig(stored: ChatConfig | null): ChatConfig {
  return stored ? { ...DEFAULT_CONFIG, ...stored } : DEFAULT_CONFIG;
}

export function useConfigStore() {
  const [config, setConfig] = useLocalStorage<ChatConfig>(
    'wa-chat-config',
    getInitialChatConfig,
  );

  return { config, setConfig };
}
