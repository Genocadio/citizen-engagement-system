# CitizenES Backend

A modern backend for the CitizenES feedback platform, built with Node.js, Express, GraphQL, and WebSocket technologies.

## Features

- 🔐 Secure authentication with JWT
- 📡 REST API for write operations
- 🎯 GraphQL API for read operations and subscriptions
- 💬 Real-time chat with Socket.IO
- 👥 Role-based access control
- 📝 Category-specific staff access
- 📦 MongoDB with Mongoose ODM
- 🔄 TypeScript for type safety
- 🐳 Docker support for both development and production
- 🚀 Render deployment ready

## Prerequisites

- Node.js (v22.15.0)
- MongoDB
- pnpm
- Docker and Docker Compose (for containerized deployment)

## Setup

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/citizen-es-backend.git
cd backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory (copy from .env.example):
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/citizen-es

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# Add other required environment variables from .env.example
```

5. Start the development server:
```bash
pnpm dev
```

### Docker Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/citizen-es-backend.git
cd backend
```

2. Create and configure your `.env` file:
```bash
cp .env.example .env
# Edit .env with your development settings
```

3. Start the development environment:
```bash
docker-compose up dev
```

This will start:
- The backend service with hot-reloading
- MongoDB database with authentication
- All necessary environment variables
- Health checks for all services

### Docker Production

1. Clone the repository:
```bash
git clone https://github.com/yourusername/citizen-es-backend.git
cd backend
```

2. Create and configure your production `.env` file:
```bash
cp .env.example .env
# Edit .env with your production settings
# Make sure to set secure values for all variables
```

3. Start the production environment:
```bash
docker-compose up prod
```

This will start:
- The optimized production backend service
- MongoDB database with authentication
- Automatic restart on failure
- Resource limits and reservations
- Health checks for all services
- Production environment variables

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=4000
     MONGODB_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-jwt-secret>
     JWT_EXPIRES_IN=7d
     CORS_ORIGIN=<your-frontend-url>
     CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
     CORS_CREDENTIALS=true
     GRAPHQL_PLAYGROUND_ENABLED=false
     ERROR_STACK_TRACE=false
     ```
4. Deploy!

Note: Make sure to set up a MongoDB database (either MongoDB Atlas or Render's MongoDB service) and use its connection string in the `MONGODB_URI` environment variable.

### Environment Variables

The application requires several environment variables to run properly. Copy `.env.example` to `.env` and configure the following:

- Server Configuration (PORT, NODE_ENV)
- MongoDB Configuration (MONGODB_URI)
- JWT Configuration (JWT_SECRET, JWT_EXPIRES_IN)
- CORS Configuration (CORS_ORIGIN, CORS_METHODS, CORS_CREDENTIALS)
- Rate Limiting (RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS)
- Security Settings (HELMET_ENABLED, XSS_PROTECTION, etc.)
- WebSocket Configuration (WS_PATH, WS_PING_TIMEOUT, etc.)
- GraphQL Configuration (GRAPHQL_PATH, GRAPHQL_PLAYGROUND_ENABLED)
- API Configuration (API_PREFIX, API_VERSION)
- Error Handling (ERROR_STACK_TRACE)

For production, ensure all sensitive values are properly secured and not committed to version control.

## API Documentation

### REST Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/feedback` - Create new feedback
- PUT `/api/feedback/:id` - Update feedback
- DELETE `/api/feedback/:id` - Delete feedback

### GraphQL Endpoints

- POST `/graphql` - GraphQL API endpoint
- WebSocket `/graphql` - GraphQL subscriptions

Example query:
```graphql
query FeedbackList($limit: Int, $offset: Int, $category: String) {
  feedbacks(limit: $limit, offset: $offset, category: $category) {
    id
    title
    type
    comments(limit: 5) {
      message
      authorName
    }
  }
}
```

### WebSocket Events

- `join-feedback` - Join a feedback chat room
- `send-message` - Send a message in a feedback chat
- `new-message` - Receive new messages

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── rest/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   └── validators/
│   │   └── graphql/
│   │       ├── schema/
│   │       ├── resolvers/
│   │       └── subscriptions/
│   ├── chat/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── app.ts
│   └── server.ts
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 