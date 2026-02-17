// FitKart Project Structure Documentation

## Project Organization

This document outlines the complete FitKart project structure and how each component fits into the overall architecture.

### Root Level Files
- `.gitignore` - Git ignore rules for all platforms
- `.docker-compose.yml` - Docker services configuration
- `README.md` - Project overview and quick start
- `package.json` - Root dependencies (if using monorepo)

### Directory Structure

#### `/mobile`
React Native mobile application with Redux state management

**Key Directories:**
- `/src/screens` - App screens (Home, Activity, Rewards, Store, Profile)
- `/src/components` - Reusable UI components
- `/src/navigation` - React Navigation setup
- `/src/services` - API clients and external service integrations
- `/src/redux` - Global state management (auth, user, steps, coins)
- `/src/utils` - Helper functions and utilities
- `/src/styles` - Theme configuration and global styles
- `/src/assets` - Icons, images, and fonts

**Key Files:**
- `package.json` - Mobile app dependencies
- `tsconfig.json` - TypeScript configuration with path aliases
- `.eslintrc.json` - Linting rules
- `.env.example` - Environment variables template

#### `/backend`
Node.js Express API server

**Key Directories:**
- `/src/config` - Configuration files (database, app, environment)
- `/src/controllers` - Request handlers for routes
- `/src/models` - Database models and schemas
- `/src/routes` - API endpoints
- `/src/services` - Business logic (steps, coins, shopping, anti-cheat)
- `/src/middleware` - Authentication, validation, error handling
- `/src/utils` - Helper functions and utilities
- `/tests` - Unit and integration tests

**Key Files:**
- `package.json` - Backend dependencies
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - Linting rules
- `.env.example` - Environment variables template
- `Dockerfile` - Docker configuration for containerization

#### `/admin-panel`
Next.js admin dashboard for platform management

**Key Directories:**
- `/pages` - Next.js pages (Dashboard, Users, Orders, Analytics)
- `/components` - Reusable admin UI components
- `/services` - API client for backend communication
- `/styles` - CSS/SCSS files (using FitKart color scheme)
- `/public` - Static assets

**Key Files:**
- `package.json` - Admin dependencies
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - Linting rules
- `.env.example` - Environment variables template

#### `/database`
Database migrations and seed data

**Key Directories:**
- `/migrations` - SQL migration files
- `/seeds` - Sample data for development

**Key Files:**
- `README.md` - Database documentation

#### `/docs`
Project documentation

**Key Files:**
- `API.md` - API endpoints documentation
- `SETUP.md` - Local development setup guide
- `DEPLOYMENT.md` - Production deployment guide
- Other architecture and design documentation

### Technology Stack

**Mobile:**
- React Native + Expo
- Redux Toolkit for state management
- TypeScript
- React Navigation
- Axios for HTTP requests

**Backend:**
- Node.js with Express
- TypeScript
- PostgreSQL for data storage
- Redis for caching
- JWT for authentication

**Admin Panel:**
- Next.js (React framework)
- TypeScript
- Redux for state management
- Recharts for analytics

**DevOps:**
- Docker & Docker Compose
- PostgreSQL database
- Redis cache
- Nginx (in production)

### Development Workflow

1. **Mobile Development**
   ```bash
   cd mobile
   npm install
   cp .env.example .env
   npm run start
   ```

2. **Backend Development**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Admin Panel Development**
   ```bash
   cd admin-panel
   npm install
   cp .env.example .env
   npm run dev
   ```

### Design System (FitKart Brand)

**Colors:**
- Primary: #028090 (Teal)
- Secondary: #00A896 (Light Teal)
- Accent: #f5576c (Red)
- Gold: #fdcb6e (Rewards/Coins)

**Typography:**
- Primary Font: Outfit (300-800 weights)
- Mono Font: Space Mono

**Spacing Scale:**
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px

**Border Radius:**
- Small: 8px
- Medium: 12px
- Base: 16px
- Large: 20px

**Animations:**
- fadeIn: 300ms ease-out
- slideUp: 400ms ease-out
- scaleIn: 300ms ease-out

### Key Features

✅ **Step Tracking** - Google Fit & Health Kit integration  
✅ **Coin System** - Earn coins from steps  
✅ **Store** - Shopify integration for redemption  
✅ **Authentication** - Google, Apple, Email/OTP  
✅ **Admin Dashboard** - User and analytics management  
✅ **Leaderboards** - Social engagement  
✅ **Anti-Cheat** - Step validation system  

### Next Steps

1. Complete Redux slices for all features
2. Implement authentication screens
3. Create core UI components
4. Set up API endpoints
5. Database schema and migrations
6. Integration testing

For more details, see individual README.md files in each directory.
