/**
 * @fileoverview Authentication resolvers for GraphQL API
 * @description Handles user authentication, registration, and JWT token generation
 */

import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { User, IUser } from '../../../models/User';
import { logger } from '../../../utils/logger';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';

/**
 * Interface for JWT payload
 * @interface JWTPayload
 */
interface JWTPayload {
  id: string;
}

/**
 * Authentication resolvers for GraphQL mutations
 * @type {Object}
 */
export const authResolvers = {
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
    login: async (_: any, { email, password }: { email: string; password: string }, context: any) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() }) as IUser & { _id: mongoose.Types.ObjectId };
        if (!user) {
          throw new AuthenticationError('User not found');
        }

        if (!user.isActive) {
          throw new AuthenticationError('Account is inactive');
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
          throw new AuthenticationError('Invalid password');
        }

        const secret: Secret = process.env.JWT_SECRET || 'your-secret-key';
        const options: SignOptions = { expiresIn: '7d' };
        const payload: JWTPayload = { id: user._id.toString() };

        const token = jwt.sign(payload, secret, options);

        // Update login activity
        const now = new Date();
        await User.findByIdAndUpdate(user._id, {
          $set: {
            lastLoginAt: now,
            lastActivityAt: now
          },
          $push: {
            loginHistory: {
              timestamp: now,
              ipAddress: context.req?.ip,
              userAgent: context.req?.headers['user-agent']
            }
          }
        });

        return {
          token,
          user
        };
      } catch (error) {
        logger.error('Login error:', error);
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
    register: async (_: any, { input }: { input: any }) => {
      try {
        // Check for existing user with same email, username, or phone number
        const existingUser = await User.findOne({
          $or: [
            { email: input.email.toLowerCase() },
            { username: input.username?.toLowerCase() },
            { phoneNumber: input.phoneNumber }
          ]
        });

        if (existingUser) {
          if (existingUser.email === input.email.toLowerCase()) {
            throw new UserInputError('Email already registered');
          }
          if (input.username && existingUser.username === input.username.toLowerCase()) {
            throw new UserInputError('Username already taken');
          }
          if (input.phoneNumber && existingUser.phoneNumber === input.phoneNumber) {
            throw new UserInputError('Phone number already registered');
          }
        }

        // Create new user with lowercase email and username
        const user = await User.create({
          ...input,
          email: input.email.toLowerCase(),
          username: input.username?.toLowerCase(),
          role: 'user',
          isActive: true // Explicitly set isActive to true for new users
        }) as IUser & { _id: mongoose.Types.ObjectId };

        const secret: Secret = process.env.JWT_SECRET || 'your-secret-key';
        const options: SignOptions = { expiresIn: '7d' };
        const payload: JWTPayload = { id: user._id.toString() };

        const token = jwt.sign(payload, secret, options);

        return {
          token,
          user
        };
      } catch (error) {
        logger.error('Registration error:', error);
        if (error instanceof mongoose.Error.ValidationError) {
          throw new UserInputError('Invalid input data');
        }
        throw error;
      }
    }
  }
}; 