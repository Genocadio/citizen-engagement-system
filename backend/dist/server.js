"use strict";
/**
 * @fileoverview Server entry point for CitizenES Backend
 * @description Initializes the Express server and loads environment variables
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
// Load environment variables
(0, dotenv_1.config)();
/**
 * Server port number
 * @type {number}
 * @default 4000
 */
const PORT = process.env.PORT || 4000;
/**
 * Start the Express server
 * @listens {number} PORT - The port number to listen on
 */
app_1.app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Server running on port ${PORT}`);
    logger_1.logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
});
