// backend/src/services/UserService.ts

import { UserRepository } from '../repositories/UserRepository';
import { EncryptionService } from '../utils/encryption';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  country_code: string;
  profile_picture?: string;
  is_verified: boolean;
  is_blocked: boolean;
  role: 'user' | 'moderator' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  total_steps: number;
  total_coins_earned: number;
  total_coins_spent: number;
  current_streak: number;
  achievements_count: number;
  orders_count: number;
}

export interface UpdateProfileInput {
  full_name?: string;
  phone?: string;
  country_code?: string;
  profile_picture?: string;
}

/**
 * User Service
 * Manages user profiles, settings, and public information
 */
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return this.mapToProfile(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Validate update data
    if (input.phone && !this.isValidPhone(input.phone)) {
      throw new ValidationError('Invalid phone number format');
    }

    if (input.country_code && !this.isValidCountryCode(input.country_code)) {
      throw new ValidationError('Invalid country code');
    }

    // Update user
    const updateData: any = {};
    if (input.full_name !== undefined) updateData.full_name = input.full_name;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.country_code !== undefined) updateData.country_code = input.country_code;
    if (input.profile_picture !== undefined) updateData.profile_picture = input.profile_picture;

    const updated = await this.userRepository.update(userId, updateData);

    return this.mapToProfile(updated);
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const stats = await this.userRepository.getUserStats(userId);

    return {
      total_steps: stats.total_steps || 0,
      total_coins_earned: stats.total_coins_earned || 0,
      total_coins_spent: stats.total_coins_spent || 0,
      current_streak: stats.current_streak || 0,
      achievements_count: stats.achievements_count || 0,
      orders_count: stats.orders_count || 0,
    };
  }

  /**
   * Get public user profile (for leaderboards, etc.)
   * Redacts sensitive information
   */
  async getUserPublic(userId: string): Promise<{
    id: string;
    full_name: string;
    profile_picture?: string;
    country_code?: string;
  }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      full_name: user.full_name,
      profile_picture: user.profile_picture,
      country_code: user.country_code,
    };
  }

  /**
   * Upload/update profile picture
   */
  async uploadProfilePicture(
    userId: string,
    pictureUrl: string
  ): Promise<UserProfile> {
    if (!pictureUrl || !this.isValidUrl(pictureUrl)) {
      throw new ValidationError('Invalid picture URL');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const updated = await this.userRepository.update(userId, {
      profile_picture: pictureUrl,
    });

    return this.mapToProfile(updated);
  }

  /**
   * Block user (admin action)
   */
  async blockUser(userId: string, reason: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role === 'admin') {
      throw new ConflictError('Cannot block an admin user');
    }

    await this.userRepository.blockUser(userId, reason);
  }

  /**
   * Unblock user (admin action)
   */
  async unblockUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    await this.userRepository.unblockUser(userId);
  }

  /**
   * Search users (admin action)
   */
  async searchUsers(
    searchTerm: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ users: UserProfile[]; total: number }> {
    if (searchTerm.length < 2) {
      throw new ValidationError('Search term must be at least 2 characters');
    }

    const { data, total } = await this.userRepository.search(
      searchTerm,
      limit,
      offset
    );

    return {
      users: data.map((u) => this.mapToProfile(u)),
      total,
    };
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const updated = await this.userRepository.update(userId, {
      is_verified: true,
      verified_at: new Date(),
    });

    return this.mapToProfile(updated);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    return this.mapToProfile(user);
  }

  /**
   * Get all active users (admin action)
   */
  async getActiveUsers(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ users: UserProfile[]; total: number }> {
    const { data, total } = await this.userRepository.findActive(limit, offset);

    return {
      users: data.map((u) => this.mapToProfile(u)),
      total,
    };
  }

  /**
   * Get users by role (admin action)
   */
  async getUsersByRole(
    role: 'user' | 'moderator' | 'admin',
    limit: number = 50,
    offset: number = 0
  ): Promise<{ users: UserProfile[]; total: number }> {
    const { data, total } = await this.userRepository.findByRole(
      role,
      limit,
      offset
    );

    return {
      users: data.map((u) => this.mapToProfile(u)),
      total,
    };
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return await this.userRepository.emailExists(email);
  }

  /**
   * Map database user to UserProfile
   */
  private mapToProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      country_code: user.country_code,
      profile_picture: user.profile_picture,
      is_verified: user.is_verified,
      is_blocked: user.is_blocked,
      role: user.role || 'user',
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Validate phone number (basic)
   */
  private isValidPhone(phone: string): boolean {
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  /**
   * Validate country code (ISO 3166-1 alpha-2)
   */
  private isValidCountryCode(code: string): boolean {
    // Simple check - should be 2 characters
    return code.length === 2 && /^[A-Z]{2}$/.test(code);
  }

  /**
   * Validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }
}
