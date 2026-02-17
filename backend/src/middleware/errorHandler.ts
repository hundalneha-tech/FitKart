// backend/src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../utils/errors';
import { ApiResponse } from '../utils/response';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error
  console.error('❌ Error:', {
    type: error.constructor.name,
    message: error.message,
    path: req.path,
    method: req.method,
    ...(error instanceof AppError && { code: error.code }),
    stack: !isProduction ? error.stack : undefined,
  });

  // Default error response
  let statusCode = 500;
  let code = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let details: Record<string, any> | undefined;

  // Handle known errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  }

  // Handle specific error types
  if (error instanceof SyntaxError) {
    statusCode = 400;
    code = ErrorCode.VALIDATION_FAILED;
    message = 'Invalid request body';
  }

  const response = new ApiResponse(
    'error',
    undefined,
    {
      code,
      message,
      details: {
        ...details,
        ...(isProduction ? {} : { stack: error.stack }),
      },
    }
  );

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response = new ApiResponse('error', undefined, {
    code: ErrorCode.NOT_FOUND,
    message: `Route not found: ${req.method} ${req.path}`,
  });

  res.status(404).json(response);
};
