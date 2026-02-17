// backend/src/routes/coins.ts

import { Router } from 'express';
import { CoinController } from '../controllers/CoinController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new CoinController();

// Schema definitions
const checkBalanceSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

const addCoinsSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('earned', 'bonus').default('bonus'),
  reference: Joi.object({
    type: Joi.string(),
    id: Joi.string(),
    description: Joi.string(),
  }),
});

const spendCoinsSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reference: Joi.object({
    type: Joi.string(),
    id: Joi.string(),
    description: Joi.string(),
  }),
});

const freezeCoinsSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reference: Joi.object({
    type: Joi.string(),
    id: Joi.string(),
    description: Joi.string(),
  }),
});

const unfreezeCoinsSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reference: Joi.object({
    type: Joi.string(),
    id: Joi.string(),
    description: Joi.string(),
  }),
});

/**
 * Coin Routes
 * GET /coins/balance - Get user's wallet balance
 * GET /coins/history - Get transaction history
 * POST /coins/check-balance - Check if user has enough coins
 * POST /coins/add - Add coins (admin)
 * POST /coins/spend - Spend coins
 * POST /coins/freeze - Freeze coins for pending order
 * POST /coins/unfreeze - Unfreeze coins (refund)
 * GET /coins/stats - Get coin statistics
 */

// Get balance
router.get(
  '/balance',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getBalance(req, res)
);

// Get history
router.get(
  '/history',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getHistory(req, res)
);

// Check balance
router.post(
  '/check-balance',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(checkBalanceSchema),
  (req, res) => controller.checkBalance(req, res)
);

// Add coins (admin)
router.post(
  '/add',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(addCoinsSchema),
  (req, res) => controller.addCoins(req, res)
);

// Spend coins
router.post(
  '/spend',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(spendCoinsSchema),
  (req, res) => controller.spendCoins(req, res)
);

// Freeze coins
router.post(
  '/freeze',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(freezeCoinsSchema),
  (req, res) => controller.freezeCoins(req, res)
);

// Unfreeze coins
router.post(
  '/unfreeze',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(unfreezeCoinsSchema),
  (req, res) => controller.unfreezeCoins(req, res)
);

// Get stats
router.get(
  '/stats',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getStats(req, res)
);

export default router;
