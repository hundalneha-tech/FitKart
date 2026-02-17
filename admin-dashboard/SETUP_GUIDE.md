# FitKart Admin Dashboard Setup Guide

**Tech Stack**: Next.js 14 + TypeScript + Tailwind CSS + TanStack Query  
**Estimated Time**: 10-15 minutes to setup  
**Status**: Production Ready

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Available Pages](#available-pages)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

The FitKart Admin Dashboard is a comprehensive management interface built with Next.js and designed to manage:

- **👥 Users**: View, search, block/unblock users
- **📦 Orders**: Track orders, view details
- **🛍️ Products**: Create, update, delete store products
- **📊 Analytics**: Dashboard with key metrics and charts
- **⚠️ Monitoring**: System health, suspicious activity
- **🏆 Leaderboards**: View user rankings
- **⚙️ Settings**: Configure platform settings

### Key Features

✅ **Beautiful Dark Theme** - Modern, professional UI  
✅ **Real-time Data** - TanStack Query for automatic cache management  
✅ **Type-Safe** - Full TypeScript support  
✅ **Responsive Design** - Works on desktop, tablet, mobile  
✅ **Fast Performance** - Next.js optimizations built-in  
✅ **Easy Deployment** - Production-ready  

---

## Prerequisites

### Required

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Backend Running**: FitKart backend API should be running (see [SETUP_GUIDE.md](../../SETUP_GUIDE.md))

### Recommended

- **Git**: For version control
- **VS Code**: Code editor with extensions
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Check Versions

```bash
node --version    # v18.x.x or higher
npm --version     # 8.x.x or higher
```

---

## Installation

### Step 1: Navigate to Admin Dashboard Directory

```bash
cd admin-dashboard
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React 18.2+
- Next.js 14
- TypeScript 5.3
- Tailwind CSS 3.3
- TanStack Query 5.28
- Recharts (for charts)
- Lucide Icons
- And more...

### Step 3: Verify Installation

```bash
npm list react next typescript
# Should show installed versions without errors
```

---

## Configuration

### Step 1: Create Environment File

```bash
cp .env.example .env.local
```

### Step 2: Edit Environment Variables

Open `.env.local` and update values:

```env
# API Configuration (point to your backend)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# For production:
# NEXT_PUBLIC_API_URL=https://www.fitkart.club/api/v1

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-strong-secret-key-min-32-chars

# Application
NEXT_PUBLIC_APP_NAME=FitKart Admin
NEXT_PUBLIC_ENVIRONMENT=development
```

### Step 3: Generate NEXTAUTH_SECRET

```bash
# Generate a secure secret
openssl rand -base64 32

# On Windows PowerShell:
# [Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes(32))
```

---

## Running Locally

### Development Server

```bash
npm run dev
```

**Output:**
```
> admin-dashboard@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3001
  - Environments: .env.local

✓ Ready in 3.2s
```

### Access the Dashboard

Open your browser and navigate to:

```
http://localhost:3001
```

### Login

Use admin credentials:

```
Email: admin@fitkart.club
Password: AdminPass123!
```

**Note**: These are demo credentials. Use actual admin account credentials from your backend.

---

## Project Structure

```
admin-dashboard/
├── src/
│   ├── pages/              # Next.js pages
│   │   ├── login.tsx       # Login page
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── users.tsx       # User management
│   │   ├── products.tsx    # Product management
│   │   ├── orders.tsx      # Order management
│   │   ├── leaderboard.tsx # Leaderboard view
│   │   ├── settings.tsx    # Settings page
│   │   └── suspicious.tsx  # Suspicious activity
│   │
│   ├── components/         # React components
│   │   ├── Layout.tsx      # Main layout with sidebar
│   │   ├── Header.tsx      # Top navigation bar
│   │   └── ...more components
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useApi.ts       # API calls & queries
│   │   └── useAuth.ts      # Authentication store
│   │
│   ├── lib/                # Utilities & helpers
│   │   ├── api.ts          # API client class
│   │   └── utils.ts        # Helper functions
│   │
│   └── types/              # TypeScript types
│       └── index.ts        # Global types
│
├── public/                 # Static files
├── .env.example           # Environment template
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config
├── next.config.js         # Next.js config
├── package.json           # Dependencies
└── README.md              # This file
```

---

## Available Pages

### 1. Login Page

**URL**: `http://localhost:3001/login`

- Email and password login
- Demo credentials display
- Error handling
- Responsive design

### 2. Dashboard

**URL**: `http://localhost:3001/dashboard`

**Features**:
- System health status
- Key statistics (users, revenue, orders)
- User growth chart
- Revenue chart
- Quick actions
- Recent activity

### 3. Users Management

**URL**: `http://localhost:3001/users`

**Features**:
- View all users in a table
- Search users by email/name
- User details (email, name, status, join date)
- Block/unblock users
- Pagination
- Responsive table

### 4. Products Management

**URL**: `http://localhost:3001/products`

**Features**:
- View all products in grid
- Add new products (form)
- Edit existing products
- Delete products
- View product details
- Categorization

### 5. Orders Management

**URL**: `http://localhost:3001/orders`

**Features**:
- View all orders
- Order details
- Status tracking
- Filter by date
- Export orders

### 6. Leaderboard

**URL**: `http://localhost:3001/leaderboard`

**Features**:
- Weekly rankings
- Monthly rankings
- All-time rankings
- Top performers
- User positions

### 7. Suspicious Activity

**URL**: `http://localhost:3001/suspicious`

**Features**:
- Review flagged users
- Activity details
- Block user action
- Clear suspicious flag

### 8. Settings

**URL**: `http://localhost:3001/settings`

**Features**:
- App configuration
- Email settings
- Payment settings
- Rate limiting
- Feature flags

---

## Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Code Style

The project uses:
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **TypeScript**: Type safety

**Auto-formatting on save** (if configured in your editor)

### Making Changes

```bash
# 1. Create new component
src/components/MyComponent.tsx

# 2. Use in a page
src/pages/mypage.tsx

# 3. Run linter
npm run lint:fix

# 4. Test locally
npm run dev

# 5. Format code
npm run format
```

---

## Deployment

### Build for Production

```bash
npm run build
```

**Output**:
```
✓ Compiled successfully
✓ Created optimized production build
```

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t fitkart-admin .

# Run container
docker run -p 3001:3001 fitkart-admin
```

### Option 3: AWS/DigitalOcean

```bash
# Build
npm run build

# Upload dist folder to server
scp -r .next ubuntu@your-server:/app/

# SSH and run
ssh ubuntu@your-server
cd /app
npm install --production
npm start
```

### Environment Variables for Production

```env
# .env.production
NEXT_PUBLIC_API_URL=https://www.fitkart.club/api/v1
NEXTAUTH_URL=https://admin.fitkart.club
NEXTAUTH_SECRET=<strong-secret-generated>
NODE_ENV=production
```

---

## Troubleshooting

### Port 3001 Already in Use

```bash
# macOS/Linux
lsof -i :3001

# Windows PowerShell
netstat -ano | findstr :3001

# Kill process
kill -9 <PID>
# or change port in next.config.js
```

### API Connection Errors

```
Error: Failed to connect to API
```

**Solutions**:
1. Check backend is running: `curl http://localhost:3000/health`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check firewall/CORS settings
4. Verify authentication token

### Dependencies Issues

```bash
# Clear cache
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Verify
npm list
```

### Build Errors

```bash
# Type check
npm run type-check

# Lint check
npm run lint

# Clear build cache
rm -rf .next
npm run build
```

### CSS Not Loading

```bash
# Tailwind CSS issues
rm -rf node_modules/.cache
npm run dev

# Force rebuild
npm run build
```

---

## API Integration

### Making API Calls

Use the provided React Query hooks:

```typescript
import { useUsers, useAnalytics } from '@/hooks/useApi';

export default function MyPage() {
  // Automatically handles caching, refetching, etc.
  const { data, isLoading, error } = useUsers();
  
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Users: {data.data.total}</p>}
    </div>
  );
}
```

### All Available Hooks

```typeScript
// Auth
useLogin()              // Login with credentials
useLogout()             // Logout user
useProfile()            // Get current user profile

// Users 
useUsers()              // Get paginated users
useUser(userId)         // Get single user
useSearchUsers(query)   // Search users
useBlockUser()          // Block a user
useUnblockUser()        // Unblock a user

// Analytics
useAnalytics()          // Get platform analytics
useSystemHealth()       // Get system status
useSuspiciousActivity() // Get flagged activities

// Orders
useOrders()             // Get all orders
useOrder(orderId)       // Get single order

// Products
useProducts()           // Get all products
useProduct(productId)   // Get single product
useCreateProduct()      // Create product
useUpdateProduct()      // Update product
useDeleteProduct()      // Delete product

// Leaderboard
useLeaderboard(type)    // Get rankings
```

---

## Security Notes

- ✅ **Authentication**: JWT-based with secure tokens
- ✅ **HTTPS**: Always use HTTPS in production
- ✅ **CORS**: Configured for your domain only
- ✅ **Environment Variables**: Never commit `.env.local`
- ✅ **API Secrets**: Keep NEXTAUTH_SECRET secure
- ✅ **Admin Only**: Always verify user is admin on backend

### Production Checklist

- [ ] HTTPS enabled
- [ ] Environment variables set correctly
- [ ] NEXTAUTH_SECRET is strong (32+ chars)
- [ ] API URL points to production backend
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Backups configured
- [ ] Monitoring enabled

---

## Performance Tips

1. **Cache Strategy**: React Query handles caching automatically
2. **Image Optimization**: Use Next.js `<Image>` component
3. **Code Splitting**: Next.js does automatic code splitting
4. **API Calls**: Queries are automatically deduplicated
5. **Production Build**: Always test production build locally

```bash
# Test production build
npm run build
npm start
```

---

## Support & Resources

- **Documentation**: [README.md](./README.md)
- **Backend API**: [API_DOCUMENTATION.md](../../API_DOCUMENTATION.md)
- **Next.js Docs**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## Common Tasks

### Add New Admin Page

```typescript
// 1. Create page in src/pages/
// src/pages/reports.tsx

import Layout from '@/components/Layout';

export default function ReportsPage() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-white">Reports</h1>
      {/* Your content */}
    </Layout>
  );
}

// 2. Page automatically added to sidebar in Layout.tsx
// 3. Access at: http://localhost:3001/reports
```

### Create New API Hook

```typescript
// src/hooks/useApi.ts

export function useMyEndpoint() {
  return useQuery({
    queryKey: ['my-endpoint'],
    queryFn: () => apiClient.get('/my-endpoint'),
  });
}

// Usage in component
import { useMyEndpoint } from '@/hooks/useApi';

const { data } = useMyEndpoint();
```

### Add API Client Method

```typescript
// src/lib/api.ts

async getMyData() {
  const response = await this.client.get('/my-endpoint');
  return response.data;
}
```

---

## Next Steps

1. **Customize** - Update branding, colors, add your logo
2. **Add Features** - Create more admin pages as needed
3. **Connect Backend** - Test all API integrations
4. **Deploy** - Get admin dashboard live
5. **Monitor** - Setup error tracking, analytics

---

**Status**: ✅ Production Ready  
**Last Updated**: February 17, 2026  
**Version**: 1.0.0
