import { Response } from '../../../models/Response';
import { Feedback } from '../../../models/Feedback';
import { User } from '../../../models/User';
import { logger } from '../../../utils/logger';
import { PubSub } from 'graphql-subscriptions';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

const pubsub = new PubSub();

export const responseResolvers = {
  Query: {
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
    }
  },

  Mutation: {
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
          ...input,
          by: context.user.id
        });

        const populatedResponse = await Response.findById(response._id)
          .populate('by')
          .populate('likedBy');

        // Notify feedback followers
        pubsub.publish('RESPONSE_ADDED', {
          responseAdded: populatedResponse
        });

        // Notify feedback author and followers
        pubsub.publish('USER_FEEDBACK_UPDATED', {
          userFeedbackUpdated: feedback
        });

        return populatedResponse;
      } catch (error) {
        logger.error('Error creating response:', error);
        throw error;
      }
    },

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

        const updatedResponse = await Response.findByIdAndUpdate(
          id,
          { message },
          { new: true }
        )
          .populate('by')
          .populate('likedBy');

        pubsub.publish('RESPONSE_UPDATED', {
          responseUpdated: updatedResponse
        });

        return updatedResponse;
      } catch (error) {
        logger.error('Error updating response:', error);
        throw error;
      }
    },

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
            $addToSet: { likedBy: context.user.id }
          },
          { new: true }
        )
          .populate('by')
          .populate('likedBy');

        pubsub.publish('RESPONSE_UPDATED', {
          responseUpdated: updatedResponse
        });

        return updatedResponse;
      } catch (error) {
        logger.error('Error liking response:', error);
        throw error;
      }
    },

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
            $pull: { likedBy: context.user.id }
          },
          { new: true }
        )
          .populate('by')
          .populate('likedBy');

        pubsub.publish('RESPONSE_UPDATED', {
          responseUpdated: updatedResponse
        });

        return updatedResponse;
      } catch (error) {
        logger.error('Error unliking response:', error);
        throw error;
      }
    }
  },

  Subscription: {
    responseAdded: {
      subscribe: (_: any, { feedbackId }: { feedbackId: string }, context: any) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in');
        }

        return pubsub.asyncIterator(['RESPONSE_ADDED']);
      },
      resolve: (payload: any) => {
        return payload.responseAdded;
      }
    }
  },

  Response: {
    feedback: async (parent: any) => {
      return await Feedback.findById(parent.feedback);
    },
    by: async (parent: any) => {
      return await User.findById(parent.by);
    }
  }
}; 