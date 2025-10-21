const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only-change-in-production';

function sign(payload, opts = {}) {
  return jwt.sign(payload, SECRET, Object.assign({ expiresIn: '30d' }, opts)); // Extended to 30 days
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { sign, verify };
