import { describe, it, expect } from 'vitest';
import { validateMessages, metaError } from '../../server/validate-message.js';
import {
  BUTTON_LIMITS,
  LIST_LIMITS,
  META_ERROR_CODE,
  META_ERROR_SUBCODE,
} from '../../server/constants.js';

// validateMessages takes an already-wrapped array and returns a violation
// detail string, or null when every message is valid.
const check = (message) => validateMessages([message]);

const button = (buttons) => ({
  type: 'interactive',
  interactive: {
    type: 'button',
    body: { text: 'Proceed?' },
    action: { buttons },
  },
});

const replyButton = (id = 'yes', title = 'Yes') => ({
  type: 'reply',
  reply: { id, title },
});

const list = (action, header) => ({
  type: 'interactive',
  interactive: {
    type: 'list',
    ...(header ? { header } : {}),
    body: { text: 'Choose an option' },
    action,
  },
});

const listAction = (rows = [{ id: 'r1', title: 'Row 1' }]) => ({
  button: 'Open menu',
  sections: [{ title: 'Section A', rows }],
});

describe('batch handling', () => {
  it('rejects a non-array body', () => {
    expect(validateMessages({ type: 'text', text: { body: 'hi' } })).toBeTruthy();
  });

  it('rejects an empty batch', () => {
    expect(validateMessages([])).toBeTruthy();
  });

  it('accepts a batch where every message is valid', () => {
    expect(
      validateMessages([
        { type: 'text', text: { body: 'hi' } },
        { type: 'image', image: { link: 'https://example.com/a.png' } },
      ]),
    ).toBeNull();
  });

  // Atomicity: one bad message must fail the whole request so the caller
  // broadcasts nothing.
  it('fails the whole batch on a later violation', () => {
    expect(
      validateMessages([
        { type: 'text', text: { body: 'hi' } },
        { type: 'image', image: {} },
      ]),
    ).toBeTruthy();
  });

  it('returns the detail of the first violation', () => {
    const detail = validateMessages([
      { type: 'sticker' },
      { type: 'image', image: {} },
    ]);
    expect(detail).toMatch(/Message type must be one of/);
  });
});

describe('unknown and malformed shells', () => {
  it.each([
    ['empty object', {}],
    ['null', null],
    ['array', []],
    ['string', 'text'],
    ['missing type', { text: { body: 'hi' } }],
    ['non-string type', { type: 7 }],
    ['unknown type', { type: 'sticker', sticker: { id: '1' } }],
    ['webhook-ish type', { type: 'reaction', reaction: { emoji: '👍' } }],
  ])('rejects %s', (_label, message) => {
    expect(check(message)).toBeTruthy();
  });
});

describe('text', () => {
  it('accepts a non-empty body', () => {
    expect(check({ type: 'text', text: { body: 'hello' } })).toBeNull();
  });

  it.each([
    ['missing text object', { type: 'text' }],
    ['text not an object', { type: 'text', text: 'hello' }],
    ['missing body', { type: 'text', text: {} }],
    ['empty body', { type: 'text', text: { body: '' } }],
    ['whitespace-only body', { type: 'text', text: { body: '   ' } }],
    ['non-string body', { type: 'text', text: { body: 42 } }],
  ])('rejects %s', (_label, message) => {
    expect(check(message)).toBeTruthy();
  });
});

