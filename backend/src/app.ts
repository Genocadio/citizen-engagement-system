/**
 * @fileoverview Main application file for CitizenES Backend
 * @description Sets up Express server with Apollo GraphQL, Socket.IO, and MongoDB integration
 */

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { typeDefs } from './api/graphql/schema/typeDefs';
import { resolvers } from './api/graphql/resolvers';
import { authMiddleware } from './api/rest/middlewares/auth.middleware';
import { logger } from './utils/logger';
import connectDB from './config/db';
import { ChatGateway } from './chat/chat.gateway';
import jwt from 'jsonwebtoken';
import { User } from './models/User';

/**
 * Express application instance
 * @type {express.Application}
 */
export const app = express();

// Connect to MongoDB
connectDB();

/**
 * HTTP server instance
 * @type {http.Server}
 */
const httpServer = createServer(app);

/**
 * Socket.IO server instance
 * @type {Server}
 */
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Initialize Chat Gateway
new ChatGateway(io);

/**
 * Apollo GraphQL server instance
 * @type {ApolloServer}
 */
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    {
      async serverWillStart() {
        logger.info('🚀 Apollo Server starting up!');
      },
    },
  ],
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

/**
 * Starts the Apollo Server and sets up the GraphQL endpoint
 * @async
 * @function startApolloServer
 * @throws {Error} If server fails to start
 */
const startApolloServer = async () => {
  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        // Add auth context here
        const token = req.headers.authorization?.replace('Bearer ', '');
        let user = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            if (typeof decoded === 'object' && 'id' in decoded) {
              user = await User.findById((decoded as any).id).select('-password');
            }
          } catch (error) {
            logger.error('Error verifying token:', error);
          }
        }

        return { req, user };
      },
    })
  );
};

/**
 * Socket.IO connection event handlers
 */
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join-room', (feedbackId: string) => {
    socket.join(feedbackId);
    logger.info(`Socket ${socket.id} joined room: ${feedbackId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Start the server
startApolloServer().catch((err) => {
  logger.error('Failed to start Apollo Server:', err);
  process.exit(1);
});
