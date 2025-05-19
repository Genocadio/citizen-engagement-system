"use strict";
/**
 * @fileoverview Feedback resolvers for GraphQL API
 * @description Handles feedback-related queries, mutations, and subscriptions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackResolvers = void 0;
const Feedback_1 = require("../../../models/Feedback");
const User_1 = require("../../../models/User");
const Response_1 = require("../../../models/Response");
const Comment_1 = require("../../../models/Comment");
const logger_1 = require("../../../utils/logger");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const apollo_server_express_1 = require("apollo-server-express");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * PubSub instance for handling real-time subscriptions
 * @type {PubSub}
 */
const pubsub = new graphql_subscriptions_1.PubSub();
/**
 * Helper function to convert ObjectId to string
 * @param {any} id - ObjectId to convert
 * @returns {string} String representation of ObjectId
 */
const convertIdToString = (id) => {
    if (id instanceof mongoose_1.default.Types.ObjectId) {
        return id.toString();
    }
    return id;
};
/**
 * Helper function to convert user object
 * @param {any} user - User object to convert
 * @returns {Object|null} Converted user object or null
 */
const convertUserObject = (user) => {
    if (!user)
        return null;
    return {
        ...user.toObject(),
        id: convertIdToString(user._id),
        _id: convertIdToString(user._id),
    };
};
/**
 * Feedback resolvers for GraphQL operations
 * @type {Object}
 */
