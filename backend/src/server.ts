import { config } from 'dotenv';
import { app } from './app';
import { logger } from './utils/logger';

// Load environment variables
config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
}); 