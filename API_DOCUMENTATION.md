# 📚 API Documentation

Complete reference for FitKart's 81 REST endpoints across 9 domains.

**Base URL**: `http://localhost:3000/api/v1`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## Table of Contents

- [Authentication](#authentication)
- [Auth Endpoints](#auth-endpoints)
- [User Endpoints](#user-endpoints)
- [Coin Endpoints](#coin-endpoints)
- [Step Endpoints](#step-endpoints)
- [Order Endpoints](#order-endpoints)
- [Achievement Endpoints](#achievement-endpoints)
- [Leaderboard Endpoints](#leaderboard-endpoints)
- [Store Endpoints](#store-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

### Token-Based (JWT)

Include JWT token in Authorization header for protected routes:

```bash
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire in 15 minutes. Use refresh tokens to obtain new access tokens.

```bash
POST /api/v1/auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

---

## Auth Endpoints

### 1. Register User

**Endpoint**: `POST /auth/register`  
**Auth**: None  
**Rate Limit**: 10 requests/minute

Register a new user account.

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

**Request Body**:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, uppercase, lowercase, number, special)",
  "name": "string (required)",
  "phone": "string (required)",
  "country": "string (required, 2-letter code)"
}
```

**Success Response** (201):
```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "country": "US",
    "role": "user",
    "emailVerified": false,
    "profilePicture": null,
    "createdAt": "2024-02-17T10:30:00Z"
  },
  "message": "User registered successfully",
  "timestamp": "2024-02-17T10:30:00Z"
}
```

**Error Responses**:
- 400: Invalid email format, weak password, duplicate email
- 422: Validation failed

---

### 2. Login

**Endpoint**: `POST /auth/login`  
**Auth**: None  
**Rate Limit**: 10 requests/minute

Authenticate user with email and password.

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "rememberMe": true
  }'
```

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "rememberMe": "boolean (optional)"
}
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "accessToken": "jwt_token_expires_15m",
    "refreshToken": "jwt_token_expires_7d",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  },
  "message": "Login successful",
  "timestamp": "2024-02-17T10:30:00Z"
}
```

**Error Responses**:
- 401: Invalid credentials
- 403: Account blocked/suspended

---

### 3. Send OTP

**Endpoint**: `POST /auth/send-otp`  
**Auth**: None  
**Rate Limit**: 5 requests/minute

Request one-time password via email.

```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Request Body**:
```json
{
  "email": "string (required, valid email)"
}
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "message": "OTP sent to user@example.com",
    "expiresIn": 300
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 4. Verify OTP

**Endpoint**: `POST /auth/verify-otp`  
**Auth**: None  
**Rate Limit**: 5 requests/minute

Login using OTP without password.

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Request Body**:
```json
{
  "email": "string (required)",
  "otp": "string (required, 6 digits)"
}
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 5. Refresh Token

**Endpoint**: `POST /auth/refresh`  
**Auth**: None  
**Rate Limit**: 100 requests/minute

Get new access token using refresh token.

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "refresh_token_here"}'
```

**Request Body**:
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 6. Logout

**Endpoint**: `POST /auth/logout`  
**Auth**: Required (user)  
**Rate Limit**: 100 requests/minute

Invalidate current session and tokens.

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer access_token"
```

**Success Response** (200):
```json
{
  "status": 200,
  "message": "Logged out successfully",
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 7. Get Profile

**Endpoint**: `GET /auth/profile`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get authenticated user's profile.

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer access_token"
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "profilePicture": "url",
    "lastLogin": "2024-02-17T10:30:00Z"
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 8. Verify Email

**Endpoint**: `POST /auth/verify-email`  
**Auth**: Required (user)  
**Rate Limit**: 5 requests/minute

Verify email address with token.

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-email \
  -H "Authorization: Bearer access_token" \
  -H "Content-Type: application/json" \
  -d '{"token": "email_verification_token"}'
```

**Request Body**:
```json
{
  "token": "string (required)"
}
```

**Success Response** (200):
```json
{
  "status": 200,
  "message": "Email verified successfully",
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

## User Endpoints

### 1. Get User Profile

**Endpoint**: `GET /users/:userId`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get public user profile by ID.

---

### 2. Update Profile

**Endpoint**: `PUT /users/profile`  
**Auth**: Required (user)  
**Rate Limit**: 100 requests/minute

Update user profile information.

**Request Body**:
```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "country": "string (optional)",
  "bio": "string (optional)"
}
```

---

### 3. Upload Profile Picture

**Endpoint**: `POST /users/profile-picture`  
**Auth**: Required (user)  
**Rate Limit**: 100 requests/minute

Upload or update profile picture.

**Form Data**:
```
file: multipart (required, JPG/PNG, max 5MB)
```

---

### 4. Get User Statistics

**Endpoint**: `GET /users/:userId/stats`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get user's stats including steps, coins, achievements.

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "totalSteps": 1000000,
    "totalCoins": 5000,
    "achievementsUnlocked": 8,
    "currentStreak": 15,
    "totalOrdersCount": 10,
    "joinedDate": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 5. Search Users

**Endpoint**: `GET /users/search?query=john&limit=20&offset=0`  
**Auth**: Required (user)  
**Rate Limit**: 100 requests/minute

Search users by name or email.

**Query Parameters**:
```
query: string (required)
limit: number (optional, default 20, max 100)
offset: number (optional, default 0)
```

---

### 6-11. Additional User Endpoints

- `GET /users` - List users (paginated)
- `GET /users/:userId/public-profile` - Get public profile
- `PUT /users/profile` - Update profile
- `DELETE /users/:userId` - Delete account (self only)
- `GET /users/:userId/public-stats` - Get public stats
- `GET /users/monthly-stats` - Get monthly statistics

*(Continued for brevity - 11 total user endpoints)*

---

## Coin Endpoints

### 1. Get Wallet Balance

**Endpoint**: `GET /coins/balance`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get current coin balance.

```bash
curl -X GET http://localhost:3000/api/v1/coins/balance \
  -H "Authorization: Bearer access_token"
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "balance": 5000,
    "frozen": 500,
    "available": 4500
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 2. Get Coin History

