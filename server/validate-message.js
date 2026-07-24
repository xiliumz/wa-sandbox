import {
  BUTTON_LIMITS,
  LIST_LIMITS,
  MEDIA_TYPES,
  META_ERROR_CODE,
  META_ERROR_SUBCODE,
} from './constants.js';

const KNOWN_TYPES = new Set(['text', 'interactive', ...MEDIA_TYPES]);

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMissingOrBlankString(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function tooLong(value, max) {
  return typeof value === 'string' && value.length > max;
}

function validateButton(interactive) {
  const buttons = interactive.action?.buttons;
  if (!Array.isArray(buttons) || buttons.length === 0) {
    return 'interactive.action.buttons is required and must be a non-empty array';
  }
  if (buttons.length > BUTTON_LIMITS.maxButtons) {
    return `interactive.action.buttons supports at most ${BUTTON_LIMITS.maxButtons} buttons`;
  }
  for (const btn of buttons) {
    if (!isPlainObject(btn)) {
      return 'Each button must be a JSON object';
    }
    if (btn.type !== 'reply') {
      return 'Each button must have type "reply"';
    }
    if (!isPlainObject(btn.reply)) {
      return 'Each button requires a reply object with id and title';
    }
    const { id, title } = btn.reply;
    if (isMissingOrBlankString(id)) {
      return 'Button id is required and must be a non-empty string';
    }
    if (isMissingOrBlankString(title)) {
      return 'Button title is required and must be a non-empty string';
    }
    if (tooLong(title, BUTTON_LIMITS.titleMax)) {
      return `Button title must be ${BUTTON_LIMITS.titleMax} characters or fewer`;
    }
    if (tooLong(id, BUTTON_LIMITS.idMax)) {
      return `Button id must be ${BUTTON_LIMITS.idMax} characters or fewer`;
    }
  }
  return null;
}

function validateList(interactive) {
  const action = interactive.action || {};
  const sections = action.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    return 'interactive.action.sections is required and must be a non-empty array';
  }
  if (sections.length > LIST_LIMITS.maxSections) {
    return `interactive.action.sections supports at most ${LIST_LIMITS.maxSections} sections`;
  }
  if (isMissingOrBlankString(action.button)) {
    return 'interactive.action.button is required and must be a non-empty string';
  }
  if (tooLong(action.button, LIST_LIMITS.buttonLabelMax)) {
    return `interactive.action.button label must be ${LIST_LIMITS.buttonLabelMax} characters or fewer`;
  }

  let totalRows = 0;
  for (const section of sections) {
    const rows = section?.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return 'Each list section must have a non-empty rows array';
    }
    totalRows += rows.length;
    for (const row of rows) {
      if (!isPlainObject(row)) {
        return 'Each list row must be a JSON object';
      }
      if (isMissingOrBlankString(row.id)) {
        return 'Row id is required and must be a non-empty string';
      }
      if (isMissingOrBlankString(row.title)) {
        return 'Row title is required and must be a non-empty string';
      }
      if (tooLong(row.title, LIST_LIMITS.rowTitleMax)) {
        return `Row title must be ${LIST_LIMITS.rowTitleMax} characters or fewer`;
      }
      if (tooLong(row.description, LIST_LIMITS.rowDescriptionMax)) {
        return `Row description must be ${LIST_LIMITS.rowDescriptionMax} characters or fewer`;
      }
      if (tooLong(row.id, LIST_LIMITS.rowIdMax)) {
        return `Row id must be ${LIST_LIMITS.rowIdMax} characters or fewer`;
      }
    }
  }
  if (totalRows > LIST_LIMITS.maxRowsTotal) {
    return `A list supports at most ${LIST_LIMITS.maxRowsTotal} rows across all sections`;
  }
  return null;
}

function validateMedia(raw) {
  const media = raw[raw.type];
  if (!isPlainObject(media)) {
    return `A message of type "${raw.type}" requires a nested "${raw.type}" object`;
  }
  const hasLink = !isMissingOrBlankString(media.link);
  const hasId = !isMissingOrBlankString(media.id);
  if (hasLink === hasId) {
    return `The "${raw.type}" object must have exactly one of "link" or "id"`;
  }
  return null;
}

function validateText(raw) {
  if (!isPlainObject(raw.text) || isMissingOrBlankString(raw.text.body)) {
    return 'text.body is required and must be a non-empty string';
  }
  return null;
}

/**
 * Validates a single raw message. Returns a violation detail string, or null if valid.
 * Known types only: text, interactive (button|list), and media (image|video|audio|document).
 *
 * @param {unknown} raw
 * @returns {string | null}
 */
function validateOne(raw) {
  if (!isPlainObject(raw)) {
    return 'Each message must be a JSON object';
  }
  if (typeof raw.type !== 'string' || !KNOWN_TYPES.has(raw.type)) {
    return 'Message type must be one of: text, interactive, image, video, audio, document';
  }
  if (raw.type === 'text') {
    return validateText(raw);
  }
  if (raw.type === 'interactive') {
    if (!isPlainObject(raw.interactive)) {
      return 'interactive object is required for interactive messages';
    }
    if (raw.interactive.type === 'button') {
      return validateButton(raw.interactive);
    }
    if (raw.interactive.type === 'list') {
      return validateList(raw.interactive);
    }
    return 'interactive.type must be "button" or "list"';
  }
  if (MEDIA_TYPES.includes(raw.type)) {
    return validateMedia(raw);
  }
  return null;
}

/**
 * Validates a batch of raw Meta-format messages. Pure and deterministic.
 * Validation is atomic: returns the detail of the FIRST violation so the caller can
 * reject the whole request and broadcast nothing. Returns null when every message is valid.
 *
 * @param {unknown[]} messages - Already wrapped into an array by the caller.
 * @returns {string | null}
 */
export function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'Request body must contain at least one message object';
  }
  for (const raw of messages) {
    const detail = validateOne(raw);
    if (detail) {
      return detail;
    }
  }
  return null;
}

function generateTraceId() {
  return 'A' + Math.random().toString(36).slice(2, 13);
}

/**
 * Builds a WhatsApp Cloud API-style error response body for a rejected request.
 *
 * @param {string} detail - Human-readable violation detail from validateMessages.
 * @returns {object}
 */
export function metaError(detail) {
  return {
    error: {
      message: `(#100) ${detail}`,
      type: 'OAuthException',
      code: META_ERROR_CODE,
      error_data: {
        messaging_product: 'whatsapp',
        details: detail,
      },
      error_subcode: META_ERROR_SUBCODE,
      fbtrace_id: generateTraceId(),
    },
  };
}
