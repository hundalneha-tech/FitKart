// backend/src/utils/jwt.ts

import jwt from 'jsonwebtoken';

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  role: 'user' | 'moderator' | 'admin';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class JWTService {
  /**
   * Generate access token (15 minutes)
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'fitkart',
      audience: 'fitkart-mobile',
    });
  }

  /**
   * Generate refresh token (7 days)
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'fitkart',
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET, {
        issuer: 'fitkart',
      }) as TokenPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { sub: string } | null {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'fitkart',
      }) as { sub: string };
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Get token expiry time in seconds
   */
  static getTokenExpiryIn(tokenType: 'access' | 'refresh'): number {
    if (tokenType === 'access') {
      return 15 * 60; // 15 minutes in seconds
    } else {
      return 7 * 24 * 60 * 60; // 7 days in seconds
    }
  }

  /**
   * Check if token is expiring soon (within 1 minute)
   */
  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (!decoded?.exp) return false;

      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      return expiresIn < 60; // Less than 1 minute
    } catch {
      return false;
    }
  }
}
