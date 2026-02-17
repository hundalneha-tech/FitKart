// backend/src/middleware/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { ValidationError as JoiValidationError } from 'joi';
import { ValidationError, validationErrorResponse } from '../utils/response';

/**
 * Middleware to validate request body against a schema
 */
export const validationMiddleware = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details: Record<string, any> = {};

      error.details.forEach((detail: JoiValidationError) => {
        const path = detail.path.join('.');
        details[path] = {
          message: detail.message,
          type: detail.type,
        };
      });

      return next(
        new ValidationError('Request validation failed', details)
      );
    }

    // Replace body with validated data
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate query parameters
 */
export const queryValidationMiddleware = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details: Record<string, any> = {};

      error.details.forEach((detail: JoiValidationError) => {
        const path = detail.path.join('.');
        details[path] = {
          message: detail.message,
          type: detail.type,
        };
      });

      return next(
        new ValidationError('Query validation failed', details)
      );
    }

    // Replace query with validated data
    req.query = value as any;
    next();
  };
};

/**
 * Middleware to validate path parameters
 */
export const paramValidationMiddleware = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details: Record<string, any> = {};

      error.details.forEach((detail: JoiValidationError) => {
        const path = detail.path.join('.');
        details[path] = {
          message: detail.message,
          type: detail.type,
        };
      });

      return next(
        new ValidationError('Parameter validation failed', details)
      );
    }

    // Replace params with validated data
    req.params = value;
    next();
  };
};
