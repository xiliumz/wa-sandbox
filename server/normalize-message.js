import { MEDIA_TYPES } from "./constants.js";

/**
 * @typedef {object} MetaTextMessage
 * @property {'text'} type
 * @property {{body: string}} text
 *
 * @typedef {object} MetaInteractiveButton
 * @property {'interactive'} type
 * @property {{
 *   type: 'button',
 *   body: {text: string},
 *   header?: {type: string, text?: string, image?: {link: string}, video?: {link: string}, document?: {link: string}},
 *   footer?: {text: string},
 *   action: {buttons: Array<{type: string, reply: {id: string, title: string}}>}
 * }} interactive
 *
 * @typedef {object} MetaInteractiveList
 * @property {'interactive'} type
 * @property {{
 *   type: 'list',
 *   body: {text: string},
 *   header?: {type: string, text?: string},
 *   footer?: {text: string},
 *   action: {button: string, sections: Array<{title: string, rows: Array<{id: string, title: string, description?: string}}>}
 * }} interactive
 *
 * @typedef {MetaTextMessage | MetaInteractiveButton | MetaInteractiveList | object} MetaMessage
 */

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Maps a Meta interactive header into the simulator header shape.
 * Text headers are already `{ type, text }`. Media headers nest bytes under
 * `image|video|document.link` (or may already carry `mediaUrl`); the UI wants flat `mediaUrl`.
 *
 * @param {object | undefined} header
 * @param {{ allowMedia?: boolean }} [options] - Lists only support text headers in Meta/UI.
 * @returns {{ type: string, text?: string, mediaUrl?: string } | undefined}
 */
function normalizeInteractiveHeader(header, { allowMedia = false } = {}) {
  if (!header || typeof header !== "object") return undefined;

  const type = header.type || "text";

  // List headers (and plain text button headers): keep the `{ type, text }` shape.
  if (!allowMedia || type === "text") {
    return header.text ? { type: "text", text: header.text } : undefined;
  }

  // Button media header: Meta nests `{ image: { link } }`; accept flat mediaUrl too.
  return {
    type,
    text: header.text,
    mediaUrl: header.mediaUrl || header[type]?.link || undefined,
  };
}

/**
 * Transforms Meta Graph API message format into the simulator's internal Message format.
 *
 * @param {MetaMessage} raw - A message payload from Meta's Graph API (or from your backend).
 * @returns {object} Normalized message compatible with the simulator's Message type.
 */
export function normalizeMessage(raw) {
  const base = {
    id: generateId(),
    timestamp: Date.now(),
  };

  if (raw.type === "text") {
    return {
      ...base,
      type: "text",
      content: raw.text?.body || "",
    };
  }

  if (raw.type === "interactive" && raw.interactive?.type === "button") {
    const buttons = (raw.interactive.action?.buttons || [])
      .filter((btn) => btn.type === "reply")
      .map((btn) => ({
        id: btn.reply?.id || generateId(),
        title: btn.reply?.title || "",
      }));

    return {
      ...base,
      type: "interactive_button",
      header: normalizeInteractiveHeader(raw.interactive.header, {
        allowMedia: true,
      }),
      body: { text: raw.interactive.body?.text || "" },
      // Meta footer is already { text }; pass through when present.
      footer: raw.interactive.footer || undefined,
      buttons,
    };
  }

  if (raw.type === "interactive" && raw.interactive?.type === "list") {
    const sections = (raw.interactive.action?.sections || []).map(
      (section) => ({
        title: section.title || "",
        rows: (section.rows || []).map((row) => ({
          id: row.id || generateId(),
          title: row.title || "",
          description: row.description || "",
        })),
      }),
    );

    return {
      ...base,
      type: "interactive_list",
      // Meta list headers are text-only.
      header: normalizeInteractiveHeader(raw.interactive.header),
      body: { text: raw.interactive.body?.text || "" },
      // Meta footer is already { text }; pass through when present.
      footer: raw.interactive.footer || undefined,
      buttonText: raw.interactive.action?.button || "Select",
      sections,
    };
  }

  if (MEDIA_TYPES.includes(raw.type)) {
    // Meta nests media under a key named after the type: { type: 'image', image: { link, caption } }.
    // The Cloud API send format accepts `link` (a public URL) or `id` (a handle to media previously uploaded to Meta).
    // The sandbox renders a `link` directly but has no Media API store to resolve an `id`,
    // so it passes the handle through for the UI to show a placeholder.
    const media = raw[raw.type] || {};
    return {
      ...base,
      type: raw.type,
      mediaUrl: media.link || "",
      mediaId: media.id || undefined,
      caption: media.caption || undefined,
      filename: media.filename || undefined,
      mimeType: media.mime_type || undefined,
      voice: raw.type === "audio" ? Boolean(media.voice) : undefined,
    };
  }

  // Fallback: pass through unknown shapes as-is with generated metadata
  return { ...base, ...raw };
}
