"use strict";
/**
 * @fileoverview Logger configuration for CitizenES Backend
 * @description Sets up Winston logger with console and file transports
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize } = winston_1.default.format;
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
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(colorize(), timestamp(), logFormat),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ],
});
