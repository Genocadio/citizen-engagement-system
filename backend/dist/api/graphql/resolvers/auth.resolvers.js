"use strict";
/**
 * @fileoverview Authentication resolvers for GraphQL API
 * @description Handles user authentication, registration, and JWT token generation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResolvers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../../models/User");
const logger_1 = require("../../../utils/logger");
const apollo_server_express_1 = require("apollo-server-express");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Authentication resolvers for GraphQL mutations
 * @type {Object}
 */
exports.authResolvers = {
    Mutation: {
        /**
         * Login mutation resolver
         * Authenticates user and returns JWT token
         * @param {any} _ - Parent resolver result
         * @param {{ email: string; password: string }} param1 - Login credentials
         * @param {any} context - GraphQL context
         * @returns {Promise<{ token: string; user: IUser }>} JWT token and user data
         * @throws {AuthenticationError} If user not found or password invalid
         */
        login: async (_, { email, password }, context) => {
            try {
                const user = (await User_1.User.findOne({ email: email.toLowerCase() }));
                if (!user) {
                    throw new apollo_server_express_1.AuthenticationError('User not found');
                }
                if (!user.isActive) {
                    throw new apollo_server_express_1.AuthenticationError('Account is inactive');
                }
                const isValid = await user.comparePassword(password);
                if (!isValid) {
                    throw new apollo_server_express_1.AuthenticationError('Invalid password');
                }
                const secret = process.env.JWT_SECRET || 'your-secret-key';
                const options = { expiresIn: '7d' };
                const payload = { id: user._id.toString() };
                const token = jsonwebtoken_1.default.sign(payload, secret, options);
                // Update login activity
                const now = new Date();
                await User_1.User.findByIdAndUpdate(user._id, {
                    $set: {
                        lastLoginAt: now,
                        lastActivityAt: now,
                    },
                    $push: {
                        loginHistory: {
                            timestamp: now,
                            ipAddress: context.req?.ip,
                            userAgent: context.req?.headers['user-agent'],
                        },
                    },
                });
                return {
                    token,
                    user,
                };
            }
            catch (error) {
                logger_1.logger.error('Login error:', error);
                throw error;
            }
        },
        /**
         * Register mutation resolver
         * Creates new user account and returns JWT token
         * @param {any} _ - Parent resolver result
         * @param {{ input: any }} param1 - User registration data
         * @returns {Promise<{ token: string; user: IUser }>} JWT token and user data
         * @throws {UserInputError} If email/username/phone already exists
         */
        register: async (_, { input }) => {
            try {
                // Check for existing user with same email, username, or phone number
                const existingUser = await User_1.User.findOne({
                    $or: [
                        { email: input.email.toLowerCase() },
                        { username: input.username?.toLowerCase() },
                        { phoneNumber: input.phoneNumber },
                    ],
                });
                if (existingUser) {
                    if (existingUser.email === input.email.toLowerCase()) {
                        throw new apollo_server_express_1.UserInputError('Email already registered');
                    }
                    if (input.username && existingUser.username === input.username.toLowerCase()) {
                        throw new apollo_server_express_1.UserInputError('Username already taken');
                    }
                    if (input.phoneNumber && existingUser.phoneNumber === input.phoneNumber) {
                        throw new apollo_server_express_1.UserInputError('Phone number already registered');
                    }
                }
                // Create new user with lowercase email and username
                const user = (await User_1.User.create({
                    ...input,
                    email: input.email.toLowerCase(),
                    username: input.username?.toLowerCase(),
                    role: 'user',
                    isActive: true, // Explicitly set isActive to true for new users
                }));
                const secret = process.env.JWT_SECRET || 'your-secret-key';
                const options = { expiresIn: '7d' };
                const payload = { id: user._id.toString() };
                const token = jsonwebtoken_1.default.sign(payload, secret, options);
                return {
                    token,
                    user,
                };
            }
            catch (error) {
                logger_1.logger.error('Registration error:', error);
                if (error instanceof mongoose_1.default.Error.ValidationError) {
                    throw new apollo_server_express_1.UserInputError('Invalid input data');
                }
                throw error;
            }
        },
    },
};
