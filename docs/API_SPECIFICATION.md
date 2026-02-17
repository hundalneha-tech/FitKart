# FitKart API Specification v1.0

**Base URL:** `https://api.fitkart.com/api`  
**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Auth Endpoints](#auth-endpoints)
   - [User Endpoints](#user-endpoints)
   - [Step Endpoints](#step-endpoints)
   - [Coin Endpoints](#coin-endpoints)
   - [Order Endpoints](#order-endpoints)
   - [Achievement Endpoints](#achievement-endpoints)
   - [Leaderboard Endpoints](#leaderboard-endpoints)
   - [Store Endpoints](#store-endpoints)
   - [Admin Endpoints](#admin-endpoints)

---

## API Overview

### Base Information
- **Protocol:** HTTPS only
- **Format:** JSON
- **Character Encoding:** UTF-8
- **Rate Limit:** 1000 requests/hour per user
- **API Version Header:** `X-API-Version: 1.0`

### Environment URLs
```
Development:  https://dev-api.fitkart.com/api
Staging:      https://staging-api.fitkart.com/api
Production:   https://api.fitkart.com/api
```

### Response Envelope
All responses follow this structure:
```json
{
  "status": "success|error|validation_error",
  "data": {},
  "message": "Optional message",
  "error": "Optional error details",
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_abc123def456"
}
```

---

## Authentication

### JWT Token Strategy

#### Access Token
- **Lifetime:** 15 minutes
- **Type:** Bearer token
- **Scope:** API access
- **Header:** `Authorization: Bearer eyJhbGc...`

#### Refresh Token
- **Lifetime:** 7 days
- **Type:** Opaque
- **Storage:** Secure httpOnly cookie
- **Rotation:** New refresh token issued with each refresh

#### Token Claims
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "user|admin",
  "iat": 1708150245,
  "exp": 1708151145,
  "iss": "fitkart",
  "aud": "fitkart-mobile"
}
```

### Authentication Methods

#### 1. Email/Password
```
POST /auth/register
POST /auth/login
```

#### 2. Google OAuth
```
POST /auth/google
Headers: { Authorization: "Bearer google_token" }
```

#### 3. Apple Sign-In
```
POST /auth/apple
Body: { identityToken: "apple_identity_token" }
```

#### 4. Email/OTP
```
POST /auth/otp/send
POST /auth/otp/verify
```

### Authorization Levels
```
Public:      No auth required
User:        Valid JWT required
Admin:       JWT + admin role required
Internal:    Service-to-service only
```

---

## Error Handling

### Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_abc123def456"
}
```

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 204 | No Content | Success, no response body |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |
| 503 | Unavailable | Service temporarily down |

### Error Codes

**Authentication Errors:**
- `AUTH_INVALID_CREDENTIALS` - Email/password incorrect
- `AUTH_USER_NOT_FOUND` - User doesn't exist
- `AUTH_ACCOUNT_DISABLED` - Account inactive
- `AUTH_TOKEN_EXPIRED` - JWT expired
- `AUTH_TOKEN_INVALID` - JWT malformed
- `AUTH_OAUTH_FAILED` - OAuth provider error

**Validation Errors:**
- `VALIDATION_FAILED` - Input validation failed
- `INVALID_EMAIL` - Email format invalid
- `INVALID_PHONE` - Phone format invalid
- `PASSWORD_WEAK` - Password doesn't meet requirements
- `EMAIL_IN_USE` - Email already registered

**Business Logic Errors:**
- `INSUFFICIENT_COINS` - Not enough coins
- `PRODUCT_OUT_OF_STOCK` - Product unavailable
- `INVALID_STEP_DATA` - Step record invalid
- `SUSPICIOUS_ACTIVITY` - Anomaly detected
- `ORDER_ALREADY_REFUNDED` - Cannot refund twice

**System Errors:**
- `INTERNAL_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Downstream service down
- `DATABASE_ERROR` - Database connection failed

---

## Endpoints

### Auth Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "phone": "+14155552671",
  "country_code": "+1"
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "ref_abc123def456",
    "expires_in": 900
  }
}

Errors:
- 400: VALIDATION_FAILED
- 409: EMAIL_IN_USE
```

#### Login User
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "ref_abc123def456",
    "expires_in": 900
  }
}

Errors:
- 400: INVALID_CREDENTIALS
- 404: USER_NOT_FOUND
- 403: ACCOUNT_DISABLED
```

#### Google OAuth Login
```
POST /auth/google
Content-Type: application/json

Request Body:
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIzcjU...",
  "access_token": "ya29.a0AfH6SMBx..."
}

Response (200 OK / 201 Created):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@gmail.com",
    "full_name": "John Doe",
    "is_new_user": false,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "ref_abc123def456"
  }
}

Errors:
- 400: AUTH_OAUTH_FAILED
- 400: INVALID_TOKEN
```

#### Apple Sign-In
```
POST /auth/apple
Content-Type: application/json

Request Body:
{
  "identity_token": "eyJraWQiOiI4NkQ1ODMzMEEyRjI0RjZGODkzQjA...",
  "authorization_code": "cd6e18e2b-c2b9-46b0-8ae1-c58de7c7c...",
  "user": {
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "user@privaterelay.appleid.com"
  }
}

Response (200 OK / 201 Created):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@privaterelay.appleid.com",
    "full_name": "John Doe",
    "is_new_user": false,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "ref_abc123def456"
  }
}

Errors:
- 400: AUTH_OAUTH_FAILED
- 400: INVALID_TOKEN
```

#### Send OTP
```
POST /auth/otp/send
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "message": "OTP sent to email",
    "expires_in": 600
  }
}

