/**
 * @fileoverview Logger configuration for CitizenES Backend
 * @description Sets up Winston logger with console and file transports
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

/**
 * Custom log format function
 * @param {Object} param0 - Log entry object
 * @param {string} param0.level - Log level
 * @param {string} param0.message - Log message
 * @param {string} param0.timestamp - Log timestamp
 * @returns {string} Formatted log message
 */
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

/**
 * Winston logger instance
 * @type {winston.Logger}
 * @description
 * - Uses 'info' level in production, 'debug' in development
 * - Includes timestamp and colorized output
 * - Writes to console and files:
 *   - error.log: Error level logs only
 *   - combined.log: All logs
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    colorize(),
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
}); 