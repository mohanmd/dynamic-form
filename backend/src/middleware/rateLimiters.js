const rateLimit = require('express-rate-limit');

const message = { success: false, message: 'Too many requests, please try again later.' };

// login brute force
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message });

// public submit endpoint
const submissionLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, message });

module.exports = { loginLimiter, submissionLimiter };
