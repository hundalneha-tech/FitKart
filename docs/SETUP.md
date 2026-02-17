# FitKart Setup Guide

## Prerequisites
- Node.js 16+
- npm 7+ or yarn 1.22+
- PostgreSQL 12+
- Redis 6+
- Git

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/FitKart.git
cd FitKart
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure .env with your settings
# - Database credentials
# - JWT secret
# - Google Fit API keys
# - Shopify API credentials

# Start PostgreSQL and Redis (if not using Docker)
# Or run: docker-compose up postgres redis

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Mobile Setup

```bash
cd ../mobile

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure .env with your settings

# For iOS (macOS only)
npm run ios

# For Android (requires Android Studio)
npm run android
```

### 4. Admin Panel Setup

```bash
cd ../admin-panel

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure .env with your settings

# Start development server
npm run dev
```

Admin panel will run on `http://localhost:3001`

## Using Docker Compose

```bash
# Build and start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f admin
```

Services will be available at:
- Backend: `http://localhost:3000`
- Admin Panel: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Database Setup

### Create Database
```bash
createdb -U fitkart_user fitkart
```

### Run Migrations
```bash
cd backend
npm run migrate
```

### Seed Database
```bash
npm run seed
```

## Environment Variables

Create `.env` files in each directory using the `.env.example` templates.

### Key Variables to Configure:

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate a strong one)
- `REDIS_URL` - Redis connection string
- `SHOPIFY_ACCESS_TOKEN` - Your Shopify store access token

**Mobile:**
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_FIT_CLIENT_ID` - For step tracking on Android

**Admin:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Development Workflow

### Running All Services

Option 1: Docker Compose (Recommended)
```bash
docker-compose up
```

Option 2: Manual (3 terminal windows)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Admin Panel
cd admin-panel && npm run dev

# Terminal 3 - Mobile
cd mobile && npm run ios  # or npm run android
```

## Testing

### Backend
```bash
cd backend
npm test
npm run test:watch
```

### Mobile
```bash
cd mobile
npm test
```

### Admin Panel
```bash
cd admin-panel
npm test
```

## Code Quality

### Linting
```bash
# Backend
cd backend && npm run lint

# Mobile
cd mobile && npm run lint

# Admin
cd admin-panel && npm run lint
```

### Type Checking
```bash
# All projects have TypeScript
npm run type-check
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Redis Connection Error
- Verify Redis is running
- Check REDIS_URL in .env
- Default: `redis://localhost:6379`

### Mobile Emulator Issues
- Android: Ensure Android Studio is installed
- iOS: Requires macOS and Xcode

## Next Steps

1. Read [API Documentation](./API.md)
2. Review [Deployment Guide](./DEPLOYMENT.md)
3. Check [Database Schema](./DATABASE.md)

## Support

For issues, check:
1. GitHub Issues
2. Documentation
3. Contact: support@fitkart.com
