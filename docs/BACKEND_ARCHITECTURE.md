# FitKart Backend - High Level Architecture

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                   │
│              (Mobile App / Admin Dashboard)                           │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                                    │
│            (backend/src/index.ts, backend/src/app.ts)               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   MIDDLEWARE CHAIN                           │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ 1. Logging Middleware                                 │ │  │
│  │  │ 2. Auth Middleware (Extract JWT, verify)              │ │  │
│  │  │ 3. Admin Middleware (Check role)                      │ │  │
│  │  │ 4. Validation Middleware (Schema validation)          │ │  │
│  │  │ 5. Rate Limiting Middleware (Redis token bucket)      │ │  │
│  │  │ 6. Cache Middleware (Check Redis cache)               │ │  │
│  │  │ 7. Anti-Cheat Middleware (Real-time validation)       │ │  │
│  │  │ 8. Request Handler (Controller)                       │ │  │
│  │  │ 9. Audit Logging Middleware (Log admin actions)       │ │  │
│  │  │ 10. Error Handler (Catch & format errors)             │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────┬──────────────────────────┘
               │                          │
        ┌──────▼────────┐          ┌──────▼───────┐
        │   ROUTES      │          │ CONTROLLERS  │
        │   (9 files)   │          │  (9 files)   │
        ├───────────────┤          ├──────────────┤
        │ auth.routes   │          │ AuthCtrl     │
        │ users.routes  │          │ UserCtrl     │
        │ steps.routes  │          │ StepCtrl     │
        │ coins.routes  │          │ CoinCtrl     │
        │ orders.routes │          │ OrderCtrl    │
        │ and... (4 more)          │ and... (4 more)
        │               │          │              │
        └───────────────┘          └──────┬───────┘
                                          │
                                    ┌─────▼──────┐
                                    │ SERVICES   │
                                    │ (9 files)  │
                                    ├────────────┤
                                    │AuthService │
                                    │UserService │
                                    │StepService │
                                    │CoinService │
                                    │OrderService│
                                    │and... (4 more)
                                    │            │
                                    └─────┬──────┘
                                          │
                        ┌─────────────────┴──────────────┐
                        │                                │
                   ┌────▼────────┐             ┌────────▼──┐
                   │ REPOSITORIES│             │ UTILITIES  │
                   │ (2+ created)│             │ (5 files)  │
                   ├─────────────┤             ├────────────┤
                   │BaseRepo     │             │response.ts │
                   │UserRepo     │             │errors.ts   │
                   │WalletRepo   │             │validators  │
                   │and... (9+)  │             │jwt.ts      │
                   │             │             │encryption  │
                   └──────┬──────┘             └────────────┘
                          │
                   ┌──────▼──────────┐
                   │  TYPEORM        │
                   │  Entities (14)  │
                   ├─────────────────┤
                   │ User            │
                   │ Wallet          │
                   │ StepRecord      │
                   │ Order           │
                   │ and... (10 more)│
                   └─────────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────────┐    ┌──────▼──────┐    ┌───────▼────┐
   │ PostgreSQL  │    │   Redis     │    │ FILE       │
   │ Database    │    │   Cache     │    │ STORAGE    │
   │  (14 tables)│    │  │ Rate Limit│    │ (S3/CDN)   │
   │             │    │  │ Cache     │    │            │
   │ ✓ users     │    │  │ Sessions  │    │ ✓ Pictures │
   │ ✓ wallets   │    │  │ Leaderboard│   │ ✓ Product  │
   │ ✓ orders    │    │             │    │   images   │
   │ ✓ steps     │    └─────────────┘    └────────────┘
   │ ✓ and... 10+│
   └─────────────┘
