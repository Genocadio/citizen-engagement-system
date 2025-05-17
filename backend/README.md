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

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/citizen-es-backend.git
cd citizen-es-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/citizen-es
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 