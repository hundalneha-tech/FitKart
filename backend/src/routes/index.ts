// backend/src/routes/index.ts

/**
 * Routes - HTTP Endpoint Definitions
 *
 * Each route file:
 * - Imports controllers
 * - Defines Joi validation schemas
 * - Wires middleware to endpoints
 * - Delegates to controller methods
 * - Returns Express Router
 *
 * Middleware applied per endpoint:
 * - authMiddleware: Requires JWT authentication
 * - adminMiddleware: Requires admin role
 * - validationMiddleware: Validates request body/params
 * - rateLimitMiddleware: Rate limiting (auth/api/sensitive/public/steps)
 *
 * All routes are mounted with /api/v1 prefix in main app
 */

import authRoutes from './auth';
import usersRoutes from './users';
import coinsRoutes from './coins';
import stepsRoutes from './steps';
import ordersRoutes from './orders';
import achievementsRoutes from './achievements';
import leaderboardRoutes from './leaderboard';
import storeRoutes from './store';
import adminRoutes from './admin';

export {
  authRoutes,
  usersRoutes,
  coinsRoutes,
  stepsRoutes,
  ordersRoutes,
  achievementsRoutes,
  leaderboardRoutes,
  storeRoutes,
  adminRoutes,
};

/**
 * Route Registration Summary
 *
 * Prefix: /api/v1
 *
 * Auth Routes (/api/v1/auth):
 * - POST /register
 * - POST /login
 * - POST /send-otp
 * - POST /verify-otp
 * - POST /refresh-token
 * - POST /logout
 * - GET /profile
 * - POST /verify-email
 * Total: 8 endpoints
 *
 * Users Routes (/api/v1/users):
 * - GET /profile
 * - PUT /profile
 * - GET /stats
 * - GET /:id/public
 * - POST /picture
 * - DELETE /:id (admin)
 * - GET /search
 * - GET / (admin)
 * - POST /:id/unblock (admin)
 * - GET /:id/stats
 * - GET /:id/verify-email/:token
 * Total: 11 endpoints
 *
 * Coins Routes (/api/v1/coins):
 * - GET /balance
 * - GET /history
 * - POST /check-balance
 * - POST /add (admin)
 * - POST /spend
 * - POST /freeze
 * - POST /unfreeze
 * - GET /stats
 * Total: 8 endpoints
 *
 * Steps Routes (/api/v1/steps):
 * - POST /record
 * - GET /today
 * - GET /weekly
 * - GET /monthly
 * - GET /history
 * - GET /streak
 * - GET /best-day
 * - GET /daily/:date
 * - GET /:userId/public
 * Total: 9 endpoints
 *
 * Orders Routes (/api/v1/orders):
 * - POST / (create)
 * - GET / (list)
 * - GET /:id
 * - POST /:id/confirm
 * - POST /:id/cancel
 * - PUT /:id/status (admin)
 * - GET /code/:code
 * - GET /admin/pending (admin)
 * - GET /admin/stats (admin)
 * Total: 9 endpoints
 *
 * Achievements Routes (/api/v1/achievements):
 * - GET / (all)
 * - GET /:id
 * - GET /user/achievements
 * - POST /:id/unlock (admin)
 * - GET /:id/leaderboard
 * - GET /:id/progress
 * - POST /check
 * Total: 7 endpoints
 *
 * Leaderboard Routes (/api/v1/leaderboard):
 * - GET /weekly
 * - GET /monthly
 * - GET /all-time
 * - GET /context
 * - GET /country/:code
 * - GET /friends
 * - POST /refresh (admin)
 * Total: 7 endpoints
 *
 * Store Routes (/api/v1/store):
 * - GET /products
 * - GET /products/:id
 * - GET /search
 * - GET /featured
 * - GET /stats
 * - POST /products (admin)
 * - PUT /products/:id (admin)
 * - POST /sync-shopify (admin)
 * Total: 8 endpoints
 *
 * Admin Routes (/api/v1/admin):
 * - GET /users
 * - PUT /users/:id/role
 * - GET /analytics
 * - GET /notifications/stats
 * - GET /settings
 * - GET /settings/:key
 * - PUT /settings/:key
 * - GET /suspicious
 * - POST /suspicious/:id/approve
 * - POST /suspicious/:id/reject
 * - GET /health
 * - POST /reports
 * - POST /notifications/broadcast
 * - POST /users/:id/export-data
 * Total: 14 endpoints
 *
 * GRAND TOTAL: 81 endpoints
 *
 * Rate Limiting by Endpoint Type:
 * - Auth endpoints: 10 requests/minute
 * - API endpoints: 1000 requests/hour
 * - Sensitive (admin): 5 requests/minute
 * - Public: 100 requests/minute
 * - Step recording: 100 requests/day
 *
 * Authentication:
 * - Public endpoints: No auth required
 * - Protected endpoints: Require JWT in Authorization header
 * - Admin endpoints: Require admin role
 * - Optional endpoints: Auth attempted if header present, continues if fails
 */
