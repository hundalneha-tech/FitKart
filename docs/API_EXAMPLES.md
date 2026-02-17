# FitKart API - Request/Response Examples

## Authentication Examples

### Register User

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: api.fitkart.com
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "phone": "+14155552671",
  "country_code": "+1"
}
```

**Response (201 Created):**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Set-Cookie: refresh_token=ref_abc123def456; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDgyMjI2NDUsImV4cCI6MTcwODIyMzU0NSwiaXNzIjoiZml0a2FydCIsImF1ZCI6ImZpdGthcnQtbW9iaWxlIn0.signature",
    "refresh_token": "ref_abc123def456",
    "expires_in": 900,
    "token_type": "Bearer"
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_550e8400"
}
```

**Error Response (400):**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "status": "validation_error",
  "error": {
    "code": "PASSWORD_WEAK",
    "message": "Password must be at least 8 characters",
    "details": {
      "field": "password",
      "reason": "Must contain uppercase, lowercase, number, and special character",
      "requirements": {
        "min_length": 8,
        "uppercase": true,
        "lowercase": true,
        "number": true,
        "special_char": true
      }
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_550e8400"
}
```

---

## Step Tracking Examples

### Record Steps

**Request:**
```http
POST /api/steps/record HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "steps": 8432,
  "distance": 6.2,
  "calories": 420,
  "heart_points": 250,
  "source": "google_fit",
  "recorded_date": "2024-02-17"
}
```

**Response (201 Created):**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "steps": 8432,
    "distance": 6.2,
    "calories": 420,
    "heart_points": 250,
    "source": "google_fit",
    "recorded_date": "2024-02-17",
    "is_verified": false,
    "coins_awarded": 8,
    "created_at": "2024-02-17T10:30:45Z"
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_660e8400"
}
```

**Error Response (403 - Suspicious Activity):**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "SUSPICIOUS_ACTIVITY",
    "message": "Step submission flagged for review",
    "details": {
      "reason": "Extreme spike compared to average",
      "expected_steps": 10000,
      "reported_steps": 150000,
      "anomaly_score": 95,
      "action": "Submitted for admin review. You will be notified of the outcome."
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_660e8400"
}
```

---

### Get Weekly Steps

**Request:**
```http
GET /api/steps/week?week_of=2024-02-12 HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=300

{
  "status": "success",
  "data": {
    "week_start": "2024-02-12",
    "week_end": "2024-02-18",
    "total_steps": 65432,
    "weekly_goal": 100000,
    "goal_percentage": 65.4,
    "daily_breakdown": [
      {
        "date": "2024-02-12",
        "day_name": "Monday",
        "steps": 9234,
        "distance": 6.8,
        "calories": 462,
        "daily_goal": 10000,
        "goal_met": false
      },
      {
        "date": "2024-02-13",
        "day_name": "Tuesday",
        "steps": 10932,
        "distance": 8.1,
        "calories": 546,
        "daily_goal": 10000,
        "goal_met": true
      },
      {
        "date": "2024-02-14",
        "day_name": "Wednesday",
        "steps": 0,
        "distance": 0,
        "calories": 0,
        "daily_goal": 10000,
        "goal_met": false
      },
      {
        "date": "2024-02-15",
        "day_name": "Thursday",
        "steps": 8765,
        "distance": 6.4,
        "calories": 438,
        "daily_goal": 10000,
        "goal_met": false
      },
      {
        "date": "2024-02-16",
        "day_name": "Friday",
        "steps": 11234,
        "distance": 8.3,
        "calories": 561,
        "daily_goal": 10000,
        "goal_met": true
      },
      {
        "date": "2024-02-17",
        "day_name": "Saturday",
        "steps": 8432,
        "distance": 6.2,
        "calories": 421,
        "daily_goal": 10000,
        "goal_met": false
      },
      {
        "date": "2024-02-18",
        "day_name": "Sunday",
        "steps": 0,
        "distance": 0,
        "calories": 0,
        "daily_goal": 10000,
        "goal_met": false
      }
    ],
    "days_active": 5,
    "best_day": {
      "date": "2024-02-16",
      "steps": 11234
    },
    "average_steps": 13086,
    "streak": 2
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_weekly"
}
```

---

## Order Examples

### Create Order

**Request:**
```http
POST /api/orders HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

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
    "street": "123 Main Street",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94103",
    "country": "US"
  }
}
```

**Response (201 Created):**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "data": {
    "id": "aaa0e8400-e29b-41d4-a716-446655440000",
    "order_code": "FK-2024-00123",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "total_coins": 8000,
    "status": "pending",
    "items": [
      {
        "id": "item_001",
        "product_id": "880e8400-e29b-41d4-a716-446655440000",
        "product_name": "Fitness Tracker Band",
        "quantity": 1,
        "coin_price_at_purchase": 5000,
        "total_coins": 5000,
        "image_url": "https://cdn.fitkart.com/products/tracker-band.jpg"
      },
      {
        "id": "item_002",
        "product_id": "990e8400-e29b-41d4-a716-446655440000",
        "product_name": "$10 Gift Card",
        "quantity": 2,
        "coin_price_at_purchase": 1000,
        "total_coins": 2000,
        "image_url": "https://cdn.fitkart.com/products/gift-card.jpg"
      }
    ],
    "shipping_address": {
      "full_name": "John Doe",
      "street": "123 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94103",
      "country": "US"
    },
    "estimated_delivery": "2024-02-22T23:59:59Z",
    "created_at": "2024-02-17T10:30:45Z"
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_aaa0e8400"
}
```