**Endpoint**: `GET /coins/history?limit=50&offset=0&type=all`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get transaction history.

**Query Parameters**:
```
limit: number (default 50, max 100)
offset: number (default 0)
type: string (all|earn|spend|freeze|unfreeze)
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "earn",
        "amount": 100,
        "description": "Steps recorded",
        "timestamp": "2024-02-17T10:30:00Z"
      }
    ],
    "total": 500,
    "hasMore": true
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 3-8. Additional Coin Endpoints

- `POST /coins/check-balance` - Check available balance for purchase
- `POST /coins/spend` - Spend coins for purchase
- `POST /coins/freeze` - Freeze coins for order
- `POST /coins/unfreeze` - Unfreeze frozen coins
- `GET /coins/stats` - Get coin statistics
- `POST /coins/add` - Admin: Add coins to user (admin only)

*(7 total coin endpoints)*

---

## Step Endpoints

### 1. Record Steps

**Endpoint**: `POST /steps/record`  
**Auth**: Required (user)  
**Rate Limit**: 100 requests/minute

Record user's steps.

```bash
curl -X POST http://localhost:3000/api/v1/steps/record \
  -H "Authorization: Bearer access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "steps": 5000,
    "timestamp": "2024-02-17T10:30:00Z",
    "source": "device"
  }'
```

**Request Body**:
```json
{
  "steps": "number (required, positive)",
  "timestamp": "string (ISO date, required)",
  "source": "string (device|manual, required)"
}
```

**Success Response** (201):
```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "steps": 5000,
    "coinsEarned": 50,
    "totalToday": 5000,
    "timestamp": "2024-02-17T10:30:00Z"
  },
  "message": "Steps recorded successfully",
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 2. Get Today's Steps

**Endpoint**: `GET /steps/today`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get steps recorded today.

---

### 3. Get Weekly Stats

**Endpoint**: `GET /steps/weekly?week=current`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get weekly step statistics.

**Query Parameters**:
```
week: string (current|previous)
```

---

### 4-9. Additional Step Endpoints

