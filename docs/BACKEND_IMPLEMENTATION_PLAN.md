# FitKart Backend Implementation Plan

## Overview

This document outlines the step-by-step implementation of the FitKart backend with 40+ REST API endpoints.

**Estimated Timeline:** 40-60 hours (~2 weeks)  
**Team Size:** 2-3 developers  
**Technology Stack:** Node.js + Express, TypeORM, PostgreSQL 12+, Redis 7, TypeScript

---

## Phase 1: Database Models & TypeORM Setup

### 1.1 TypeORM Entities (17 files)

Create entities for all database tables:

```
backend/src/models/entities/
├── User.ts                    # users table
├── RefreshToken.ts           # refresh_tokens table
├── Wallet.ts                 # wallets table
├── CoinTransaction.ts        # coin_transactions table
├── StepRecord.ts             # step_records table
├── StepValidation.ts         # step_validations table
├── Order.ts                  # orders table
├── OrderItem.ts              # order_items table
├── RewardProduct.ts          # reward_products table
├── Achievement.ts            # achievements table
├── UserAchievement.ts        # user_achievements table
├── LeaderboardCache.ts       # leaderboard_cache table
├── AdminLog.ts               # admin_logs table
├── Setting.ts                # settings table
├── ActiveUser.ts             # active_users view
├── DailyStepSummary.ts       # daily_step_summary view
└── UserStats.ts              # user_stats view
```

### 1.2 Database Connection Setup

- `backend/src/config/database.ts` - TypeORM data source configuration
- Connection pooling: 20 max connections, 5 min idle
- SSL mode for production
- Logging enabled for development

### 1.3 Migration Runner

- `backend/src/config/migrations.ts` - Run migrations on startup
- Verify database schema matches expected state

---

## Phase 2: Middleware & Infrastructure

### 2.1 Authentication Middleware

- **authMiddleware.ts** - Verify JWT token, extract user
- Bearer token parsing
- Automatic token refresh handling
- 401 response for invalid/expired tokens

### 2.2 Validation Middleware

- **validationMiddleware.ts** - Validate request body against schema
- Support for Joi and class-validator
- Return 400 with field-level errors
- Support nested object validation

### 2.3 Rate Limiting Middleware

- **rateLimitMiddleware.ts** - Redis-backed rate limiting
- Token bucket algorithm
- Different limits per endpoint type
- X-RateLimit headers in response

### 2.4 Anti-Cheat Middleware

- **antiCheatMiddleware.ts** - Real-time step validation
- Speed sanity checks (max 12 km/h)
- Distance/step ratio validation
- Flag suspicious submissions (anomaly score >80)

### 2.5 Admin Authorization Middleware

- **adminMiddleware.ts** - Verify admin role
- 403 response for non-admin users
- Support for granular permission checks

### 2.6 Cache Middleware

- **cacheMiddleware.ts** - Redis-backed response caching
- Configurable TTL per endpoint
- Cache invalidation support
- Cache-Control headers

### 2.7 Audit Logging Middleware

- **auditLogMiddleware.ts** - Log admin actions
- Track before/after state changes
- IP address and user agent logging
- Async logging to avoid blocking

### 2.8 Error Handling

- **errorHandler.ts** - Global error catch-all
- Format error responses consistently
- HTTP status code mapping
- Error logging to monitoring service
- Stack trace in development only

---

## Phase 3: Utilities & Base Classes

### 3.1 Response Wrapper

```typescript
// backend/src/utils/response.ts
export class ApiResponse<T> {
  constructor(
    public status: 'success' | 'error' | 'validation_error',
    public data?: T,
    public error?: ApiError,
    public message?: string
  ) {}
}
```

### 3.2 Error Definitions

- `backend/src/utils/errors.ts` - Custom error classes
- AuthenticationError
- ValidationError
- NotFoundError
- ConflictError
- SuspiciousActivityError

### 3.3 Validators

- `backend/src/utils/validators.ts`
- Email validation
- Password strength validation
- Pagination validation
- Date range validation

### 3.4 JWT Utilities

- `backend/src/utils/jwt.ts`
- Generate access token (15 min expiry)
- Generate refresh token (7 day expiry)
- Verify token signature
- Extract claims from token

### 3.5 Encryption Utilities

- `backend/src/utils/encryption.ts`
- Hash passwords (bcrypt)
- Compare password hashes
- Generate OTP codes
- Validate OTP codes

---

## Phase 4: Service Layer (Business Logic)

### 4.1 AuthService
- **Methods:** register(), login(), googleLogin(), appleLogin(), sendOTP(), verifyOTP(), refreshToken(), logout()
- **Dependencies:** UserRepository, RefreshTokenRepository, jwt utilities, encryption
- **Business Logic:**
  - Validate credentials
  - Generate tokens
  - Create refresh token records
  - Handle OAuth token verification

