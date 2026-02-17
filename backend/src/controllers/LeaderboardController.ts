// backend/src/controllers/LeaderboardController.ts

import { Response } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { AuthRequest } from './AuthController';

/**
 * Leaderboard Controller
 * Handles all leaderboard ranking endpoints
 */
export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  /**
   * GET /leaderboard/weekly
   * Get weekly leaderboard (no auth required)
   */
  async getWeeklyLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '10', offset = '0' } = req.query;

    const limitNum = parseInt(limit as string) || 10;
    const offsetNum = parseInt(offset as string) || 0;

    const leaderboard = await this.leaderboardService.getWeeklyLeaderboard(
      limitNum,
      offsetNum
    );

    res.json(
      successResponse(leaderboard, 'Weekly leaderboard retrieved', 'leaderboard/weekly')
    );
  }

  /**
   * GET /leaderboard/monthly
   * Get monthly leaderboard (no auth required)
   */
  async getMonthlyLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '10', offset = '0' } = req.query;

    const limitNum = parseInt(limit as string) || 10;
    const offsetNum = parseInt(offset as string) || 0;

    const leaderboard = await this.leaderboardService.getMonthlyLeaderboard(
      limitNum,
      offsetNum
    );

    res.json(
      successResponse(leaderboard, 'Monthly leaderboard retrieved', 'leaderboard/monthly')
    );
  }

  /**
   * GET /leaderboard/all-time
   * Get all-time leaderboard (no auth required)
   */
  async getAllTimeLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '10', offset = '0' } = req.query;

    const limitNum = parseInt(limit as string) || 10;
    const offsetNum = parseInt(offset as string) || 0;

    const leaderboard = await this.leaderboardService.getAllTimeLeaderboard(
      limitNum,
      offsetNum
    );

    res.json(
      successResponse(
        leaderboard,
        'All-time leaderboard retrieved',
        'leaderboard/all-time'
      )
    );
  }

  /**
   * GET /leaderboard/context
   * Get user's rank and position (requires auth)
   */
  async getUserContext(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { period = 'weekly' } = req.query;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const context = await this.leaderboardService.getUserContext(
      userId,
      period as 'weekly' | 'monthly' | 'all-time'
    );

    res.json(
      successResponse(context, 'User leaderboard context retrieved', 'leaderboard/context')
    );
  }

  /**
   * GET /leaderboard/country/:code
   * Get country leaderboard (no auth required)
   */
  async getCountryLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    const { code } = req.params;
    const { limit = '10', period = 'weekly' } = req.query;

    if (!code) {
      res.status(400).json(validationErrorResponse({ code: 'Country code is required' }));
      return;
    }

    const limitNum = parseInt(limit as string) || 10;

    const leaderboard = await this.leaderboardService.getCountryLeaderboard(
      code,
      limitNum,
      period as 'weekly' | 'monthly' | 'all-time'
    );

    res.json(
      successResponse(leaderboard, 'Country leaderboard retrieved', 'leaderboard/country')
    );
  }

  /**
   * GET /leaderboard/friends
   * Get friends leaderboard (requires auth)
   */
  async getFriendsLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { friend_ids = '[]', period = 'weekly' } = req.query;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    // Parse friend IDs from query string
    let userIds: string[] = [];
    try {
      userIds = JSON.parse(friend_ids as string);
    } catch {
      // Continue with empty list
    }

    const leaderboard = await this.leaderboardService.getFriendsLeaderboard(
      userId,
      userIds,
      period as 'weekly' | 'monthly' | 'all-time'
    );

    res.json(
      successResponse(leaderboard, 'Friends leaderboard retrieved', 'leaderboard/friends')
    );
  }

  /**
   * POST /leaderboard/refresh
   * Refresh leaderboard cache (admin only)
   */
  async refreshCache(req: AuthRequest, res: Response): Promise<void> {
    const result = await this.leaderboardService.refreshLeaderboardCache();

    res.json(
      successResponse(result, 'Leaderboard cache refreshed', 'leaderboard/refresh')
    );
  }
}
