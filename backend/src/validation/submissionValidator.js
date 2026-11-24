const { getValidator, isEmptyValue } = require('./fieldValidators');

// only reads keys defined in the form, anything else (like $where) is dropped
function validateSubmission(form, payload) {
  const errors = {};
  const data = {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { isValid: false, errors: { _form: 'Submission data must be an object' }, data };
  }

  for (const field of form.fields) {
    const raw = Object.prototype.hasOwnProperty.call(payload, field.key) ? payload[field.key] : undefined;

    if (isEmptyValue(raw)) {
      if (field.required) errors[field.key] = `${field.label} is required`;
      continue;
    }

    const validator = getValidator(field.type);
    if (!validator) {
      errors[field.key] = `Unsupported field type "${field.type}"`;
      continue;
    }

    const result = validator(raw, field);
    if (result.error) errors[field.key] = result.error;
    else data[field.key] = result.value;
  }

  return { isValid: Object.keys(errors).length === 0, errors, data };
}

module.exports = { validateSubmission };
