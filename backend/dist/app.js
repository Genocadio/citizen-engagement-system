"use strict";
/**
 * @fileoverview Main application file for CitizenES Backend
 * @description Sets up Express server with Apollo GraphQL, Socket.IO, and MongoDB integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const typeDefs_1 = require("./api/graphql/schema/typeDefs");
const resolvers_1 = require("./api/graphql/resolvers");
const logger_1 = require("./utils/logger");
const db_1 = __importDefault(require("./config/db"));
const chat_gateway_1 = require("./chat/chat.gateway");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("./models/User");
/**
 * Express application instance
 * @type {express.Application}
 */
exports.app = (0, express_1.default)();
// Connect to MongoDB
(0, db_1.default)();
/**
 * HTTP server instance
 * @type {http.Server}
 */
const httpServer = (0, http_1.createServer)(exports.app);
/**
 * Socket.IO server instance
 * @type {Server}
 */
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
// Initialize Chat Gateway
new chat_gateway_1.ChatGateway(exports.io);
/**
 * Apollo GraphQL server instance
 * @type {ApolloServer}
 */
const apolloServer = new server_1.ApolloServer({
    typeDefs: typeDefs_1.typeDefs,
    resolvers: resolvers_1.resolvers,
    plugins: [
        {
            async serverWillStart() {
                logger_1.logger.info('🚀 Apollo Server starting up!');
            },
        },
    ],
});
// Middleware
exports.app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
exports.app.use(express_1.default.json());
/**
 * Starts the Apollo Server and sets up the GraphQL endpoint
 * @async
 * @function startApolloServer
 * @throws {Error} If server fails to start
 */
const startApolloServer = async () => {
    await apolloServer.start();
    exports.app.use('/graphql', (0, express4_1.expressMiddleware)(apolloServer, {
        context: async ({ req }) => {
            // Add auth context here
            const token = req.headers.authorization?.replace('Bearer ', '');
            let user = null;
            if (token) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                    if (typeof decoded === 'object' && 'id' in decoded) {
                        user = await User_1.User.findById(decoded.id).select('-password');
                    }
                }
                catch (error) {
                    logger_1.logger.error('Error verifying token:', error);
                }
            }
            return { req, user };
        },
    }));
};
/**
 * Socket.IO connection event handlers
 */
exports.io.on('connection', (socket) => {
    logger_1.logger.info(`Socket connected: ${socket.id}`);
    socket.on('join-room', (feedbackId) => {
        socket.join(feedbackId);
        logger_1.logger.info(`Socket ${socket.id} joined room: ${feedbackId}`);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Socket disconnected: ${socket.id}`);
    });
});
// Start the server
startApolloServer().catch((err) => {
    logger_1.logger.error('Failed to start Apollo Server:', err);
    process.exit(1);
});
