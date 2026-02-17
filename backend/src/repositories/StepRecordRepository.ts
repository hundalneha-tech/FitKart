// backend/src/repositories/StepRecordRepository.ts

import { StepRecord } from '../models';
import { BaseRepository } from './BaseRepository';

export class StepRecordRepository extends BaseRepository<StepRecord> {
  constructor() {
    super(StepRecord);
  }

  /**
   * Get steps for specific date
   */
  async getStepsForDate(userId: string, date: Date): Promise<StepRecord | null> {
    return await this.findOne({
      user_id: userId,
      recorded_date: date,
    });
  }

  /**
   * Get steps for date range
   */
  async getStepsForDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StepRecord[]> {
    const query = this.repository.createQueryBuilder('sr')
      .where('sr.user_id = :userId', { userId })
      .andWhere('sr.recorded_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('sr.recorded_date', 'DESC');

    return await query.getMany();
  }

  /**
   * Get this week's steps
   */
  async getWeeklySteps(userId: string): Promise<{ total: number; records: StepRecord[] }> {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday

    const records = await this.getStepsForDateRange(userId, weekStart, today);
    const total = records.reduce((sum, r) => sum + r.steps, 0);

    return { total, records };
  }

  /**
   * Get this month's steps
   */
  async getMonthlySteps(userId: string): Promise<{ total: number; records: StepRecord[] }> {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const records = await this.getStepsForDateRange(userId, monthStart, today);
    const total = records.reduce((sum, r) => sum + r.steps, 0);

    return { total, records };
  }

  /**
   * Get total steps all time
   */
  async getTotalSteps(userId: string): Promise<number> {
    const result = await this.repository.query(
      `
      SELECT SUM(steps) as total
      FROM step_records
      WHERE user_id = $1
      `,
      [userId]
    );
    return result[0]?.total || 0;
  }

  /**
   * Get daily goal met count (for streak purposes)
   */
  async getDailyGoalMetCount(userId: string, dailyGoal: number = 10000): Promise<number> {
    const result = await this.repository.query(
      `
      SELECT COUNT(*) as count
      FROM step_records
      WHERE user_id = $1 AND steps >= $2
      `,
      [userId, dailyGoal]
    );
    return result[0]?.count || 0;
  }

  /**
   * Get current streak
   */
  async getCurrentStreak(userId: string, dailyGoal: number = 10000): Promise<number> {
    const result = await this.repository.query(
      `
      WITH RECURSIVE streak AS (
        SELECT recorded_date, 1 as streak_length
        FROM step_records
        WHERE user_id = $1 AND steps >= $2
        ORDER BY recorded_date DESC
        LIMIT 1
        
        UNION ALL
        
        SELECT sr.recorded_date, s.streak_length + 1
        FROM step_records sr
        JOIN streak s ON sr.recorded_date = s.recorded_date - interval '1 day'
        WHERE sr.user_id = $1 AND sr.steps >= $2
      )
      SELECT MAX(streak_length) as streak
      FROM streak
      `,
      [userId, dailyGoal]
    );
    return result[0]?.streak || 0;
  }

  /**
   * Get best day (most steps)
   */
  async getBestDay(userId: string): Promise<StepRecord | null> {
    const query = this.repository.createQueryBuilder('sr')
      .where('sr.user_id = :userId', { userId })
      .orderBy('sr.steps', 'DESC')
      .limit(1);

    return await query.getOne() || null;
  }

  /**
   * Get average daily steps
   */
  async getAverageDailySteps(userId: string): Promise<number> {
    const result = await this.repository.query(
      `
      SELECT AVG(steps) as average
      FROM step_records
      WHERE user_id = $1
      `,
      [userId]
    );
    return Math.round(result[0]?.average || 0);
  }
}