```

---

## Key Files Organization

```
backend/
├── src/
│   ├── index.ts                  # Main server entry point (NOT YET)
│   ├── app.ts                    # Express app setup (NOT YET)
│   ├── config/
│   │   ├── database.ts           # ✅ TypeORM configuration
│   │   └── redis.ts              # ✅ Redis client
│   ├── models/                   # ✅ TypeORM Entities (14)
│   │   ├── User.ts
│   │   ├── Wallet.ts
│   │   ├── Order.ts
│   │   ├── and... 11 more
│   │   └── index.ts
│   ├── middleware/               # ✅ Middleware (5 created, 3 TODO)
│   │   ├── authMiddleware.ts
│   │   ├── validationMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimitMiddleware.ts
│   │   ├── antiCheatMiddleware.ts (TODO)
│   │   ├── cacheMiddleware.ts (TODO)
│   │   ├── auditLogMiddleware.ts (TODO)
│   │   └── index.ts
│   ├── repositories/             # Data access layer
│   │   ├── BaseRepository.ts     # ✅ Base CRUD class
│   │   ├── UserRepository.ts     # ✅ Example implementation
│   │   ├── WalletRepository.ts   # ✅ Example implementation
│   │   ├── and... 11 more (TODO)
│   │   └── index.ts
│   ├── services/                 # Business logic layer (TODO)
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   ├── StepService.ts
│   │   ├── CoinService.ts
│   │   ├── OrderService.ts
│   │   └── and... 4 more
│   ├── controllers/              # Request handlers (TODO)
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   └── and... 7 more
│   ├── routes/                   # API endpoint definitions (TODO)
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   └── and... 7 more
│   └── utils/                    # ✅ Helper utilities (5)
│       ├── response.ts
│       ├── errors.ts
│       ├── validators.ts
│       ├── jwt.ts
│       └── encryption.ts
├── tests/
│   ├── unit/                     # Service unit tests (TODO)
│   ├── integration/              # API integration tests (TODO)
│   └── e2e/                      # End-to-end tests (TODO)
├── migrations/                   # Database migrations (TODO)
├── seeds/                        # Seed data (TODO)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # Setup guide
```

---

## Data Flow for POST /orders

```
┌─ HTTP Request ─────────────────────────────────────────┐
│ POST /api/orders                                       │
│ Authorization: Bearer {jwt_token}                      │
│ Body: { items, shipping_address }                     │
└──────────────┬────────────────────────────────────────┘
               │
               ▼
    ┌─ Request received ─────┐
    │  by Express app        │
    └────────┬────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 1. Logging Middleware         │ Logs request details
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 2. Auth Middleware            │ ✅ Verifies JWT, extracts user
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 3. Validation Middleware      │ ✅ Validates schema
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 4. Rate Limit Middleware      │ ✅ Checks Redis bucket
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 5. OrderController.createOrder│
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 6. OrderService.createOrder() │ Business logic
    │    - Validates inventory      │
    │    - Creates order            │
    │    - Freezes coins            │
    │    - Awards achievement       │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 7. Multiple Repository Calls: │
    │    - OrderRepository.create() │  INSERT into orders
    │    - OrderItemRepository      │  INSERT into order_items
    │    - WalletRepository.freeze()│  UPDATE wallets
    │    - CoinTransactionRepository│  INSERT transaction
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 8. PostgreSQL Database        │ Stores data
    │    Executes transaction       │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 9. Response formatted         │
    │    { status, data }           │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 10. Audit Logging Middleware  │ Logs admin action (if admin)
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ 11. Send HTTP Response        │
    │     201 Created               │
    │     { order_code, total_coins } 
    └───────────────────────────────┘
```

---

## Database Connection Flow

```
1. Application Startup
   ├─ Load .env variables
   ├─ Create TypeORM DataSource
   ├─ Connect to PostgreSQL
   │  ├─ Initialize connection pool (20 max, 5 min)
   │  ├─ Enable SSL for production
   │  └─ Start logging SQL queries
   └─ Ready to handle requests

2. Each Request
   ├─ Get connection from pool
   ├─ Execute query/transaction
   ├─ Return connection to pool
   └─ Response sent to client

3. On Error
   ├─ Rollback transaction
   ├─ Release connection
   ├─ Log error
   └─ Send error response
