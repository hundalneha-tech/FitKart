# FitKart Admin Dashboard

**Modern Admin Interface for FitKart Platform**

A comprehensive, professionally-designed admin dashboard for managing the FitKart fitness ecosystem. Built with Next.js 14, TypeScript, Tailwind CSS, and TanStack Query for maximum performance and developer experience.

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/TanStack%20Query-5.28-FF4154?style=flat-square&logo=react)](https://tanstack.com/query/latest)

---

## ✨ Features

### 📊 Dashboard
- Real-time platform analytics
- System health monitoring
- Key performance indicators (KPIs)
- Revenue and user growth charts
- Quick action shortcuts

### 👥 User Management
- View all registered users
- Search and filter users
- Block/unblock user accounts
- User activity tracking
- User profile details
- Pagination support

### 📦 Order Management
- Track all orders
- Order details and history
- Order status updates
- Date filtering and search
- Export orders (prepared)
- Customer information

### 🛍️ Product Management
- Create new products
- Edit existing products
- Delete products
- Product categorization
- Inventory tracking
- Price management

### 🏆 Leaderboard
- Weekly rankings
- Monthly rankings
- All-time rankings
- User position tracking
- Country-based filtering
- Score breakdown

### ⚠️ Suspicious Activity
- Monitor flagged users
- Review suspicious activities
- Activity severity levels
- Take action on accounts
- Clear alerts

### ⚙️ Settings
- System configuration
- Email settings
- Payment configuration
- Rate limiting rules
- Feature toggles
- Backup management

### 🔐 Security
- JWT-based authentication
- Secure session management
- HTTPS enforced
- CORS protection
- Role-based access control
- Audit logging

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0+
- npm 8.0.0+
- FitKart Backend running (v1.0.0+)

### Installation

```bash
# Clone or navigate to the admin-dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3001`

### Login

**Demo Credentials:**
```
Email: admin@fitkart.club
Password: AdminPass123!
```

---

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── pages/              # Next.js page routes
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── public/                 # Static files
├── tests/                  # Test files (Jest)
├── .env.example           # Environment template
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

---

## 🛠️ Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check

# Run tests
npm run test

# Test coverage
npm run test:coverage
```

---

## 🔌 API Integration

The dashboard is fully integrated with the FitKart backend API. All requests are handled through:

- **API Client**: `src/lib/api.ts` - Axios instance with interceptors
- **React Query Hooks**: `src/hooks/useApi.ts` - 40+ custom hooks

### Example Usage

```typescript
import { useUsers, useProducts } from '@/hooks/useApi';

export default function AdminPage() {
  // Automatically handles caching, loading, errors
  const { data: users, isLoading } = useUsers();
  const { data: products } = useProducts();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Total Users: {users?.data.total}</h1>
      <h1>Total Products: {products?.data.total}</h1>
    </div>
  );
}
```

### Authentication

Authentication is managed through Zustand store with automatic token persistence:

```typescript
import { useAuthStore } from '@/hooks/useAuth';

const { login, logout, user, isAuthenticated } = useAuthStore();

// Login
await login(email, password);

// Check auth status
if (isAuthenticated) {
  console.log('Logged in as:', user?.email);
}

// Logout
logout();
```

---

## 🎨 Customization

### Tailwind Theme

Edit `tailwind.config.js` to customize:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#001f3f',
        },
      },
    },
  },
};
```

### Color Scheme

- **Background**: `gray-900` (dark)
- **Cards**: `gray-800`
- **Primary**: `blue-600`
- **Success**: `green-500`
- **Warning**: `yellow-500`
- **Error**: `red-500`

---

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1920px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 768px)

All pages are fully responsive with collapsible sidebar for mobile devices.

---

## 📊 Pages Overview

