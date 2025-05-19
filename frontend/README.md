# CitzenES Frontend

A modern web application built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Docker (optional, for containerized development)

### Installation

#### Local Development

1. Clone the repository:
```bash
git clone [repository-url]
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add necessary environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url
```

4. Start the development server:
```bash
pnpm dev
```

#### Docker Development

1. Build and run the development container:
```bash
# Build the development image
docker build -t citzenes-frontend-dev -f Dockerfile.dev .

# Run the container with hot reloading
docker run -it --rm \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -v /app/.next \
  citzenes-frontend-dev
```

The development container includes:
- Hot reloading for instant code updates
- Volume mounting for local development
- Node modules and Next.js cache persistence
- Development tools and debugging capabilities

## 📚 Project Structure

```
frontend/
├── app/              # Next.js app directory (pages and layouts)
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared logic
├── public/          # Static assets
└── styles/          # Global styles and Tailwind configuration
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/settings` - Get user settings

### Content Management
- `GET /api/content` - Get content list
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

## 🚀 Deployment

### Production Build

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

### Deployment Options

1. **Vercel (Recommended)**
   - Connect your GitHub repository to Vercel
   - Configure environment variables
   - Deploy automatically on push to main branch

2. **Docker Production**
   ```bash
   # Build the production image
   docker build -t citzenes-frontend .

   # Run the production container
   docker run -d \
     -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=your_api_url \
     citzenes-frontend
   ```

   For production deployment with Docker Compose:
   ```yaml
   version: '3.8'
   services:
     frontend:
       build:
         context: .
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=your_api_url
       restart: unless-stopped
   ```

3. **Traditional Deployment**
   - Build the application using `pnpm build`
   - Deploy the `.next` directory to your hosting provider
   - Configure environment variables on your hosting platform

## 🤝 Contributing

### Development Workflow

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git commit -m "feat: your feature description"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

### Code Style Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Scalability Considerations

1. **Code Organization**
   - Use feature-based folder structure
   - Implement proper code splitting
   - Follow the Single Responsibility Principle

2. **Performance**
   - Implement proper caching strategies
   - Use Next.js Image component for optimized images
   - Implement lazy loading where appropriate
   - Monitor and optimize bundle size

3. **State Management**
   - Use React Context for global state
   - Implement proper data fetching strategies
   - Consider using SWR or React Query for data caching

### Maintainability

1. **Documentation**
   - Keep README up to date
   - Document complex components and functions
   - Use TypeScript for better type safety

2. **Testing**
   - Write unit tests for components
   - Implement integration tests
   - Use E2E testing for critical flows

3. **Code Quality**
   - Regular code reviews
   - Maintain consistent coding standards
   - Use automated testing in CI/CD

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Troubleshooting

Common issues and their solutions:

1. **Build Failures**
   - Clear `.next` directory
   - Remove `node_modules` and reinstall dependencies
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set in `.env.local`
   - Check for proper variable naming

3. **Performance Issues**
   - Use Chrome DevTools for performance profiling
   - Check for unnecessary re-renders
   - Optimize images and assets 