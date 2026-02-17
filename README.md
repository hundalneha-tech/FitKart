# 🏃 FitKart - Fitness Tracking Platform

> A comprehensive, production-ready fitness tracking platform built with Node.js, Express, PostgreSQL, and React Native. Users earn coins for physical activity that can be redeemed in an integrated store.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Backend](https://img.shields.io/badge/backend-production--ready-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features

🚀 **User Management**
- User registration and authentication with JWT tokens
- OTP-based passwordless login
- Role-based access control (user/admin)
- Profile management with picture uploads
- Activity tracking and statistics

🏆 **Fitness Tracking**
- Step recording with anti-cheat detection
- Daily/weekly/monthly statistics
- Streak calculation (consecutive days)
- Personal best tracking
- Activity flagging for suspicious patterns
- Geographic leaderboards

💰 **Coin Economy**
- Earn coins for physical activity
- Spend coins to purchase products
- Transaction history with filtering
- Coin freezing for orders
- Admin coin management
- Wallet balance tracking

🛍️ **E-Commerce Integration**
- Product catalog with categories
- Shopping cart with coin payments
- Order management and tracking
- Product recommendations

🏅 **Achievement System**
- 14 predefined achievement badges
- Unlock achievements based on milestones
- Achievement leaderboards
- Progress tracking

📊 **Leaderboards**
- Weekly, monthly, and all-time rankings
- Country-specific leaderboards
- Friend rankings
- Cache optimization with Redis

⚙️ **Admin Dashboard**
- User management (blocking, roles, analytics)
- Suspicious activity review
- System health monitoring
- Configuration management

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet, CORS, bcryptjs

### Testing
- **Jest**: 230+ test cases
- **Coverage**: 75%+
- **Integration**: Service and controller tests

### DevOps
- **Docker & Docker Compose**
- **Monitoring**: Prometheus, Grafana, Loki
- **Reverse Proxy**: Nginx

---

## 📁 Project Structure

```
FitKart/
├── backend/
│   ├── src/
│   │   ├── entities/          # Database models (14 entities)
│   │   ├── repositories/      # Data access layer
│   │   ├── services/          # Business logic (9 services)
│   │   ├── controllers/       # HTTP handlers (9 controllers)
│   │   ├── routes/            # Endpoints (81 total)
│   │   ├── middleware/        # Custom middleware
│   │   └── utils/             # Helpers
│   ├── test/                  # Tests (230+ cases)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml         # Base configuration
├── docker-compose.dev.yml     # Development
├── docker-compose.prod.yml    # Production + monitoring
├── DOCKER_GUIDE.md           # Docker documentation
├── API_DOCUMENTATION.md      # 81 endpoints
├── SETUP_GUIDE.md           # Development setup
├── DEPLOYMENT_GUIDE.md      # Production deployment
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose ([Install](https://docs.docker.com/get-docker/))
- OR Node.js 18+ & PostgreSQL 14+

### Docker Setup (Recommended)

```bash
# Clone and setup
git clone https://github.com/yourusername/FitKart.git
cd FitKart

# Auto-setup everything
bash scripts/docker-setup.sh setup development

# On Windows:
scripts\docker-setup.bat setup development

# Services ready at:
# Backend: http://localhost:3000
# pgAdmin: http://localhost:5050
# Redis Commander: http://localhost:8081
```

### Local Setup

```bash
cd backend

# Install dependencies
npm install

# Setup database
cp .env.example .env
createdb fitkart
npm run migrate

# Start Redis locally
redis-server &

# Run development server
npm run dev
```

### Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Expected: {"status": "ok", "timestamp": "..."}
```

---

## 📚 API Documentation

### Endpoints Overview

| Domain | Endpoints | Docs |
|--------|-----------|------|
| Auth | 8 | Register, Login, OTP, Tokens |
| Users | 11 | Profile, Stats, Search |
| Coins | 8 | Balance, History, Spend |
| Steps | 9 | Record, Daily/Weekly/Monthly |
| Orders | 9 | Create, Confirm, Track |
| Achievements | 7 | Badges, Progress |
| Leaderboards | 7 | Rankings, Country |
| Store | 8 | Products, Search |
| Admin | 14 | Users, Analytics, Reports |
| **TOTAL** | **81** | [See Full Docs](./API_DOCUMENTATION.md) |

### Sample Request

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "phone": "+1234567890",
    "country": "US"
  }'
```

### Sample Response

```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-02-17T10:30:00Z"
  },
  "message": "User registered successfully",
  "timestamp": "2024-02-17T10:30:00Z"
}
```

**Full API documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 💻 Development

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed local development setup.

### Available Scripts

```bash
npm run dev              # Start with hot reload
npm test                 # Run all tests
npm run test:coverage    # Coverage report
npm run migrate          # Database migrations
npm run lint             # Code quality
```

### Project Stats

- **12,000+** lines of backend code
- **81** REST endpoints
- **230+** test cases
- **17** database tables
- **75%+** test coverage
- **9** service classes
- **9** controller classes

---

## 🧪 Testing

Comprehensive test suite with **230+ test cases**.

```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific test type
npm run test:services      # Service tests
npm run test:controllers   # Controller tests
npm run test:integration   # Integration tests
```

See [backend/test/TESTING_GUIDE.md](./backend/test/TESTING_GUIDE.md) for details.

---

## 🐳 Deployment

### Docker Setup

```bash
# Development
bash scripts/docker-setup.sh setup development

# Production
bash scripts/docker-setup.sh setup production
```

### Production Services

- ✅ 3 Backend replicas
- ✅ PostgreSQL + Backups
- ✅ Redis Cache
- ✅ Nginx Reverse Proxy
- ✅ Prometheus (Metrics)
- ✅ Grafana (Dashboards)
- ✅ Loki (Logging)

Full deployment guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Docker documentation: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

## 🔐 Security

✅ JWT authentication with refresh tokens  
✅ OTP passwordless login  
✅ Password hashing (bcryptjs)  
✅ Role-based access control  
✅ 5-tier rate limiting (Redis)  
✅ Helmet security headers  
✅ CORS protection  
✅ SQL injection prevention  
✅ Input validation (Joi)  
✅ Error handling without data leaks  

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow code standards (TypeScript, ESLint)
4. Write tests for new features
5. Update documentation
6. Push and open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📞 Support

- 📚 **Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 🐳 **Docker Help**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- 🔧 **Setup Issues**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 🚀 **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 🧪 **Testing**: [backend/test/TESTING_GUIDE.md](./backend/test/TESTING_GUIDE.md)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- ✅ Backend API (81 endpoints)
- ✅ Database design (17 tables)
- ✅ Testing suite (230+ tests)
- ✅ Docker setup

### Phase 2 🔄 (Next)
- 🔄 React Native mobile app
- 🔄 Admin web dashboard
- 🔄 Push notifications
- 🔄 Analytics dashboard

### Phase 3 📋 (Future)
- 📋 Social features
- 📋 Wearable integration
- 📋 ML recommendations
- 📋 Advanced gamification

---

**Status**: Production Ready 🚀  
**Version**: 1.0.0  
**Last Updated**: February 17, 2026

*Built with ❤️ for fitness enthusiasts worldwide*