Errors:
- 400: INVALID_EMAIL
- 429: TOO_MANY_REQUESTS
```

#### Verify OTP
```
POST /auth/otp/verify
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response (200 OK / 201 Created):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "User Name (if exists)",
    "is_new_user": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "ref_abc123def456"
  }
}

Errors:
- 400: INVALID_OTP
- 400: OTP_EXPIRED
- 404: USER_NOT_FOUND
```

#### Refresh Token
```
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer {access_token}

Request Body:
{
  "refresh_token": "ref_abc123def456"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "ref_def789ghi012",
    "expires_in": 900
  }
}

Errors:
- 401: TOKEN_EXPIRED
- 401: TOKEN_INVALID
```

#### Logout
```
POST /auth/logout
Authorization: Bearer {access_token}

Response (204 No Content):

Errors:
- 401: UNAUTHORIZED
```

---

### User Endpoints

#### Get User Profile
```
GET /users/me
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+14155552671",
    "country_code": "+1",
    "profile_picture_url": "https://cdn.fitkart.com/profiles/...",
    "bio": "Fitness enthusiast",
    "total_steps": 1234567,
    "total_coins": 5000,
    "created_at": "2024-01-15T10:30:45Z",
    "last_login_at": "2024-02-17T08:15:30Z"
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Update User Profile
```
PUT /users/me
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "full_name": "Jane Doe",
  "phone": "+14155552671",
  "bio": "Updated bio"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "Jane Doe",
    "phone": "+14155552671",
    "bio": "Updated bio",
    "updated_at": "2024-02-17T10:30:45Z"
  }
}

Errors:
- 400: VALIDATION_FAILED
- 401: UNAUTHORIZED
```

#### Upload Profile Picture
```
POST /users/me/profile-picture
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Request Body:
{
  "image": <binary file>
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "profile_picture_url": "https://cdn.fitkart.com/profiles/550e8400-e29b-41d4-a716-446655440000.jpg"
  }
}

Errors:
- 400: INVALID_IMAGE
- 413: IMAGE_TOO_LARGE
```

