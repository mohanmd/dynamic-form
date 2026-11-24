const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

function readToken(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function verify(token) {
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  return { id: payload.sub, role: payload.role };
}

function authenticate(req, _res, next) {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    req.user = verify(token);
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

// sets req.user if there's a valid token, otherwise just continue
function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = verify(token);
    } catch {
      // bad token, treat as guest
    }
  }
  next();
}

const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  });
}

module.exports = { authenticate, optionalAuth, authorize, signToken };
