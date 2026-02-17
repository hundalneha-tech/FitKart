// backend/src/repositories/WalletRepository.ts

import { Wallet } from '../models';
import { BaseRepository } from './BaseRepository';

export class WalletRepository extends BaseRepository<Wallet> {
  constructor() {
    super(Wallet);
  }

  /**
   * Get wallet by user ID
   */
  async getByUserId(userId: string): Promise<Wallet | null> {
    return await this.findOne({ user_id: userId });
  }

  /**
   * Get available coins for user
   */
  async getAvailableCoins(userId: string): Promise<number> {
    const wallet = await this.getByUserId(userId);
    return wallet?.available_coins || 0;
  }

  /**
   * Check if user has enough coins
   */
  async hasEnoughCoins(userId: string, amount: number): Promise<boolean> {
    const available = await this.getAvailableCoins(userId);
    return available >= amount;
  }

  /**
   * Add coins to wallet
   */
  async addCoins(userId: string, amount: number): Promise<Wallet | null> {
    const wallet = await this.getByUserId(userId);

    if (!wallet) {
      return null;
    }

    return await this.repository.update(
      { user_id: userId },
      {
        available_coins: () => `available_coins + ${amount}`,
        total_earned: () => `total_earned + ${amount}`,
      } as any
    );
  }

  /**
   * Spend coins from wallet
   */
  async spendCoins(userId: string, amount: number): Promise<Wallet | null> {
    const wallet = await this.getByUserId(userId);

    if (!wallet || wallet.available_coins < amount) {
      return null;
    }

    return await this.repository.update(
      { user_id: userId },
      {
        available_coins: () => `available_coins - ${amount}`,
        total_spent: () => `total_spent + ${amount}`,
      } as any
    );
  }

  /**
   * Freeze coins (for orders being processed)
   */
  async freezeCoins(userId: string, amount: number): Promise<Wallet | null> {
    const wallet = await this.getByUserId(userId);

    if (!wallet || wallet.available_coins < amount) {
      return null;
    }

    return await this.repository.update(
      { user_id: userId },
      {
        available_coins: () => `available_coins - ${amount}`,
        frozen_coins: () => `frozen_coins + ${amount}`,
      } as any
    );
  }

  /**
   * Unfreeze coins (if order cancelled)
   */
  async unfreezeCoins(userId: string, amount: number): Promise<Wallet | null> {
    const wallet = await this.getByUserId(userId);

    if (!wallet || wallet.frozen_coins < amount) {
      return null;
    }

    return await this.repository.update(
      { user_id: userId },
      {
        available_coins: () => `available_coins + ${amount}`,
        frozen_coins: () => `frozen_coins - ${amount}`,
      } as any
    );
  }

  /**
   * Get wallet summary for user
   */
  async getWalletSummary(userId: string) {
    return await this.repository.query(
      `
      SELECT 
        available_coins,
        frozen_coins,
        total_earned,
        total_spent,
        (total_earned - total_spent) as net_coins
      FROM wallets
      WHERE user_id = $1
      `,
      [userId]
    );
  }

  /**
   * Get top spenders
   */
  async getTopSpenders(limit: number = 10) {
    return await this.repository.query(
      `
      SELECT 
        user_id,
        total_spent,
        available_coins,
        total_earned
      FROM wallets
      ORDER BY total_spent DESC
      LIMIT $1
      `,
      [limit]
    );
  }

  /**
   * Get users with low balance
   */
  async getUsersWithLowBalance(threshold: number = 100) {
    return await this.repository.query(
      `
      SELECT 
        user_id,
        available_coins
      FROM wallets
      WHERE available_coins < $1
      ORDER BY available_coins ASC
      `,
      [threshold]
    );
  }
}
