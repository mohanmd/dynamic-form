const FIELD_TYPES = Object.freeze({
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
  PHONE: 'phone',
  TEXTAREA: 'textarea',
  DATE: 'date',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
});

const FIELD_TYPE_VALUES = Object.values(FIELD_TYPES);

// these need options
const OPTION_FIELD_TYPES = [FIELD_TYPES.SELECT, FIELD_TYPES.RADIO, FIELD_TYPES.CHECKBOX];

const FORM_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
});

module.exports = { FIELD_TYPES, FIELD_TYPE_VALUES, OPTION_FIELD_TYPES, FORM_STATUS };
