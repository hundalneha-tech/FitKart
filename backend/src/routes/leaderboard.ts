// backend/src/routes/leaderboard.ts

import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';

const router = Router();
const controller = new LeaderboardController();

/**
 * Leaderboard Routes
 * GET /leaderboard/weekly - Get weekly rankings
 * GET /leaderboard/monthly - Get monthly rankings
 * GET /leaderboard/all-time - Get all-time rankings
 * GET /leaderboard/context - Get user's rank and position
 * GET /leaderboard/country/:code - Get country rankings
 * GET /leaderboard/friends - Get friends rankings
 * POST /leaderboard/refresh - Refresh cache (admin)
 */

// Get weekly leaderboard
router.get(
  '/weekly',
  rateLimitMiddleware.api,
  (req, res) => controller.getWeeklyLeaderboard(req, res)
);

// Get monthly leaderboard
router.get(
  '/monthly',
  rateLimitMiddleware.api,
  (req, res) => controller.getMonthlyLeaderboard(req, res)
);

// Get all-time leaderboard
router.get(
  '/all-time',
  rateLimitMiddleware.api,
  (req, res) => controller.getAllTimeLeaderboard(req, res)
);

// Get user context
router.get(
  '/context',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getUserContext(req, res)
);

// Get country leaderboard
router.get(
  '/country/:code',
  rateLimitMiddleware.api,
  (req, res) => controller.getCountryLeaderboard(req, res)
);

// Get friends leaderboard
router.get(
  '/friends',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getFriendsLeaderboard(req, res)
);

// Refresh cache (admin)
router.post(
  '/refresh',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  (req, res) => controller.refreshCache(req, res)
);

export default router;