- `GET /steps/monthly` - Monthly step statistics
- `GET /steps/history` - Historical step data (paginated)
- `GET /steps/streak` - Get current streak information
- `GET /steps/best-day` - Get best day record
- `GET /steps/:userId/public-stats` - Get public user stats
- `POST /steps/sync` - Sync with health app (manual)

*(9 total step endpoints)*

---

## Order Endpoints

### 1. Create Order

**Endpoint**: `POST /orders`  
**Auth**: Required (user)  
**Rate Limit**: 50 requests/minute

Create new order from cart.

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "uuid", "quantity": 2}
    ]
  }'
```

**Request Body**:
```json
{
  "items": [
    {
      "productId": "uuid (required)",
      "quantity": "number (required, min 1)"
    }
  ]
}
```

**Success Response** (201):
```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "status": "pending",
    "items": [...],
    "totalCoins": 500,
    "createdAt": "2024-02-17T10:30:00Z"
  },
  "message": "Order created successfully",
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 2-9. Additional Order Endpoints

- `GET /orders` - List user's orders (paginated)
- `GET /orders/:orderId` - Get order details
- `POST /orders/:orderId/confirm` - Confirm order
- `POST /orders/:orderId/cancel` - Cancel order
- `GET /orders/:orderId/status` - Get order status
- `GET /orders/lookup/:trackingId` - Lookup by tracking ID
- `GET /orders/stats` - User's order statistics
- `GET /admin/orders` - Admin: List all orders

*(9 total order endpoints)*

---

## Achievement Endpoints

### 1. Get All Achievements

**Endpoint**: `GET /achievements`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get list of all available achievements.

```bash
curl -X GET http://localhost:3000/api/v1/achievements \
  -H "Authorization: Bearer access_token"
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "name": "First Steps",
        "description": "Record your first 100 steps",
        "badge": "url",
        "rarity": "common",
        "unlocked": true,
        "unlockedAt": "2024-02-17T10:30:00Z"
      }
    ],
    "total": 14,
    "unlockedCount": 8
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 2-7. Additional Achievement Endpoints

- `GET /achievements/:id` - Get achievement details
- `GET /achievements/user/:userId` - User's unlocked achievements
- `POST /achievements/:id/unlock` - Unlock achievement (admin)
- `GET /achievements/leaderboard` - Achievement leaderboard
- `GET /achievements/progress` - User's progress toward achievements
- `GET /achievements/stats` - Achievement statistics

*(7 total achievement endpoints)*

---

## Leaderboard Endpoints

### 1. Weekly Leaderboard

**Endpoint**: `GET /leaderboard/weekly?limit=100&offset=0`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get weekly step leaderboard (cached).

```bash
curl -X GET http://localhost:3000/api/v1/leaderboard/weekly \
  -H "Authorization: Bearer access_token"
```

**Query Parameters**:
```
limit: number (default 100, max 100)
offset: number (default 0)
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "entries": [
      {
        "rank": 1,
        "userId": "uuid",
        "name": "John Doe",
        "steps": 50000,
        "coins": 500,
        "userRank": null
      }
    ],
    "userPosition": {
      "rank": 42,
      "steps": 10000
    }
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 2-7. Additional Leaderboard Endpoints

- `GET /leaderboard/monthly` - Monthly leaderboard
- `GET /leaderboard/all-time` - All-time leaderboard
- `GET /leaderboard/country/:country` - Country leaderboard
- `GET /leaderboard/friends` - Friends leaderboard
- `GET /leaderboard/user-context/:userId` - User's leaderboard position
- `POST /leaderboard/refresh` - Admin: Refresh cache

*(7 total leaderboard endpoints)*

---

## Store Endpoints

### 1. Get Products

**Endpoint**: `GET /store?limit=20&offset=0&category=all`  
**Auth**: Required (user)  
**Rate Limit**: 1000 requests/hour

Get store products.

```bash
curl -X GET http://localhost:3000/api/v1/store \
  -H "Authorization: Bearer access_token"
```

