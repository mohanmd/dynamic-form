// length = supports minLength/maxLength, range = supports min/max
export const FIELD_TYPES = {
  text: { label: 'Text', hasOptions: false, length: true, range: false },
  email: { label: 'Email', hasOptions: false, length: true, range: false },
  number: { label: 'Number', hasOptions: false, length: false, range: true },
  phone: { label: 'Phone', hasOptions: false, length: true, range: false },
  textarea: { label: 'Text Area', hasOptions: false, length: true, range: false },
  date: { label: 'Date', hasOptions: false, length: false, range: false },
  select: { label: 'Select', hasOptions: true, length: false, range: false },
  radio: { label: 'Radio', hasOptions: true, length: false, range: false },
  checkbox: { label: 'Checkbox', hasOptions: true, length: false, range: true },
};

export const FIELD_TYPE_KEYS = Object.keys(FIELD_TYPES);
