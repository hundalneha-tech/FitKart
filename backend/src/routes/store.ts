// backend/src/routes/store.ts

import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new StoreController();

// Schema definitions
const createProductSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  price_coins: Joi.number().positive().required(),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().uri(),
});

const updateProductSchema = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string().min(10),
  price_coins: Joi.number().positive(),
  category: Joi.string(),
  stock: Joi.number().integer().min(0),
  image: Joi.string().uri(),
});

/**
 * Store Routes
 * GET /store/products - Get all products
 * GET /store/products/:id - Get product details
 * GET /store/search - Search products
 * GET /store/featured - Get featured products
 * GET /store/stats - Get store stats
 * POST /store/products - Create product (admin)
 * PUT /store/products/:id - Update product (admin)
 * POST /store/sync-shopify - Sync with Shopify (admin)
 */

// Get products
router.get(
  '/products',
  rateLimitMiddleware.api,
  (req, res) => controller.getProducts(req, res)
);

// Get product details
router.get(
  '/products/:id',
  rateLimitMiddleware.api,
  (req, res) => controller.getProductDetail(req, res)
);

// Search products
router.get(
  '/search',
  rateLimitMiddleware.api,
  (req, res) => controller.searchProducts(req, res)
);

// Get featured products
router.get(
  '/featured',
  rateLimitMiddleware.api,
  (req, res) => controller.getFeaturedProducts(req, res)
);

// Get store stats
router.get(
  '/stats',
  rateLimitMiddleware.api,
  (req, res) => controller.getStats(req, res)
);

// Create product (admin)
router.post(
  '/products',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(createProductSchema),
  (req, res) => controller.createProduct(req, res)
);

// Update product (admin)
router.put(
  '/products/:id',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(updateProductSchema),
  (req, res) => controller.updateProduct(req, res)
);

// Sync Shopify (admin)
router.post(
  '/sync-shopify',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  (req, res) => controller.syncShopify(req, res)
);

export default router;
