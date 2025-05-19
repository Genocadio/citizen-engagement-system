"use strict";
/**
 * @fileoverview Database configuration for CitizenES Backend
 * @description Handles MongoDB connection setup and error handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
/**
 * Connects to MongoDB database
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If connection fails
 */
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen-es');
        logger_1.logger.info(`📦 MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
