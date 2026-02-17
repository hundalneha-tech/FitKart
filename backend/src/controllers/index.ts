// backend/src/controllers/index.ts

/**
 * Controller Layer - HTTP Request Handlers
 *
 * Controllers handle HTTP requests and delegate to services.
 * Each controller:
 * - Extends a request with user context (AuthRequest)
 * - Validates request parameters and body
 * - Calls appropriate service methods
 * - Formats responses using successResponse() / validationErrorResponse()
 * - Lets error middleware handle exceptions
 *
 * No business logic should be in controllers - only request/response handling.
 * All domain logic belongs in services.
 */

export { AuthController, type AuthRequest } from './AuthController';
export { UserController } from './UserController';
export { CoinController } from './CoinController';
export { StepController } from './StepController';
export { OrderController } from './OrderController';
export { AchievementController } from './AchievementController';
export { LeaderboardController } from './LeaderboardController';
export { StoreController } from './StoreController';
export { AdminController } from './AdminController';

/**
 * Controller Methods Summary
 *
 * AuthController (8 methods / endpoints):
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/send-otp
 * - POST /auth/verify-otp
 * - POST /auth/refresh-token
 * - POST /auth/logout
 * - GET /auth/profile
 * - POST /auth/verify-email
 *
 * UserController (8 methods / endpoints):
 * - GET /users/profile
 * - PUT /users/profile
 * - GET /users/stats
 * - GET /users/:id/public
 * - POST /users/picture
 * - DELETE /users/:id (block)
 * - GET /users/search
 * - GET /users (list - admin)
 *
 * CoinController (7 methods / endpoints):
 * - GET /coins/balance
 * - GET /coins/history
 * - POST /coins/check-balance
 * - POST /coins/add (admin)
 * - POST /coins/spend
 * - POST /coins/freeze
 * - POST /coins/unfreeze
 *
 * StepController (8 methods / endpoints):
 * - POST /steps/record
 * - GET /steps/today
 * - GET /steps/weekly
 * - GET /steps/monthly
 * - GET /steps/history
 * - GET /steps/streak
 * - GET /steps/best-day
 * - GET /steps/daily/:date
 *
 * OrderController (8 methods / endpoints):
 * - POST /orders
 * - GET /orders
 * - GET /orders/:id
 * - POST /orders/:id/confirm
 * - POST /orders/:id/cancel
 * - PUT /orders/:id/status (admin)
 * - GET /orders/code/:code
 * - GET /orders/pending (admin)
 *
 * AchievementController (6 methods / endpoints):
 * - GET /achievements
 * - GET /achievements/:id
 * - GET /achievements/user
 * - POST /achievements/:id/unlock (admin)
 * - GET /achievements/:id/leaderboard
 * - GET /achievements/:id/progress
 *
 * LeaderboardController (7 methods / endpoints):
 * - GET /leaderboard/weekly
 * - GET /leaderboard/monthly
 * - GET /leaderboard/all-time
 * - GET /leaderboard/context
 * - GET /leaderboard/country/:code
 * - GET /leaderboard/friends
 * - POST /leaderboard/refresh (admin)
 *
 * StoreController (7 methods / endpoints):
 * - GET /store/products
 * - GET /store/products/:id
 * - GET /store/search
 * - GET /store/featured
 * - GET /store/stats
 * - POST /store/products (admin)
 * - PUT /store/products/:id (admin)
 *
 * AdminController (13 methods / endpoints):
 * - GET /admin/users
 * - PUT /admin/users/:id/role
 * - GET /admin/analytics
 * - GET /admin/notifications/stats
 * - GET /admin/settings
 * - GET /admin/settings/:key
 * - PUT /admin/settings/:key
 * - GET /admin/suspicious
 * - POST /admin/suspicious/:id/approve
 * - POST /admin/suspicious/:id/reject
 * - GET /admin/health
 * - POST /admin/reports
 * - POST /admin/notifications/broadcast
 *
 * TOTAL: 72+ endpoints implemented
 *
 * Request Pattern:
 * ```typescript
 * async myEndpoint(req: AuthRequest, res: Response): Promise<void> {
 *   const userId = req.user?.id;
 *   
 *   // 1. Validate
 *   if (!userId) {
 *     res.status(401).json(validationErrorResponse(...));
 *     return;
 *   }
 *   
 *   // 2. Call Service
 *   const result = await this.service.doSomething(userId);
 *   
 *   // 3. Respond
 *   res.json(successResponse(result, 'Message', 'event_name'));
 * }
 * ```
 *
 * Error Handling:
 * - Service throws AppError subclass
 * - Error middleware catches and formats
 * - Consistent error response with proper HTTP status
 * - No try/catch needed in controllers
 *
 * Authentication:
 * - AuthMiddleware injects user context into req.user
 * - req.user contains: id, email, role
 * - Admin endpoints check req.user.role === 'admin'
 * - Optional auth endpoints use optionalAuthMiddleware
 */
