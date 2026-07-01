# TODO

- [ ] Add bridge-side validation for interactive messages and return `400 Bad Request` when backend sends incorrect button/list payloads:
  - Reply buttons: max 3 buttons
  - Interactive lists: max 10 sections and max 10 rows total across all sections