### 4.2 UserService
- **Methods:** getProfile(), updateProfile(), getStats(), getUserPublic(), uploadProfilePicture()
- **Dependencies:** UserRepository, WalletRepository, StepRecordRepository
- **Business Logic:**
  - Profile management
  - Calculate user statistics
  - Handle image uploads to S3/CDN
  - Filter sensitive data for public profiles

### 4.3 StepService
- **Methods:** recordSteps(), getTodaySteps(), getWeeklySteps(), getMonthlySteps(), getHistory()
- **Dependencies:** StepRecordRepository, StepValidationRepository, CoinService
- **Business Logic:**
  - Validate step data (anti-cheat)
  - Calculate coins earned
  - Aggregate daily/weekly/monthly stats
  - Handle multiple data sources (Google Fit, Apple Health, etc.)

### 4.4 CoinService
- **Methods:** getBalance(), getHistory(), spendCoins(), addCoins(), freezeCoins(), unfreezeCoins()
- **Dependencies:** WalletRepository, CoinTransactionRepository
- **Business Logic:**
  - Verify sufficient balance
  - Create immutable transaction records
  - Update denormalized wallet balances
  - Support coin refunds

### 4.5 OrderService
- **Methods:** createOrder(), getOrders(), getOrderDetail(), cancelOrder(), updateOrderStatus()
- **Dependencies:** OrderRepository, RewardProductRepository, CoinService, StepService
- **Business Logic:**
  - Validate inventory
  - Freeze coins from wallet
  - Create order with items
  - Manage order lifecycle (pending → delivered)
  - Handle refunds and cancellations

### 4.6 AchievementService
- **Methods:** getAll(), getUserAchievements(), unlockAchievement(), checkAndUnlockAchievements()
- **Dependencies:** AchievementRepository, UserAchievementRepository, StepRecordRepository
- **Business Logic:**
  - Determine achievement unlock criteria
  - Create user_achievement records
  - Check for milestone-based unlocks
  - Support retroactive achievement unlocks

### 4.7 LeaderboardService
- **Methods:** getWeeklyRankings(), getMonthlyRankings(), getAllTimeRankings(), getUserContext(), recalculateCache()
- **Dependencies:** LeaderboardCacheRepository, StepRecordRepository, WalletRepository
- **Business Logic:**
  - Query pre-computed cache first
  - Fall back to real-time calculation if cache stale
  - Refresh cache nightly via scheduled job
  - Calculate user percentile and rank

### 4.8 StoreService
- **Methods:** getProducts(), getProductDetail(), searchProducts(), syncWithShopify()
- **Dependencies:** RewardProductRepository
- **Business Logic:**
  - Filter by category and search
  - Validate product availability
  - Sync with Shopify for pricing
  - Handle product image CDN URLs

### 4.9 AdminService
- **Methods:** listUsers(), updateUserRole(), getAnalytics(), getSettings(), updateSetting(), getSuspiciousSteps(), approveSteps(), rejectSteps()
- **Dependencies:** All repositories, AdminLogRepository
- **Business Logic:**
  - User management
  - Platform analytics aggregation
  - Setting persistence
  - Step approval workflow with coins award/penalty

---

## Phase 5: Controller Layer (Request Handlers)

### 5.1 Structure Pattern

```typescript
export class SomeController {
  constructor(private someService: SomeService) {}

  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.someService.doSomething(req.body);
      res.status(200).json(new ApiResponse('success', result));
    } catch (error) {
      // Error handling delegated to middleware
      throw error;
    }
  }
}
```

### 5.2 AuthController (8 methods)
- register(), login(), googleLogin(), appleLogin(), sendOTP(), verifyOTP(), refreshToken(), logout()

### 5.3 UserController (6 methods)
- getProfile(), updateProfile(), uploadPicture(), getStats(), getPublicProfile(), getUserStats()

### 5.4 StepController (5 methods)
- recordSteps(), getTodaySteps(), getWeeklySteps(), getMonthlySteps(), getHistory()

### 5.5 CoinController (2 methods)
- getBalance(), getHistory()

### 5.6 OrderController (4 methods)
- createOrder(), getOrders(), getOrderDetail(), cancelOrder()

### 5.7 AchievementController (2 methods)
- getAll(), getUserAchievements()

### 5.8 LeaderboardController (4 methods)
- getWeeklyLeaderboard(), getMonthlyLeaderboard(), getAllTimeLeaderboard(), getUserContext()

