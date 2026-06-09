import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { URL } from 'url';
import { normalizeMessage } from './normalize-message.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

/** @type {Map<string, import('ws').WebSocket>} */
const clients = new Map();

wss.on('connection', (ws, req) => {
  // Parse clientId from URL query params
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const clientId = url.searchParams.get('clientId') || `anon_${Date.now()}`;
  const phone = url.searchParams.get('phone') || '';

  // Close any existing connection with the same clientId
  const existing = clients.get(clientId);
  if (existing && existing.ws !== ws && existing.ws.readyState === 1) {
    console.log(`🔌 Closing stale connection for client ${clientId}`);
    existing.ws.close();
  }

  clients.set(clientId, { ws, phone });
  console.log(`🖥️  Simulator client connected (${clientId}, phone=${phone || 'none'}) — total clients: ${clients.size}`);

  ws.on('close', () => {
    // Only remove if this ws is the one currently mapped
    const entry = clients.get(clientId);
    if (entry && entry.ws === ws) {
      clients.delete(clientId);
    }
    console.log(`🖥️  Simulator client disconnected (${clientId}) — total clients: ${clients.size}`);
  });

  ws.on('error', () => {
    const entry = clients.get(clientId);
    if (entry && entry.ws === ws) {
      clients.delete(clientId);
    }
  });
});

/**
 * POST /api/inbox
 * Your backend sends replies here.
 * Body: single message object or array of messages
 */
app.post('/api/inbox', (req, res) => {
  const rawMessages = Array.isArray(req.body) ? req.body : [req.body];

  // Extract routing info before normalization
  const routed = rawMessages.map((raw) => {
    const to = raw.to || raw.recipient || null;
    const message = normalizeMessage(raw);
    return { to, message };
  });

  // Group messages by destination phone
  const groups = new Map();
  for (const { to, message } of routed) {
    const key = to || 'broadcast';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(message);
  }

  // Clean up dead connections before broadcasting
  for (const [clientId, { ws }] of clients.entries()) {
    if (ws.readyState !== 1) {
      clients.delete(clientId);
    }
  }

  console.log(`📥 Received ${rawMessages.length} message(s) from backend`);
  console.log(`📡 Checking ${clients.size} connected client(s) for routing`);

  let deliveredClients = 0;
  let deliveredMessages = 0;

  for (const [clientId, { ws, phone }] of clients.entries()) {
    if (ws.readyState !== 1) {
      clients.delete(clientId);
      continue;
    }

    const clientMessages = [];
    const broadcast = groups.get('broadcast') || [];
    clientMessages.push(...broadcast);

    if (phone && groups.has(phone)) {
      clientMessages.push(...groups.get(phone));
    }

    if (clientMessages.length > 0) {
      ws.send(JSON.stringify({ type: 'messages', data: clientMessages }));
      deliveredClients++;
      deliveredMessages += clientMessages.length;
    }
  }

  console.log(`✅ Delivered to ${deliveredClients}/${clients.size} client(s), ${deliveredMessages} message(s) total`);

  res.json({ success: true, received: routed.length, deliveredClients, deliveredMessages });
});

/**
 * GET /health
 * Health check + connection count
 */
app.get('/health', (_, res) => {
  // Clean up dead connections before counting
  for (const [clientId, { ws }] of clients.entries()) {
    if (ws.readyState !== 1) {
      clients.delete(clientId);
    }
  }
  res.json({ status: 'ok', clients: clients.size });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Bridge server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`📥 POST replies to: http://localhost:${PORT}/api/inbox`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
});
