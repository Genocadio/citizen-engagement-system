import { IResolvers } from '@apollo/server';
import { authResolvers } from './auth.resolvers';
import { feedbackResolvers } from './feedback.resolvers';
import { commentResolvers } from './comment.resolvers';
import { userResolvers } from './user.resolvers';
import { responseResolvers } from './response.resolvers';

export const resolvers: IResolvers = {
  Query: {
    ...userResolvers.Query,
    ...feedbackResolvers.Query,
    ...commentResolvers.Query,
    ...responseResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...feedbackResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...responseResolvers.Mutation
  },
  Subscription: {
    ...feedbackResolvers.Subscription,
    ...commentResolvers.Subscription,
    ...responseResolvers.Subscription
  },
  User: userResolvers.User,
  Feedback: feedbackResolvers.Feedback,
  Comment: commentResolvers.Comment,
  Response: responseResolvers.Response
}; 