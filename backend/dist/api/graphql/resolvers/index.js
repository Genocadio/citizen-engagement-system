"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const auth_resolvers_1 = require("./auth.resolvers");
const feedback_resolvers_1 = require("./feedback.resolvers");
const comment_resolvers_1 = require("./comment.resolvers");
const user_resolvers_1 = require("./user.resolvers");
const response_resolvers_1 = require("./response.resolvers");
exports.resolvers = {
    Query: {
        ...user_resolvers_1.userResolvers.Query,
        ...feedback_resolvers_1.feedbackResolvers.Query,
        ...comment_resolvers_1.commentResolvers.Query,
        ...response_resolvers_1.responseResolvers.Query,
    },
    Mutation: {
        ...auth_resolvers_1.authResolvers.Mutation,
        ...feedback_resolvers_1.feedbackResolvers.Mutation,
        ...comment_resolvers_1.commentResolvers.Mutation,
        ...response_resolvers_1.responseResolvers.Mutation,
        ...user_resolvers_1.userResolvers.Mutation,
    },
    Subscription: {
        ...feedback_resolvers_1.feedbackResolvers.Subscription,
        ...comment_resolvers_1.commentResolvers.Subscription,
        ...response_resolvers_1.responseResolvers.Subscription,
    },
    User: user_resolvers_1.userResolvers.User,
    Feedback: feedback_resolvers_1.feedbackResolvers.Feedback,
    Comment: comment_resolvers_1.commentResolvers.Comment,
    Response: response_resolvers_1.responseResolvers.Response,
};
