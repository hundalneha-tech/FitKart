// backend/src/routes/auth.ts

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new AuthController();

// Schema definitions
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().min(2).required(),
  phone: Joi.string().required(),
  country_code: Joi.string().length(2).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const sendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp_code: Joi.string().length(6).required(),
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

/**
 * Auth Routes
 * POST /auth/register - Register new user (rate limited)
 * POST /auth/login - Login with credentials (rate limited)
 * POST /auth/send-otp - Send OTP to email (rate limited)
 * POST /auth/verify-otp - Verify OTP and login (rate limited)
 * POST /auth/refresh-token - Refresh access token (rate limited)
 * POST /auth/logout - Logout user (requires auth)
 * GET /auth/profile - Get user profile (requires auth)
 * POST /auth/verify-email - Verify email with token
 */

// Register
router.post(
  '/register',
  rateLimitMiddleware.auth,
  validationMiddleware(registerSchema),
  (req, res) => controller.register(req, res)
);

// Login
router.post(
  '/login',
  rateLimitMiddleware.auth,
  validationMiddleware(loginSchema),
  (req, res) => controller.login(req, res)
);

// Send OTP
router.post(
  '/send-otp',
  rateLimitMiddleware.auth,
  validationMiddleware(sendOTPSchema),
  (req, res) => controller.sendOTP(req, res)
);

// Verify OTP
router.post(
  '/verify-otp',
  rateLimitMiddleware.auth,
  validationMiddleware(verifyOTPSchema),
  (req, res) => controller.verifyOTP(req, res)
);

// Refresh Token
router.post(
  '/refresh-token',
  rateLimitMiddleware.auth,
  validationMiddleware(refreshTokenSchema),
  (req, res) => controller.refreshToken(req, res)
);

// Logout
router.post(
  '/logout',
  authMiddleware,
  (req, res) => controller.logout(req, res)
);

// Get Profile
router.get(
  '/profile',
  authMiddleware,
  (req, res) => controller.getProfile(req, res)
);

// Verify Email
router.post(
  '/verify-email',
  (req, res) => controller.verifyEmail(req, res)
);

export default router;
