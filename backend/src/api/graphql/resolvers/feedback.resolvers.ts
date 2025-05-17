import { Feedback } from '../../../models/Feedback';
import { User } from '../../../models/User';
import { Response } from '../../../models/Response';
import { Comment } from '../../../models/Comment';
import { logger } from '../../../utils/logger';
import { PubSub } from 'graphql-subscriptions';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

const pubsub = new PubSub();

export const feedbackResolvers = {
  Query: {
    feedback: async (_: any, { id }: { id: string }) => {
      try {
        return await Feedback.findById(id)
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');
      } catch (error) {
        logger.error('Error fetching feedback:', error);
        throw error;
      }
    },

    feedbackByTicketId: async (_: any, { ticketId }: { ticketId: string }) => {
      try {
        return await Feedback.findOne({ ticketId })
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');
      } catch (error) {
        logger.error('Error fetching feedback by ticket ID:', error);
        throw error;
      }
    },

    feedbacks: async (_: any, { limit = 10, offset = 0, category, status, type }: any) => {
      try {
        const query: any = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (type) query.type = type;

        return await Feedback.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('author')
          .populate('assignedTo')
          .populate('likedBy')
          .populate('followers');
      } catch (error) {
        logger.error('Error fetching feedbacks:', error);
        throw error;
      }
    }
  },

  Mutation: {
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
    author: async (parent: any) => {
      return await User.findById(parent.author);
    },
    assignedTo: async (parent: any) => {
      return parent.assignedTo ? await User.findById(parent.assignedTo) : null;
    },
    comments: async (parent: any, { limit = 10, offset = 0 }: any) => {
      return await Comment.find({ feedback: parent._id })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('author');
    },
    responses: async (parent: any, { limit = 10, offset = 0 }: any) => {
      return await Response.find({ feedback: parent._id })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('by');
    }
  }
}; 