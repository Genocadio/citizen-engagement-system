import { Comment } from '../../../models/Comment';
import { Feedback } from '../../../models/Feedback';
import { User } from '../../../models/User';
import { logger } from '../../../utils/logger';
import { PubSub } from 'graphql-subscriptions';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

const pubsub = new PubSub();

export const commentResolvers = {
  Query: {
    comments: async (_: any, { feedbackId, limit = 10, offset = 0 }: any) => {
      try {
        return await Comment.find({ feedback: feedbackId })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('author')
          .populate('likedBy');
      } catch (error) {
        logger.error('Error fetching comments:', error);
        throw error;
      }
    }
  },

  Mutation: {
    createComment: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const feedback = await Feedback.findById(input.feedbackId);
        if (!feedback) {
          throw new UserInputError('Feedback not found');
        }

        const comment = await Comment.create({
          ...input,
          author: context.user.id
        });

        const populatedComment = await Comment.findById(comment._id)
          .populate('author')
          .populate('likedBy');

        // Notify feedback followers
        pubsub.publish('COMMENT_ADDED', {
          commentAdded: populatedComment
        });

        // Notify feedback author and followers
        pubsub.publish('USER_FEEDBACK_UPDATED', {
          userFeedbackUpdated: feedback
        });

        return populatedComment;
      } catch (error) {
        logger.error('Error creating comment:', error);
        throw error;
      }
    },

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

        pubsub.publish('COMMENT_UPDATED', {
          commentUpdated: updatedComment
        });

        return updatedComment;
      } catch (error) {
        logger.error('Error updating comment:', error);
        throw error;
      }
    },

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

    likeComment: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }

        if (comment.likedBy.includes(context.user.id)) {
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

        pubsub.publish('COMMENT_UPDATED', {
          commentUpdated: updatedComment
        });

        return updatedComment;
      } catch (error) {
        logger.error('Error liking comment:', error);
        throw error;
      }
    },

    unlikeComment: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }

        if (!comment.likedBy.includes(context.user.id)) {
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

        pubsub.publish('COMMENT_UPDATED', {
          commentUpdated: updatedComment
        });

        return updatedComment;
      } catch (error) {
        logger.error('Error unliking comment:', error);
        throw error;
      }
    }
  },

  Subscription: {
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
    feedback: async (parent: any) => {
      return await Feedback.findById(parent.feedback);
    },
    author: async (parent: any) => {
      return await User.findById(parent.author);
    }
  }
}; 