/**
 * @fileoverview User resolvers for GraphQL API
 * @description Handles user-related queries and field resolvers
 */

import { User, IUser } from '../../../models/User';
import { Feedback } from '../../../models/Feedback';
import { Comment } from '../../../models/Comment';
import { logger } from '../../../utils/logger';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';

/**
 * User resolvers for GraphQL operations
 * @type {Object}
 */
export const userResolvers = {
  Query: {
    /**
     * Get current user's profile
     * @param {any} _ - Parent resolver result
     * @param {any} __ - Arguments
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} User profile
     * @throws {Error} If user not authenticated
     */
    me: async (_: any, __: any, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        const user = await User.findById(context.user._id)
          .select('-password');
        return user;
      } catch (error) {
        logger.error('Error fetching user:', error);
        throw error;
      }
    },

    /**
     * Get user by ID
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - User ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} User profile
     * @throws {Error} If user not found or not authorized
     */
    user: async (_: any, { id }: { id: string }, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Only admins can view other users
        if (context.user.role !== 'admin' && context.user._id.toString() !== id) {
          throw new ForbiddenError('Not authorized to view this user');
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
          throw new UserInputError('User not found');
        }

        return user;
      } catch (error) {
        logger.error('Error fetching user:', error);
        throw error;
      }
    },

    /**
     * Get list of users with filtering and pagination
     * @param {any} _ - Parent resolver result
     * @param {any} param1 - Filter and pagination parameters
     * @param {any} context - GraphQL context
     * @returns {Promise<Array>} List of users
     * @throws {Error} If not authorized
     */
    users: async (_: any, { limit = 10, offset = 0, role, category, isActive }: any, context: any) => {
      try {
        if (!context.user || context.user.role !== 'admin') {
          throw new ForbiddenError('Not authorized to view users');
        }

        const query: any = {};
        if (role) query.role = role;
        if (category) query.category = category;
        if (typeof isActive === 'boolean') query.isActive = isActive;

        const users = await User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);

        return users;
      } catch (error) {
        logger.error('Error fetching users:', error);
        throw error;
      }
    }
  },

  Mutation: {
    /**
     * Update user profile
     * @param {any} _ - Parent resolver result
     * @param {{ id: string; input: any }} param1 - User ID and update data
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated user
     * @throws {Error} If not authorized or user not found
     */
    updateUser: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      let session;
      try {
        // Authentication check
        if (!context.user) {
          throw new Error('Authentication required');
        }

        // Authorization check
        if (context.user.role !== 'admin' && context.user._id.toString() !== id) {
          throw new ForbiddenError('Not authorized to update this user');
        }

        // Remove role update for non-admin users
        if (context.user.role !== 'admin' && input.role) {
          delete input.role;
        }

        // Start transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Find the user first to ensure it exists
        const existingUser = await User.findById(id).session(session);
        if (!existingUser) {
          throw new UserInputError('User not found');
        }

        // Clean up input - remove undefined values but keep empty strings
        const cleanedInput = Object.entries(input).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        // If no valid fields to update, return the existing user
        if (Object.keys(cleanedInput).length === 0) {
          await session.commitTransaction();
          return existingUser;
        }

        // Validate unique fields only if they are being updated
        if (cleanedInput.username !== undefined && cleanedInput.username !== '') {
          const existingUsername = await User.findOne({ 
            username: cleanedInput.username, 
            _id: { $ne: id } 
          }).session(session);
          if (existingUsername) {
            throw new UserInputError('Username already taken');
          }
        }

        if (cleanedInput.phoneNumber !== undefined && cleanedInput.phoneNumber !== '') {
          const existingPhone = await User.findOne({ 
            phoneNumber: cleanedInput.phoneNumber, 
            _id: { $ne: id } 
          }).session(session);
          if (existingPhone) {
            throw new UserInputError('Phone number already registered');
          }
        }

        // Perform the update
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { $set: cleanedInput },
          { 
            new: true,
            runValidators: true,
            session
          }
        ).select('-password');

        if (!updatedUser) {
          throw new Error('Failed to update user - unexpected null result');
        }

        await session.commitTransaction();
        return updatedUser;
      } catch (error: any) {
        if (session) {
          await session.abortTransaction();
        }
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
          throw new UserInputError('Invalid input data', { 
            errors: Object.values(error.errors).map((e: any) => e.message)
          });
        }
        
        if (error.name === 'CastError') {
          throw new UserInputError('Invalid ID format');
        }

        // Re-throw other errors
        throw error;
      } finally {
        if (session) {
          session.endSession();
        }
      }
    },

    /**
     * Update user role (admin only)
     * @param {any} _ - Parent resolver result
     * @param {{ id: string; role: string }} param1 - User ID and new role
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated user
     * @throws {Error} If not authorized or invalid role
     */
    updateUserRole: async (_: any, { id, role }: { id: string; role: string }, context: any) => {
      try {
        if (!context.user || context.user.role !== 'admin') {
          throw new ForbiddenError('Not authorized to update user role');
        }

        if (!['user', 'admin'].includes(role)) {
          throw new UserInputError('Invalid role');
        }

        const user = await User.findByIdAndUpdate(
          id,
          { $set: { role } },
          { new: true }
        ).select('-password');

        if (!user) {
          throw new UserInputError('User not found');
        }

        return user;
      } catch (error) {
        logger.error('Error updating user role:', error);
        throw error;
      }
    },

    /**
     * Update user activity state (admin only)
     * @param {any} _ - Parent resolver result
     * @param {{ id: string; isActive: boolean }} param1 - User ID and activity state
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated user
     * @throws {Error} If not authorized or user not found
     */
    updateUserActivity: async (_: any, { id, isActive }: { id: string; isActive: boolean }, context: any) => {
      try {
        if (!context.user || context.user.role !== 'admin') {
          throw new ForbiddenError('Not authorized to update user activity');
        }

        const user = await User.findByIdAndUpdate(
          id,
          { $set: { isActive } },
          { new: true }
        ).select('-password');

        if (!user) {
          throw new UserInputError('User not found');
        }

        return user;
      } catch (error) {
        logger.error('Error updating user activity:', error);
        throw error;
      }
    }
  },

  User: {
    /**
     * Resolve feedbacks field for User type
     * @param {any} parent - Parent resolver result
     * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
     * @returns {Promise<Array>} Array of user's feedbacks
     */
    feedbacks: async (parent: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      try {
        const feedbacks = await Feedback.find({ author: parent._id })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);
        return feedbacks;
      } catch (error) {
        logger.error('Error fetching user feedbacks:', error);
        throw error;
      }
    },

    /**
     * Resolve comments field for User type
     * @param {any} parent - Parent resolver result
     * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
     * @returns {Promise<Array>} Array of user's comments
     */
    comments: async (parent: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      try {
        const comments = await Comment.find({ author: parent._id })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);
        return comments;
      } catch (error) {
        logger.error('Error fetching user comments:', error);
        throw error;
      }
    },

    /**
     * Resolve assignedFeedbacks field for User type
     * @param {any} parent - Parent resolver result
     * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
     * @returns {Promise<Array>} Array of feedbacks assigned to user
     */
    assignedFeedbacks: async (parent: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      try {
        const feedbacks = await Feedback.find({ assignedTo: parent._id })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);
        return feedbacks;
      } catch (error) {
        logger.error('Error fetching assigned feedbacks:', error);
        throw error;
      }
    }
  }
}; 