import type { Message, InteractiveListMessage } from '@/types/messages';

export function findActiveListMessage(
  messages: Message[],
  activeId: string | null,
): InteractiveListMessage | null {
  if (!activeId) {
    return null;
  }

  return (
    messages.find((m): m is InteractiveListMessage =>
      m.id === activeId && m.type === 'interactive_list',
    ) || null
  );
}
