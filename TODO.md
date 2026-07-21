# TODO

- [ ] Add bridge-side validation for interactive messages and return `400 Bad Request` when backend sends incorrect button/list payloads. Validate in a pure `server/validate-message.js` module, called from `server/routes/messages.js` **before** normalize/broadcast. Match Meta's real limits and error behavior as closely as possible:
  - Reply buttons:
    - max 3 buttons
    - each button `title` ≤ 20 chars
    - each button `id` (reply id) ≤ 256 chars
  - Interactive lists:
    - max 10 sections
    - max 10 rows total across all sections
    - `action.button` label ≤ 20 chars
    - each row `title` ≤ 24 chars
    - each row `description` ≤ 72 chars
    - each row `id` ≤ 200 chars
    - reject interactive payloads missing required `buttons`/`sections`
  - Batch handling is atomic: if any message in the POST body fails, reject the whole request with `400` and broadcast nothing.
  - Mirror Meta's real error response shape rather than a bespoke one, e.g.:
    ```json
    { "error": { "message": "(#100) ...", "type": "OAuthException", "code": 100, "error_subcode": 2494010, "fbtrace_id": "..." } }
    ```
- [x] Support media messages (image, video, audio, document) sent from backend to simulator. `server/normalize-message.js` currently only normalizes text and interactive types; the frontend `MediaMessage` type in `src/types/messages.ts` is already ready.
