// backend/src/routes/users.ts

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new UserController();

// Schema definitions
const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2),
  phone: Joi.string(),
  country_code: Joi.string().length(2),
  profile_picture: Joi.string().uri(),
});

const uploadPictureSchema = Joi.object({
  picture_url: Joi.string().uri().required(),
});

/**
 * User Routes
 * GET /users/profile - Get current user's profile
 * PUT /users/profile - Update current user's profile
 * GET /users/stats - Get current user's stats
 * GET /users/:id/public - Get public profile
 * POST /users/picture - Upload profile picture
 * DELETE /users/:id - Block user (admin)
 * GET /users/search - Search users
 * GET /users - List all users (admin)
 * POST /users/:id/unblock - Unblock user (admin)
 * GET /users/:id/stats - Get user stats
 * GET /users/:id/verify-email/:token - Verify email
 */

// Get current user's profile
router.get(
  '/profile',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getProfile(req, res)
);

// Update profile
router.put(
  '/profile',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(updateProfileSchema),
  (req, res) => controller.updateProfile(req, res)
);

// Get current user's stats
router.get(
  '/stats',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getStats(req, res)
);

// Get public profile
router.get(
  '/:id/public',
  rateLimitMiddleware.api,
  (req, res) => controller.getPublicProfile(req, res)
);

// Upload profile picture
router.post(
  '/picture',
  authMiddleware,
  rateLimitMiddleware.api,
  validationMiddleware(uploadPictureSchema),
  (req, res) => controller.uploadProfilePicture(req, res)
);

// Block user (admin)
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  (req, res) => controller.deleteUser(req, res)
);

// Search users
router.get(
  '/search',
  authMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.searchUsers(req, res)
);

// List all users (admin)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.listUsers(req, res)
);

// Unblock user (admin)
router.post(
  '/:id/unblock',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  (req, res) => controller.unblockUser(req, res)
);

// Get user stats
router.get(
  '/:id/stats',
  rateLimitMiddleware.api,
  (req, res) => controller.getUserStats(req, res)
);

// Verify email
router.get(
  '/:id/verify-email/:token',
  (req, res) => controller.verifyEmail(req, res)
);

export default router;
