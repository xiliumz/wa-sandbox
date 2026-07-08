import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { URL } from 'url';
import { registerClient, removeClient, startHeartbeat } from './clients.js';
import { messagesController } from './routes/messages.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/api/ws' });

// Internal port; must match nginx.conf.template
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const phone = url.searchParams.get('phone') || '';

  registerClient(ws, phone);

  ws.on('close', () => removeClient(ws));
  ws.on('error', () => removeClient(ws));
});

const heartbeatInterval = startHeartbeat();

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

app.post('/api/messages', messagesController);

server.listen(PORT, () => {
  console.log(`📥 POST replies to: http://localhost:${PORT}/api/messages`);
});
