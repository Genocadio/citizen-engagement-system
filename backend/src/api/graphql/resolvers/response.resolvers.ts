/**
 * @fileoverview Response resolvers for GraphQL API
 * @description Handles response-related queries, mutations, and subscriptions
 */

import { Response } from '../../../models/Response';
import { Feedback } from '../../../models/Feedback';
import { User } from '../../../models/User';
import { logger } from '../../../utils/logger';
import { PubSub } from 'graphql-subscriptions';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

/**
 * PubSub instance for handling real-time subscriptions
 * @type {PubSub}
 */
const pubsub = new PubSub();

/**
 * Response resolvers for GraphQL operations
 * @type {Object}
 */
export const responseResolvers = {
  Query: {
    /**
     * Get responses for a feedback
     * @param {any} _ - Parent resolver result
     * @param {{ feedbackId: string; limit?: number; offset?: number }} param1 - Query parameters
     * @returns {Promise<Array>} Array of response objects
     */
    responses: async (_: any, { feedbackId, limit = 10, offset = 0 }: any) => {
      try {
        return await Response.find({ feedback: feedbackId })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('by')
          .populate('likedBy');
      } catch (error) {
        logger.error('Error fetching responses:', error);
        throw error;
      }
    },
  },

  Mutation: {
    /**
     * Create new response
     * @param {any} _ - Parent resolver result
     * @param {{ input: any }} param1 - Response input data
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Created response
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If feedback not found
     */
    createResponse: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedback = await Feedback.findById(input.feedbackId);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        const response = await Response.create({
          feedback: input.feedbackId,
          by: context.user.id,
          message: input.message,
          statusUpdate: input.statusUpdate,
          attachments: input.attachments || [],
        });

        const populatedResponse = await Response.findById(response._id)
          .populate('by')
          .populate('likedBy');

        // Notify feedback followers
        pubsub.publish('RESPONSE_ADDED', {
          responseAdded: populatedResponse,
        });

        // Notify feedback author and followers
        pubsub.publish('USER_FEEDBACK_UPDATED', {
          userFeedbackUpdated: feedback,
        });

        return populatedResponse;
      } catch (error) {
        logger.error('Error creating response:', error);
        throw error;
      }
    },

    /**
     * Update existing response
     * @param {any} _ - Parent resolver result
     * @param {{ id: string; message: string }} param1 - Update parameters
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated response
     * @throws {AuthenticationError} If not authorized
     * @throws {UserInputError} If response not found
     */
    updateResponse: async (_: any, { id, message }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const response = await Response.findById(id);
        if (!response) {
          throw new UserInputError('Response not found');
        }

        if (response.by.toString() !== context.user.id) {
          throw new AuthenticationError('Not authorized to update this response');
        }

        const updatedResponse = await Response.findByIdAndUpdate(id, { message }, { new: true })
          .populate('by')
          .populate('likedBy');

        pubsub.publish('RESPONSE_UPDATED', {
          responseUpdated: updatedResponse,
        });

        return updatedResponse;
      } catch (error) {
        logger.error('Error updating response:', error);
        throw error;
      }
    },

    /**
     * Delete response
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Response ID
     * @param {any} context - GraphQL context
     * @returns {Promise<boolean>} Success status
     * @throws {AuthenticationError} If not authorized
     * @throws {UserInputError} If response not found
     */
    deleteResponse: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const response = await Response.findById(id);
        if (!response) {
          throw new UserInputError('Response not found');
        }

        if (response.by.toString() !== context.user.id && context.user.role !== 'admin') {
          throw new AuthenticationError('Not authorized to delete this response');
        }

        await Response.findByIdAndDelete(id);
        return true;
      } catch (error) {
        logger.error('Error deleting response:', error);
        throw error;
      }
    },

    /**
     * Like response
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Response ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated response
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If response not found or already liked
     */
    likeResponse: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const response = await Response.findById(id);
        if (!response) {
          throw new UserInputError('Response not found');
        }

        if (response.likedBy.includes(context.user.id)) {
          throw new UserInputError('You have already liked this response');
        }

        const updatedResponse = await Response.findByIdAndUpdate(
          id,
          {
            $inc: { likes: 1 },
            $addToSet: { likedBy: context.user.id },
          },
          { new: true }
        )
          .populate('by')
          .populate('likedBy');

        pubsub.publish('RESPONSE_UPDATED', {
          responseUpdated: updatedResponse,
        });

        return updatedResponse;
      } catch (error) {
        logger.error('Error liking response:', error);
        throw error;
      }
    },

    /**
     * Unlike response
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Response ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated response
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If response not found or not liked
     */
    unlikeResponse: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const response = await Response.findById(id);
        if (!response) {
          throw new UserInputError('Response not found');
        }

        if (!response.likedBy.includes(context.user.id)) {
          throw new UserInputError('You have not liked this response');
        }

        const updatedResponse = await Response.findByIdAndUpdate(
          id,
          {
            $inc: { likes: -1 },
            $pull: { likedBy: context.user.id },
          },
          { new: true }
        )
          .populate('by')
          .populate('likedBy');

        pubsub.publish('RESPONSE_UPDATED', {
          responseUpdated: updatedResponse,
        });

        return updatedResponse;
      } catch (error) {
        logger.error('Error unliking response:', error);
        throw error;
      }
    },
  },

  Subscription: {
    /**
     * Subscribe to response updates
     * @param {any} _ - Parent resolver result
     * @param {{ feedbackId: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {AsyncIterator} Subscription iterator
     * @throws {AuthenticationError} If user not authenticated
     */
    responseAdded: {
      subscribe: (_: any, { feedbackId }: { feedbackId: string }, context: any) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in');
        }

        return pubsub.asyncIterator(['RESPONSE_ADDED']);
      },
      resolve: (payload: any) => {
        return payload.responseAdded;
      },
    },
  },

  Response: {
    /**
     * Resolve feedback field for Response type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<Object>} Feedback object
     */
    feedback: async (parent: any) => {
      return await Feedback.findById(parent.feedback);
    },

    /**
     * Resolve by field for Response type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<Object>} User object
     */
    by: async (parent: any) => {
      return await User.findById(parent.by);
    },

    /**
     * Resolve likesCount field for Response type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<number>} Number of likes
     */
    likesCount: async (parent: any) => {
      return await Response.findById(parent._id).then((response) => response?.likedBy?.length || 0);
    },

    /**
     * Resolve hasLiked field for Response type
     * @param {any} parent - Parent resolver result
     * @param {any} _ - Arguments
     * @param {any} context - GraphQL context
     * @returns {Promise<boolean|null>} Whether user has liked
     */
    hasLiked: async (parent: any, _: any, context: any) => {
      if (!context.user) return null;
      return await Response.findById(parent._id).then(
        (response) => response?.likedBy?.includes(context.user.id) || false
      );
    },
  },
};