#### Get User Stats
```
GET /users/me/stats
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "total_steps": 1234567,
    "today_steps": 8432,
    "week_steps": 65432,
    "month_steps": 234567,
    "available_coins": 5000,
    "frozen_coins": 100,
    "total_earned": 10500,
    "total_spent": 5500,
    "achievements_count": 5,
    "orders_count": 3,
    "current_rank": 42
  }
}

Errors:
- 401: UNAUTHORIZED
```

---

### Step Endpoints

#### Record Steps
```
POST /steps/record
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "steps": 8432,
  "distance": 6.2,
  "calories": 420,
  "heart_points": 250,
  "source": "google_fit",
  "recorded_date": "2024-02-17"
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "steps": 8432,
    "distance": 6.2,
    "calories": 420,
    "source": "google_fit",
    "recorded_date": "2024-02-17",
    "is_verified": false,
    "created_at": "2024-02-17T10:30:45Z"
  }
}

Errors:
- 400: INVALID_STEP_DATA
- 403: SUSPICIOUS_ACTIVITY
- 401: UNAUTHORIZED
```

#### Get Today's Steps
```
GET /steps/today
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "date": "2024-02-17",
    "steps": 8432,
    "distance": 6.2,
    "calories": 420,
    "heart_points": 250,
    "source": "google_fit",
    "is_verified": false
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get Weekly Steps
```
GET /steps/week
Authorization: Bearer {access_token}
Query Parameters:
  - week_of: YYYY-MM-DD (optional, defaults to current week)

Response (200 OK):
{
  "status": "success",
  "data": {
    "week_start": "2024-02-12",
    "week_end": "2024-02-18",
    "total_steps": 65432,
    "daily_breakdown": [
      {
        "date": "2024-02-12",
        "steps": 9234,
        "goal_met": true
      },
      {
        "date": "2024-02-13",
        "steps": 8932,
        "goal_met": true
      },
      ...
    ],
    "days_active": 7,
    "goal_achievement": 100
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get Monthly Steps
```
GET /steps/month
Authorization: Bearer {access_token}
Query Parameters:
  - month: YYYY-MM (optional, defaults to current month)

Response (200 OK):
{
  "status": "success",
  "data": {
    "month": "2024-02",
    "total_steps": 234567,
    "weekly_breakdown": [
      {
        "week": "Week 1",
        "steps": 65432
      },
      ...
    ]
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get Step History
```
GET /steps/history
Authorization: Bearer {access_token}
Query Parameters:
  - limit: 30 (default, max 100)
  - offset: 0 (for pagination)
  - start_date: YYYY-MM-DD (optional)
  - end_date: YYYY-MM-DD (optional)

Response (200 OK):
{
  "status": "success",
  "data": {
    "steps": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "date": "2024-02-17",
        "steps": 8432,
        "distance": 6.2,
        "calories": 420,
        "source": "google_fit",
        "is_verified": true
      },
      ...
    ],
    "total": 30,
    "offset": 0,
    "limit": 30
  }
}

Errors:
- 401: UNAUTHORIZED
```

---

### Coin Endpoints

#### Get Coin Balance
```
GET /coins/balance
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "available_coins": 5000,
    "frozen_coins": 100,
    "total_balance": 5100,
    "total_earned": 10500,
    "total_spent": 5500,
    "last_updated": "2024-02-17T10:30:45Z"
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get Coin History
```
GET /coins/history
Authorization: Bearer {access_token}
Query Parameters:
  - limit: 50 (default, max 100)
  - offset: 0 (for pagination)
  - transaction_type: earned|spent|refund|bonus (optional)
  - start_date: YYYY-MM-DD (optional)
  - end_date: YYYY-MM-DD (optional)

Response (200 OK):
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "amount": 100,
        "transaction_type": "earned",
        "description": "Earned from steps",
        "reference_type": "step_record",
        "reference_id": "660e8400-e29b-41d4-a716-446655440000",
        "balance_after": 5100,
        "created_at": "2024-02-17T10:30:45Z"
      },
      ...
    ],
    "total": 50,
    "offset": 0,
    "limit": 50
  }
}

Errors:
- 401: UNAUTHORIZED
```

