// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'moderator' | 'admin';
  };
}

/**
 * Middleware to verify JWT token from Authorization header
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Missing authorization header');
    }

    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AuthenticationError('Invalid authorization header format');
    }

    const payload = JWTService.verifyAccessToken(token);

    if (!payload) {
      throw new AuthenticationError(
        'Invalid or expired token',
        { reason: 'Token verification failed' }
      );
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify admin role
 */
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthenticationError('User not authenticated'));
  }

  if (req.user.role !== 'admin') {
    return next(
      new AuthenticationError(
        'Admin access required',
        { actual_role: req.user.role }
      )
    );
  }

  next();
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 */
export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = JWTService.extractTokenFromHeader(authHeader);

      if (token) {
        const payload = JWTService.verifyAccessToken(token);

        if (payload) {
          req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
          };
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};
