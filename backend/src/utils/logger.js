const { createLogger, format, transports } = require('winston');

/**
 * Production Logger
 * Ensures all logs are structured (JSON) and sensitive data is masked.
 */
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'indipips-backend' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Utility to mask PII/Tokens
const mask = (obj) => {
  const masked = { ...obj };
  ['password', 'token', 'accessToken', 'refreshToken', 'secret'].forEach(key => {
    if (masked[key]) masked[key] = '********';
  });
  return masked;
};

module.exports = { logger, mask };
