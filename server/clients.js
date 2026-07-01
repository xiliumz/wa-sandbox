import { WebSocket } from 'ws';

/** @type {Map<string, {ws: import('ws').WebSocket, phone: string}>} */
const clients = new Map();

export function registerClient(ws, clientId, phone) {
  const existing = clients.get(clientId);
  if (existing && existing.ws !== ws && existing.ws.readyState === WebSocket.OPEN) {
    console.log(`🔌 Closing stale connection for client ${clientId}`);
    existing.ws.close();
  }

  clients.set(clientId, { ws, phone });
  console.log(
    `🖥️  Simulator client connected (${clientId}, phone=${phone || 'none'}) — total clients: ${clients.size}`,
  );
}

export function removeClient(ws, clientId) {
  const entry = clients.get(clientId);
  if (entry && entry.ws === ws) {
    clients.delete(clientId);
  }
  console.log(`🖥️  Simulator client disconnected (${clientId}) — total clients: ${clients.size}`);
}

export function broadcastMessages(groups) {
  let deliveredClientCount = 0;
  let deliveredMessageCount = 0;

  for (const { ws, phone } of getHealthyClients()) {
    const clientMessages = [];
    clientMessages.push(...(groups.get('broadcast') || []));

    if (phone && groups.has(phone)) {
      clientMessages.push(...groups.get(phone));
    }

    if (clientMessages.length > 0) {
      ws.send(JSON.stringify({ type: 'messages', data: clientMessages }));
      deliveredClientCount++;
      deliveredMessageCount += clientMessages.length;
    }
  }

  return {
    deliveredClientCount,
    deliveredMessageCount,
    totalClientCount: clients.size,
  };
}

function cleanupClients() {
  for (const [clientId, { ws }] of clients.entries()) {
    if (ws.readyState !== WebSocket.OPEN) {
      clients.delete(clientId);
    }
  }
}

function getHealthyClients() {
  cleanupClients();
  return Array.from(clients.values()).map((client) => ({ ...client }));
}
