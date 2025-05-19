/**
 * @fileoverview Database configuration for CitizenES Backend
 * @description Handles MongoDB connection setup and error handling
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Connects to MongoDB database
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If connection fails
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen-es'
    );
    logger.info(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
