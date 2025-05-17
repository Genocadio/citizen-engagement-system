import { User } from '../../../models/User';
import { Feedback } from '../../../models/Feedback';
import { Comment } from '../../../models/Comment';
import { logger } from '../../../utils/logger';

export const userResolvers = {
  Query: {
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
    }
  },

  User: {
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