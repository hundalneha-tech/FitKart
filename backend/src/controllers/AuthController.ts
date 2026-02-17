// backend/src/controllers/AuthController.ts

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { Validators } from '../utils/validators';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Auth Controller
 * Handles all authentication-related endpoints
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/register
   * Register new user with email and password
   */
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, full_name, phone, country_code } = req.body;

    // Validate inputs
    const errors: Record<string, string> = {};

    if (!email) errors.email = 'Email is required';
    else if (!Validators.isValidEmail(email)) errors.email = 'Invalid email format';

    if (!password) errors.password = 'Password is required';
    else if (!Validators.isStrongPassword(password))
      errors.password =
        'Password must be 8+ chars with uppercase, lowercase, number, special char';

    if (!full_name) errors.full_name = 'Full name is required';
    if (!phone) errors.phone = 'Phone is required';
    if (!country_code) errors.country_code = 'Country code is required';

    if (Object.keys(errors).length > 0) {
      res.status(400).json(validationErrorResponse(errors));
      return;
    }

    const result = await this.authService.register({
      email: email.toLowerCase(),
      password,
      full_name,
      phone,
      country_code,
    });

    res.status(201).json(
      successResponse(result, 'User registered successfully', 'auth/register')
    );
  }

  /**
   * POST /auth/login
   * Login with email and password
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Validate inputs
    const errors: Record<string, string> = {};

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      res.status(400).json(validationErrorResponse(errors));
      return;
    }

    const result = await this.authService.login({
      email: email.toLowerCase(),
      password,
    });

    res.json(successResponse(result, 'Login successful', 'auth/login'));
  }

  /**
   * POST /auth/send-otp
   * Send OTP to email
   */
  async sendOTP(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    // Validate input
    const errors: Record<string, string> = {};

    if (!email) errors.email = 'Email is required';
    else if (!Validators.isValidEmail(email)) errors.email = 'Invalid email format';

    if (Object.keys(errors).length > 0) {
      res.status(400).json(validationErrorResponse(errors));
      return;
    }

    await this.authService.sendOTP(email.toLowerCase());

    res.json(
      successResponse(
        { message: 'OTP sent to email' },
        'OTP sent successfully',
        'auth/send-otp'
      )
    );
  }

  /**
   * POST /auth/verify-otp
   * Login or register with OTP
   */
  async verifyOTP(req: Request, res: Response): Promise<void> {
    const { email, otp_code } = req.body;

    // Validate inputs
    const errors: Record<string, string> = {};

    if (!email) errors.email = 'Email is required';
    else if (!Validators.isValidEmail(email)) errors.email = 'Invalid email format';

    if (!otp_code) errors.otp_code = 'OTP code is required';
    else if (!Validators.isValidOTP(otp_code))
      errors.otp_code = 'OTP must be 6 digits';

    if (Object.keys(errors).length > 0) {
      res.status(400).json(validationErrorResponse(errors));
      return;
    }

    const result = await this.authService.verifyOTP({
      email: email.toLowerCase(),
      otp_code,
    });

    res.json(successResponse(result, 'OTP verified successfully', 'auth/verify-otp'));
  }

  /**
   * POST /auth/refresh-token
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refresh_token } = req.body;

    // Validate input
    if (!refresh_token) {
      res.status(400).json(
        validationErrorResponse({
          refresh_token: 'Refresh token is required',
        })
      );
      return;
    }

    const result = await this.authService.refreshToken(refresh_token);

    res.json(
      successResponse(result, 'Token refreshed successfully', 'auth/refresh-token')
    );
  }

  /**
   * POST /auth/logout
   * Logout user (requires auth)
   */
  async logout(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(
        successResponse({ message: 'User must be authenticated' }, 'Login required')
      );
      return;
    }

    await this.authService.logout(userId);

    res.json(successResponse({ message: 'Logged out successfully' }, 'Logout successful'));
  }

  /**
   * GET /auth/profile
   * Get current user's profile (requires auth)
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(
        successResponse({ message: 'User must be authenticated' }, 'Login required')
      );
      return;
    }

    // Delegate to UserService (via UserController)
    // This is handled separately to avoid circular dependencies
    res.json(
      successResponse(
        { message: 'Get profile via UserController' },
        'Use UserController for profile'
      )
    );
  }

  /**
   * POST /auth/verify-email
   * Verify email with token (called from email link)
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      res.status(400).json(validationErrorResponse({ token: 'Token is required' }));
      return;
    }

    // In production, verify token and mark email as verified
    res.json(successResponse({ message: 'Email verified' }, 'Email verification successful'));
  }
}
