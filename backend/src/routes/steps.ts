// backend/src/routes/steps.ts

import { Router } from 'express';
import { StepController } from '../controllers/StepController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new StepController();

// Schema definitions
const recordStepsSchema = Joi.object({
  steps: Joi.number().integer().positive().required(),
  distance: Joi.number().positive(),
  source: Joi.string().valid('manual', 'device', 'wearable', 'import').default('manual'),
});

/**
 * Step Routes
 * POST /steps/record - Record step count
 * GET /steps/today - Get today's steps
 * GET /steps/weekly - Get weekly stats
 * GET /steps/monthly - Get monthly stats
 * GET /steps/history - Get step history
 * GET /steps/streak - Get current streak
 * GET /steps/best-day - Get best day
 * GET /steps/daily/:date - Get steps for date
 * GET /steps/:userId/public - Get public stats
 */

// Record steps
router.post(
  '/record',
  authMiddleware,
  rateLimitMiddleware.steps,
  validationMiddleware(recordStepsSchema),
  (req, res) => controller.recordSteps(req, res)
);

// Get today's steps
router.get(
  '/today',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getTodaySteps(req, res)
);

// Get weekly steps
router.get(
  '/weekly',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getWeeklySteps(req, res)
);

// Get monthly steps
router.get(
  '/monthly',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getMonthlySteps(req, res)
);

// Get history
router.get(
  '/history',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getHistory(req, res)
);

// Get streak
router.get(
  '/streak',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getCurrentStreak(req, res)
);

// Get best day
router.get(
  '/best-day',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getBestDay(req, res)
);

// Get steps for date
router.get(
  '/daily/:date',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getStepsForDate(req, res)
);

// Get public stats
router.get(
  '/:userId/public',
  rateLimitMiddleware.api,
  (req, res) => controller.getUserStepsPublic(req, res)
);

export default router;