```

---

## Service Layer Pattern

Each service follows this pattern:

```typescript
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private coinService: CoinService,
    private walletRepository: WalletRepository
  ) {}

  async createOrder(userId: string, input: CreateOrderInput) {
    // 1. Validate input and business rules
    if (!hasValidProducts(input.items)) {
      throw new ValidationError('Invalid products');
    }

    // 2. Check preconditions
    const availableCoins = await this.coinService.getBalance(userId);
    if (availableCoins < totalCost) {
      throw new InsufficientCoinsError(totalCost, availableCoins);
    }

    // 3. Execute business logic (possibly multi-step)
    const coins = await this.coinService.spendCoins(userId, totalCost);
    const order = await this.orderRepository.create(orderData);
    
    // 4. Handle side effects
    await this.achievementService.checkAndUnlock(userId);

    // 5. Return result
    return order;
  }
}
```

---

## Error Handling Strategy

```
┌─ Error Occurs ─────────────────┐
│ In Controller/Service/Repository │
└────────┬──────────────────────┘
         │
    ┌────▼────────────────────┐
    │ Catch and throw known   │
    │ error type:             │
    │ - AuthenticationError   │
    │ - ValidationError       │
    │ - InsufficientCoinsError│
    │ - SuspiciousActivityErr │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │ Bubbles to middleware   │
    │ error handler           │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │ errorHandler middleware │
    │ catches error & formats │
    │ response with:          │
    │ - HTTP status code      │
    │ - Error code            │
    │ - Human message         │
    │ - Details (if dev mode) │
    └────┬────────────────────┘
         │
    ◄─────┴───────► HTTP Response
          400/401/403/429/500 etc
          { status, error, timestamp }
```

---

## Caching Strategy

```
GET /leaderboard/weekly
    ├─ Check Redis cache
    │  ├─ If hit (< 1 hour old)
    │  │  └─ Return cached data (50ms)
    │  └─ If miss
    │     ├─ Query database
    │     ├─ Cache for 1 hour
    │     └─ Return data (200ms)
    └─ Set Cache-Control header

POST /steps/record
    ├─ No caching (mutable operation)
    ├─ But does update cache:
    │  ├─ Invalidate user's stats cache
    │  ├─ Update leaderboard cache
    │  └─ Clear any related caches
    └─ Return response
```

---

## Transaction Safety

```
POST /orders (Multi-step transaction)
    │
    ├─ BEGIN TRANSACTION
    │
    ├─ INSERT INTO orders (order_code, status='pending')
    │
    ├─ INSERT INTO order_items (for each item)
    │
    ├─ UPDATE wallets SET available -= amount, frozen += amount
    │
    ├─ INSERT INTO coin_transactions (type='spent')
    │
    ├─ CHECK inventory levels
    │
    ├─ If any step fails:
    │  └─ ROLLBACK (all changes undone)
    │
    └─ If all succeed:
       └─ COMMIT (changes permanent)
```

---

## Performance Targets

| Endpoint | Target | Achievable By |
|----------|--------|---------------|
| POST /auth/login | 200ms | Bcrypt (100ms) + DB (50ms) + overhead (50ms) |
| GET /leaderboard/weekly | 50ms | Redis cache hit |
| POST /steps/record | 100ms | Async validation + fast DB insert |
| GET /users/me | 50ms | Single indexed query |
| POST /orders | 250ms | Multiple operations in transaction |
| GET /coins/balance | 10ms | Denormalized column lookup |

---

## Next Phase: Service Implementation

After middleware & repositories are complete:

1. **AuthService** - User registration, login, token refresh
2. **UserService** - Profile management  
3. **CoinService** - Balance checks, transactions
4. **StepService** - Activity recording with anti-cheat
5. **OrderService** - Order creation with coin deduction
6. **AchievementService** - Badge unlocking logic
7. **LeaderboardService** - Ranking calculations
8. **StoreService** - Product catalog
9. **AdminService** - Platform administration

Each service will follow the same pattern shown above.
