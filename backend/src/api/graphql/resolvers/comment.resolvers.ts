/**
 * @fileoverview Comment resolvers for GraphQL API
 * @description Handles comment-related queries, mutations, and subscriptions
 */

import { Comment } from '../../../models/Comment';
import { Feedback } from '../../../models/Feedback';
import { User } from '../../../models/User';
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
 * Comment resolvers for GraphQL operations
 * @type {Object}
 */
export const commentResolvers = {
  Query: {
    /**
     * Get comments for a feedback item
     * @param {any} _ - Parent resolver result
     * @param {{ feedbackId: string; limit?: number; offset?: number }} param1 - Query parameters
     * @returns {Promise<Array>} Array of comments
     */
    comments: async (_: any, { feedbackId, limit = 10, offset = 0 }: any) => {
      try {
        const comments = await Comment.find({ feedback: feedbackId })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('author')
          .populate('likedBy');

        // Convert all ObjectIds to strings
        return comments.map(comment => ({
          ...comment.toObject(),
          id: convertIdToString(comment._id),
          _id: convertIdToString(comment._id),
          author: comment.author ? convertUserObject(comment.author) : null,
          feedback: convertIdToString(comment.feedback),
          likedBy: comment.likedBy.map(user => convertUserObject(user))
        }));
      } catch (error) {
        logger.error('Error fetching comments:', error);
        throw error;
      }
    }
  },

  Mutation: {
    /**
     * Create a new comment
     * @param {any} _ - Parent resolver result
     * @param {{ input: any }} param1 - Comment input data
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Created comment
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If feedback not found
     */
    createComment: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedback = await Feedback.findById(input.feedbackId);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        // Get user data to set authorName
        const user = await User.findById(context.user.id);
        if (!user) {
          throw new AuthenticationError('User not found');
        }

        const authorName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.username || user.email;

        const comment = await Comment.create({
          ...input,
          author: context.user.id,
          authorName,
          feedback: input.feedbackId
        });

        const populatedComment = await Comment.findById(comment._id)
          .populate('author')
          .populate('likedBy');

        if (!populatedComment) {
          throw new Error('Failed to populate comment after creation');
        }

        // Convert ObjectIds to strings
        const commentWithStringIds = {
          ...populatedComment.toObject(),
          id: convertIdToString(populatedComment._id),
          _id: convertIdToString(populatedComment._id),
          author: populatedComment.author ? convertUserObject(populatedComment.author) : null,
          feedback: convertIdToString(populatedComment.feedback),
          likedBy: populatedComment.likedBy.map(user => convertUserObject(user))
        };

        // Notify feedback followers
        pubsub.publish('COMMENT_ADDED', {
          commentAdded: commentWithStringIds
        });

        // Notify feedback author and followers
        pubsub.publish('USER_FEEDBACK_UPDATED', {
          userFeedbackUpdated: feedback
        });

        return commentWithStringIds;
      } catch (error) {
        logger.error('Error creating comment:', error);
        throw error;
      }
    },

    /**
     * Update an existing comment
     * @param {any} _ - Parent resolver result
     * @param {{ id: string; message: string }} param1 - Update parameters
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated comment
     * @throws {AuthenticationError} If user not authenticated or not comment author
     */
    updateComment: async (_: any, { id, message }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }

        if (comment.author.toString() !== context.user.id) {
          throw new AuthenticationError('Not authorized to update this comment');
        }

        const updatedComment = await Comment.findByIdAndUpdate(
          id,
          { message },
          { new: true }
        )
          .populate('author')
          .populate('likedBy');

        if (!updatedComment) {
          throw new Error('Failed to update comment');
        }

        // Convert ObjectIds to strings
        const commentWithStringIds = {
          ...updatedComment.toObject(),
          id: convertIdToString(updatedComment._id),
          _id: convertIdToString(updatedComment._id),
          author: updatedComment.author ? convertUserObject(updatedComment.author) : null,
          feedback: convertIdToString(updatedComment.feedback),
          likedBy: updatedComment.likedBy.map(user => convertUserObject(user))
        };

        pubsub.publish('COMMENT_UPDATED', {
          commentUpdated: commentWithStringIds
        });

        return commentWithStringIds;
      } catch (error) {
        logger.error('Error updating comment:', error);
        throw error;
      }
    },

    /**
     * Delete a comment
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Comment ID
     * @param {any} context - GraphQL context
     * @returns {Promise<boolean>} Success status
     * @throws {AuthenticationError} If user not authenticated or not authorized
     */
    deleteComment: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }

        if (comment.author.toString() !== context.user.id && context.user.role !== 'admin') {
          throw new AuthenticationError('Not authorized to delete this comment');
        }

        await Comment.findByIdAndDelete(id);
        return true;
      } catch (error) {
        logger.error('Error deleting comment:', error);
        throw error;
      }
    },

    /**
     * Like a comment
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Comment ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated comment
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If comment not found or already liked
     */
    likeComment: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }

        // Check if user has already liked the comment
        const hasLiked = await Comment.findById(id).then(comment => 
          comment?.likedBy?.includes(context.user.id) || false
        );

        if (hasLiked) {
          throw new UserInputError('You have already liked this comment');
        }

        const updatedComment = await Comment.findByIdAndUpdate(
          id,
          {
            $inc: { likes: 1 },
            $addToSet: { likedBy: context.user.id }
          },
          { new: true }
        )
          .populate('author')
          .populate('likedBy');

        if (!updatedComment) {
          throw new Error('Failed to update comment likes');
        }

        // Convert ObjectIds to strings
        const commentWithStringIds = {
          ...updatedComment.toObject(),
          id: convertIdToString(updatedComment._id),
          _id: convertIdToString(updatedComment._id),
          author: updatedComment.author ? convertUserObject(updatedComment.author) : null,
          feedback: convertIdToString(updatedComment.feedback),
          likedBy: updatedComment.likedBy.map(user => convertUserObject(user))
        };

        pubsub.publish('COMMENT_UPDATED', {
          commentUpdated: commentWithStringIds
        });

        return commentWithStringIds;
      } catch (error) {
        logger.error('Error liking comment:', error);
        throw error;
      }
    },

    /**
     * Unlike a comment
     * @param {any} _ - Parent resolver result
     * @param {{ id: string }} param1 - Comment ID
     * @param {any} context - GraphQL context
     * @returns {Promise<Object>} Updated comment
     * @throws {AuthenticationError} If user not authenticated
     * @throws {UserInputError} If comment not found or not liked
     */
    unlikeComment: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }

        // Check if user has liked the comment
        const hasLiked = await Comment.findById(id).then(comment => 
          comment?.likedBy?.includes(context.user.id) || false
        );

        if (!hasLiked) {
          throw new UserInputError('You have not liked this comment');
        }

        const updatedComment = await Comment.findByIdAndUpdate(
          id,
          {
            $inc: { likes: -1 },
            $pull: { likedBy: context.user.id }
          },
          { new: true }
        )
          .populate('author')
          .populate('likedBy');

        if (!updatedComment) {
          throw new Error('Failed to update comment likes');
        }

        // Convert ObjectIds to strings
        const commentWithStringIds = {
          ...updatedComment.toObject(),
          id: convertIdToString(updatedComment._id),
          _id: convertIdToString(updatedComment._id),
          author: updatedComment.author ? convertUserObject(updatedComment.author) : null,
          feedback: convertIdToString(updatedComment.feedback),
          likedBy: updatedComment.likedBy.map(user => convertUserObject(user))
        };

        pubsub.publish('COMMENT_UPDATED', {
          commentUpdated: commentWithStringIds
        });

        return commentWithStringIds;
      } catch (error) {
        logger.error('Error unliking comment:', error);
        throw error;
      }
    }
  },

  Subscription: {
    /**
     * Subscribe to new comments
     * @param {any} _ - Parent resolver result
     * @param {{ feedbackId: string }} param1 - Feedback ID
     * @param {any} context - GraphQL context
     * @returns {AsyncIterator} Subscription iterator
     * @throws {AuthenticationError} If user not authenticated
     */
    commentAdded: {
      subscribe: (_: any, { feedbackId }: { feedbackId: string }, context: any) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in');
        }

        return pubsub.asyncIterator(['COMMENT_ADDED']);
      },
      resolve: (payload: any) => {
        return payload.commentAdded;
      }
    }
  },

  Comment: {
    /**
     * Resolve feedback field for Comment type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<Object|null>} Feedback object or null
     */
    feedback: async (parent: any) => {
      const feedback = await Feedback.findById(parent.feedback);
      return feedback ? {
        ...feedback.toObject(),
        id: convertIdToString(feedback._id),
        _id: convertIdToString(feedback._id)
      } : null;
    },

    /**
     * Resolve author field for Comment type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<Object|null>} User object or null
     */
    author: async (parent: any) => {
      const user = await User.findById(parent.author);
      return user ? convertUserObject(user) : null;
    },

    /**
     * Resolve likesCount field for Comment type
     * @param {any} parent - Parent resolver result
     * @returns {Promise<number>} Number of likes
     */
    likesCount: async (parent: any) => {
      return await Comment.findById(parent._id).then(comment => comment?.likedBy?.length || 0);
    },

    /**
     * Resolve hasLiked field for Comment type
     * @param {any} parent - Parent resolver result
     * @param {any} _ - Arguments
     * @param {any} context - GraphQL context
     * @returns {Promise<boolean|null>} Whether user has liked the comment
     */
    hasLiked: async (parent: any, _: any, context: any) => {
      if (!context.user) return null;
      return await Comment.findById(parent._id).then(comment => 
        comment?.likedBy?.includes(context.user.id) || false
      );
    }
  }
}; 