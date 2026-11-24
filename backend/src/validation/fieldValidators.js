const { FIELD_TYPES } = require('../constants/fieldTypes');

// one validator per field type, returns { value } or { error }.
// required is checked in submissionValidator so these only get non-empty values.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// optional +, then digits / spaces / dashes / brackets
const PHONE_CHARS_RE = /^\+?[0-9\s\-()]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// remove control chars (keep tab and newlines)
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

// max lengths when the admin didn't set any
const DEFAULT_MAX_LENGTH = {
  [FIELD_TYPES.TEXT]: 500,
  [FIELD_TYPES.EMAIL]: 254,
  [FIELD_TYPES.PHONE]: 25,
  [FIELD_TYPES.TEXTAREA]: 5000,
};

const isEmptyValue = (v) =>
  v === undefined ||
  v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

function sanitizeString(value) {
  return value.replace(CONTROL_CHARS_RE, '').trim();
}

function validateString(value, field) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return { error: `${field.label} must be text` };
  }
  const str = sanitizeString(String(value));
  const rules = field.validation || {};
  const maxLength = rules.maxLength ?? DEFAULT_MAX_LENGTH[field.type] ?? 500;

  if (rules.minLength != null && str.length < rules.minLength) {
    return { error: `${field.label} must be at least ${rules.minLength} characters` };
  }
  if (str.length > maxLength) {
    return { error: `${field.label} must be at most ${maxLength} characters` };
  }
  return { value: str };
}

function validateSingleOption(value, field) {
  if (typeof value !== 'string') return { error: `${field.label} must be a single option` };
  const v = value.trim();
  if (!field.options.includes(v)) {
    return { error: `${field.label} must be one of: ${field.options.join(', ')}` };
  }
  return { value: v };
}

const validators = {
  [FIELD_TYPES.TEXT]: validateString,
  [FIELD_TYPES.TEXTAREA]: validateString,

  [FIELD_TYPES.EMAIL]: (value, field) => {
    const res = validateString(value, field);
    if (res.error) return res;
    if (!EMAIL_RE.test(res.value)) return { error: `${field.label} must be a valid email address` };
    return { value: res.value.toLowerCase() };
  },

  [FIELD_TYPES.PHONE]: (value, field) => {
    const res = validateString(value, field);
    if (res.error) return res;
    const digits = res.value.replace(/\D/g, '');
    if (!PHONE_CHARS_RE.test(res.value) || digits.length < 7 || digits.length > 15) {
      return { error: `${field.label} must be a valid phone number (7-15 digits)` };
    }
    return { value: res.value };
  },

  [FIELD_TYPES.NUMBER]: (value, field) => {
    // allow 42 and "42"
    const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : NaN;
    if (!Number.isFinite(num)) return { error: `${field.label} must be a valid number` };
    const { min, max } = field.validation || {};
    if (min != null && num < min) return { error: `${field.label} must be at least ${min}` };
    if (max != null && num > max) return { error: `${field.label} must be at most ${max}` };
    return { value: num };
  },

  [FIELD_TYPES.DATE]: (value, field) => {
    if (typeof value !== 'string' || !ISO_DATE_RE.test(value.trim())) {
      return { error: `${field.label} must be a date in YYYY-MM-DD format` };
    }
    const v = value.trim();
    const d = new Date(`${v}T00:00:00Z`);
    // catches dates like 2024-02-31
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) {
      return { error: `${field.label} must be a valid date` };
    }
    return { value: v };
  },

  [FIELD_TYPES.SELECT]: validateSingleOption,
  [FIELD_TYPES.RADIO]: validateSingleOption,

  [FIELD_TYPES.CHECKBOX]: (value, field) => {
    if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
      return { error: `${field.label} must be a list of options` };
    }
    const unique = [...new Set(value.map((v) => v.trim()))];
    const invalid = unique.filter((v) => !field.options.includes(v));
    if (invalid.length) {
      return { error: `${field.label} contains invalid option(s): ${invalid.join(', ')}` };
    }
    const { min, max } = field.validation || {};
    if (min != null && unique.length < min) return { error: `Select at least ${min} option(s) for ${field.label}` };
    if (max != null && unique.length > max) return { error: `Select at most ${max} option(s) for ${field.label}` };
    return { value: unique };
  },
};

function getValidator(type) {
  return validators[type];
}

module.exports = { getValidator, isEmptyValue, validators };