### 5.9 StoreController (3 methods)
- getProducts(), getProductDetail(), searchProducts()

### 5.10 AdminController (8 methods)
- listUsers(), getAnalytics(), getSettings(), updateSetting(), getSuspiciousSteps(), approveSteps(), rejectSteps(), getAuditLogs()

---

## Phase 6: Route Configuration

### 6.1 Route Files (9 total)

```
backend/src/routes/
├── auth.routes.ts         # POST /auth/*
├── users.routes.ts        # GET/PUT /users/*
├── steps.routes.ts        # POST/GET /steps/*
├── coins.routes.ts        # GET /coins/*
├── orders.routes.ts       # POST/GET /orders/*
├── achievements.routes.ts # GET /achievements/*
├── leaderboard.routes.ts  # GET /leaderboard/*
├── store.routes.ts        # GET /store/*
└── admin.routes.ts        # GET/POST /admin/*
```

### 6.2 Route Registration Pattern

```typescript
export function setupRoutes(app: Express): void {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', authMiddleware, userRoutes);
  app.use('/api/steps', authMiddleware, stepRoutes);
  // ... etc
}
```

### 6.3 Middleware Ordering

1. Logging middleware
2. Auth middleware (for protected routes)
3. Admin check (for admin routes)
4. Validation middleware
5. Rate limiting middleware
6. Cache middleware (GET only)
7. Anti-cheat middleware (steps only)
8. Route handler
9. Audit logging middleware (POST/PUT/DELETE only)

---

## Phase 7: Server Setup & Integration

### 7.1 Main Server File (`backend/src/index.ts`)

```typescript
import express from 'express';
import { AppDataSource } from './config/database';
import { setupMiddleware } from './middleware/setup';
import { setupRoutes } from './routes/setup';

const app = express();

// Initialize database
await AppDataSource.initialize();

// Setup middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 7.2 Dependency Injection Setup

- `backend/src/config/di.ts` - Service container
- Register all services with their dependencies
- Resolve controllers with services injected

### 7.3 Environment Configuration

- `.env` file with all required variables
- Schema validation on startup
- Sensible defaults for development

---

## Implementation Order (Recommended)

### Week 1: Foundation (Days 1-3)
1. Create TypeORM entities (all 17)
2. Create middleware base files
3. Create utility/helper files
4. Create service base class
5. Create controller base class

### Week 1: Core Services (Days 4-5)
1. AuthService implementation
2. UserService implementation
3. CoinService implementation
4. StepService implementation

### Week 2: Additional Services (Day 1-2)
1. OrderService implementation
2. AchievementService implementation
3. LeaderboardService implementation
4. StoreService implementation
5. AdminService implementation

### Week 2: Controllers & Routes (Day 3-5)
1. Create all 9 controllers
2. Create all 9 route files
3. Wire up dependency injection
4. Test each endpoint
5. Fix integration issues

### Week 2+: Testing & Optimization (Day 6+)
1. Unit tests for services
2. Integration tests for API endpoints
3. Load testing and performance optimization
4. Security audit
5. Documentation completion

---

## Testing Strategy

### Unit Tests
- Service methods in isolation
- Mock repositories
- Mock external services (OAuth, Shopify)

### Integration Tests
- Full request/response cycles
- Database interactions
- Middleware chain execution

### End-to-End Tests
- Real API calls
- Database state verification
- Redis cache behavior

---

## Performance Targets

| Endpoint | Target | Method |
|----------|--------|--------|
| POST /auth/login | 200ms | Bcrypt hashing takes ~100ms |
| GET /leaderboard/weekly | 50ms | Redis cache hit |
| POST /steps/record | 100ms | Async validation |
| GET /users/me/stats | 50ms | Single join query |
| POST /orders | 250ms | Multiple transactions |
| GET /coins/balance | 10ms | Denormalized table lookup |

---

## Security Considerations

1. **Authentication:** JWT with 15-min expiry + refresh tokens
2. **Authorization:** Role-based access control (user/moderator/admin)
3. **Password Security:** Bcrypt with salt rounds = 10
4. **Rate Limiting:** 1000 req/hour per user
5. **Data Encryption:** HTTPS only in production
6. **SQL Injection:** TypeORM parameterized queries
7. **CORS:** Whitelisted origins only
8. **Helmet:** Security headers on all responses
9. **Input Validation:** Schema validation on all inputs
10. **Audit Logging:** All admin actions logged

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations executed
- [ ] Redis cache initialized
- [ ] All 40+ endpoints tested
- [ ] Error handling verified
- [ ] Rate limiting working
- [ ] Audit logs flowing
- [ ] Monitoring enabled
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Load testing passed
- [ ] Security audit passed