---

### Order Endpoints

#### Create Order
```
POST /orders
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "items": [
    {
      "product_id": "880e8400-e29b-41d4-a716-446655440000",
      "quantity": 1
    },
    {
      "product_id": "990e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    }
  ],
  "shipping_address": {
    "full_name": "John Doe",
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94103",
    "country": "US"
  }
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "id": "aaa0e8400-e29b-41d4-a716-446655440000",
    "order_code": "FK-2024-00123",
    "total_coins": 8000,
    "status": "pending",
    "items": [
      {
        "product_id": "880e8400-e29b-41d4-a716-446655440000",
        "quantity": 1,
        "coin_price": 5000
      }
    ],
    "created_at": "2024-02-17T10:30:45Z"
  }
}

Errors:
- 400: VALIDATION_FAILED
- 400: INSUFFICIENT_COINS
- 400: PRODUCT_OUT_OF_STOCK
- 401: UNAUTHORIZED
```

#### Get Orders
```
GET /orders
Authorization: Bearer {access_token}
Query Parameters:
  - limit: 20 (default)
  - offset: 0 (for pagination)
  - status: pending|confirmed|processing|shipped|delivered|cancelled (optional)

Response (200 OK):
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "aaa0e8400-e29b-41d4-a716-446655440000",
        "order_code": "FK-2024-00123",
        "total_coins": 8000,
        "status": "shipped",
        "tracking_number": "1Z999AA10123456784",
        "item_count": 3,
        "created_at": "2024-02-17T10:30:45Z",
        "shipped_at": "2024-02-18T08:15:30Z"
      },
      ...
    ],
    "total": 5,
    "offset": 0,
    "limit": 20
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get Order Details
```
GET /orders/{order_id}
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "aaa0e8400-e29b-41d4-a716-446655440000",
    "order_code": "FK-2024-00123",
    "total_coins": 8000,
    "status": "shipped",
    "items": [
      {
        "product_id": "880e8400-e29b-41d4-a716-446655440000",
        "product_name": "Fitness Tracker Band",
        "quantity": 1,
        "coin_price_at_purchase": 5000,
        "image_url": "https://..."
      },
      ...
    ],
    "shipping_address": {
      "full_name": "John Doe",
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94103",
      "country": "US"
    },
    "tracking_number": "1Z999AA10123456784",
    "created_at": "2024-02-17T10:30:45Z",
    "shipped_at": "2024-02-18T08:15:30Z",
    "estimated_delivery": "2024-02-22T23:59:59Z"
  }
}

Errors:
- 401: UNAUTHORIZED
- 404: NOT_FOUND
```

#### Cancel Order
```
POST /orders/{order_id}/cancel
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "aaa0e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled",
    "refunded_coins": 8000,
    "cancelled_at": "2024-02-17T11:45:20Z"
  }
}

Errors:
- 401: UNAUTHORIZED
- 404: NOT_FOUND
- 409: CANNOT_CANCEL_SHIPPED
```

---

### Achievement Endpoints

#### Get All Achievements
```
GET /achievements
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "achievements": [
      {
        "id": "bbb0e8400-e29b-41d4-a716-446655440000",
        "code": "steps_10k",
        "name": "Daily Goal",
        "description": "Walk 10,000 steps",
        "icon_url": "https://cdn.fitkart.com/badges/daily-goal.png",
        "badge_color": "#90EE90",
        "reward_coins": 50,
        "is_unlocked": true,
        "unlocked_at": "2024-02-15T14:22:10Z"
      },
      ...
    ],
    "total": 7,
    "unlocked_count": 5
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get User Achievements
```
GET /users/me/achievements
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "achievements": [
      {
        "id": "bbb0e8400-e29b-41d4-a716-446655440000",
        "code": "steps_10k",
        "name": "Daily Goal",
        "icon_url": "https://cdn.fitkart.com/badges/daily-goal.png",
        "badge_color": "#90EE90",
        "reward_coins": 50,
        "unlocked_at": "2024-02-15T14:22:10Z"
      },
      ...
    ],
    "total_unlocked": 5
  }
}

Errors:
- 401: UNAUTHORIZED
```