// P0-1: validate must reject anything normalizeMessage would silently
// drop via `.filter(btn => btn.type === 'reply')`. A 200 with zero
// buttons in the UI is the bug these tests exist to prevent.
describe('interactive button (P0-1 contract with normalize)', () => {
  it('accepts a well-formed button payload', () => {
    expect(check(button([replyButton('yes', 'Yes'), replyButton('no', 'No')]))).toBeNull();
  });

  it('rejects a button missing type: "reply"', () => {
    expect(check(button([{ reply: { id: 'yes', title: 'Yes' } }]))).toMatch(
      /type "reply"/,
    );
  });

  it('rejects a button with a non-reply type', () => {
    expect(check(button([{ type: 'cta_url', reply: { id: 'y', title: 'Y' } }]))).toBeTruthy();
  });

  it.each([
    ['missing reply object', [{ type: 'reply' }]],
    ['reply not an object', [{ type: 'reply', reply: 'yes' }]],
    ['button not an object', ['yes']],
    ['null button', [null]],
    ['missing id', [{ type: 'reply', reply: { title: 'Yes' } }]],
    ['empty id', [{ type: 'reply', reply: { id: '', title: 'Yes' } }]],
    ['whitespace id', [{ type: 'reply', reply: { id: '  ', title: 'Yes' } }]],
    ['missing title', [{ type: 'reply', reply: { id: 'yes' } }]],
    ['empty title', [{ type: 'reply', reply: { id: 'yes', title: '' } }]],
    ['whitespace title', [{ type: 'reply', reply: { id: 'yes', title: ' ' } }]],
    ['numeric id', [{ type: 'reply', reply: { id: 1, title: 'Yes' } }]],
  ])('rejects %s', (_label, buttons) => {
    expect(check(button(buttons))).toBeTruthy();
  });

  it.each([
    ['missing action', { type: 'interactive', interactive: { type: 'button', body: { text: 'x' } } }],
    ['missing interactive object', { type: 'interactive' }],
    ['interactive not an object', { type: 'interactive', interactive: 'button' }],
  ])('rejects %s', (_label, message) => {
    expect(check(message)).toBeTruthy();
  });

  it('rejects an empty buttons array', () => {
    expect(check(button([]))).toBeTruthy();
  });

  it('rejects buttons that is not an array', () => {
    expect(check(button({ 0: replyButton() }))).toBeTruthy();
  });

  it(`rejects more than ${BUTTON_LIMITS.maxButtons} buttons`, () => {
    const tooMany = Array.from({ length: BUTTON_LIMITS.maxButtons + 1 }, (_, i) =>
      replyButton(`id${i}`, `T${i}`),
    );
    expect(check(button(tooMany))).toBeTruthy();
  });

  it('accepts a title exactly at the limit and rejects one over', () => {
    const atLimit = 'x'.repeat(BUTTON_LIMITS.titleMax);
    expect(check(button([replyButton('yes', atLimit)]))).toBeNull();
    expect(check(button([replyButton('yes', atLimit + 'x')]))).toBeTruthy();
  });

  it('accepts an id exactly at the limit and rejects one over', () => {
    const atLimit = 'x'.repeat(BUTTON_LIMITS.idMax);
    expect(check(button([replyButton(atLimit, 'Yes')]))).toBeNull();
    expect(check(button([replyButton(atLimit + 'x', 'Yes')]))).toBeTruthy();
  });
});

describe('interactive list', () => {
  it('accepts a well-formed list', () => {
    expect(check(list(listAction()))).toBeNull();
  });

  it('accepts a list with a text header', () => {
    expect(check(list(listAction(), { type: 'text', text: 'MENU HEADER' }))).toBeNull();
  });

  it.each([
    ['missing sections', { button: 'Open menu' }],
    ['empty sections', { button: 'Open menu', sections: [] }],
    ['sections not an array', { button: 'Open menu', sections: {} }],
    ['missing action.button', { sections: [{ title: 'A', rows: [{ id: 'r1', title: 'R' }] }] }],
    ['empty action.button', { button: '', sections: [{ title: 'A', rows: [{ id: 'r1', title: 'R' }] }] }],
    ['whitespace action.button', { button: ' ', sections: [{ title: 'A', rows: [{ id: 'r1', title: 'R' }] }] }],
    ['section with no rows', { button: 'Open', sections: [{ title: 'A' }] }],
    ['section with empty rows', { button: 'Open', sections: [{ title: 'A', rows: [] }] }],
    ['null section', { button: 'Open', sections: [null] }],
  ])('rejects %s', (_label, action) => {
    expect(check(list(action))).toBeTruthy();
  });

  it.each([
    ['row not an object', ['r1']],
    ['missing row id', [{ title: 'Row 1' }]],
    ['empty row id', [{ id: '', title: 'Row 1' }]],
    ['missing row title', [{ id: 'r1' }]],
    ['empty row title', [{ id: 'r1', title: '' }]],
    ['whitespace row title', [{ id: 'r1', title: '  ' }]],
  ])('rejects %s', (_label, rows) => {
    expect(check(list(listAction(rows)))).toBeTruthy();
  });

  it('rejects a row title over the limit', () => {
    const over = 'x'.repeat(LIST_LIMITS.rowTitleMax + 1);
    expect(check(list(listAction([{ id: 'r1', title: over }])))).toBeTruthy();
  });

  it('rejects a row description over the limit', () => {
    const over = 'x'.repeat(LIST_LIMITS.rowDescriptionMax + 1);
    expect(
      check(list(listAction([{ id: 'r1', title: 'Row 1', description: over }]))),
    ).toBeTruthy();
  });

  it('accepts a row description exactly at the limit', () => {
    const atLimit = 'x'.repeat(LIST_LIMITS.rowDescriptionMax);
    expect(
      check(list(listAction([{ id: 'r1', title: 'Row 1', description: atLimit }]))),
    ).toBeNull();
  });

  it(`rejects more than ${LIST_LIMITS.maxSections} sections`, () => {
    const sections = Array.from({ length: LIST_LIMITS.maxSections + 1 }, (_, i) => ({
      title: `S${i}`,
      rows: [{ id: `r${i}`, title: `Row ${i}` }],
    }));
    expect(check(list({ button: 'Open menu', sections }))).toBeTruthy();
  });

  it(`rejects more than ${LIST_LIMITS.maxRowsTotal} rows across all sections`, () => {
    const rows = Array.from({ length: LIST_LIMITS.maxRowsTotal + 1 }, (_, i) => ({
      id: `r${i}`,
      title: `Row ${i}`,
    }));
    expect(check(list(listAction(rows)))).toBeTruthy();
  });

  it(`accepts exactly ${LIST_LIMITS.maxRowsTotal} rows split across sections`, () => {
    const sections = Array.from({ length: 2 }, (_, s) => ({
      title: `S${s}`,
      rows: Array.from({ length: LIST_LIMITS.maxRowsTotal / 2 }, (_, i) => ({
        id: `s${s}r${i}`,
        title: `Row ${i}`,
      })),
    }));
    expect(check(list({ button: 'Open menu', sections }))).toBeNull();
  });
});

