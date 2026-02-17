// backend/src/routes/orders.ts

import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new OrderController();

// Schema definitions
const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().required(),
        quantity: Joi.number().integer().positive().required(),
        price_per_unit: Joi.number().positive().required(),
      })
    )
    .required(),
  shipping_address: Joi.string(),
});

const confirmOrderSchema = Joi.object({});

const cancelOrderSchema = Joi.object({
  reason: Joi.string(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    .required(),
  metadata: Joi.object(),
});

/**
 * Order Routes
 * POST /orders - Create new order
 * GET /orders - Get user's orders
 * GET /orders/:id - Get order details
 * POST /orders/:id/confirm - Confirm order
 * POST /orders/:id/cancel - Cancel order
 * PUT /orders/:id/status - Update status (admin)
 * GET /orders/code/:code - Get by order code
 * GET /orders/pending - Get pending orders (admin)
 * GET /orders/stats - Get order stats (admin)
 */

// Create order
router.post(
  '/',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(createOrderSchema),
  (req, res) => controller.createOrder(req, res)
);

// Get user's orders
router.get(
  '/',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getOrders(req, res)
);

// Get order detail
router.get(
  '/:id',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getOrderDetail(req, res)
);

// Confirm order
router.post(
  '/:id/confirm',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.confirmOrder(req, res)
);

// Cancel order
router.post(
  '/:id/cancel',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(cancelOrderSchema),
  (req, res) => controller.cancelOrder(req, res)
);

// Update status (admin)
router.put(
  '/:id/status',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(updateStatusSchema),
  (req, res) => controller.updateStatus(req, res)
);

// Get by order code
router.get(
  '/code/:code',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getByOrderCode(req, res)
);

// Get pending orders (admin)
router.get(
  '/admin/pending',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getPendingOrders(req, res)
);

// Get stats (admin)
router.get(
  '/admin/stats',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getStats(req, res)
);

export default router;