---

### Leaderboard Endpoints

#### Get Weekly Leaderboard
```
GET /leaderboard/weekly
Authorization: Bearer {access_token}
Query Parameters:
  - limit: 100 (default, max 1000)
  - offset: 0 (for pagination)

Response (200 OK):
{
  "status": "success",
  "data": {
    "period": "weekly",
    "week_start": "2024-02-12",
    "week_end": "2024-02-18",
    "rankings": [
      {
        "rank": 1,
        "user_id": "ccc0e8400-e29b-41d4-a716-446655440000",
        "full_name": "Alice Smith",
        "profile_picture_url": "https://...",
        "total_steps": 145000,
        "is_current_user": false
      },
      ...
    ],
    "current_user_rank": 42,
    "total_users": 1234
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get Monthly Leaderboard
```
GET /leaderboard/monthly
Authorization: Bearer {access_token}
Query Parameters:
  - limit: 100 (default, max 1000)
  - offset: 0 (for pagination)

Response (200 OK):
{
  "status": "success",
  "data": {
    "period": "monthly",
    "month": "2024-02",
    "rankings": [...]
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get All-Time Leaderboard
```
GET /leaderboard/all-time
Authorization: Bearer {access_token}
Query Parameters:
  - limit: 100 (default, max 1000)
  - offset: 0 (for pagination)

Response (200 OK):
{
  "status": "success",
  "data": {
    "period": "all_time",
    "rankings": [...]
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get User's Ranking Context
```
GET /leaderboard/me
Authorization: Bearer {access_token}
Query Parameters:
  - period: weekly|monthly|all_time (default: weekly)

Response (200 OK):
{
  "status": "success",
  "data": {
    "current_rank": 42,
    "total_users": 1234,
    "users_ahead": 41,
    "users_behind": 1151,
    "total_steps": 85432,
    "surrounding_users": [
      {
        "rank": 40,
        "full_name": "Bob Johnson",
        "total_steps": 85600
      },
      {
        "rank": 41,
        "full_name": "Charlie Brown",
        "total_steps": 85520
      },
      {
        "rank": 42,
        "full_name": "Your Name",
        "total_steps": 85432,
        "is_current_user": true
      },
      {
        "rank": 43,
        "full_name": "David Lee",
        "total_steps": 85300
      }
    ]
  }
}

Errors:
- 401: UNAUTHORIZED
```

---

### Store Endpoints

#### Get All Products
```
GET /store/products
Authorization: Bearer {access_token}
Query Parameters:
  - limit: 20 (default, max 100)
  - offset: 0 (for pagination)
  - category: string (optional)
  - sort_by: popularity|price|newest (default: popularity)

Response (200 OK):
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "ddd0e8400-e29b-41d4-a716-446655440000",
        "name": "Fitness Tracker Band",
        "description": "Premium activity tracking band",
        "coin_price": 5000,
        "retail_price": 49.99,
        "image_url": "https://cdn.fitkart.com/products/tracker-band.jpg",
        "stock_quantity": 50,
        "category": "wearables",
        "rating": 4.5,
        "review_count": 234
      },
      ...
    ],
    "total": 100,
    "offset": 0,
    "limit": 20,
    "categories": ["wearables", "accessories", "gift-cards"]
  }
}

