# WA Sandbox — WhatsApp Business API Simulator

A developer tool for testing WhatsApp webhook integrations without needing a real WhatsApp Business account. It provides a WhatsApp Web-like UI that sends **real Meta Graph API-format payloads** to your backend and receives replies in real-time.

## Architecture

The project has two parts:

| Component          | Stack                                | Description                                             |
| ------------------ | ------------------------------------ | ------------------------------------------------------- |
| **Frontend**       | React + Vite + TypeScript + Tailwind | WhatsApp Web-like chat UI                               |
| **Backend bridge** | Node.js + Express + WebSocket        | Relays incoming messages to connected simulator clients |

### Message Flow

```
┌──────────────┐  POST (Meta webhook format)  ┌──────────────────┐
│   Simulator  │ ──────────────────────────▶  │   Your Backend   │
│   (Frontend) │                              │   (e.g. chatbot) │
└──────┬───────┘                              └───────┬──────────┘
       │                                              │
       │  WebSocket (real-time)           POST /api/messages
       │       ◀──────────────────────────────────────┘
       ▼
  Replies appear
  in the UI
```

| Direction                               | What happens                                                                                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Outgoing** (user → your backend)      | You type in the simulator → it POSTs a Meta Graph API-format webhook payload to your `VITE_WEBHOOK_URL`. Your backend receives it exactly as if WhatsApp sent it. |
| **Incoming** (your backend → simulator) | Your backend POSTs to the bridge server at `POST /api/messages` → the bridge pushes the message via WebSocket to the simulator UI.                                |

## Features

- **All WhatsApp message types**: text, image, video, audio/voice, document, interactive buttons (max 3), interactive lists (max 10 rows)
- **HMAC signature verification**: computes `X-Hub-Signature-256` using `VITE_APP_SECRET`, matching Meta's behavior
- **Webhook verification test**: tests the `hub.mode=subscribe` verification flow
- **Message injector panel**: manually inject incoming messages for testing without a backend
- **Media upload**: send images/videos/documents with captions (album behavior: only first file gets caption)
- **Voice recording**: record and send voice notes as `.ogg`
- **Per-phone routing**: the bridge server routes messages to specific simulator clients based on destination phone number
- **Message status tracking**: `sending` → `sent` → `read` / `failed`
- **LocalStorage persistence**: chat history and config survive page reloads

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### 1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — see [Configuration](#configuration) below.

### 3. Run (development)

Start both the bridge server and the frontend dev server:

```bash
npm run dev:all
```

Or run them separately:

```bash
# Terminal 1 — bridge server (port 3001)
npm run server

# Terminal 2 — frontend dev server (port 5173)
npm run dev
```

- **Simulator UI**: [http://localhost:5173](http://localhost:5173)

## Configuration

All config lives in `.env` (Vite bakes `VITE_*` vars into the frontend bundle at build time).

| Variable              | Required | Description                                                                         |
| --------------------- | -------- | ----------------------------------------------------------------------------------- |
| `VITE_WEBHOOK_URL`    | Yes      | Your backend's webhook endpoint (where outgoing messages are POSTed)                |
| `VITE_VERIFY_TOKEN`   | Optional | Token for testing webhook verification                                              |
| `VITE_APP_SECRET`     | Optional | Secret for computing `X-Hub-Signature-256` HMAC headers                             |
| `VITE_WS_URL`         | Yes      | Bridge server WebSocket path (default `/api/ws`; works through Vite proxy or nginx) |
| `VITE_USER_PHONE`     | Yes      | The simulator's "from" phone number (e.g. `6281234567890`)                          |
| `VITE_BUSINESS_PHONE` | Yes      | The business phone number being simulated (e.g. `15550000000`)                      |

## Using Docker Compose

Docker Compose runs both the frontend (served by nginx) and the bridge backend as isolated containers with a single command.

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values. The `VITE_*` variables are passed as build args to the frontend container.

### 2. Build and start

```bash
docker compose up --build
```

This starts two services:

| Service    | Container port | Host port | Description                             |
| ---------- | -------------- | --------- | --------------------------------------- |
| `frontend` | 80             | **4000**  | React app served by nginx               |
| `backend`  | 3001           | -         | WebSocket bridge server (internal only) |

- **Simulator UI**: [http://localhost:4000](http://localhost:4000)

### 3. How the Docker setup works

The nginx config in the frontend container acts as a reverse proxy:

```
Browser ──▶ nginx (port 80)
             ├── /           → serves static React SPA
|             ├── /api/*      → proxy_pass to backend:4001 (HTTP API)
|             └── /api/ws     → proxy_pass to backend:4001 (WebSocket upgrade)
```

This means from the browser's perspective, everything is served from the same origin (`localhost:4000`), avoiding CORS issues. The nginx container communicates with the backend container over Docker's internal network using the service name `backend`.

### 4. Common commands

```bash
# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Rebuild after code changes
docker compose up --build
```

## Sending Messages to the Simulator from Your Backend

When your backend wants to show a message in the simulator UI, POST to the bridge server.

```bash
# Full app (Docker/nginx - port 4000)
curl -X POST http://localhost:4000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "6281234567890",
    "type": "text",
    "text": { "body": "Hello from my bot!" }
  }'

# Direct to backend (local dev - port 3001)
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "6281234567890",
    "type": "text",
    "text": { "body": "Hello from my bot!" }
  }'
```

Use the same `to` value as the simulator's `VITE_USER_PHONE`. If you omit `to`, the message is broadcast to every connected simulator client.

The payload shape is based on the **Meta Graph API** message structure. The bridge accepts the full Cloud API shape (including `messaging_product`, `recipient_type`, and `to`), but only `type` and the message body are required. See `docs/api-specification.md` for full details on all supported message types.

## License

Private project.
