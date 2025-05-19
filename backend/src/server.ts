/**
 * @fileoverview Server entry point for CitizenES Backend
 * @description Initializes the Express server and loads environment variables
 */

import { config } from 'dotenv';
import { app } from './app';
import { logger } from './utils/logger';

// Load environment variables
config();

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
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
}); 