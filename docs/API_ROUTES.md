# FitKart Backend API Routes Structure

## Route Organization

### File Structure
```
backend/src/routes/
├── index.ts                  # Main router initialization
├── auth.routes.ts            # /api/auth/*
├── users.routes.ts           # /api/users/*
├── steps.routes.ts           # /api/steps/*
├── coins.routes.ts           # /api/coins/*
├── orders.routes.ts          # /api/orders/*
├── achievements.routes.ts    # /api/achievements/*
├── leaderboard.routes.ts     # /api/leaderboard/*
├── store.routes.ts           # /api/store/*
├── admin.routes.ts           # /api/admin/*
└── middleware/
    ├── auth.middleware.ts    # JWT verification
    ├── admin.middleware.ts   # Admin role check
    ├── validation.middleware.ts # Input validation
    └── error.middleware.ts   # Error handling
```

---

## Route Definitions

### Auth Routes (`/api/auth`)
```typescript
POST   /auth/register           → AuthController.register
POST   /auth/login              → AuthController.login
POST   /auth/google             → AuthController.googleLogin
POST   /auth/apple              → AuthController.appleLogin
POST   /auth/otp/send           → AuthController.sendOTP
POST   /auth/otp/verify         → AuthController.verifyOTP
POST   /auth/refresh            → AuthController.refreshToken
POST   /auth/logout             → AuthController.logout

Middleware:
  - POST /login → rateLimitMiddleware (10/min per IP)
  - POST /otp/send → rateLimitMiddleware (5/hour per email)
```

### User Routes (`/api/users`)
```typescript
GET    /users/me               → UserController.getProfile (auth required)
PUT    /users/me               → UserController.updateProfile (auth required)
POST   /users/me/profile-picture → UserController.uploadProfilePicture (auth required)
GET    /users/me/stats         → UserController.getStats (auth required)
GET    /users/{id}             → UserController.getUserPublic
GET    /users/{id}/stats       → UserController.getUserStats

Middleware:
  - All routes except GET /users/{id}* → authMiddleware
  - POST/PUT → validationMiddleware
  - POST /profile-picture → fileUploadMiddleware (10MB max)
```

### Step Routes (`/api/steps`)
```typescript
POST   /steps/record           → StepController.recordSteps (auth required)
GET    /steps/today            → StepController.getTodaySteps (auth required)
GET    /steps/week             → StepController.getWeeklySteps (auth required)
GET    /steps/month            → StepController.getMonthlySteps (auth required)
GET    /steps/history          → StepController.getHistory (auth required)

Middleware:
  - All routes → authMiddleware
  - POST /record → rateLimitMiddleware (3/min per user)
  - POST /record → antiCheatMiddleware
  - GET routes → cacheMiddleware (5 min TTL)
```

### Coin Routes (`/api/coins`)
```typescript
GET    /coins/balance          → CoinController.getBalance (auth required)
GET    /coins/history          → CoinController.getHistory (auth required)

Middleware:
  - All routes → authMiddleware
  - GET /balance → cacheMiddleware (1 min TTL)
```

### Order Routes (`/api/orders`)
```typescript
POST   /orders                 → OrderController.createOrder (auth required)
GET    /orders                 → OrderController.getOrders (auth required)
GET    /orders/{order_id}      → OrderController.getOrderDetail (auth required)
POST   /orders/{order_id}/cancel → OrderController.cancelOrder (auth required)

Middleware:
  - All routes → authMiddleware
  - POST /orders → validationMiddleware
  - POST /orders → coinsLockMiddleware (prevent double-spend)
```

### Achievement Routes (`/api/achievements`)
```typescript
GET    /achievements           → AchievementController.getAll (auth required)
GET    /users/me/achievements  → AchievementController.getUserAchievements (auth required)

Middleware:
  - All routes → authMiddleware
  - GET /achievements → cacheMiddleware (60 min TTL)
```

### Leaderboard Routes (`/api/leaderboard`)
```typescript
GET    /leaderboard/weekly     → LeaderboardController.getWeekly (auth required)
GET    /leaderboard/monthly    → LeaderboardController.getMonthly (auth required)
GET    /leaderboard/all-time   → LeaderboardController.getAllTime (auth required)
GET    /leaderboard/me         → LeaderboardController.getMyRank (auth required)

Middleware:
  - All routes → authMiddleware
  - All GET routes → cacheMiddleware (60 min TTL)
```

### Store Routes (`/api/store`)
```typescript
GET    /store/products         → StoreController.getProducts (auth required)
GET    /store/products/{product_id} → StoreController.getProductDetail (auth required)
GET    /store/search           → StoreController.searchProducts (auth required)

Middleware:
  - All routes → authMiddleware
  - All GET routes → cacheMiddleware (60 min TTL)
  - GET /products → paginationMiddleware
```

