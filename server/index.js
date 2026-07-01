import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { URL } from 'url';
import { registerClient, removeClient } from './clients.js';
import { createMessagesRouter } from './routes/messages.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/api/ws' });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const clientId = url.searchParams.get('clientId') || `anon_${Date.now()}`;
  const phone = url.searchParams.get('phone') || '';

  registerClient(ws, clientId, phone);

  ws.on('close', () => removeClient(ws, clientId));
  ws.on('error', () => removeClient(ws, clientId));
});

app.post('/api/messages', createMessagesRouter());

server.listen(PORT, () => {
  console.log(`\n🚀 Bridge server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/api/ws`);
  console.log(`📥 POST replies to: http://localhost:${PORT}/api/messages`);
});
