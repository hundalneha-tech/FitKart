// backend/src/controllers/AchievementController.ts

import { Response } from 'express';
import { AchievementService } from '../services/AchievementService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { AuthRequest } from './AuthController';

/**
 * Achievement Controller
 * Handles all achievement badge and reward endpoints
 */
export class AchievementController {
  private achievementService: AchievementService;

  constructor() {
    this.achievementService = new AchievementService();
  }

  /**
   * GET /achievements
   * Get all achievements (no auth required)
   */
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const achievements = await this.achievementService.getAll();
    res.json(
      successResponse(achievements, 'All achievements retrieved', 'achievement/all')
    );
  }

  /**
   * GET /achievements/:id
   * Get specific achievement (no auth required)
   */
  async getAchievement(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Achievement ID is required' }));
      return;
    }

    const achievement = await this.achievementService.getAchievement(id);
    if (!achievement) {
      res.status(404).json(validationErrorResponse({ id: 'Achievement not found' }));
      return;
    }

    res.json(
      successResponse(achievement, 'Achievement retrieved', 'achievement/detail')
    );
  }

  /**
   * GET /achievements/user
   * Get user's achievements (requires auth)
   */
  async getUserAchievements(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const achievements = await this.achievementService.getUserAchievements(userId);
    res.json(
      successResponse(achievements, 'User achievements retrieved', 'achievement/user')
    );
  }

  /**
   * POST /achievements/:id/unlock
   * Manually unlock achievement (admin only)
   */
  async unlockAchievement(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Achievement ID is required' }));
      return;
    }

    if (!user_id) {
      res.status(400).json(validationErrorResponse({ user_id: 'User ID is required' }));
      return;
    }

    const achievement = await this.achievementService.unlockAchievement(user_id, id);
    res.json(
      successResponse(achievement, 'Achievement unlocked', 'achievement/unlock')
    );
  }

  /**
   * GET /achievements/:id/leaderboard
   * Get users with specific achievement (no auth required)
   */
  async getAchievementLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { limit = '10' } = req.query;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Achievement ID is required' }));
      return;
    }

    const limitNum = parseInt(limit as string) || 10;
    const holders = await this.achievementService.getAchievementLeaderboard(id, limitNum);

    res.json(
      successResponse(holders, 'Achievement holders retrieved', 'achievement/leaderboard')
    );
  }

  /**
   * GET /achievements/:id/progress
   * Get user's progress toward achievement (requires auth)
   */
  async getProgress(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { id } = req.params;
    const { current_value = '0' } = req.query;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Achievement ID is required' }));
      return;
    }

    const currentValueNum = parseInt(current_value as string) || 0;
    const progress = await this.achievementService.getAchievementProgress(
      userId,
      id,
      currentValueNum
    );

    res.json(
      successResponse(progress, 'Achievement progress retrieved', 'achievement/progress')
    );
  }

  /**
   * POST /achievements/check
   * Check and unlock achievements based on user stats (requires auth)
   */
  async checkAndUnlock(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const {
      total_steps,
      total_coins,
      total_orders,
      current_streak,
      consecutive_days,
    } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const unlockedNow = await this.achievementService.checkAndUnlockAchievements(userId, {
      total_steps,
      total_coins,
      total_orders,
      current_streak,
      consecutive_days,
    });

    res.json(
      successResponse(
        { unlocked: unlockedNow },
        'Achievements checked',
        'achievement/check'
      )
    );
  }
}
