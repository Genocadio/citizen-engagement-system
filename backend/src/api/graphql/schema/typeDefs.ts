import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    username: String
    phoneNumber: String
    profileUrl: String
    role: String!
    category: String
    createdAt: String!
    updatedAt: String!
    feedbacks(limit: Int, offset: Int): [Feedback!]
    comments(limit: Int, offset: Int): [Comment!]
    assignedFeedbacks(limit: Int, offset: Int): [Feedback!]
    likedFeedbacks(limit: Int, offset: Int): [Feedback!]
    likedComments(limit: Int, offset: Int): [Comment!]
    likedResponses(limit: Int, offset: Int): [Response!]
    followedFeedbacks(limit: Int, offset: Int): [Feedback!]
  }

  type Comment {
    id: ID!
    message: String!
    feedback: Feedback!
    author: User!
    authorName: String!
    attachments: [String!]
    likes: Int!
    likedBy: [User!]
    createdAt: String!
    updatedAt: String!
  }

  type Response {
    id: ID!
    feedback: Feedback!
    by: User!
    message: String!
    attachments: [String!]
    statusUpdate: String!
    likes: Int!
    likedBy: [User!]
    createdAt: String!
    updatedAt: String!
  }

  type Location {
    country: String!
    province: String!
    district: String!
    sector: String!
    otherDetails: String
  }

  type Feedback {
    id: ID!
    ticketId: String!
    title: String!
    description: String!
    type: String!
    status: String!
    category: String!
    subcategory: String
    priority: String!
    author: User
    assignedTo: User
    attachments: [String!]
    chatEnabled: Boolean!
    comments: [Comment!]
    responses: [Response!]
    likes: Int!
    likedBy: [User!]
    followers: [User!]
    isAnonymous: Boolean!
    location: Location
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input LocationInput {
    country: String!
    province: String!
    district: String!
    sector: String!
    otherDetails: String
  }

  input FeedbackInput {
    title: String!
    description: String!
    type: String!
    category: String!
    subcategory: String
    priority: String
    attachments: [String!]
    chatEnabled: Boolean
    isAnonymous: Boolean
    location: LocationInput
  }

  input CommentInput {
    message: String!
    feedbackId: ID!
    attachments: [String!]
  }

  input ResponseInput {
    message: String!
    feedbackId: ID!
    statusUpdate: String!
    attachments: [String!]
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String
    lastName: String
    username: String
    phoneNumber: String
    profileUrl: String
    role: String
    category: String
  }

  type Query {
    me: User
    feedback(id: ID!): Feedback
    feedbackByTicketId(ticketId: String!): Feedback
    feedbacks(
      limit: Int
      offset: Int
      category: String
      subcategory: String
      status: String
      type: String
      isAnonymous: Boolean
      country: String
      province: String
    ): [Feedback!]!
    comments(feedbackId: ID!, limit: Int, offset: Int): [Comment!]!
    responses(feedbackId: ID!, limit: Int, offset: Int): [Response!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    createFeedback(input: FeedbackInput!): Feedback!
    updateFeedback(id: ID!, input: FeedbackInput!): Feedback!
    deleteFeedback(id: ID!): Boolean!
    createComment(input: CommentInput!): Comment!
    updateComment(id: ID!, message: String!): Comment!
    deleteComment(id: ID!): Boolean!
    createResponse(input: ResponseInput!): Response!
    updateResponse(id: ID!, message: String!): Response!
    deleteResponse(id: ID!): Boolean!
    likeFeedback(id: ID!): Feedback!
    unlikeFeedback(id: ID!): Feedback!
    likeComment(id: ID!): Comment!
    unlikeComment(id: ID!): Comment!
    likeResponse(id: ID!): Response!
    unlikeResponse(id: ID!): Response!
    followFeedback(id: ID!): Feedback!
    unfollowFeedback(id: ID!): Feedback!
  }

  type Subscription {
    feedbackUpdated(feedbackId: ID!): Feedback!
    commentAdded(feedbackId: ID!): Comment!
    responseAdded(feedbackId: ID!): Response!
    userFeedbackUpdated(userId: ID!): Feedback!
  }
`; 