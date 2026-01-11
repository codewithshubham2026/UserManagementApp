const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Keep token creation in one place to avoid mistakes with expiry/secret.
function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '2h' });
}

module.exports = generateToken;
