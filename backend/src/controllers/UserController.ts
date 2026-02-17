// backend/src/controllers/UserController.ts

import { Response } from 'express';
import { UserService } from '../services/UserService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { Validators } from '../utils/validators';
import { AuthRequest } from './AuthController';

/**
 * User Controller
 * Handles all user profile and management endpoints
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * GET /users/profile
   * Get current user's profile (requires auth)
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const profile = await this.userService.getProfile(userId);
    res.json(successResponse(profile, 'Profile retrieved successfully', 'user/profile'));
  }

  /**
   * PUT /users/profile
   * Update current user's profile (requires auth)
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const { full_name, phone, country_code, profile_picture } = req.body;

    const profile = await this.userService.updateProfile(userId, {
      full_name,
      phone,
      country_code,
      profile_picture,
    });

    res.json(successResponse(profile, 'Profile updated successfully', 'user/profile/update'));
  }

  /**
   * GET /users/stats
   * Get current user's statistics (requires auth)
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const stats = await this.userService.getUserStats(userId);
    res.json(successResponse(stats, 'Stats retrieved successfully', 'user/stats'));
  }

  /**
   * GET /users/:id/public
   * Get public profile (no auth required)
   */
  async getPublicProfile(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'User ID is required' }));
      return;
    }

    const profile = await this.userService.getUserPublic(id);
    res.json(
      successResponse(profile, 'Public profile retrieved successfully', 'user/public')
    );
  }

  /**
   * POST /users/picture
   * Upload profile picture (requires auth)
   */
  async uploadProfilePicture(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const { picture_url } = req.body;

    if (!picture_url) {
      res.status(400).json(validationErrorResponse({ picture_url: 'Picture URL is required' }));
      return;
    }

    const profile = await this.userService.uploadProfilePicture(userId, picture_url);
    res.json(
      successResponse(profile, 'Profile picture updated successfully', 'user/picture/upload')
    );
  }

  /**
   * DELETE /users/:id
   * Block/delete user (admin only)
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'User ID is required' }));
      return;
    }

    if (!reason) {
      res.status(400).json(validationErrorResponse({ reason: 'Reason is required' }));
      return;
    }

    await this.userService.blockUser(id, reason);
    res.json(successResponse({ message: 'User blocked' }, 'User blocked successfully'));
  }

  /**
   * GET /users/search
   * Search users by name/email (requires auth)
   */
  async searchUsers(req: AuthRequest, res: Response): Promise<void> {
    const { q, limit = '20', offset = '0' } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json(validationErrorResponse({ q: 'Search query is required' }));
      return;
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const result = await this.userService.searchUsers(q, limitNum, offsetNum);
    res.json(successResponse(result, 'Users found', 'user/search'));
  }

  /**
   * GET /users
   * List all users (admin only)
   */
  async listUsers(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '50', offset = '0', role, status } = req.query;

    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;

    const result = await this.userService.getActiveUsers(limitNum, offsetNum);
    res.json(successResponse(result, 'Users retrieved', 'user/list'));
  }

  /**
   * POST /users/:id/unblock
   * Unblock user (admin only)
   */
  async unblockUser(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'User ID is required' }));
      return;
    }

    await this.userService.unblockUser(id);
    res.json(successResponse({ message: 'User unblocked' }, 'User unblocked successfully'));
  }

  /**
   * GET /users/:id/stats
   * Get specific user's stats (public, no auth required)
   */
  async getUserStats(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'User ID is required' }));
      return;
    }

    const stats = await this.userService.getUserStats(id);
    res.json(successResponse(stats, 'User stats retrieved', 'user/stats'));
  }

  /**
   * GET /users/:id/verify-email/:token
   * Verify email (called from email link)
   */
  async verifyEmail(req: AuthRequest, res: Response): Promise<void> {
    const { id, token } = req.params;

    if (!id || !token) {
      res.status(400).json(
        validationErrorResponse({ id: 'User ID and token are required' })
      );
      return;
    }

    const profile = await this.userService.verifyEmail(id);
    res.json(successResponse(profile, 'Email verified successfully', 'user/email/verify'));
  }
}