describe('interactive subtype gate', () => {
  it.each([['cta_url'], ['product'], ['flow'], ['']])(
    'rejects interactive.type "%s"',
    (type) => {
      expect(
        check({ type: 'interactive', interactive: { type, body: { text: 'x' } } }),
      ).toMatch(/"button" or "list"/);
    },
  );

  it('rejects a missing interactive.type', () => {
    expect(check({ type: 'interactive', interactive: { body: { text: 'x' } } })).toBeTruthy();
  });
});

// Send-format contract: exactly one of `link` or `id`. Webhook-style
// `{ url }` is rejected by design (P1-3).
describe('media', () => {
  it.each([['image'], ['video'], ['audio'], ['document']])(
    'accepts %s with a link',
    (type) => {
      expect(check({ type, [type]: { link: 'https://example.com/a.bin' } })).toBeNull();
    },
  );

  it.each([['image'], ['video'], ['audio'], ['document']])(
    'accepts %s with an id',
    (type) => {
      expect(check({ type, [type]: { id: 'media-123' } })).toBeNull();
    },
  );

  it.each([
    ['missing nested object', { type: 'image' }],
    ['nested value not an object', { type: 'image', image: 'https://example.com/a.png' }],
    ['empty nested object', { type: 'image', image: {} }],
    ['both link and id', { type: 'image', image: { link: 'https://e/a.png', id: '1' } }],
    ['empty link', { type: 'image', image: { link: '' } }],
    ['whitespace link', { type: 'image', image: { link: '  ' } }],
    ['empty id', { type: 'image', image: { id: '' } }],
    ['numeric id', { type: 'image', image: { id: 12345 } }],
    ['webhook-style url', { type: 'image', image: { url: 'https://e/a.png' } }],
    ['nested key mismatched with type', { type: 'image', video: { link: 'https://e/a.mp4' } }],
  ])('rejects %s', (_label, message) => {
    expect(check(message)).toBeTruthy();
  });
});

describe('metaError', () => {
  it('wraps the detail in a Cloud API-shaped envelope', () => {
    const error = metaError('Button title is required').error;
    expect(error).toMatchObject({
      message: '(#100) Button title is required',
      type: 'OAuthException',
      code: META_ERROR_CODE,
      error_subcode: META_ERROR_SUBCODE,
      error_data: {
        messaging_product: 'whatsapp',
        details: 'Button title is required',
      },
    });
    expect(error.fbtrace_id).toMatch(/^A\w+$/);
  });

  it('generates a distinct fbtrace_id per call', () => {
    const ids = new Set(
      Array.from({ length: 20 }, () => metaError('x').error.fbtrace_id),
    );
    expect(ids.size).toBeGreaterThan(1);
  });
});
