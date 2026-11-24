const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

function joiErrorsToMap(error) {
  const map = {};
  for (const d of error.details) {
    const path = d.path.join('.') || '_form';
    if (!map[path]) map[path] = d.message.replace(/"/g, '');
  }
  return map;
}

// replaces req[source] with the cleaned joi output
const validateBody = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: false });
  if (error) return next(ApiError.badRequest('Validation failed', joiErrorsToMap(error)));
  req.body = value;
  return next();
};

// 400 for bad ids instead of a CastError
const validateObjectId =
  (...params) =>
  (req, _res, next) => {
    for (const p of params) {
      if (!mongoose.Types.ObjectId.isValid(req.params[p]) || String(req.params[p]).length !== 24) {
        return next(ApiError.badRequest(`Invalid ${p}`));
      }
    }
    return next();
  };

module.exports = { validateBody, validateObjectId, joiErrorsToMap };