| Page | Route | Features |
|------|-------|----------|
| **Login** | `/login` | Authentication, demo credentials |
| **Dashboard** | `/dashboard` | Analytics, charts, KPIs |
| **Users** | `/users` | User table, search, block/unblock |
| **Products** | `/products` | Product grid, CRUD operations |
| **Orders** | `/orders` | Order tracking, filters |
| **Leaderboard** | `/leaderboard` | Rankings, weekly/monthly/all-time |
| **Suspicious** | `/suspicious` | Flag review, activity logs |
| **Settings** | `/settings` | System configuration |

---

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in `tests/` directory with Jest and React Testing Library.

---

## 🌐 Environment Variables

Create `.env.local` from `.env.example`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Application
NEXT_PUBLIC_APP_NAME=FitKart Admin
NEXT_PUBLIC_VERSION=1.0.0
NODE_ENV=development

# Feature Flags
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_MONITORING_ENABLED=true
```

For production deployment, update:
- `NEXT_PUBLIC_API_URL` to production backend
- `NEXTAUTH_URL` to production domain
- `NEXTAUTH_SECRET` to strong random string
- `NODE_ENV` to `production`

---

## 📦 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel deploy --prod
```

### Docker

```bash
# Build
docker build -t fitkart-admin .

# Run
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=https://api.fitkart.club \
  fitkart-admin
```

### Manual

```bash
npm run build
npm start
```

---

## 📚 Documentation

- [**Setup Guide**](./SETUP_GUIDE.md) - Detailed setup instructions
- [**API Documentation**](../API_DOCUMENTATION.md) - Backend API reference
- [**Deployment Guide**](../DEPLOYMENT_GUIDE.md) - Production deployment

---

## 🔐 Security

- ✅ JWT token-based authentication
- ✅ Secure password hashing
- ✅ HTTPS/TLS encryption
- ✅ Environment variable protection
- ✅ CORS headers configured
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Rate limiting ready

**Production Security Checklist:**
- [ ] HTTPS enabled
- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] API keys rotated
- [ ] Rate limiting enabled
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Logs reviewed

---

## 🐛 Troubleshooting

### Connection Refused

```
Error: Failed to connect to backend
```

**Solution**: Ensure backend is running at `NEXT_PUBLIC_API_URL`

```bash
# Check backend health
curl http://localhost:3000/health
```

### Port Already in Use

```bash
# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### API Errors

Check:
1. Backend is running
2. Environment variables correct
3. Network/firewall settings
4. Authentication tokens valid

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Code Standards:**
- TypeScript strict mode
- ESLint compliance
- Prettier formatting
- 80%+ test coverage

---

## 📋 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 14.0.0 |
| **Language** | TypeScript | 5.3.0 |
| **UI Framework** | React | 18.2.0 |
| **Styling** | Tailwind CSS | 3.3.0 |
| **HTTP Client** | Axios | 1.6.0 |
| **State Management** | TanStack Query | 5.28.0 |
| | Zustand | 4.4.0 |
| **Charts** | Recharts | 2.10.0 |
| **Icons** | Lucide React | 0.294.0 |
| **Testing** | Jest | 29.0.0 |
| | React Testing Library | 14.0.0 |
| **Linting** | ESLint | 8.0.0 |
| | Prettier | 3.0.0 |

---

## 📄 License

This project is part of the FitKart platform. See [LICENSE](../LICENSE) for details.

---

## 📞 Support

For issues, feature requests, or questions:

1. Check [Troubleshooting](#-troubleshooting) section
2. Review [Setup Guide](./SETUP_GUIDE.md)
3. Check [API Documentation](../API_DOCUMENTATION.md)
4. Open an issue on GitHub

---

## 🎯 Roadmap

- ✅ Core dashboard pages
- ✅ User management
- ✅ Product management
- 🔄 Advanced analytics
- 🔄 Report generation
- 🔄 Admin notifications
- 📋 Mobile app optimizations
- 📋 Real-time updates (WebSocket)
- 📋 Bulk operations
- 📋 Custom dashboards

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: February 17, 2026

---

## 🙌 Credits

Built with ❤️ for the FitKart platform.

**Technologies**: Next.js • React • TypeScript • Tailwind CSS • TanStack Query
