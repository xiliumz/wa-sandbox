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

  // Close any existing connection with the same clientId
  const existing = clients.get(clientId);
  if (existing && existing !== ws && existing.readyState === 1) {
    console.log(`🔌 Closing stale connection for client ${clientId}`);
    existing.close();
  }

  clients.set(clientId, ws);
  console.log(`🖥️  Simulator client connected (${clientId}) — total clients: ${clients.size}`);

  ws.on('close', () => {
    // Only remove if this ws is the one currently mapped
    if (clients.get(clientId) === ws) {
      clients.delete(clientId);
    }
    console.log(`🖥️  Simulator client disconnected (${clientId}) — total clients: ${clients.size}`);
  });

  ws.on('error', () => {
    if (clients.get(clientId) === ws) {
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
  const messages = rawMessages.map(normalizeMessage);

  // Clean up dead connections before broadcasting
  for (const [clientId, ws] of clients.entries()) {
    if (ws.readyState !== 1) {
      clients.delete(clientId);
    }
  }

  console.log(`📥 Received ${rawMessages.length} message(s) from backend`);
  console.log(`📡 Relaying to ${clients.size} simulator client(s)`);

  const payload = JSON.stringify({ type: 'messages', data: messages });

  let delivered = 0;
  for (const [clientId, ws] of clients.entries()) {
    if (ws.readyState === 1) {
      ws.send(payload);
      delivered++;
    } else {
      clients.delete(clientId);
    }
  }

  res.json({ success: true, received: messages.length, delivered });
});

/**
 * GET /health
 * Health check + connection count
 */
app.get('/health', (_, res) => {
  // Clean up dead connections before counting
  for (const [clientId, ws] of clients.entries()) {
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
