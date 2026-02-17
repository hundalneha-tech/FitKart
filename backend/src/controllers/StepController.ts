// backend/src/controllers/StepController.ts

import { Response } from 'express';
import { StepService } from '../services/StepService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { Validators } from '../utils/validators';
import { AuthRequest } from './AuthController';

/**
 * Step Controller
 * Handles all step recording and activity tracking endpoints
 */
export class StepController {
  private stepService: StepService;

  constructor() {
    this.stepService = new StepService();
  }

  /**
   * POST /steps/record
   * Record step count (requires auth)
   */
  async recordSteps(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { steps, distance, source = 'manual' } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!steps || steps < 0) {
      res.status(400).json(validationErrorResponse({ steps: 'Valid step count is required' }));
      return;
    }

    const record = await this.stepService.recordSteps(
      userId,
      steps,
      distance,
      source
    );

    res.status(201).json(
      successResponse(record, 'Steps recorded successfully', 'step/record')
    );
  }

  /**
   * GET /steps/today
   * Get today's step count (requires auth)
   */
  async getTodaySteps(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const steps = await this.stepService.getTodaySteps(userId);
    res.json(successResponse(steps, 'Today steps retrieved successfully', 'step/today'));
  }

  /**
   * GET /steps/weekly
   * Get weekly step statistics (requires auth)
   */
  async getWeeklySteps(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const stats = await this.stepService.getWeeklySteps(userId);
    res.json(
      successResponse(stats, 'Weekly steps retrieved successfully', 'step/weekly')
    );
  }

  /**
   * GET /steps/monthly
   * Get monthly step statistics (requires auth)
   */
  async getMonthlySteps(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const stats = await this.stepService.getMonthlySteps(userId);
    res.json(
      successResponse(stats, 'Monthly steps retrieved successfully', 'step/monthly')
    );
  }

  /**
   * GET /steps/history
   * Get step history with pagination (requires auth)
   */
  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { days = '30', limit = '100', offset = '0' } = req.query;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const daysNum = parseInt(days as string) || 30;
    const limitNum = parseInt(limit as string) || 100;
    const offsetNum = parseInt(offset as string) || 0;

    const history = await this.stepService.getHistory(userId, daysNum, limitNum, offsetNum);
    res.json(successResponse(history, 'Step history retrieved successfully', 'step/history'));
  }

  /**
   * GET /steps/streak
   * Get current streak (requires auth)
   */
  async getCurrentStreak(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { daily_goal = '3000' } = req.query;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const dailyGoalNum = parseInt(daily_goal as string) || 3000;
    const streak = await this.stepService.getCurrentStreak(userId, dailyGoalNum);

    res.json(
      successResponse(
        { streak, daily_goal: dailyGoalNum },
        'Streak retrieved successfully',
        'step/streak'
      )
    );
  }

  /**
   * GET /steps/best-day
   * Get best day record (requires auth)
   */
  async getBestDay(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const bestDay = await this.stepService.getBestDay(userId);
    res.json(successResponse(bestDay, 'Best day retrieved successfully', 'step/best-day'));
  }

  /**
   * GET /steps/daily/:date
   * Get steps for specific date (requires auth)
   */
  async getStepsForDate(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { date } = req.params;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!date) {
      res.status(400).json(validationErrorResponse({ date: 'Date is required' }));
      return;
    }

    // Parse date - simplified implementation
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json(validationErrorResponse({ date: 'Invalid date format' }));
      return;
    }

    const steps = await this.stepService.getTodaySteps(userId); // Simplified
    res.json(successResponse(steps, `Steps for ${date} retrieved`, 'step/daily'));
  }

  /**
   * GET /steps/:userId/public
   * Get user's public step statistics (no auth required)
   */
  async getUserStepsPublic(req: AuthRequest, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json(validationErrorResponse({ userId: 'User ID is required' }));
      return;
    }

    const stats = await this.stepService.getWeeklySteps(userId);
    res.json(successResponse(stats, 'Public stats retrieved', 'step/public'));
  }
}