**Error Response (400 - Insufficient Coins):**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_COINS",
    "message": "Not enough coins to complete this order",
    "details": {
      "required_coins": 8000,
      "available_coins": 5000,
      "coins_short": 3000,
      "suggestion": "Try removing items or wait for more coins from step tracking"
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_aaa0e8400"
}
```

---

## Leaderboard Examples

### Get Weekly Leaderboard

**Request:**
```http
GET /api/leaderboard/weekly?limit=10&offset=0 HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=3600

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
        "profile_picture_url": "https://cdn.fitkart.com/profiles/alice.jpg",
        "total_steps": 145000,
        "distance": 106.8,
        "coins_earned": 145,
        "is_current_user": false
      },
      {
        "rank": 2,
        "user_id": "ddd0e8400-e29b-41d4-a716-446655440000",
        "full_name": "Bob Johnson",
        "profile_picture_url": "https://cdn.fitkart.com/profiles/bob.jpg",
        "total_steps": 132000,
        "distance": 97.4,
        "coins_earned": 132,
        "is_current_user": false
      },
      {
        "rank": 3,
        "user_id": "eee0e8400-e29b-41d4-a716-446655440000",
        "full_name": "Charlie Brown",
        "profile_picture_url": "https://cdn.fitkart.com/profiles/charlie.jpg",
        "total_steps": 125000,
        "distance": 92.3,
        "coins_earned": 125,
        "is_current_user": false
      },
      {
        "rank": 42,
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "profile_picture_url": "https://cdn.fitkart.com/profiles/john.jpg",
        "total_steps": 65432,
        "distance": 48.3,
        "coins_earned": 65,
        "is_current_user": true
      }
    ],
    "current_user": {
      "rank": 42,
      "total_users": 12543
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_leaderboard"
}
```

---

## Error Examples

### 401 Unauthorized - Invalid Token

**Request:**
```http
GET /api/users/me HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer invalid_token_abc123
```

**Response:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "AUTH_TOKEN_INVALID",
    "message": "Invalid or expired authentication token",
    "details": {
      "reason": "Token signature verification failed"
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_invalid_token"
}
```

### 429 Too Many Requests - Rate Limited

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: api.fitkart.com
Content-Type: application/json

(making 11th request in 1 minute from same IP)
```

**Response:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP",
    "details": {
      "limit": 10,
      "window": 60,
      "retry_after_seconds": 45
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_rate_limited"
}
```

### 404 Not Found

**Request:**
```http
GET /api/orders/invalid_order_id HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found",
    "details": {
      "resource": "order",
      "id": "invalid_order_id"
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_404"
}
```

---

## Batch Request Examples

### Sync Multiple Day Steps

**Request:**
```http
POST /api/steps/batch HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "records": [
    {
      "steps": 10234,
      "distance": 7.5,
      "calories": 511,
      "source": "google_fit",
      "recorded_date": "2024-02-14"
    },
    {
      "steps": 0,
      "distance": 0,
      "calories": 0,
      "source": "manual",
      "recorded_date": "2024-02-15"
    },
    {
      "steps": 8765,
      "distance": 6.4,
      "calories": 438,
      "source": "google_fit",
      "recorded_date": "2024-02-16"
    }
  ]
}
```

**Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "data": {
    "processed": 3,
    "successful": 2,
    "failed": 1,
    "results": [
      {
        "recorded_date": "2024-02-14",
        "status": "success",
        "coins_awarded": 10
      },
      {
        "recorded_date": "2024-02-15",
        "status": "success",
        "coins_awarded": 0
      },
      {
        "recorded_date": "2024-02-16",
        "status": "failed",
        "error": "SUSPICIOUS_ACTIVITY",
        "message": "Flagged for admin review"
      }
    ],
    "total_coins_awarded": 10
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_batch_001"
}
```

---

## Pagination Examples

### Query Page of Orders

**Request:**
```http
GET /api/orders?limit=10&offset=20 HTTP/1.1
Host: api.fitkart.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "data": {
    "orders": [...],
    "pagination": {
      "total": 47,
      "limit": 10,
      "offset": 20,
      "has_next": true,
      "has_previous": true,
      "total_pages": 5,
      "current_page": 3,
      "next_offset": 30,
      "previous_offset": 10
    }
  },
  "timestamp": "2024-02-17T10:30:45Z",
  "request_id": "req_orders_page3"
}
```

---

**Last Updated:** February 17, 2024  
**API Version:** 1.0.0
