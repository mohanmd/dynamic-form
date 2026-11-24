const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let error = err;
  if (err.name === 'CastError') error = ApiError.badRequest(`Invalid ${err.path}`);
  if (err.type === 'entity.parse.failed') error = ApiError.badRequest('Malformed JSON body');
  if (err.type === 'entity.too.large') error = new ApiError(413, 'Request body too large');

  const status = error.statusCode || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    // don't leak internal errors
    message: status >= 500 ? 'Internal server error' : error.message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
}

module.exports = { notFound, errorHandler };
