// backend/src/middleware/rateLimitMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { RedisClient } from '../config/redis';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

/**
 * Create rate limit middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const redis = RedisClient.getInstance();

      // Use IP address as identifier
      const identifier = req.ip || 'unknown';
      const key = `ratelimit:${identifier}`;

      // Get current request count
      const current = await redis.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await redis.expire(key, Math.ceil(config.windowMs / 1000));
      }

      // Set rate limit headers
      const windowSeconds = Math.ceil(config.windowMs / 1000);
      const resetTime = Math.floor(Date.now() / 1000) + windowSeconds;

      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, config.maxRequests - current).toString()
      );
      res.setHeader('X-RateLimit-Reset', resetTime.toString());

      // Check limit
      if (current > config.maxRequests) {
        throw new RateLimitError(
          windowSeconds,
          {
            limit: config.maxRequests,
            current: current - 1,
            window_ms: config.windowMs,
          }
        );
      }

      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        next(error);
      } else {
        // Don't block request if Redis unavailable
        console.warn('Rate limit check failed:', error);
        next();
      }
    }
  };
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // Strict limits for auth endpoints
  auth: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),

  // Normal limits for API endpoints
  api: createRateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
  }),

  // Strict limits for sensitive operations
  sensitive: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  }),

  // Very strict limits for public endpoints
  public: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // Moderate limits for step recording
  steps: createRateLimitMiddleware({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 1440, // 100 per day max (1 per minute on average)
  }),
};
