# FitKart API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `POST /auth/apple` - Apple OAuth login
- `POST /auth/otp/send` - Send OTP to email
- `POST /auth/otp/verify` - Verify OTP and login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `GET /users/:id/stats` - Get user statistics
- `GET /users/leaderboard` - Get global leaderboard
- `GET /users/leaderboard/friends` - Get friends leaderboard

### Steps
- `POST /steps/record` - Record steps from device
- `GET /steps/today` - Get today's steps
- `GET /steps/week` - Get weekly steps
- `GET /steps/history` - Get step history

### Coins
- `GET /coins/balance` - Get coin balance
- `GET /coins/history` - Get transaction history
- `POST /coins/earn` - Earn coins from steps
- `POST /coins/redeem` - Redeem coins for products

### Store
- `GET /store/products` - Get all store products
- `GET /store/products/:id` - Get product details
- `POST /store/cart/add` - Add item to cart
- `GET /store/cart` - Get shopping cart
- `DELETE /store/cart/:itemId` - Remove cartitem

### Rewards
- `GET /rewards/achievements` - Get user achievements
- `GET /rewards/achievements/all` - Get all available achievements
- `GET /rewards/badges` - Get user badges

### Admin
- `GET /admin/users` - List all users
- `GET /admin/analytics` - Get platform analytics
- `GET /admin/logs` - Get activity logs

## Response Format
```json
{
  "status": "success|error",
  "data": {},
  "message": "Optional message",
  "error": "Optional error details"
}
```

## Error Codes
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict
- `429` - Rate limited
- `500` - Server error
