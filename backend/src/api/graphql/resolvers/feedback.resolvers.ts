/**
 * @fileoverview Feedback resolvers for GraphQL API
 * @description Handles feedback-related queries, mutations, and subscriptions
 */

import { Feedback } from '../../../models/Feedback';
import { User } from '../../../models/User';
import { Response } from '../../../models/Response';
import { Comment } from '../../../models/Comment';
import { logger } from '../../../utils/logger';
import { PubSub } from 'graphql-subscriptions';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';

/**
 * PubSub instance for handling real-time subscriptions
 * @type {PubSub}
 */
const pubsub = new PubSub();

/**
 * Helper function to convert ObjectId to string
 * @param {any} id - ObjectId to convert
 * @returns {string} String representation of ObjectId
 */
const convertIdToString = (id: any): string => {
  if (id instanceof mongoose.Types.ObjectId) {
    return id.toString();
  }
  return id;
};

/**
 * Helper function to convert user object
 * @param {any} user - User object to convert
 * @returns {Object|null} Converted user object or null
 */
const convertUserObject = (user: any) => {
  if (!user) return null;
  return {
    ...user.toObject(),
    id: convertIdToString(user._id),
    _id: convertIdToString(user._id)
  };
};

/**
 * Feedback resolvers for GraphQL operations
 * @type {Object}
 */