### Admin Routes (`/api/admin`)
```typescript
GET    /admin/users            → AdminController.listUsers (auth + admin required)
GET    /admin/analytics        → AdminController.getAnalytics (auth + admin required)
GET    /admin/settings         → AdminController.getSettings (auth + admin required)
PUT    /admin/settings/{key}   → AdminController.updateSetting (auth + admin required)
GET    /admin/steps/suspicious → AdminController.getSuspiciousSteps (auth + admin required)
POST   /admin/steps/{id}/approve → AdminController.approveSteps (auth + admin required)
POST   /admin/steps/{id}/reject → AdminController.rejectSteps (auth + admin required)
GET    /admin/logs             → AdminController.getAuditLogs (auth + admin required)

Middleware:
  - All routes → authMiddleware
  - All routes → adminMiddleware
  - POST/PUT routes → validationMiddleware
  - All routes → auditLogMiddleware (log admin actions)
```

---

## Middleware Stack

### Authentication Middleware
```typescript
Purpose: Verify JWT token and attach user to request
Order: First (after logging)
Error: 401 Unauthorized
Header: Authorization: Bearer {token}
```

### Admin Middleware
```typescript
Purpose: Verify user has admin role
Order: After auth middleware
Error: 403 Forbidden
```

### Validation Middleware
```typescript
Purpose: Validate request body against schema
Order: Before controller
Tools: Joi/Yup for schema validation
Error: 400 Bad Request
```

### Rate Limiting Middleware
```typescript
Purpose: Prevent abuse
Strategy: Token bucket algorithm
Store: Redis
Per: IP or User ID depending on endpoint
```

### Error Handling Middleware
```typescript
Purpose: Catch all errors and format response
Order: Last (wraps all routes)
Formats: Error code, message, details
Logs: All errors to monitoring service
```

### Cache Middleware
```typescript
Purpose: Cache GET responses
Store: Redis
TTL: Varies by endpoint (1-60 minutes)
Key: {user_id}:{endpoint}:{params}
Invalidation: On POST/PUT/DELETE to related resource
```

### Anti-Cheat Middleware
```typescript
Purpose: Validate step submissions
Run: Before StepController.recordSteps
Checks:
  - Max steps per day
  - Impossible speeds
  - Device consistency
Action: Flag for admin review if suspicious
```

### Audit Log Middleware
```typescript
Purpose: Log all admin actions
Run: After controller completes
Store: admin_logs table
Fields: admin_id, action, entity_type, changes, headers
```

---

## Controller Organization

### Auth Controller
```typescript
Methods:
  - register(req, res): Create new user
  - login(req, res): Email/password login
  - googleLogin(req, res): Google OAuth
  - appleLogin(req, res): Apple Sign-In
  - sendOTP(req, res): Send email OTP
  - verifyOTP(req, res): Verify and login with OTP
  - refreshToken(req, res): Refresh JWT
  - logout(req, res): Invalidate refresh token
```

### User Controller
```typescript
Methods:
  - getProfile(req, res): Get current user
  - updateProfile(req, res): Update user info
  - uploadProfilePicture(req, res): Upload to S3
  - getStats(req, res): Get user statistics
  - getUserPublic(req, res): Get public profile
  - getUserStats(req, res): Get user's stats
```

### Step Controller
```typescript
Methods:
  - recordSteps(req, res): Save step record
  - getTodaySteps(req, res): Get today's total
  - getWeeklySteps(req, res): Get week breakdown
  - getMonthlySteps(req, res): Get month breakdown
  - getHistory(req, res): Get paginated history
```

### Coin Controller
```typescript
Methods:
  - getBalance(req, res): Get current coins
  - getHistory(req, res): Get paginated history
```

### Order Controller
```typescript
Methods:
  - createOrder(req, res): Create new order
  - getOrders(req, res): List user's orders
  - getOrderDetail(req, res): Get order details
  - cancelOrder(req, res): Cancel and refund order
```

### Achievement Controller
```typescript
Methods:
  - getAll(req, res): List all achievements
  - getUserAchievements(req, res): Get user's unlocked
```

### Leaderboard Controller
```typescript
Methods:
  - getWeekly(req, res): Get weekly rankings
  - getMonthly(req, res): Get monthly rankings
  - getAllTime(req, res): Get all-time rankings
  - getMyRank(req, res): Get user's rank context
```

### Store Controller
```typescript
Methods:
  - getProducts(req, res): List products
  - getProductDetail(req, res): Get product details
  - searchProducts(req, res): Search by query
```

### Admin Controller
```typescript
Methods:
  - listUsers(req, res): List all users
  - getAnalytics(req, res): Platform analytics
  - getSettings(req, res): Get all settings
  - updateSetting(req, res): Update one setting
  - getSuspiciousSteps(req, res): List for review
  - approveSteps(req, res): Approve and award coins
  - rejectSteps(req, res): Reject and revoke coins
  - getAuditLogs(req, res): Get admin logs
```