**Query Parameters**:
```
limit: number (default 20, max 100)
offset: number (default 0)
category: string (all|electronics|clothing|etc)
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Wireless Earbuds",
        "description": "Premium sound quality",
        "price": 5000,
        "image": "url",
        "category": "electronics",
        "stock": 50
      }
    ],
    "total": 150,
    "hasMore": true
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 2-8. Additional Store Endpoints

- `GET /store/:productId` - Get product details
- `POST /store/search?query=earbuds` - Search products
- `GET /store/featured` - Get featured products
- `GET /store/stats` - Store statistics
- `POST /store/products` - Admin: Create product
- `PUT /store/:productId` - Admin: Update product
- `DELETE /store/:productId` - Admin: Delete product

*(8 total store endpoints)*

---

## Admin Endpoints

### 1. List Users (Admin)

**Endpoint**: `GET /admin/users?limit=50&offset=0`  
**Auth**: Required (admin)  
**Rate Limit**: 500 requests/hour

List all platform users.

**Query Parameters**:
```
limit: number (default 50, max 100)
offset: number (default 0)
search: string (optional)
status: string (all|active|blocked|suspended)
```

**Success Response** (200):
```json
{
  "status": 200,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "status": "active",
        "createdAt": "2024-02-17T10:30:00Z",
        "totalSteps": 1000000
      }
    ],
    "total": 5000,
    "hasMore": true
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

### 2-14. Additional Admin Endpoints

- `PUT /admin/users/:userId/role` - Update user role
- `POST /admin/users/:userId/block` - Block user
- `POST /admin/users/:userId/unblock` - Unblock user
- `POST /admin/users/:userId/coins/add` - Add coins to user
- `GET /admin/analytics` - Platform analytics
- `GET /admin/suspicious-activity` - Review suspicious activity
- `GET /admin/health` - System health status
- `GET /admin/settings` - Get admin settings
- `PUT /admin/settings` - Update admin settings
- `POST /admin/notifications/broadcast` - Send broadcast notification
- `GET /admin/reports` - Generate reports
- `POST /admin/export/users` - Export user data
- `GET /admin/logs` - Access audit logs
- `POST /admin/maintenance` - Maintenance mode

*(14 total admin endpoints)*

---

## Error Handling

### Standard Error Response Format

```json
{
  "status": 400,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field": "fieldName",
    "issue": "Detailed explanation"
  },
  "timestamp": "2024-02-17T10:30:00Z"
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| INVALID_EMAIL | 400 | Email format invalid |
| WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| DUPLICATE_EMAIL | 409 | Email already registered |
| INVALID_CREDENTIALS | 401 | Wrong email or password |
| TOKEN_EXPIRED | 401 | JWT token has expired |
| INSUFFICIENT_COINS | 400 | Not enough coins for transaction |
| NOT_FOUND | 404 | Resource not found |
| PERMISSION_DENIED | 403 | Insufficient permissions |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

Requests are rate-limited per endpoint and user.

### Tier 1: Strict (Auth Endpoints)
- **Limit**: 10 requests per minute
- **Applies**: /auth/register, /auth/login, /auth/send-otp

### Tier 2: Normal (Write Operations)
- **Limit**: 100 requests per minute
- **Applies**: POST, PUT, DELETE operations

### Tier 3: Generous (Read Operations)
- **Limit**: 1000 requests per hour
- **Applies**: GET /users, GET /steps, GET /coins

### Tier 4: API (General)
- **Limit**: 5000 requests per hour
- **Headers**:
  - `X-RateLimit-Limit`: Limit for this period
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

### 429 Response (Rate Limited)

```json
{
  "status": 429,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again in 60 seconds",
  "retryAfter": 60,
  "timestamp": "2024-02-17T10:30:00Z"
}
```

---

## Response Headers

All responses include:

```
Content-Type: application/json
X-Request-ID: unique-request-id
X-Response-Time: 45ms
Cache-Control: no-store
X-Frame-Options: DENY
```

---

## Pagination

List endpoints support pagination via query parameters:

```
?limit=50&offset=0
```

### Response Format

```json
{
  "data": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1000,
    "hasMore": true
  }
}
```

---

## Versioning

Current API version: **1.0.0**

All endpoints prefixed with `/api/v1/`

---

**Last Updated**: February 17, 2026  
**Total Endpoints**: 81  
**Domains**: 9  
**Rate Tiers**: 4
