# FitKart Backend - Setup & Running Guide

## 📋 Prerequisites

Before setting up the FitKart backend, ensure you have:

- **Node.js** >= 16.x
- **npm** >= 8.x or **yarn** >= 3.x
- **PostgreSQL** >= 12.x (running locally or accessible)
- **Redis** >= 7.x (running locally or accessible)
- **.env file** configured with required variables (see below)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install npm packages
npm install

# Or using yarn
yarn install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fitkart
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_SSL=false
DATABASE_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Authentication
JWT_SECRET=your_secret_key_here_min_32_chars_recommended
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
OTP_EXPIRY=10m

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Encryption
ENCRYPTION_KEY=your_32_char_encryption_key_here

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# AWS (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Shopify (Optional)
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_SHOP_NAME=
```

### 3. Setup Database

```bash
# Create database (if not exists)
createdb fitkart

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 4. Start Development Server

```bash
# Start with hot-reload
npm run dev

# You should see:
# 🚀 Starting FitKart Backend Server...
# 📌 Environment: development
# 🔌 Port: 3000
# ...
# ✨ API Server: http://localhost:3000
# 🏥 Health: http://localhost:3000/health
```

## 📚 Available Scripts

```bash
# Start production server
npm start

# Start development server (with hot-reload)
npm run dev

# Build TypeScript to JavaScript
npm build

# Run migrations
npm run migrate

# Create a new migration
npm run migrate:create

# Seed database with initial data
npm run seed

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Type check without emitting
npm run type-check
```

## 🏥 Health Check

Test if the server is running:

```bash
curl http://localhost:3000/health

# Response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T10:30:00Z",
#   "uptime": 125.34
# }
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new account
- `POST /api/v1/auth/login` - Login with credentials
- `POST /api/v1/auth/send-otp` - Send OTP for passwordless login
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/stats` - Get user statistics
- `GET /api/v1/users/:id/public` - Get public profile
- `POST /api/v1/users/picture` - Upload profile picture

### Coins & Wallet
- `GET /api/v1/coins/balance` - Get wallet balance
- `GET /api/v1/coins/history` - Get transaction history
- `POST /api/v1/coins/spend` - Spend coins
- `POST /api/v1/coins/freeze` - Freeze coins (orders)
- `POST /api/v1/coins/unfreeze` - Refund frozen coins

### Step Tracking
- `POST /api/v1/steps/record` - Record steps
- `GET /api/v1/steps/today` - Today's steps
- `GET /api/v1/steps/weekly` - Weekly stats
- `GET /api/v1/steps/monthly` - Monthly stats
- `GET /api/v1/steps/history` - History

### Store & Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/store/products` - Get products
- `GET /api/v1/store/search` - Search products

### Achievements & Leaderboard
- `GET /api/v1/achievements` - Get achievements
- `GET /api/v1/leaderboard/weekly` - Weekly rankings
- `GET /api/v1/leaderboard/monthly` - Monthly rankings
- `GET /api/v1/leaderboard/all-time` - All-time rankings

### Admin
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/analytics` - Platform analytics
- `GET /api/v1/admin/settings` - Get settings
- `GET /api/v1/admin/suspicious` - Suspicious activities

## 🐛 Troubleshooting

### Cannot connect to database
```bash
# Check PostgreSQL is running
psql -U postgres

# Check connection parameters in .env
# DATABASE_HOST should be correct
# DATABASE_USER and DATABASE_PASSWORD should match

# Verify database exists
psql -U postgres -l | grep fitkart
```

### Cannot connect to Redis
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Port already in use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript compilation errors
```bash
# Check for type errors
npm run type-check

# Fix common issues
npm run lint -- --fix
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── config/
│   │   ├── database.ts       # TypeORM config
│   │   └── redis.ts          # Redis config
│   ├── middleware/           # Express middleware
│   ├── models/               # TypeORM entities
│   ├── repositories/         # Data access layer
│   ├── services/             # Business logic
│   ├── controllers/          # HTTP request handlers
│   ├── routes/               # API routes
│   ├── utils/                # Utilities
│   └── types/                # TypeScript types
├── migrations/               # TypeORM migrations
├── tests/                    # Test files
├── .env.example             # Example env file
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md                # Setup guide
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secret**: Use a strong, random secret (min 32 characters)
3. **CORS**: Restrict to specific domains
4. **Rate Limiting**: Enable rate limiting for sensitive endpoints
5. **Helmet**: Security headers are enabled by default
6. **Database**: Use strong passwords, enable SSL in production
7. **Redis**: Protect with password in production

## 🚢 Deployment

### Docker
```bash
# Build Docker image
docker build -t fitkart-backend .

# Run container
docker run -p 3000:3000 --env-file .env fitkart-backend
```

### Horizontal Scaling
- Use load balancer (NGINX, HAProxy)
- Ensure Redis is on separate server
- Use managed PostgreSQL service
- Use environment-specific .env files

## 📊 Monitoring

### Database Connection Pool
- Max connections: 20 (configurable)
- Idle timeout: 30 seconds
- Connection timeout: 5 seconds

### Rate Limiting
- Auth endpoints: 10 requests/minute
- API endpoints: 1000 requests/hour
- Sensitive endpoints: 5 requests/minute
- Public endpoints: 100 requests/minute

### Logging
- Request logging via Morgan
- Error logging to console
- Optionally: Send to ELK stack or CloudWatch

## 📞 Support

For issues and questions:
1. Check the README.md
2. Review error logs
3. Check database connection
4. Verify environment variables
5. Run tests: `npm test`

## 📝 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Redis Documentation](https://redis.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
