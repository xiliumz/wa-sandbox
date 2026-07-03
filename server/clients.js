import { WebSocket } from 'ws';

/** @type {Map<WebSocket, {ws: import('ws').WebSocket, phone: string}>} */
const clients = new Map();

export function registerClient(ws, phone) {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  clients.set(ws, { ws, phone });
  console.log(
    `🖥️  Simulator client connected (phone=${phone || 'none'}) — total clients: ${clients.size}`,
  );
}

export function removeClient(ws) {
  if (clients.has(ws)) {
    clients.delete(ws);
  }
  console.log(`🖥️  Simulator client disconnected — total clients: ${clients.size}`);
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

function getHealthyClients() {
  cleanupClients();
  // Shallow-copy each client so callers cannot mutate the internal Map entries.
  return Array.from(clients.values()).map((client) => ({ ...client }));
}

function cleanupClients() {
  for (const [ws] of clients.entries()) {
    if (ws.readyState !== WebSocket.OPEN) {
      clients.delete(ws);
    }
  }
}

export function startHeartbeat(intervalMs = 30000) {
  return setInterval(() => {
    for (const { ws } of Array.from(clients.values())) {
      if (ws.readyState !== WebSocket.OPEN) {
        clients.delete(ws);
        continue;
      }

      if (!ws.isAlive) {
        console.log('💀 Terminating dead client connection');
        clients.delete(ws);
        ws.terminate();
        continue;
      }

      ws.isAlive = false;
      ws.ping();
    }
  }, intervalMs);
}