---

## Service Layer Organization

### Auth Service
```typescript
Methods:
  - validateCredentials(email, password)
  - generateTokens(userId)
  - verifyGoogleToken(idToken)
  - verifyAppleToken(identityToken)
  - sendOTPEmail(email)
  - validateOTP(email, otp)
```

### User Service
```typescript
Methods:
  - getUser(userId)
  - updateUser(userId, updates)
  - getUserStats(userId)
  - uploadProfilePicture(userId, file)
```

### Step Service
```typescript
Methods:
  - recordSteps(userId, stepData)
  - validateSteps(stepData)
  - calculateAnomalyScore(userId, steps)
  - getTodaySteps(userId)
  - getWeeklySteps(userId, weekOf)
  - getMonthlySteps(userId, monthOf)
  - getHistory(userId, options)
```

### Coin Service
```typescript
Methods:
  - getBalance(userId)
  - awardCoins(userId, amount, reason)
  - spendCoins(userId, amount, reason)
  - getHistory(userId, options)
  - isBalanceSufficient(userId, amount)
```

### Order Service
```typescript
Methods:
  - createOrder(userId, items, shippingAddress)
  - getOrders(userId, options)
  - getOrderDetail(orderId)
  - cancelOrder(orderId)
  - refundOrder(orderId)
  - updateOrderStatus(orderId, status)
```

### Achievement Service
```typescript
Methods:
  - getAll()
  - getUserAchievements(userId)
  - checkAchievements(userId, steps)
  - unlockAchievement(userId, achievementId)
```

### Leaderboard Service
```typescript
Methods:
  - getWeekly(limit, offset)
  - getMonthly(limit, offset)
  - getAllTime(limit, offset)
  - getUserRank(userId, period)
  - updateCache() // Called nightly
```

### Store Service
```typescript
Methods:
  - getProducts(options)
  - getProductDetail(productId)
  - searchProducts(query, options)
  - syncProducts() // Called nightly from Shopify
```

### Admin Service
```typescript
Methods:
  - listUsers(options)
  - getAnalytics(startDate, endDate)
  - getSettings()
  - updateSetting(key, value)
  - getSuspiciousSteps(options)
  - approveSteps(stepId, adminId)
  - rejectSteps(stepId, adminId, reason)
  - getAuditLogs(options)
  - logAdminAction(adminId, action, entity, changes)
```

---

## Request Flow Example

### POST /orders (Create Order)
```
Client
  ↓
API Gateway (CORS, logging)
  ↓
Express Middleware (parsing)
  ↓
authMiddleware (verify JWT)
  ↓
validationMiddleware (validate schema)
  ↓
OrderController.createOrder()
  ↓ (calls services)
OrderService.createOrder()
  ├→ CoinService.isBalanceSufficient() [check]
  ├→ CoinService.spendCoins() [freeze]
  ├→ OrderRepository.create()
  │  ├→ INSERT orders
  │  └→ INSERT order_items
  ├→ CoinService.updateWallet()
  ├→ CoinService.logTransaction()
  └→ Return Order
  ↓
Response (201 Created)
  ↓
auditLogMiddleware (log if admin)
  ↓
Client receives response
```

---

## Error Flow Example

### Invalid Token → 401 Response
```
Request with invalid JWT
  ↓
authMiddleware detects invalid token
  ↓
Throws 401 AuthenticationError
  ↓
Express error handler catches
  ↓
Formats error response
```

---

## Response Examples

### Success Response (200)
```json
{
  "status": "success",
  "data": {...},
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_abc123"
}
```

### Creation Response (201)
```json
{
  "status": "success",
  "data": {...},
  "message": "Resource created successfully",
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_abc123"
}
```

### Error Response (400)
```json
{
  "status": "validation_error",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_abc123"
}
```

---

## Route Performance Targets

| Route | Target | Optimization |
|-------|--------|--------------|
| POST /auth/login | 200ms | Hash computation |
| GET /leaderboard/weekly | 50ms | Redis cache |
| POST /steps/record | 100ms | Async validation |
| GET /users/me/stats | 50ms | Join with wallet |
| POST /orders | 250ms | Multiple transactions |

---

## API Gateway Setup

### Express Routes Registration
```typescript
// backend/src/routes/index.ts

import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import stepRoutes from './steps.routes';
// ... other routes

const router = express.Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'OK' }));

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/steps', stepRoutes);
router.use('/coins', coinRoutes);
router.use('/orders', orderRoutes);
router.use('/achievements', achievementRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/store', storeRoutes);
router.use('/admin', adminRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

export default router;
```

---

**Total Routes: 40+**  
**Controllers: 9**  
**Services: 9**  
**Middleware: 8**  
**Status: Ready for Implementation ✅**
