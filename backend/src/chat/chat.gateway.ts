import { Server, Socket } from 'socket.io';
import { Comment } from '../models/Comment';
import { Feedback } from '../models/Feedback';
import { logger } from '../utils/logger';

export class ChatGateway {
  constructor(private io: Server) {
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Join feedback room
      socket.on('join-feedback', async (feedbackId: string) => {
        try {
          const feedback = await Feedback.findById(feedbackId);
          if (!feedback) {
            socket.emit('error', 'Feedback not found');
            return;
          }

          if (!feedback.chatEnabled) {
            socket.emit('error', 'Chat is not enabled for this feedback');
            return;
          }

          socket.join(feedbackId);
          logger.info(`Socket ${socket.id} joined feedback room: ${feedbackId}`);
        } catch (error) {
          logger.error('Error joining feedback room:', error);
          socket.emit('error', 'Failed to join feedback room');
        }
      });

      // Handle new messages
      socket.on(
        'send-message',
        async (data: {
          feedbackId: string;
          message: string;
          authorId: string;
          authorName: string;
        }) => {
          try {
            const { feedbackId, message, authorId, authorName } = data;

            const feedback = await Feedback.findById(feedbackId);
            if (!feedback || !feedback.chatEnabled) {
              socket.emit('error', 'Invalid feedback or chat disabled');
              return;
            }

            const comment = await Comment.create({
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

            logger.info(`New message in feedback ${feedbackId} from ${authorName}`);
          } catch (error) {
            logger.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message');
          }
        }
      );

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }
}
