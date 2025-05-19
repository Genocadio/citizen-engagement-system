# Citizen Engagement System (CES)

A modern citizen engagement platform built with Next.js, TypeScript, and Node.js that enables citizens to provide feedback and interact with government services.

## 🌐 Live Demo

The application is deployed and accessible at:
- User Portal: [https://ces-gdth.onrender.com/user](https://ces-gdth.onrender.com/user)
- Admin Portal: [https://ces-gdth.onrender.com/admin](https://ces-gdth.onrender.com/admin)

### Demo Credentials

#### Admin Access
- Email: geno@email.com
- Password: 123456

#### User Access
- Register a new account through the user portal

## 🏗️ Project Structure

The project consists of two main parts:

```
citizen-engagement-system/
├── frontend/         # Next.js frontend application
└── backend/          # Node.js backend API
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Docker (optional, for containerized development)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file and add:
```env
NEXT_PUBLIC_API_URL=your_api_url
```

4. Start the development server:
```bash
pnpm dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file and configure your environment variables

4. Start the development server:
```bash
pnpm dev
```

## 🐳 Docker Development

Both frontend and backend can be run using Docker Compose:

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up frontend
docker-compose up backend
```

## 📚 Features

### User Features
- User registration and authentication
- Submit feedback and complaints
- Track feedback status
- Comment on feedback
- Like and follow feedback
- Upload attachments
- Location-based feedback

### Admin Features
- User management
- Feedback management
- Analytics and statistics
- Response management
- Category management
- Priority management

## 🔧 API Documentation

The backend provides a GraphQL API with the following main types:

- User Management
- Feedback Management
- Comments and Responses
- Analytics and Statistics

For detailed API documentation, refer to the backend README.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Clear build directories
   - Remove node_modules and reinstall
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check for proper variable naming

3. **Performance Issues**
   - Use Chrome DevTools for performance profiling
   - Check for unnecessary re-renders
   - Optimize images and assets

## 📞 Support

For support, please open an issue in the repository or contact the development team. 