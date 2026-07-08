import { normalizeMessage } from '../normalize-message.js';
import { broadcastMessages } from '../clients.js';

export function messagesController(req, res) {
  const rawMessages = Array.isArray(req.body) ? req.body : [req.body];

  const routed = rawMessages.map((raw) => {
    const to = raw.to || raw.recipient || null;
    const message = normalizeMessage(raw);
    return { to, message };
  });

  const groups = groupMessagesByDestination(routed);

  console.log(`📥 Received ${rawMessages.length} message(s) from backend`);

  const { deliveredClientCount, deliveredMessageCount, totalClientCount } = broadcastMessages(groups);

  console.log(`📡 Checked ${totalClientCount} connected client(s) for routing`);

  console.log(
    `✅ Delivered to ${deliveredClientCount}/${totalClientCount} client(s), ${deliveredMessageCount} message(s) total`,
  );

  res.status(200).json({ success: true });
}

function groupMessagesByDestination(routed) {
  const groups = new Map();

  for (const { to, message } of routed) {
    const key = to || 'broadcast';
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(message);
  }

  return groups;
}