Errors:
- 401: UNAUTHORIZED
```

#### Get Product Details
```
GET /store/products/{product_id}
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "ddd0e8400-e29b-41d4-a716-446655440000",
    "name": "Fitness Tracker Band",
    "description": "Premium activity tracking band",
    "coin_price": 5000,
    "retail_price": 49.99,
    "image_url": "https://cdn.fitkart.com/products/tracker-band.jpg",
    "images": [
      "https://cdn.fitkart.com/products/tracker-band-1.jpg",
      "https://cdn.fitkart.com/products/tracker-band-2.jpg"
    ],
    "stock_quantity": 50,
    "category": "wearables",
    "rating": 4.5,
    "review_count": 234,
    "reviews": [
      {
        "rating": 5,
        "comment": "Great product!",
        "reviewer_name": "John D.",
        "created_at": "2024-01-15T10:30:45Z"
      }
    ]
  }
}

Errors:
- 401: UNAUTHORIZED
- 404: NOT_FOUND
```

#### Search Products
```
GET /store/search
Authorization: Bearer {access_token}
Query Parameters:
  - q: string (search query, required)
  - limit: 20 (default)
  - offset: 0

Response (200 OK):
{
  "status": "success",
  "data": {
    "products": [...],
    "total": 15,
    "query": "tracker"
  }
}

Errors:
- 400: QUERY_REQUIRED
- 401: UNAUTHORIZED
```

---

### Admin Endpoints

#### Get All Users (Admin)
```
GET /admin/users
Authorization: Bearer {admin_token}
Query Parameters:
  - limit: 50 (default, max 500)
  - offset: 0
  - search: string (email or name)
  - status: active|inactive|suspended
  - sort_by: created_at|steps|coins (default: created_at)

Response (200 OK):
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "full_name": "John Doe",
        "total_steps": 1234567,
        "total_coins": 5000,
        "is_active": true,
        "is_suspended": false,
        "created_at": "2024-01-15T10:30:45Z",
        "last_login_at": "2024-02-17T08:15:30Z"
      },
      ...
    ],
    "total": 10000,
    "offset": 0,
    "limit": 50
  }
}

Errors:
- 401: UNAUTHORIZED
- 403: FORBIDDEN
```

#### Get Platform Analytics (Admin)
```
GET /admin/analytics
Authorization: Bearer {admin_token}
Query Parameters:
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD
  - metric: dau|wau|total_steps|coin_economy (optional, get all if not specified)

Response (200 OK):
{
  "status": "success",
  "data": {
    "summary": {
      "total_users": 12500,
      "active_today": 8320,
      "active_week": 11200,
      "total_steps_today": 125000000,
      "total_coins_earned": 2500000,
      "total_coins_spent": 1800000
    },
    "daily_trends": [
      {
        "date": "2024-02-10",
        "active_users": 8100,
        "total_steps": 122000000,
        "new_users": 50,
        "new_orders": 234
      },
      ...
    ]
  }
}

Errors:
- 401: UNAUTHORIZED
- 403: FORBIDDEN
```

#### Get Settings (Admin)
```
GET /admin/settings
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "settings": [
      {
        "key": "coins_per_step",
        "value": "1",
        "description": "Number of coins earned per step"
      },
      {
        "key": "daily_step_goal",
        "value": "10000",
        "description": "Daily step goal for achievements"
      },
      ...
    ]
  }
}

Errors:
- 401: UNAUTHORIZED
- 403: FORBIDDEN
```

#### Update Settings (Admin)
```
PUT /admin/settings/{key}
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "value": "2"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "key": "coins_per_step",
    "value": "2",
    "updated_at": "2024-02-17T10:30:45Z"
  }
}

Errors:
- 400: VALIDATION_FAILED
- 401: UNAUTHORIZED
- 403: FORBIDDEN
```

#### Review Suspicious Steps (Admin)
```
GET /admin/steps/suspicious
Authorization: Bearer {admin_token}
Query Parameters:
  - limit: 50
  - offset: 0
  - status: pending|approved|rejected

