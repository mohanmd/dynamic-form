// client validation is just for UX, the backend validates again
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^\+?[0-9\s\-()]+$/;

export const isEmpty = (v) =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

export function validateField(field, value) {
  const label = field.label;
  const rules = field.validation || {};

  if (isEmpty(value)) return field.required ? `${label} is required` : null;

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'phone': {
      const str = String(value).trim();
      if (rules.minLength != null && str.length < rules.minLength) return `${label} must be at least ${rules.minLength} characters`;
      if (rules.maxLength != null && str.length > rules.maxLength) return `${label} must be at most ${rules.maxLength} characters`;
      if (field.type === 'email' && !EMAIL_RE.test(str)) return `${label} must be a valid email address`;
      if (field.type === 'phone') {
        const digits = str.replace(/\D/g, '');
        if (!PHONE_CHARS_RE.test(str) || digits.length < 7 || digits.length > 15) return `${label} must be a valid phone number (7-15 digits)`;
      }
      return null;
    }
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) return `${label} must be a valid number`;
      if (rules.min != null && n < rules.min) return `${label} must be at least ${rules.min}`;
      if (rules.max != null && n > rules.max) return `${label} must be at most ${rules.max}`;
      return null;
    }
    case 'select':
    case 'radio':
      return field.options.includes(value) ? null : `${label} must be one of the options`;
    case 'checkbox':
      if (rules.min != null && value.length < rules.min) return `Select at least ${rules.min} option(s)`;
      if (rules.max != null && value.length > rules.max) return `Select at most ${rules.max} option(s)`;
      return null;
    default:
      return null;
  }
}

export function validateAll(fields, values) {
  const errors = {};
  for (const f of fields) {
    const err = validateField(f, values[f.key]);
    if (err) errors[f.key] = err;
  }
  return errors;
}

// start values come from each field's default value
export function initialValues(fields) {
  const values = {};
  for (const f of fields) {
    if (f.type === 'checkbox') values[f.key] = Array.isArray(f.defaultValue) ? f.defaultValue : [];
    else values[f.key] = f.defaultValue ?? '';
  }
  return values;
}
