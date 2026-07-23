// Shared server domain constants.

// Media message types Meta nests under a key matching the type (e.g. { type: 'image', image: {...} }).
export const MEDIA_TYPES = ['image', 'video', 'audio', 'document'];

// Interactive-message limits mirror the WhatsApp Cloud API (see docs/api-specification.md).
export const BUTTON_LIMITS = {
  maxButtons: 3,
  titleMax: 20,
  idMax: 256,
};

export const LIST_LIMITS = {
  maxSections: 10,
  maxRowsTotal: 10,
  buttonLabelMax: 20,
  rowTitleMax: 24,
  rowDescriptionMax: 72,
  rowIdMax: 200,
};

// WhatsApp Cloud API error code/subcode returned when rejecting an invalid message payload.
export const META_ERROR_CODE = 100;
export const META_ERROR_SUBCODE = 2494010;
