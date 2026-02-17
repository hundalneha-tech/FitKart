// backend/src/routes/achievements.ts

import { Router } from 'express';
import { AchievementController } from '../controllers/AchievementController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new AchievementController();

// Schema definitions
const unlockAchievementSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
});

const checkAndUnlockSchema = Joi.object({
  total_steps: Joi.number(),
  total_coins: Joi.number(),
  total_orders: Joi.number(),
  current_streak: Joi.number(),
  consecutive_days: Joi.number(),
});

/**
 * Achievement Routes
 * GET /achievements - Get all achievements
 * GET /achievements/:id - Get achievement details
 * GET /achievements/user - Get user's achievements
 * POST /achievements/:id/unlock - Unlock achievement (admin)
 * GET /achievements/:id/leaderboard - Get achievement holders
 * GET /achievements/:id/progress - Get progress toward achievement
 * POST /achievements/check - Check and unlock achievements
 */

// Get all achievements
router.get(
  '/',
  rateLimitMiddleware.api,
  (req, res) => controller.getAll(req, res)
);

// Get achievement details
router.get(
  '/:id',
  rateLimitMiddleware.api,
  (req, res) => controller.getAchievement(req, res)
);

// Get user's achievements
router.get(
  '/user/achievements',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getUserAchievements(req, res)
);

// Unlock achievement (admin)
router.post(
  '/:id/unlock',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(unlockAchievementSchema),
  (req, res) => controller.unlockAchievement(req, res)
);

// Get achievement leaderboard
router.get(
  '/:id/leaderboard',
  rateLimitMiddleware.api,
  (req, res) => controller.getAchievementLeaderboard(req, res)
);

// Get progress
router.get(
  '/:id/progress',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getProgress(req, res)
);

// Check and unlock
router.post(
  '/check',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(checkAndUnlockSchema),
  (req, res) => controller.checkAndUnlock(req, res)
);

export default router;