export const feedbackResolvers = {
  Query: {
    /**
     * Get feedback by ID
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Feedback ID
     * @returns {Promise<Object>} Feedback object
     * @throws {UserInputError} If feedback not found
     */
    feedback: async (_: any, { id }: { id: string }) => {
      try {
        const feedback = await Feedback.findById(id)
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        // Convert all IDs to strings
        return {
          ...feedback.toObject(),
          id: convertIdToString(feedback._id),
          _id: convertIdToString(feedback._id),
          author: feedback.author ? convertUserObject(feedback.author) : null,
          assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
          likedBy: feedback.likedBy.map(user => convertUserObject(user)),
          followers: feedback.followers.map(user => convertUserObject(user))
        };
      } catch (error) {
        logger.error('Error fetching feedback:', error);
        throw error;
      }
    },

    /**
     * Get feedback by ticket ID
     * @param {any} _ - Parent resolver result
     * @param {{ ticketId: string }} param1 - Ticket ID
     * @returns {Promise<Object>} Feedback object
     * @throws {UserInputError} If feedback not found
     */
    feedbackByTicketId: async (_: any, { ticketId }: { ticketId: string }) => {
      try {
        const feedback = await Feedback.findOne({ ticketId })
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        // Convert all IDs to strings
        return {
          ...feedback.toObject(),
          id: convertIdToString(feedback._id),
          _id: convertIdToString(feedback._id),
          author: feedback.author ? convertUserObject(feedback.author) : null,
          assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
          likedBy: feedback.likedBy.map(user => convertUserObject(user)),
          followers: feedback.followers.map(user => convertUserObject(user))
        };
      } catch (error) {
        logger.error('Error fetching feedback by ticket ID:', error);
        throw error;
      }
    },

    /**
     * Get list of feedbacks with filtering
     * @param {any} _ - Parent resolver result
     * @param {{ limit?: number; offset?: number; category?: string; status?: string; type?: string }} param1 - Query parameters
     * @returns {Promise<Array>} Array of feedback objects
     */
    feedbacks: async (_: any, { limit = 10, offset = 0, category, status, type }: any) => {
      try {
        const query: any = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (type) query.type = type;

        const feedbacks = await Feedback.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        // Convert all IDs to strings
        return feedbacks.map(feedback => ({
          ...feedback.toObject(),
          id: convertIdToString(feedback._id),
          _id: convertIdToString(feedback._id),
          author: feedback.author ? convertUserObject(feedback.author) : null,
          assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
          likedBy: feedback.likedBy.map(user => convertUserObject(user)),
          followers: feedback.followers.map(user => convertUserObject(user))
        }));
      } catch (error) {
        logger.error('Error fetching feedbacks:', error);
        throw error;
      }
    },

    /**
     * Get current user's feedbacks
     * @param {any} _ - Parent resolver result
     * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
     * @param {any} context - GraphQL context
     * @returns {Promise<Array>} Array of user's feedbacks
     * @throws {AuthenticationError} If user not authenticated
     */
    myFeedbacks: async (_: any, { limit = 10, offset = 0 }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedbacks = await Feedback.find({ author: context.user.id })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        // Convert all IDs to strings
        return feedbacks.map(feedback => ({
          ...feedback.toObject(),
          id: convertIdToString(feedback._id),
          _id: convertIdToString(feedback._id),
          author: feedback.author ? convertUserObject(feedback.author) : null,
          assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
          likedBy: feedback.likedBy.map(user => convertUserObject(user)),
          followers: feedback.followers.map(user => convertUserObject(user))
        }));
      } catch (error) {
        logger.error('Error fetching user feedbacks:', error);
        throw error;
      }
    }
  },

  Mutation: {
    /**
     * Create new feedback
     * @param {any} _ - Parent resolver result
     * @param {{ input: any }} param1 - Feedback input data
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Created feedback
     * @throws {AuthenticationError} If authentication required but not provided
     */
    createFeedback: async (_: any, { input }: any, context: any) => {
      // Only require authentication if feedback is not anonymous
      if (!input.isAnonymous && !context.user) {
        throw new AuthenticationError('You must be logged in for non-anonymous feedback');
      }

      try {
        const feedbackData = {
          ...input,
          author: input.isAnonymous ? undefined : context.user?.id
        };

        const feedback = await Feedback.create(feedbackData);

        const populatedFeedback = await Feedback.findById(feedback._id)
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        // Add author as a follower by default if not anonymous
        if (!input.isAnonymous && context.user) {
          await Feedback.findByIdAndUpdate(feedback._id, {
            $addToSet: { followers: context.user.id }
          });
        }

        pubsub.publish('FEEDBACK_CREATED', {
          feedbackUpdated: populatedFeedback
        });

        return populatedFeedback;
      } catch (error) {
        logger.error('Error creating feedback:', error);
        throw error;
      }
    },

    /**
     * Update feedback status
     * @param {any} _ - Parent resolver result
     * @param {{ id: string; status: string }} param1 - Update parameters
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated feedback
     * @throws {AuthenticationError} If not authorized
     * @throws {UserInputError} If feedback not found
     */
    updateFeedbackStatus: async (_: any, { id, status }: { id: string; status: string }, context: any) => {
      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        // For anonymous feedback, only allow status updates by admins
        if (feedback.isAnonymous) {
          if (context.user?.role !== 'admin') {
            throw new AuthenticationError('Only admins can update anonymous feedback');
          }
        } else {
          // For non-anonymous feedback, require authentication and proper authorization
          if (!context.user) {
            throw new AuthenticationError('You must be logged in');
          }
          if (feedback.author.toString() !== context.user.id && context.user.role !== 'admin') {
            throw new AuthenticationError('Not authorized to update this feedback');
          }
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          id,
          { $set: { status } },
          { new: true }
        )
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        pubsub.publish('FEEDBACK_UPDATED', {
          feedbackUpdated: updatedFeedback
        });

        // Notify followers
        pubsub.publish('USER_FEEDBACK_UPDATED', {
          userFeedbackUpdated: updatedFeedback
        });

        return updatedFeedback;
      } catch (error) {
        logger.error('Error updating feedback status:', error);
        throw error;
      }
    },

    /**
     * Update existing feedback
     * @param {any} _ - Parent resolver result
     * @param {{ id: string; input: any }} param1 - Update parameters
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated feedback
     * @throws {AuthenticationError} If not authorized
     * @throws {UserInputError} If feedback not found
     */
    updateFeedback: async (_: any, { id, input }: any, context: any) => {
      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        // For anonymous feedback, only allow status updates by admins
        if (feedback.isAnonymous) {
          if (context.user?.role !== 'admin') {
            throw new AuthenticationError('Only admins can update anonymous feedback');
          }
          // Only allow status updates for anonymous feedback
          if (Object.keys(input).some(key => key !== 'status')) {
            throw new AuthenticationError('Only status can be updated for anonymous feedback');
          }
        } else {
          // For non-anonymous feedback, require authentication and proper authorization
          if (!context.user) {
            throw new AuthenticationError('You must be logged in');
          }
          if (feedback.author.toString() !== context.user.id && context.user.role !== 'admin') {
            throw new AuthenticationError('Not authorized to update this feedback');
          }
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true }
        )
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        pubsub.publish('FEEDBACK_UPDATED', {
          feedbackUpdated: updatedFeedback
        });

        // Notify followers
        pubsub.publish('USER_FEEDBACK_UPDATED', {
          userFeedbackUpdated: updatedFeedback
        });

        return updatedFeedback;
      } catch (error) {
        logger.error('Error updating feedback:', error);
        throw error;
      }
    },

    /**
     * Delete feedback
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {Promise<boolean>} Success status
     * @throws {AuthenticationError} If not authorized
     * @throws {UserInputError} If feedback not found
     */
    deleteFeedback: async (_: any, { id }: { id: string }, context: any) => {
      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        // For anonymous feedback, only allow deletion by admins
        if (feedback.isAnonymous) {
          if (context.user?.role !== 'admin') {
            throw new AuthenticationError('Only admins can delete anonymous feedback');
          }
        } else {
          // For non-anonymous feedback, require authentication and proper authorization
          if (!context.user) {
            throw new AuthenticationError('You must be logged in');
          }
          if (feedback.author.toString() !== context.user.id && context.user.role !== 'admin') {
            throw new AuthenticationError('Not authorized to delete this feedback');
          }
        }

        await Feedback.findByIdAndDelete(id);
        return true;
      } catch (error) {
        logger.error('Error deleting feedback:', error);
        throw error;
      }
    },

    /**
     * Like feedback
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated feedback
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If feedback not found or already liked
     */
    likeFeedback: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        if (feedback.likedBy.includes(context.user.id)) {
          throw new UserInputError('You have already liked this feedback');
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          id,
          {
            $inc: { likes: 1 },
            $addToSet: { likedBy: context.user.id }
          },
          { new: true }
        )
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        pubsub.publish('FEEDBACK_UPDATED', {
          feedbackUpdated: updatedFeedback
        });

        return updatedFeedback;
      } catch (error) {
        logger.error('Error liking feedback:', error);
        throw error;
      }
    },

    /**
     * Unlike feedback
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated feedback
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If feedback not found or not liked
     */
    unlikeFeedback: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        if (!feedback.likedBy.includes(context.user.id)) {
          throw new UserInputError('You have not liked this feedback');
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          id,
          {
            $inc: { likes: -1 },
            $pull: { likedBy: context.user.id }
          },
          { new: true }
        )
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        pubsub.publish('FEEDBACK_UPDATED', {
          feedbackUpdated: updatedFeedback
        });

        return updatedFeedback;
      } catch (error) {
        logger.error('Error unliking feedback:', error);
        throw error;
      }
    },

    /**
     * Follow feedback
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated feedback
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If feedback not found or already following
     */
    followFeedback: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        if (feedback.followers.includes(context.user.id)) {
          throw new UserInputError('You are already following this feedback');
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          id,
          {
            $addToSet: { followers: context.user.id }
          },
          { new: true }
        )
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        pubsub.publish('FEEDBACK_UPDATED', {
          feedbackUpdated: updatedFeedback
        });

        return updatedFeedback;
      } catch (error) {
        logger.error('Error following feedback:', error);
        throw error;
      }
    },

    /**
     * Unfollow feedback
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated feedback
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If feedback not found or not following
     */
    unfollowFeedback: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        if (!feedback.followers.includes(context.user.id)) {
          throw new UserInputError('You are not following this feedback');
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          id,
          {
            $pull: { followers: context.user.id }
          },
          { new: true }
        )
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');

        pubsub.publish('FEEDBACK_UPDATED', {
          feedbackUpdated: updatedFeedback
        });

        return updatedFeedback;
      } catch (error) {
        logger.error('Error unfollowing feedback:', error);
        throw error;
      }
    }
  },

  Subscription: {
    /**
     * Subscribe to feedback updates
     * @param {any} _ - Parent resolver result
     * @param {{ feedbackId: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {AsyncIterator} Subscription iterator
     * @throws {AuthenticationError} If user not authenticated
     */
    feedbackUpdated: {
      subscribe: (_: any, { feedbackId }: { feedbackId: string }, context: any) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in');
        }

        return pubsub.asyncIterator(['FEEDBACK_UPDATED']);
      },
      resolve: (payload: any) => {
        return payload.feedbackUpdated;
      }
    },

    /**
     * Subscribe to user feedback updates
     * @param {any} _ - Parent resolver result
     * @param {{ userId: string }} param1 - User ID
     * @param {any} context - GraphQL context
     * @returns {AsyncIterator} Subscription iterator
     * @throws {AuthenticationError} If not authorized
     */
    userFeedbackUpdated: {
      subscribe: (_: any, { userId }: { userId: string }, context: any) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in');
        }

        if (context.user.id !== userId && context.user.role !== 'admin') {
          throw new AuthenticationError('Not authorized to subscribe to these updates');
        }

        return pubsub.asyncIterator(['USER_FEEDBACK_UPDATED']);
      },
      resolve: (payload: any) => {
        return payload.userFeedbackUpdated;
      }
    }
  },

  Feedback: {
    /**
     * Resolve author field for Feedback type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<Object|null>} User object or null
     */
    author: async (parent: any) => {
      const user = await User.findById(parent.author);
      return user ? convertUserObject(user) : null;
    },

    /**
     * Resolve assignedTo field for Feedback type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<Object|null>} User object or null
     */
    assignedTo: async (parent: any) => {
      if (!parent.assignedTo) return null;
      const user = await User.findById(parent.assignedTo);
      return user ? convertUserObject(user) : null;
    },

    /**
     * Resolve comments field for Feedback type
     * @param {any} parent - Parent resolver result
     * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
     * @returns {Promise<Array>} Array of comments
     */
    comments: async (parent: any, { limit = 10, offset = 0 }: any) => {
      const comments = await Comment.find({ feedback: parent._id })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('author')
        .populate('likedBy');

      return comments.map(comment => ({
        ...comment.toObject(),
        id: convertIdToString(comment._id),
        _id: convertIdToString(comment._id),
        author: comment.author ? convertUserObject(comment.author) : null,
        likedBy: comment.likedBy.map(user => convertUserObject(user))
      }));
    },

    /**
     * Resolve responses field for Feedback type
     * @param {any} parent - Parent resolver result
     * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
     * @returns {Promise<Array>} Array of responses
     */
    responses: async (parent: any, { limit = 10, offset = 0 }: any) => {
      const responses = await Response.find({ feedback: parent._id })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('by')
        .populate('likedBy');

      return responses.map(response => ({
        ...response.toObject(),
        id: convertIdToString(response._id),
        _id: convertIdToString(response._id),
        by: response.by ? convertUserObject(response.by) : null,
        likedBy: response.likedBy.map(user => convertUserObject(user))
      }));
    },

    /**
     * Resolve followerCount field for Feedback type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<number>} Number of followers
     */
    followerCount: async (parent: any) => {
      return await Feedback.findById(parent._id).then(feedback => feedback?.followers?.length || 0);
    },

    /**
     * Resolve isFollowing field for Feedback type
     * @param {any} parent - Parent resolver result
     * @param {any} _ - Arguments
     * @param {any} context - GraphQL context
     * @returns {Promise<boolean|null>} Whether user is following
     */
    isFollowing: async (parent: any, _: any, context: any) => {
      if (!context.user) return null;
      return await Feedback.findById(parent._id).then(feedback => 
        feedback?.followers?.includes(context.user.id) || false
      );
    },

    /**
     * Resolve likesCount field for Feedback type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<number>} Number of likes
     */
    likesCount: async (parent: any) => {
      return await Feedback.findById(parent._id).then(feedback => feedback?.likedBy?.length || 0);
    },

    /**
     * Resolve hasLiked field for Feedback type
     * @param {any} parent - Parent resolver result
     * @param {any} _ - Arguments
     * @param {any} context - GraphQL context
     * @returns {Promise<boolean|null>} Whether user has liked
     */
    hasLiked: async (parent: any, _: any, context: any) => {
      if (!context.user) return null;
      return await Feedback.findById(parent._id).then(feedback => 
        feedback?.likedBy?.includes(context.user.id) || false
      );
    }
  }
}; 