exports.feedbackResolvers = {
    Query: {
        /**
         * Get feedback by ID
         * @param {any} _ - Parent resolver result
         * @param {{ id: string }} param1 - Feedback ID
         * @returns {Promise<Object>} Feedback object
         * @throws {UserInputError} If feedback not found
         */
        feedback: async (_, { id }) => {
            try {
                const feedback = await Feedback_1.Feedback.findById(id)
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                // Convert all IDs to strings
                return {
                    ...feedback.toObject(),
                    id: convertIdToString(feedback._id),
                    _id: convertIdToString(feedback._id),
                    author: feedback.author ? convertUserObject(feedback.author) : null,
                    assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
                    likedBy: feedback.likedBy.map((user) => convertUserObject(user)),
                    followers: feedback.followers.map((user) => convertUserObject(user)),
                };
            }
            catch (error) {
                logger_1.logger.error('Error fetching feedback:', error);
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
        feedbackByTicketId: async (_, { ticketId }) => {
            try {
                const feedback = await Feedback_1.Feedback.findOne({ ticketId })
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                // Convert all IDs to strings
                return {
                    ...feedback.toObject(),
                    id: convertIdToString(feedback._id),
                    _id: convertIdToString(feedback._id),
                    author: feedback.author ? convertUserObject(feedback.author) : null,
                    assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
                    likedBy: feedback.likedBy.map((user) => convertUserObject(user)),
                    followers: feedback.followers.map((user) => convertUserObject(user)),
                };
            }
            catch (error) {
                logger_1.logger.error('Error fetching feedback by ticket ID:', error);
                throw error;
            }
        },
        /**
         * Get list of feedbacks with filtering
         * @param {any} _ - Parent resolver result
         * @param {{ limit?: number; offset?: number; category?: string; status?: string; type?: string }} param1 - Query parameters
         * @returns {Promise<Array>} Array of feedback objects
         */
        feedbacks: async (_, { limit = 10, offset = 0, category, status, type }) => {
            try {
                const query = {};
                if (category)
                    query.category = category;
                if (status)
                    query.status = status;
                if (type)
                    query.type = type;
                const feedbacks = await Feedback_1.Feedback.find(query)
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit)
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                // Convert all IDs to strings
                return feedbacks.map((feedback) => ({
                    ...feedback.toObject(),
                    id: convertIdToString(feedback._id),
                    _id: convertIdToString(feedback._id),
                    author: feedback.author ? convertUserObject(feedback.author) : null,
                    assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
                    likedBy: feedback.likedBy.map((user) => convertUserObject(user)),
                    followers: feedback.followers.map((user) => convertUserObject(user)),
                }));
            }
            catch (error) {
                logger_1.logger.error('Error fetching feedbacks:', error);
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
        myFeedbacks: async (_, { limit = 10, offset = 0 }, context) => {
            if (!context.user) {
                throw new apollo_server_express_1.AuthenticationError('You must be logged in');
            }
            try {
                const feedbacks = await Feedback_1.Feedback.find({ author: context.user.id })
                    .sort({ createdAt: -1 })
                    .skip(offset)
                    .limit(limit)
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                // Convert all IDs to strings
                return feedbacks.map((feedback) => ({
                    ...feedback.toObject(),
                    id: convertIdToString(feedback._id),
                    _id: convertIdToString(feedback._id),
                    author: feedback.author ? convertUserObject(feedback.author) : null,
                    assignedTo: feedback.assignedTo ? convertUserObject(feedback.assignedTo) : null,
                    likedBy: feedback.likedBy.map((user) => convertUserObject(user)),
                    followers: feedback.followers.map((user) => convertUserObject(user)),
                }));
            }
            catch (error) {
                logger_1.logger.error('Error fetching user feedbacks:', error);
                throw error;
            }
        },
        /**
         * Get feedback statistics
         * @param {any} _ - Parent resolver result
         * @param {any} __ - Arguments
         * @param {any} context - GraphQL context
         * @returns {Promise<Object>} Feedback statistics
         */
        feedbackStats: async (_, __, context) => {
            try {
                // Get all feedback for calculations
                const allFeedback = await Feedback_1.Feedback.find({});
                // Calculate total feedback
                const totalFeedback = allFeedback.length;
                // Calculate feedback by status
                const newFeedback = allFeedback.filter((f) => f.status === 'open').length;
                const resolvedFeedback = allFeedback.filter((f) => f.status === 'closed').length;
                const pendingFeedback = allFeedback.filter((f) => f.status === 'in-progress').length;
                // Calculate feedback by category
                const feedbackByCategory = {
                    infrastructure: allFeedback.filter((f) => f.category === 'infrastructure').length,
                    publicServices: allFeedback.filter((f) => f.category === 'public-services').length,
                    safety: allFeedback.filter((f) => f.category === 'safety').length,
                    environment: allFeedback.filter((f) => f.category === 'environment').length,
                    other: allFeedback.filter((f) => f.category === 'other').length,
                };
                // Calculate feedback by status
                const feedbackByStatus = {
                    new: newFeedback,
                    inProgress: pendingFeedback,
                    answered: allFeedback.filter((f) => f.status === 'resolved').length,
                    closed: resolvedFeedback,
                };
                // Calculate feedback by priority
                const feedbackByPriority = {
                    low: allFeedback.filter((f) => f.priority === 'low').length,
                    medium: allFeedback.filter((f) => f.priority === 'medium').length,
                    high: allFeedback.filter((f) => f.priority === 'high').length,
                    critical: allFeedback.filter((f) => f.priority === 'urgent').length,
                };
                // Calculate response rate
                const feedbackWithResponses = await Feedback_1.Feedback.countDocuments({
                    responses: { $exists: true, $not: { $size: 0 } },
                });
                const responseRate = totalFeedback > 0 ? (feedbackWithResponses / totalFeedback) * 100 : 0;
                // Calculate average response time
                const feedbackWithResponseTime = await Feedback_1.Feedback.aggregate([
                    {
                        $match: {
                            responses: { $exists: true, $not: { $size: 0 } },
                        },
                    },
                    {
                        $project: {
                            responseTime: {
                                $divide: [
                                    { $subtract: [{ $arrayElemAt: ['$responses.createdAt', 0] }, '$createdAt'] },
                                    3600000, // Convert milliseconds to hours
                                ],
                            },
                        },
                    },
                ]);
                const averageResponseTime = feedbackWithResponseTime.length > 0
                    ? feedbackWithResponseTime.reduce((acc, curr) => acc + curr.responseTime, 0) /
                        feedbackWithResponseTime.length
                    : 0;
                return {
                    totalFeedback,
                    newFeedback,
                    resolvedFeedback,
                    pendingFeedback,
                    feedbackByCategory,
                    feedbackByStatus,
                    feedbackByPriority,
                    responseRate,
                    averageResponseTime,
                };
            }
            catch (error) {
                logger_1.logger.error('Error fetching feedback statistics:', error);
                throw error;
            }
        },
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
        createFeedback: async (_, { input }, context) => {
            // Only require authentication if feedback is not anonymous
            if (!input.isAnonymous && !context.user) {
                throw new apollo_server_express_1.AuthenticationError('You must be logged in for non-anonymous feedback');
            }
            try {
                const feedbackData = {
                    ...input,
                    author: input.isAnonymous ? undefined : context.user?.id,
                };
                const feedback = await Feedback_1.Feedback.create(feedbackData);
                const populatedFeedback = await Feedback_1.Feedback.findById(feedback._id)
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                // Add author as a follower by default if not anonymous
                if (!input.isAnonymous && context.user) {
                    await Feedback_1.Feedback.findByIdAndUpdate(feedback._id, {
                        $addToSet: { followers: context.user.id },
                    });
                }
                pubsub.publish('FEEDBACK_CREATED', {
                    feedbackUpdated: populatedFeedback,
                });
                return populatedFeedback;
            }
            catch (error) {
                logger_1.logger.error('Error creating feedback:', error);
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
        updateFeedbackStatus: async (_, { id, status }, context) => {
            try {
                const feedback = await Feedback_1.Feedback.findById(id);
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                // For anonymous feedback, only allow status updates by admins
                if (feedback.isAnonymous) {
                    if (context.user?.role !== 'admin') {
                        throw new apollo_server_express_1.AuthenticationError('Only admins can update anonymous feedback');
                    }
                }
                else {
                    // For non-anonymous feedback, require authentication and proper authorization
                    if (!context.user) {
                        throw new apollo_server_express_1.AuthenticationError('You must be logged in');
                    }
                    if (feedback.author.toString() !== context.user.id && context.user.role !== 'admin') {
                        throw new apollo_server_express_1.AuthenticationError('Not authorized to update this feedback');
                    }
                }
                const updatedFeedback = await Feedback_1.Feedback.findByIdAndUpdate(id, { $set: { status } }, { new: true })
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                pubsub.publish('FEEDBACK_UPDATED', {
                    feedbackUpdated: updatedFeedback,
                });
                // Notify followers
                pubsub.publish('USER_FEEDBACK_UPDATED', {
                    userFeedbackUpdated: updatedFeedback,
                });
                return updatedFeedback;
            }
            catch (error) {
                logger_1.logger.error('Error updating feedback status:', error);
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
        updateFeedback: async (_, { id, input }, context) => {
            try {
                const feedback = await Feedback_1.Feedback.findById(id);
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                // For anonymous feedback, only allow status updates by admins
                if (feedback.isAnonymous) {
                    if (context.user?.role !== 'admin') {
                        throw new apollo_server_express_1.AuthenticationError('Only admins can update anonymous feedback');
                    }
                    // Only allow status updates for anonymous feedback
                    if (Object.keys(input).some((key) => key !== 'status')) {
                        throw new apollo_server_express_1.AuthenticationError('Only status can be updated for anonymous feedback');
                    }
                }
                else {
                    // For non-anonymous feedback, require authentication and proper authorization
                    if (!context.user) {
                        throw new apollo_server_express_1.AuthenticationError('You must be logged in');
                    }
                    if (feedback.author.toString() !== context.user.id && context.user.role !== 'admin') {
                        throw new apollo_server_express_1.AuthenticationError('Not authorized to update this feedback');
                    }
                }
                const updatedFeedback = await Feedback_1.Feedback.findByIdAndUpdate(id, { $set: input }, { new: true })
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                pubsub.publish('FEEDBACK_UPDATED', {
                    feedbackUpdated: updatedFeedback,
                });
                // Notify followers
                pubsub.publish('USER_FEEDBACK_UPDATED', {
                    userFeedbackUpdated: updatedFeedback,
                });
                return updatedFeedback;
            }
            catch (error) {
                logger_1.logger.error('Error updating feedback:', error);
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
        deleteFeedback: async (_, { id }, context) => {
            try {
                const feedback = await Feedback_1.Feedback.findById(id);
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                // For anonymous feedback, only allow deletion by admins
                if (feedback.isAnonymous) {
                    if (context.user?.role !== 'admin') {
                        throw new apollo_server_express_1.AuthenticationError('Only admins can delete anonymous feedback');
                    }
                }
                else {
                    // For non-anonymous feedback, require authentication and proper authorization
                    if (!context.user) {
                        throw new apollo_server_express_1.AuthenticationError('You must be logged in');
                    }
                    if (feedback.author.toString() !== context.user.id && context.user.role !== 'admin') {
                        throw new apollo_server_express_1.AuthenticationError('Not authorized to delete this feedback');
                    }
                }
                await Feedback_1.Feedback.findByIdAndDelete(id);
                return true;
            }
            catch (error) {
                logger_1.logger.error('Error deleting feedback:', error);
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
        likeFeedback: async (_, { id }, context) => {
            if (!context.user) {
                throw new apollo_server_express_1.AuthenticationError('You must be logged in');
            }
            try {
                const feedback = await Feedback_1.Feedback.findById(id);
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                if (feedback.likedBy.includes(context.user.id)) {
                    throw new apollo_server_express_1.UserInputError('You have already liked this feedback');
                }
                const updatedFeedback = await Feedback_1.Feedback.findByIdAndUpdate(id, {
                    $inc: { likes: 1 },
                    $addToSet: { likedBy: context.user.id },
                }, { new: true })
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                pubsub.publish('FEEDBACK_UPDATED', {
                    feedbackUpdated: updatedFeedback,
                });
                return updatedFeedback;
            }
            catch (error) {
                logger_1.logger.error('Error liking feedback:', error);
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
        unlikeFeedback: async (_, { id }, context) => {
            if (!context.user) {
                throw new apollo_server_express_1.AuthenticationError('You must be logged in');
            }
            try {
                const feedback = await Feedback_1.Feedback.findById(id);
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                if (!feedback.likedBy.includes(context.user.id)) {
                    throw new apollo_server_express_1.UserInputError('You have not liked this feedback');
                }
                const updatedFeedback = await Feedback_1.Feedback.findByIdAndUpdate(id, {
                    $inc: { likes: -1 },
                    $pull: { likedBy: context.user.id },
                }, { new: true })
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                pubsub.publish('FEEDBACK_UPDATED', {
                    feedbackUpdated: updatedFeedback,
                });
                return updatedFeedback;
            }
            catch (error) {
                logger_1.logger.error('Error unliking feedback:', error);
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
        followFeedback: async (_, { id }, context) => {
            if (!context.user) {
                throw new apollo_server_express_1.AuthenticationError('You must be logged in');
            }
            try {
                const feedback = await Feedback_1.Feedback.findById(id);
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                if (feedback.followers.includes(context.user.id)) {
                    throw new apollo_server_express_1.UserInputError('You are already following this feedback');
                }
                const updatedFeedback = await Feedback_1.Feedback.findByIdAndUpdate(id, {
                    $addToSet: { followers: context.user.id },
                }, { new: true })
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                pubsub.publish('FEEDBACK_UPDATED', {
                    feedbackUpdated: updatedFeedback,
                });
                return updatedFeedback;
            }
            catch (error) {
                logger_1.logger.error('Error following feedback:', error);
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
        unfollowFeedback: async (_, { id }, context) => {
            if (!context.user) {
                throw new apollo_server_express_1.AuthenticationError('You must be logged in');
            }
            try {
                const feedback = await Feedback_1.Feedback.findById(id);
                if (!feedback) {
                    throw new apollo_server_express_1.UserInputError('Feedback not found');
                }
                if (!feedback.followers.includes(context.user.id)) {
                    throw new apollo_server_express_1.UserInputError('You are not following this feedback');
                }
                const updatedFeedback = await Feedback_1.Feedback.findByIdAndUpdate(id, {
                    $pull: { followers: context.user.id },
                }, { new: true })
                    .populate('author')
                    .populate('assignedTo')
                    .populate('likedBy')
                    .populate('followers');
                pubsub.publish('FEEDBACK_UPDATED', {
                    feedbackUpdated: updatedFeedback,
                });
                return updatedFeedback;
            }
            catch (error) {
                logger_1.logger.error('Error unfollowing feedback:', error);
                throw error;
            }
        },
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
            subscribe: (_, { feedbackId }, context) => {
                if (!context.user) {
                    throw new apollo_server_express_1.AuthenticationError('You must be logged in');
                }
                return pubsub.asyncIterator(['FEEDBACK_UPDATED']);
            },
            resolve: (payload) => {
                return payload.feedbackUpdated;
            },
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
            subscribe: (_, { userId }, context) => {
                if (!context.user) {
                    throw new apollo_server_express_1.AuthenticationError('You must be logged in');
                }
                if (context.user.id !== userId && context.user.role !== 'admin') {
                    throw new apollo_server_express_1.AuthenticationError('Not authorized to subscribe to these updates');
                }
                return pubsub.asyncIterator(['USER_FEEDBACK_UPDATED']);
            },
            resolve: (payload) => {
                return payload.userFeedbackUpdated;
            },
        },
    },
    Feedback: {
        /**
         * Resolve author field for Feedback type
         * @param {any} parent - Parent resolver result
         * @returns {Promise<Object|null>} User object or null
         */
        author: async (parent) => {
            const user = await User_1.User.findById(parent.author);
            return user ? convertUserObject(user) : null;
        },
        /**
         * Resolve assignedTo field for Feedback type
         * @param {any} parent - Parent resolver result
         * @returns {Promise<Object|null>} User object or null
         */
        assignedTo: async (parent) => {
            if (!parent.assignedTo)
                return null;
            const user = await User_1.User.findById(parent.assignedTo);
            return user ? convertUserObject(user) : null;
        },
        /**
         * Resolve comments field for Feedback type
         * @param {any} parent - Parent resolver result
         * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
         * @returns {Promise<Array>} Array of comments
         */
        comments: async (parent, { limit = 10, offset = 0 }) => {
            const comments = await Comment_1.Comment.find({ feedback: parent._id })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .populate('author')
                .populate('likedBy');
            return comments.map((comment) => ({
                ...comment.toObject(),
                id: convertIdToString(comment._id),
                _id: convertIdToString(comment._id),
                author: comment.author ? convertUserObject(comment.author) : null,
                likedBy: comment.likedBy.map((user) => convertUserObject(user)),
            }));
        },
        /**
         * Resolve responses field for Feedback type
         * @param {any} parent - Parent resolver result
         * @param {{ limit?: number; offset?: number }} param1 - Pagination parameters
         * @returns {Promise<Array>} Array of responses
         */
        responses: async (parent, { limit = 10, offset = 0 }) => {
            const responses = await Response_1.Response.find({ feedback: parent._id })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .populate('by')
                .populate('likedBy');
            return responses.map((response) => ({
                ...response.toObject(),
                id: convertIdToString(response._id),
                _id: convertIdToString(response._id),
                by: response.by ? convertUserObject(response.by) : null,
                likedBy: response.likedBy.map((user) => convertUserObject(user)),
            }));
        },
        /**
         * Resolve followerCount field for Feedback type
         * @param {any} parent - Parent resolver result
         * @returns {Promise<number>} Number of followers
         */
        followerCount: async (parent) => {
            return await Feedback_1.Feedback.findById(parent._id).then((feedback) => feedback?.followers?.length || 0);
        },
        /**
         * Resolve isFollowing field for Feedback type
         * @param {any} parent - Parent resolver result
         * @param {any} _ - Arguments
         * @param {any} context - GraphQL context
         * @returns {Promise<boolean|null>} Whether user is following
         */
        isFollowing: async (parent, _, context) => {
            if (!context.user)
                return null;
            return await Feedback_1.Feedback.findById(parent._id).then((feedback) => feedback?.followers?.includes(context.user.id) || false);
        },
        /**
         * Resolve likesCount field for Feedback type
         * @param {any} parent - Parent resolver result
         * @returns {Promise<number>} Number of likes
         */
        likesCount: async (parent) => {
            return await Feedback_1.Feedback.findById(parent._id).then((feedback) => feedback?.likedBy?.length || 0);
        },
        /**
         * Resolve hasLiked field for Feedback type
         * @param {any} parent - Parent resolver result
         * @param {any} _ - Arguments
         * @param {any} context - GraphQL context
         * @returns {Promise<boolean|null>} Whether user has liked
         */
        hasLiked: async (parent, _, context) => {
            if (!context.user)
                return null;
            return await Feedback_1.Feedback.findById(parent._id).then((feedback) => feedback?.likedBy?.includes(context.user.id) || false);
        },
    },
};
