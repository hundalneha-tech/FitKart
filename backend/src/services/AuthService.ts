// backend/src/services/AuthService.ts

import * as crypto from 'crypto';
import { UserRepository } from '../repositories/UserRepository';
import { EncryptionService } from '../utils/encryption';
import { JWTService, TokenPayload } from '../utils/jwt';
import { Validators } from '../utils/validators';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
} from '../utils/errors';

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  country_code?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface OTPInput {
  email: string;
  otp_code: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  full_name: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

/**
 * Authentication Service
 * Handles user registration, login, token refresh, and OTP verification
 */
export class AuthService {
  private userRepository: UserRepository;
  // OTP storage would normally be in Redis, but using in-memory for simplicity
  private otpStorage: Map<string, { code: string; expiry: Date; attempts: number }> = new Map();

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate input
    const { email, password, full_name } = input;

    if (!Validators.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const passwordValidation = Validators.isStrongPassword(password);
    if (!passwordValidation.valid) {
      throw new ValidationError('Password does not meet requirements', {
        requirements: passwordValidation.errors,
      });
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered', {
        email: Validators.sanitizeEmail(email),
      });
    }

    // Hash password
    const passwordHash = await EncryptionService.hashPassword(password);

    // Create user
    const userId = EncryptionService.generateUUID();
    const user = await this.userRepository.create({
      id: userId,
      email: Validators.sanitizeEmail(email),
      password_hash: passwordHash,
      full_name: full_name.trim(),
      phone: input.phone,
      country_code: input.country_code || '+1',
      role: 'user',
      email_verified: false,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password required');
    }

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if password matches
    if (!user.password_hash) {
      throw new AuthenticationError('User has no password set');
    }

    const passwordValid = await EncryptionService.comparePassword(
      password,
      user.password_hash
    );
    if (!passwordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is blocked
    if (user.is_blocked) {
      throw new AuthenticationError('User account is blocked');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      ...tokens,
    };
  }

  /**
   * Send OTP to email
   */
  async sendOTP(email: string): Promise<void> {
    // Validate email
    if (!Validators.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Check if user exists
    const sanitizedEmail = Validators.sanitizeEmail(email);
    const user = await this.userRepository.findByEmail(sanitizedEmail);
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return;
    }

    // Generate OTP
    const otp = EncryptionService.generateOTP();
    const expiry = EncryptionService.generateOTPExpiry();

    // Store OTP
    this.otpStorage.set(sanitizedEmail, {
      code: otp,
      expiry,
      attempts: 0,
    });

    // TODO: Send email with OTP
    console.log(`📧 OTP for ${sanitizedEmail}: ${otp}`);
  }

  /**
   * Verify OTP and login
   */
  async verifyOTP(input: OTPInput): Promise<AuthResponse> {
    const { email, otp_code } = input;

    // Validate input
    if (!Validators.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!Validators.isValidOTP(otp_code)) {
      throw new ValidationError('Invalid OTP format (must be 6 digits)');
    }

    const sanitizedEmail = Validators.sanitizeEmail(email);

    // Get OTP from storage
    const otpData = this.otpStorage.get(sanitizedEmail);
    if (!otpData) {
      throw new AuthenticationError('No OTP found. Request a new one.');
    }

    // Check if OTP expired
    if (EncryptionService.isOTPExpired(otpData.expiry)) {
      this.otpStorage.delete(sanitizedEmail);
      throw new AuthenticationError('OTP has expired', {
        expiry_minutes: 10,
      });
    }

    // Check attempts
    if (otpData.attempts >= 5) {
      this.otpStorage.delete(sanitizedEmail);
      throw new AuthenticationError('Too many failed attempts', {
        max_attempts: 5,
      });
    }

    // Verify OTP
    if (otpData.code !== otp_code.trim()) {
      otpData.attempts++;
      throw new AuthenticationError('Invalid OTP', {
        remaining_attempts: 5 - otpData.attempts,
      });
    }

    // Clear OTP
    this.otpStorage.delete(sanitizedEmail);

    // Get or create user
    let user = await this.userRepository.findByEmail(sanitizedEmail);
    if (!user) {
      // Create user if doesn't exist
      const userId = EncryptionService.generateUUID();
      user = await this.userRepository.create({
        id: userId,
        email: sanitizedEmail,
        password_hash: null,
        full_name: email.split('@')[0],
        role: 'user',
        email_verified: true,
        email_verified_at: new Date(),
      });
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      ...tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    // Verify refresh token
    const payload = JWTService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Get user
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Generate new access token
    const accessToken = JWTService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as any,
    });

    return {
      access_token: accessToken,
      expires_in: JWTService.getTokenExpiryIn('access'),
    };
  }

  /**
   * Logout (typically just client-side, but can invalidate refresh token here)
   */
  async logout(userId: string): Promise<void> {
    // In a real implementation, would invalidate refresh tokens in database
    // For now, just return
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(user: any) {
    const accessToken = JWTService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = JWTService.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: JWTService.getTokenExpiryIn('access'),
      token_type: 'Bearer' as const,
    };
  }
}
