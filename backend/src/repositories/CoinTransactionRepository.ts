// backend/src/repositories/CoinTransactionRepository.ts

import { CoinTransaction } from '../models';
import { BaseRepository } from './BaseRepository';

export class CoinTransactionRepository extends BaseRepository<CoinTransaction> {
  constructor() {
    super(CoinTransaction);
  }

  /**
   * Get transaction history for user
   */
  async getTransactionHistory(userId: string, limit: number = 50, offset: number = 0) {
    const [data, total] = await this.repository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total };
  }

  /**
   * Get transactions by type
   */
  async getTransactionsByType(
    userId: string,
    type: 'earned' | 'spent' | 'refund' | 'bonus' | 'penalty'
  ) {
    return await this.find(
      { user_id: userId, type },
      { created_at: 'DESC' }
    );
  }

  /**
   * Record new transaction
   */
  async recordTransaction(data: Partial<CoinTransaction>): Promise<CoinTransaction> {
    return await this.create(data);
  }

  /**
   * Get total coins earned by user
   */
  async getTotalEarned(userId: string): Promise<number> {
    const result = await this.repository.query(
      `
      SELECT SUM(amount) as total
      FROM coin_transactions
      WHERE user_id = $1 AND type IN ('earned', 'bonus')
      `,
      [userId]
    );
    return result[0]?.total || 0;
  }

  /**
   * Get total coins spent by user
   */
  async getTotalSpent(userId: string): Promise<number> {
    const result = await this.repository.query(
      `
      SELECT SUM(amount) as total
      FROM coin_transactions
      WHERE user_id = $1 AND type IN ('spent', 'penalty')
      `,
      [userId]
    );
    return result[0]?.total || 0;
  }

  /**
   * Get recent transactions
   */
  async getRecent(userId: string, days: number = 30): Promise<CoinTransaction[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = this.repository.createQueryBuilder('ct')
      .where('ct.user_id = :userId', { userId })
      .andWhere('ct.created_at >= :startDate', { startDate })
      .orderBy('ct.created_at', 'DESC');

    return await query.getMany();
  }
}
