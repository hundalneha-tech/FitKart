// backend/src/controllers/CoinController.ts

import { Response } from 'express';
import { CoinService } from '../services/CoinService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { AuthRequest } from './AuthController';

/**
 * Coin Controller
 * Handles all coin/wallet-related endpoints
 */
export class CoinController {
  private coinService: CoinService;

  constructor() {
    this.coinService = new CoinService();
  }

  /**
   * GET /coins/balance
   * Get user's coin balance (requires auth)
   */
  async getBalance(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const balance = await this.coinService.getBalance(userId);
    res.json(successResponse(balance, 'Balance retrieved successfully', 'coin/balance'));
  }

  /**
   * GET /coins/history
   * Get transaction history (requires auth)
   */
  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const { limit = '50', offset = '0' } = req.query;
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;

    const history = await this.coinService.getTransactionHistory(
      userId,
      limitNum,
      offsetNum
    );
    res.json(
      successResponse(history, 'Transaction history retrieved successfully', 'coin/history')
    );
  }

  /**
   * POST /coins/check-balance
   * Check if user has enough coins (requires auth)
   */
  async checkBalance(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json(validationErrorResponse({ amount: 'Valid amount is required' }));
      return;
    }

    const hasEnough = await this.coinService.hasEnoughCoins(userId, amount);
    res.json(
      successResponse({ has_enough: hasEnough, amount }, 'Balance checked', 'coin/check')
    );
  }

  /**
   * POST /coins/add
   * Add coins to user (admin only)
   */
  async addCoins(req: AuthRequest, res: Response): Promise<void> {
    const { user_id, amount, type = 'bonus', reference } = req.body;

    if (!user_id) {
      res.status(400).json(validationErrorResponse({ user_id: 'User ID is required' }));
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json(validationErrorResponse({ amount: 'Valid amount is required' }));
      return;
    }

    const balance = await this.coinService.addCoins(user_id, amount, type, reference);
    res.json(
      successResponse(balance, 'Coins added successfully', 'coin/add')
    );
  }

  /**
   * POST /coins/spend
   * Spend coins (requires auth) - called internally by orders
   */
  async spendCoins(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { amount, reference } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json(validationErrorResponse({ amount: 'Valid amount is required' }));
      return;
    }

    const balance = await this.coinService.spendCoins(userId, amount, reference);
    res.json(
      successResponse(balance, 'Coins spent successfully', 'coin/spend')
    );
  }

  /**
   * POST /coins/freeze
   * Freeze coins for pending orders (requires auth)
   */
  async freezeCoins(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { amount, reference } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json(validationErrorResponse({ amount: 'Valid amount is required' }));
      return;
    }

    const balance = await this.coinService.freezeCoins(userId, amount, reference);
    res.json(
      successResponse(balance, 'Coins frozen successfully', 'coin/freeze')
    );
  }

  /**
   * POST /coins/unfreeze
   * Unfreeze coins (requires auth) - called when order cancelled
   */
  async unfreezeCoins(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { amount, reference } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json(validationErrorResponse({ amount: 'Valid amount is required' }));
      return;
    }

    const balance = await this.coinService.unfreezeCoins(userId, amount, reference);
    res.json(
      successResponse(balance, 'Coins unfrozen successfully', 'coin/unfreeze')
    );
  }

  /**
   * GET /coins/stats
   * Get coin statistics (requires auth)
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const balance = await this.coinService.getBalance(userId);
    res.json(
      successResponse(balance, 'Coin statistics retrieved', 'coin/stats')
    );
  }
}
