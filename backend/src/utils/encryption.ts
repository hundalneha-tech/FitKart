// backend/src/utils/encryption.ts

import bcrypt from 'bcrypt';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;

export class EncryptionService {
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate random OTP code (6 digits)
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate OTP expiry timestamp (10 minutes from now)
   */
  static generateOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
    return expiry;
  }

  /**
   * Check if OTP has expired
   */
  static isOTPExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  /**
   * Generate secure random token (for password reset, email verification, etc.)
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash email for privacy (used in some queries)
   */
  static hashEmail(email: string): string {
    return crypto.createHash('sha256').update(email).digest('hex');
  }

  /**
   * Generate user ID (UUID v4)
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Encrypt sensitive data (for storing in database)
   */
  static encrypt(data: string, encryptionKey?: string): string {
    const key = encryptionKey || process.env.ENCRYPTION_KEY || 'default-key';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string, encryptionKey?: string): string {
    const key = encryptionKey || process.env.ENCRYPTION_KEY || 'default-key';
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