Response (200 OK):
{
  "status": "success",
  "data": {
    "records": [
      {
        "id": "vvv0e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "user_email": "user@example.com",
        "recorded_date": "2024-02-16",
        "steps": 85432,
        "expected_steps": 12000,
        "anomaly_score": 92,
        "validation_reason": "Extreme spike compared to average",
        "status": "pending",
        "created_at": "2024-02-16T18:30:45Z"
      },
      ...
    ],
    "total": 15
  }
}

Errors:
- 401: UNAUTHORIZED
- 403: FORBIDDEN
```

#### Approve Suspicious Steps (Admin)
```
POST /admin/steps/{step_id}/approve
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "vvv0e8400-e29b-41d4-a716-446655440000",
    "status": "approved",
    "coins_awarded": 85,
    "approved_at": "2024-02-17T10:30:45Z"
  }
}

Errors:
- 401: UNAUTHORIZED
- 403: FORBIDDEN
- 404: NOT_FOUND
```

#### Reject Suspicious Steps (Admin)
```
POST /admin/steps/{step_id}/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "reason": "Impossible speed detected"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "id": "vvv0e8400-e29b-41d4-a716-446655440000",
    "status": "rejected",
    "coins_revoked": 85,
    "rejected_at": "2024-02-17T10:30:45Z"
  }
}

Errors:
- 401: UNAUTHORIZED
- 403: FORBIDDEN
- 404: NOT_FOUND
```

---

## Rate Limiting

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1645025045
```

### Limits by Endpoint Type
| Type | Limit | Window |
|------|-------|--------|
| **Public** | 100/min | Per IP |
| **Authenticated** | 1000/hour | Per user |
| **Admin** | 5000/hour | Per admin |
| **Steps Recording** | 100/day | Per user |
| **File Upload** | 10/hour | Per user |

### 429 Response
```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "reset_at": "2024-02-17T11:30:45Z"
  }
}
```

---

## Versioning

### API Versions
- **Version 1.0** (Current) - FitKart mobile and web apps
- **Version 2.0** (Planned) - Enhanced features

### Version Management
- Specify version in header: `X-API-Version: 1.0`
- Version in URL path: `/api/v1/...` (future)
- Deprecation warnings provided 6 months in advance

---

## WebSocket Endpoints (Real-time Updates)

### Real-time Step Updates
```
WS /ws/steps
Headers: { Authorization: "Bearer {access_token}" }

Message Structure:
{
  "type": "step_update",
  "data": {
    "current_steps": 8432,
    "distance": 6.2,
    "timestamp": "2024-02-17T10:30:45Z"
  }
}
```

### Live Leaderboard
```
WS /ws/leaderboard
Headers: { Authorization: "Bearer {access_token}" }

Message Structure:
{
  "type": "rank_change",
  "data": {
    "old_rank": 45,
    "new_rank": 42,
    "users_details": {...}
  }
}
```

---

## Pagination

### Query Parameters
```
GET /endpoint?limit=20&offset=0

limit:  Number of items to return (default: varies by endpoint, max: 100)
offset: Number of items to skip (default: 0)
```

### Response Structure
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "total": 500,
    "limit": 20,
    "offset": 0,
    "has_next": true,
    "has_previous": false
  }
}
```

---

## Filtering & Sorting

### Common Query Parameters
```
GET /endpoint?sort=-created_at&filter[status]=active&filter[category]=wearables

sort:      Column name with - prefix for descending (-created_at)
filter[]:  Multiple filters with bracket notation
search:    Full-text search query
```

---

## Changelog

### v1.0.0 (2024-02-17)
- Initial public API release
- Authentication system (JWT, OAuth)
- Step tracking endpoints
- Coin management
- Order management
- Leaderboard system
- Achievement unlocking
- Admin endpoints

---

**Last Updated:** February 17, 2024  
**Next Review:** Q1 2025  
**Contact:** api@fitkart.com
