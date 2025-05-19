"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const Comment_1 = require("../models/Comment");
const Feedback_1 = require("../models/Feedback");
const logger_1 = require("../utils/logger");
class ChatGateway {
    constructor(io) {
        this.io = io;
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`Socket connected: ${socket.id}`);
            // Join feedback room
            socket.on('join-feedback', async (feedbackId) => {
                try {
                    const feedback = await Feedback_1.Feedback.findById(feedbackId);
                    if (!feedback) {
                        socket.emit('error', 'Feedback not found');
                        return;
                    }
                    if (!feedback.chatEnabled) {
                        socket.emit('error', 'Chat is not enabled for this feedback');
                        return;
                    }
                    socket.join(feedbackId);
                    logger_1.logger.info(`Socket ${socket.id} joined feedback room: ${feedbackId}`);
                }
                catch (error) {
                    logger_1.logger.error('Error joining feedback room:', error);
                    socket.emit('error', 'Failed to join feedback room');
                }
            });
            // Handle new messages
            socket.on('send-message', async (data) => {
                try {
                    const { feedbackId, message, authorId, authorName } = data;
                    const feedback = await Feedback_1.Feedback.findById(feedbackId);
                    if (!feedback || !feedback.chatEnabled) {
                        socket.emit('error', 'Invalid feedback or chat disabled');
                        return;
                    }
                    const comment = await Comment_1.Comment.create({
                        message,
                        feedback: feedbackId,
                        author: authorId,
                        authorName,
                    });
                    // Broadcast to all clients in the room
                    this.io.to(feedbackId).emit('new-message', {
                        id: comment._id,
                        message: comment.message,
                        authorName: comment.authorName,
                        createdAt: comment.createdAt,
                    });
                    logger_1.logger.info(`New message in feedback ${feedbackId} from ${authorName}`);
                }
                catch (error) {
                    logger_1.logger.error('Error sending message:', error);
                    socket.emit('error', 'Failed to send message');
                }
            });
            // Handle disconnection
            socket.on('disconnect', () => {
                logger_1.logger.info(`Socket disconnected: ${socket.id}`);
            });
        });
    }
}
exports.ChatGateway = ChatGateway;
