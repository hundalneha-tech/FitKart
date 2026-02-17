// backend/src/services/index.ts

/**
 * Service Layer - Business Logic for All Endpoints
 *
 * This layer contains the core business logic for FitKart.
 * Services:
 * - Use repositories for data access
 * - Implement domain logic and validation
 * - Return domain objects (not database entities)
 * - Throw specific error types for error handling
 * - Are stateless and independent
 *
 * Service-to-Repository Mapping:
 * - AuthService → UserRepository
 * - UserService → UserRepository
 * - CoinService → WalletRepository, CoinTransactionRepository
 * - StepService → StepRecordRepository
 * - OrderService → OrderRepository
 * - AchievementService → (in-memory for MVP, db in production)
 * - LeaderboardService → (computed from raw data)
 * - StoreService → (mock data for MVP, product db in production)
 * - AdminService → UserRepository, StepRecordRepository
 */

export { AuthService } from './AuthService';
export { UserService } from './UserService';
export { CoinService } from './CoinService';
export { StepService } from './StepService';
export { OrderService } from './OrderService';
export { AchievementService } from './AchievementService';
export { LeaderboardService } from './LeaderboardService';
export { StoreService } from './StoreService';
export { AdminService } from './AdminService';

/**
 * Service Interface Types
 * (Exported for use in Controllers)
 */

// Auth
export type { AuthService as IAuthService } from './AuthService';
export type { UserProfile, UserStats, UpdateProfileInput } from './UserService';

// Coins
export type { CoinBalance } from './CoinService';

// Steps
export type {
  StepRecord,
  StepsForDate,
  WeeklyStats,
  MonthlyStats,
} from './StepService';

// Orders
export type { Order, OrderItem, OrderDetail, OrderStatus, OrderCreate } from './OrderService';

// Achievements
export type { Achievement, UserAchievement } from './AchievementService';

// Leaderboard
export type { LeaderboardEntry, UserLeaderboardContext } from './LeaderboardService';

// Store
export type { Product, ProductDetail, StoreStats } from './StoreService';

// Admin
export type {
  UserManagementData,
  PlatformAnalytics,
  SuspiciousActivity,
  Setting,
} from './AdminService';

/**
 * Service Instantiation Pattern
 *
 * Each service is instantiated with:
 * - Constructor dependency injection of repositories
 * - Singleton pattern for shared resources (Redis, DB connection)
 * - No global state except configuration
 *
 * Usage in Controllers:
 * ```typescript
 * class UserController {
 *   private userService = new UserService();
 *
 *   async getProfile(req: AuthRequest, res: Response) {
 *     try {
 *       const profile = await this.userService.getProfile(req.user.id);
 *       res.json(successResponse(profile));
 *     } catch (error) {
 *       // Error middleware handles
 *       throw error;
 *     }
 *   }
 * }
 * ```
 */
