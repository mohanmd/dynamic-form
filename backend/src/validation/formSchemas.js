const Joi = require('joi');
const { FIELD_TYPE_VALUES, OPTION_FIELD_TYPES } = require('../constants/fieldTypes');

const MAX_FIELDS = 100;

const fieldSchema = Joi.object({
  // fields coming back from GET still have their _id
  _id: Joi.string().hex().length(24),
  key: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/)
    .required()
    .messages({
      'string.pattern.base': 'Field key must start with a letter and contain only letters, numbers or underscores',
    }),
  label: Joi.string().trim().min(1).max(120).required(),
  type: Joi.string()
    .valid(...FIELD_TYPE_VALUES)
    .required(),
  placeholder: Joi.string().trim().max(200).allow('').default(''),
  defaultValue: Joi.alternatives()
    .try(Joi.string().max(5000).allow(''), Joi.number(), Joi.array().items(Joi.string().max(100)))
    .allow(null)
    .default(null),
  required: Joi.boolean().default(false),
  options: Joi.when('type', {
    is: Joi.valid(...OPTION_FIELD_TYPES),
    then: Joi.array().items(Joi.string().trim().min(1).max(100)).min(1).max(100).unique().required().messages({
      'any.required': 'Options are required for select, radio and checkbox fields',
      'array.min': 'At least one option is required',
      'array.unique': 'Options must be unique',
    }),
    otherwise: Joi.any().strip(),
  }),
  validation: Joi.object({
    minLength: Joi.number().integer().min(0),
    maxLength: Joi.number().integer().min(1),
    min: Joi.number(),
    max: Joi.number(),
  }).default({}),
}).unknown(false);

const formBodySchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  fields: Joi.array().items(fieldSchema).max(MAX_FIELDS).default([]),
}).unknown(false);

// no defaults here, otherwise a name-only update wipes the fields
const formUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150),
  fields: Joi.array().items(fieldSchema).max(MAX_FIELDS),
})
  .unknown(false)
  .min(1);

// field keys must be unique inside a form
function validateFieldsSemantics(fields) {
  const errors = {};
  const seen = new Set();
  fields.forEach((field, i) => {
    if (seen.has(field.key)) errors[`fields[${i}].key`] = `Duplicate field key "${field.key}"`;
    seen.add(field.key);
  });
  return errors;
}

module.exports = { formBodySchema, formUpdateSchema, validateFieldsSemantics };
