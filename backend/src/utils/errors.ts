// backend/src/utils/errors.ts

export enum ErrorCode {
  // Auth errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_EMAIL_EXISTS = 'AUTH_EMAIL_EXISTS',
  AUTH_INVALID_OTP = 'AUTH_INVALID_OTP',
  AUTH_OTP_EXPIRED = 'AUTH_OTP_EXPIRED',
  AUTH_OTP_ATTEMPTS_EXCEEDED = 'AUTH_OTP_ATTEMPTS_EXCEEDED',

  // User errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_UNAUTHORIZED = 'USER_UNAUTHORIZED',
  USER_FORBIDDEN = 'USER_FORBIDDEN',

  // Coin errors
  INSUFFICIENT_COINS = 'INSUFFICIENT_COINS',
  COIN_FROZEN = 'COIN_FROZEN',
  COIN_TRANSACTION_FAILED = 'COIN_TRANSACTION_FAILED',

  // Step errors
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  INVALID_STEP_DATA = 'INVALID_STEP_DATA',

  // Order errors
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_OUT_OF_STOCK',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  ORDER_ALREADY_SHIPPED = 'ORDER_ALREADY_SHIPPED',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',

  // Achievement errors
  ACHIEVEMENT_NOT_FOUND = 'ACHIEVEMENT_NOT_FOUND',

  // Leaderboard errors
  LEADERBOARD_UNAVAILABLE = 'LEADERBOARD_UNAVAILABLE',

  // Admin errors
  ADMIN_PERMISSION_DENIED = 'ADMIN_PERMISSION_DENIED',
  ADMIN_INVALID_ACTION = 'ADMIN_INVALID_ACTION',

  // General errors
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface CustomErrorOptions {
  code: ErrorCode | string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public details?: Record<string, any>;

  constructor(options: CustomErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode || 400;
    this.details = options.details;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super({
      code: ErrorCode.AUTH_TOKEN_INVALID,
      message,
      details,
      statusCode: 401,
    });
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden', details?: Record<string, any>) {
    super({
      code: ErrorCode.USER_FORBIDDEN,
      message,
      details,
      statusCode: 403,
    });
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super({
      code: ErrorCode.VALIDATION_FAILED,
      message,
      details,
      statusCode: 400,
    });
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, details?: Record<string, any>) {
    super({
      code: ErrorCode.NOT_FOUND,
      message: `${resource} not found`,
      details,
      statusCode: 404,
    });
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super({
      code: ErrorCode.CONFLICT,
      message,
      details,
      statusCode: 409,
    });
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(
    retryAfter: number = 60,
    details?: Record<string, any>
  ) {
    super({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests. Please try again later.',
      details: {
        retry_after_seconds: retryAfter,
        ...details,
      },
      statusCode: 429,
    });
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class SuspiciousActivityError extends AppError {
  constructor(
    message: string = 'Suspicious activity detected',
    details?: Record<string, any>
  ) {
    super({
      code: ErrorCode.SUSPICIOUS_ACTIVITY,
      message,
      details,
      statusCode: 403,
    });
    Object.setPrototypeOf(this, SuspiciousActivityError.prototype);
  }
}

export class InsufficientCoinsError extends AppError {
  constructor(
    required: number,
    available: number,
    details?: Record<string, any>
  ) {
    super({
      code: ErrorCode.INSUFFICIENT_COINS,
      message: 'Not enough coins to complete this transaction',
      details: {
        required_coins: required,
        available_coins: available,
        coins_short: required - available,
        ...details,
      },
      statusCode: 400,
    });
    Object.setPrototypeOf(this, InsufficientCoinsError.prototype);
  }
}

export class AdminPermissionError extends AppError {
  constructor(action: string) {
    super({
      code: ErrorCode.ADMIN_PERMISSION_DENIED,
      message: `Admin permission required for: ${action}`,
      statusCode: 403,
    });
    Object.setPrototypeOf(this, AdminPermissionError.prototype);
  }
}
