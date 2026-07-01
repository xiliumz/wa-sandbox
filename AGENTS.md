# Agent Context: WA Sandbox

> This file provides context for AI coding agents (Cursor, Windsurf, Aider, Claude Code). Read it before making global changes.

## 1. Project Overview & Philosophy

**Name:** `wa-sandbox`
**Description:** A developer tool that simulates a WhatsApp Business Account conversation. It provides a WhatsApp Web-like UI that sends **real Meta Graph API-format webhook payloads** to your backend and receives backend replies in real time via a WebSocket bridge.

**Core Tenets (inferred from the code):**

- **Type safety first:** Strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`, `isolatedModules`).
- **Minimal dependencies:** No state-management library; state lives in custom hooks backed by `localStorage`.
- **Browser-native APIs:** Uses `fetch`, `crypto.subtle`, `WebSocket`, `MediaRecorder`, `URL.createObjectURL` directly.
- **Meta API fidelity:** Outgoing payloads mirror Meta's webhook format; incoming payloads are normalized from Meta's Graph API message structure.
- **Containerized deployment:** Docker Compose setup with nginx reverse proxy is a first-class deployment target.

**Critical Dependencies:**

- **React 18.3** + **React DOM** — UI rendering.
- **Vite 5.3** — dev server, HMR, and production build.
- **TypeScript 5.4** — strict typing with path alias `@/*` mapped to `src/*`.
- **Tailwind CSS 3.4** + **autoprefixer** — utility-first styling; custom `whatsapp` color theme and `chat-pattern` background.
- **Express 5.2** + **ws 8.21** + **cors** — bridge server and WebSocket relay.
- **lucide-react** — icon set.
- **uuid** — message IDs in the frontend.
- **clsx** + **tailwind-merge** — combined in `src/utils/cn.ts` for conditional Tailwind classes.

**Entrypoints:**

- Frontend SPA: `src/main.tsx` → `src/App.tsx` → `src/components/ChatContainer.tsx`.
- Bridge server: `server/index.js` (ES module, Node 20+).

## 2. Directory Structure (The Map)

```text
wa-sandbox/
├── src/              # React + TypeScript frontend
│   ├── components/   # UI components (PascalCase .tsx)
│   ├── hooks/        # Custom React hooks (use*.ts)
│   ├── types/        # Shared domain TypeScript types
│   ├── constants/    # Default config and fixed values
│   └── utils/        # Pure helper utilities
├── server/           # Express + WebSocket bridge backend
├── docs/             # API/specification documentation
└── assets/           # Static images and screenshots
```

**Key root configuration & orchestration files:**

| File                  | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `index.html`          | Vite entry HTML                          |
| `vite.config.ts`      | Vite alias `@` → `./src`                 |
| `tsconfig.json`       | Strict TypeScript compiler options       |
| `tailwind.config.js`  | Tailwind theme + content globs           |
| `postcss.config.js`   | Tailwind + autoprefixer pipeline         |
| `Dockerfile`          | Multi-stage frontend → nginx image       |
| `nginx.conf.template` | Reverse proxy config template (envsubst) |
| `docker-compose.yml`  | Full-stack Docker Compose orchestration  |
| `.env.example`        | Environment variable template            |
| `README.md`           | Human-facing documentation               |

**Where new files go:**

- New UI components → `src/components/PascalCase.tsx`.
- New state/effect hooks → `src/hooks/useCamelCase.ts`.
- New shared domain types → `src/types/messages.ts` (or a new `src/types/*.ts` file if unrelated to messages).
- New constants → `src/constants/config.ts` (or `src/constants/*.ts`).
- New helpers → `src/utils/kebab-case.ts`.
- New bridge logic → `server/*.js` (ES modules; import `.js` extensions explicitly).

## 3. Development Commands (The Handbook)

All commands assume Node.js 20+ and npm.

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your VITE_WEBHOOK_URL, VITE_WS_URL, VITE_USER_PHONE, etc.

# Run frontend dev server (HMR on http://localhost:5173)
npm run dev

# Run bridge server only (http://localhost:3001, ws://localhost:3001)
npm run server

# Run both frontend and bridge server together
npm run dev:all

# Type-check + production build
npm run build

# Preview production build locally
npm run preview
```

**Full-stack Docker Compose (UI on http://localhost:4000):**

```bash
cp .env.example .env
# Fill values, then:
docker compose up --build
```

> There are currently no test, lint, or format scripts configured. If you add tests, use **Vitest** (Vite-native) and place `*.test.ts(x)` files next to the source files they test.

## 4. Code Style & Naming Conventions (Explicit)

**Development Principles**

Follow these principles when working on this project:

- **KISS (Keep It Simple, Stupid)** — Prefer simple solutions. Avoid unnecessary abstractions, frameworks, or configuration. If a feature can be built with plain Astro and a little TypeScript, do not add a heavier tool.
- **YAGNI (You Aren't Gonna Need It)** — Do not implement features, components, or APIs before they are actually required. Build for the current phase, not every possible future scenario.
- **Single Responsibility** — Each file, component, and function should do one thing well. Astro components handle UI, schema files handle validation shapes, scripts handle build-time tasks, and data files handle content. Keep concerns separated.
- **DRY (Don't Repeat Yourself)** — Avoid duplicating logic, data, or structure. Extract reusable components, shared utilities, and common schemas so the same knowledge exists in only one place.

**Formatting (inferred from existing code):**

- 2-space indentation.
- Semicolons are required.
- Single quotes for strings/JSX attributes where possible.
- Trailing commas in multi-line object/array/type definitions.
- No trailing spaces.
- Maximum line length is not enforced, but keep lines readable.

**File naming:**

- React components: `PascalCase.tsx`.
- Custom hooks: `useCamelCase.ts`.
- Utility modules: `kebab-case.ts`.
- Constant modules: `kebab-case.ts` (e.g., `config.ts`).
- Type modules: `kebab-case.ts` (e.g., `messages.ts`).

**Naming:**

- Components / interfaces / types: `PascalCase` (no `I` prefix on interfaces).
- Functions / variables / hooks: `camelCase`.
- Constants that are fixed values: `UPPER_SNAKE_CASE` when exported as true constants, otherwise `camelCase`.
- Custom hooks must start with `use`.

**Export style:**

- Prefer **named exports** for hooks and components (e.g., `export function useChatStore()`).
- `App.tsx` is the only default-exported component (`export default App`).

**TypeScript rules enforced by `tsconfig.json`:**

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `isolatedModules: true`
- `moduleResolution: bundler`
- `allowImportingTsExtensions: true` with `noEmit: true`
- JSX transform: `react-jsx` (do not import React just for JSX).

**Tailwind usage:**

- Use Tailwind utility classes for layout and theme colors.
- For dynamic/conditional classes, use the `cn()` helper from `src/utils/cn.ts`.
- Custom theme colors are defined in `tailwind.config.js` under `theme.extend.colors.whatsapp`.

## 5. Architecture Patterns (The Invariants)

**State management:**

- No Redux/Zustand/Context API for global state.
- `useChatStore` is a custom hook that composes `useLocalStorage` for persistence and `useState` for ephemeral UI state.
- All state updates are immutable (e.g., `[...prev, message]`, `prev.map(...)`).

**API / Data flow:**

- **Outgoing (simulator → backend):** `useWebhook` builds a Meta-format payload and `fetch`-es it to `VITE_WEBHOOK_URL`. It optionally signs the body with `X-Hub-Signature-256` using `crypto.subtle`.
- **Incoming (backend → simulator):** The bridge server (`server/index.js`) exposes `POST /api/messages`; it normalizes payloads with `normalize-message.js` and pushes them to matching WebSocket clients at `/api/ws`, grouped by destination phone number.

**Error handling:**

- Use `try/catch` around async operations (`fetch`, `crypto.subtle`, `MediaRecorder`).
- Each message is sent independently; a new message does **not** abort an earlier in-flight webhook request (matches real WhatsApp behavior).
- Provide sensible `try/catch` fallbacks (empty strings, `false` return values) instead of throwing or using monadic error types (`Result`, `Either`).

**Logging:**

- Frontend: limited `console.warn` / `console.error` for diagnostics.
- Server: structured-ish `console.log` lines with emoji prefixes for lifecycle events (`🚀`, `📡`, `📥`, `✅`, `🔌`).

**Security:**

- Secrets live in `.env` only. `VITE_APP_SECRET` is used for HMAC signing on the client side (this is a simulator; real signing happens server-side in production WhatsApp flows).
- CORS is enabled on the bridge server for local development.

## 6. Testing Strategy

**Current state:** There are no automated tests in this repository.

**If you add tests:**

- Use **Vitest** because the project is Vite-based.
- Place tests under `tests/` mirroring the `src/` directory structure, e.g. `tests/hooks/useChatStore.test.ts`.
- Do **not** hit a real backend or database; mock `fetch`, `WebSocket`, `localStorage`, `sessionStorage`, and `navigator.mediaDevices`.
- Keep tests deterministic: mock `uuid` and `Date.now()` where IDs/timestamps matter.

## 7. Git & PR Workflow

**Commit convention:** Conventional Commits, observed in history:

```text
feat: add WebSocket bridge for real-time backend replies
fix: send button/list replies as interactive type instead of text
refactor: inline and rename chat config initializer
docs: rename project to wa-sandbox and add README
chore: remove assets/message.jpg
build: isolate backend dependencies in server/package.json
```

Format: `<type>: <imperative, lowercase description>`.

**PR Checklist (before creating a PR):**

- [ ] `npm run build` passes (runs `tsc && vite build`).
- [ ] `npm run dev` starts without TypeScript or runtime errors.
- [ ] New environment variables are added to `.env.example` with comments.
- [ ] No secrets, tokens, or private keys are hardcoded.
- [ ] No stray `console.log` debug statements remain (keep intentional logs only).
- [ ] If adding or changing message types, update `docs/api-specification.md`.
- [ ] If adding/changing Tailwind theme values, verify against `tailwind.config.js`.
- [ ] If adding bridge endpoints, update `README.md` curl examples and `docker-compose.yml` if needed.

## 8. Explicit Constraints (The Bouncer)

- **NEVER** hardcode secrets (tokens, app secrets, passwords). Read from `import.meta.env.VITE_*` or `process.env.*` and provide fallbacks only for local dev defaults.
- **NEVER** commit or push code automatically; always ask the user first.
- **NEVER** mutate `localStorage` directly; use the `useLocalStorage` hook.
- **NEVER** mutate arrays/objects in state; always return new references.
- **ALWAYS** handle `null`/`undefined` edge cases (optional chaining, empty-string fallbacks, `Array.isArray` checks).
- **ALWAYS** preserve Meta Graph API payload shape when sending webhook payloads; the simulator's value is fidelity.
- **ALWAYS** route incoming WebSocket messages by destination phone number if a `to`/`recipient` field is present.
- **ALWAYS** import server modules with explicit `.js` extensions (ES modules in Node).
- **ALWAYS** use the `cn()` helper instead of string concatenation for conditional Tailwind classes.
- **ALWAYS** update `docs/api-specification.md` when adding new message types or changing the bridge API contract.

## 9. Context Triggers

Read these files before making changes to their respective domains:

- **Styling / theme:** `tailwind.config.js`, `src/index.css`, `src/utils/cn.ts`
- **Routing & build:** `vite.config.ts`, `tsconfig.json`, `index.html`
- **State / persistence:** `src/hooks/useChatStore.ts`, `src/hooks/useLocalStorage.ts`, `src/constants/config.ts`
- **Outgoing API contract:** `src/hooks/useWebhook.ts`, `src/types/messages.ts`, `docs/api-specification.md`
- **Incoming API contract:** `server/index.js`, `server/normalize-message.js`, `docs/api-specification.md`
- **Environment / secrets:** `.env.example`, `src/vite-env.d.ts`
- **Deployment:** `Dockerfile`, `docker-compose.yml`, `nginx.conf.template`, `server/Dockerfile`
- **Docs:** `README.md`, `docs/api-specification.md`
