// backend/src/app.ts

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {
  authRoutes,
  usersRoutes,
  coinsRoutes,
  stepsRoutes,
  ordersRoutes,
  achievementsRoutes,
  leaderboardRoutes,
  storeRoutes,
  adminRoutes,
} from './routes';
import {
  authMiddleware,
  validationMiddleware,
  errorHandler,
  notFoundHandler,
  rateLimitMiddleware,
} from './middleware';

/**
 * Express App Setup
 *
 * Configuration includes:
 * - Security headers (Helmet)
 * - CORS configuration
 * - Request logging (Morgan)
 * - Body parsing (Express built-in)
 * - Middleware pipeline
 * - Route registration
 * - Error handling
 */
export function createApp(): Express {
  const app = express();

  // ============================================
  // Security Middleware
  // ============================================

  // Set security HTTP headers
  app.use(helmet());

  // Enable CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400,
    })
  );

  // ============================================
  // Body Parsing & Logging
  // ============================================

  // Parse JSON requests
  app.use(express.json({ limit: '10mb' }));

  // Parse URL-encoded requests
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging
  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      skip: (req) => req.path === '/health', // Skip health check logs
    })
  );

  // ============================================
  // Health Check Endpoint
  // ============================================

  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ============================================
  // API Routes (v1)
  // ============================================

  const apiV1 = express.Router();

  // Auth routes
  apiV1.use('/auth', authRoutes);

  // Users routes
  apiV1.use('/users', usersRoutes);

  // Coins routes
  apiV1.use('/coins', coinsRoutes);

  // Steps routes
  apiV1.use('/steps', stepsRoutes);

  // Orders routes
  apiV1.use('/orders', ordersRoutes);

  // Achievements routes
  apiV1.use('/achievements', achievementsRoutes);

  // Leaderboard routes
  apiV1.use('/leaderboard', leaderboardRoutes);

  // Store routes
  apiV1.use('/store', storeRoutes);

  // Admin routes (protected)
  apiV1.use('/admin', authMiddleware, adminRoutes);

  // Register v1 routes
  app.use('/api/v1', apiV1);

  // ============================================
  // 404 Handler
  // ============================================

  app.use(notFoundHandler);

  // ============================================
  // Error Handling (Must be last)
  // ============================================

  app.use(errorHandler);

  return app;
}

/**
 * Middleware Pipeline (Applied in Order)
 *
 * 1. Helmet - Security headers
 * 2. CORS - Cross-origin requests
 * 3. Morgan - Request logging
 * 4. JSON Parser - Parse request body
 * 5. URL Parser - Parse form data
 * 6. Per-Route Middleware:
 *    a. Rate Limiting (Redis token bucket)
 *    b. Authentication (JWT verification)
 *    c. Authorization (Role checking)
 *    d. Validation (Joi schema)
 * 7. Controller - Request handling
 * 8. Response - successResponse/errorResponse
 * 9. Error Handler - Global error catch
 * 10. 404 Handler - Undefined routes
 *
 * Error Flow:
 * - Service throws AppError or built-in Error
 * - Error bubbles through controller (no try/catch)
 * - Global error middleware catches it
 * - Converts to standardized response
 * - Returns with proper HTTP status
 */

/**
 * API Response Format (All Endpoints)
 *
 * Success (2xx):
 * {
 *   "status": "success",
 *   "data": { ...payload... },
 *   "message": "Operation successful",
 *   "timestamp": "2026-02-17T...",
 *   "request_id": "req-123..."
 * }
 *
 * Error (4xx/5xx):
 * {
 *   "status": "error",
 *   "error": {
 *     "code": "AUTH_INVALID_CREDENTIALS",
 *     "message": "Invalid email or password",
 *     "details": { ...optional... }
 *   },
 *   "message": "Authentication failed",
 *   "timestamp": "2026-02-17T...",
 *   "request_id": "req-123..."
 * }
 *
 * Validation Error (400):
 * {
 *   "status": "validation_error",
 *   "errors": {
 *     "email": "Invalid email format",
 *     "password": "Must be 8+ characters"
 *   },
 *   "message": "Validation failed",
 *   "timestamp": "2026-02-17T...",
 *   "request_id": "req-123..."
 * }
 */

/**
 * Rate Limiting Configuration
 *
 * Pre-configured limiters:
 * - auth: 10 requests/minute (register, login, OTP)
 * - api: 1000 requests/hour (general endpoints)
 * - sensitive: 5 requests/minute (admin operations)
 * - public: 100 requests/minute (leaderboards, products)
 * - steps: 100 requests/day (step recording)
 *
 * Redis-backed via token bucket algorithm
 * No limit exceeded for health checks
 */
