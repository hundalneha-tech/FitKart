// backend/src/services/StepService.ts

import { StepRecordRepository } from '../repositories/StepRecordRepository';
import { CoinService } from './CoinService';
import { EncryptionService } from '../utils/encryption';
import { NotFoundError, ValidationError, SuspiciousActivityError } from '../utils/errors';

export interface StepRecord {
  id: string;
  date: Date;
  steps: number;
  distance?: number;
  source: 'manual' | 'device' | 'wearable' | 'import';
  created_at: Date;
}

export interface StepsForDate {
  date: Date;
  steps: number;
  distance?: number;
}

export interface WeeklyStats {
  week_start: Date;
  week_end: Date;
  total_steps: number;
  daily_breakdown: StepsForDate[];
  coin_earned?: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  total_steps: number;
  daily_breakdown: StepsForDate[];
  coin_earned?: number;
}

/**
 * Step Service
 * Manages step recording, validation, and anti-cheat detection
 */
export class StepService {
  private stepRepository: StepRecordRepository;
  private coinService: CoinService;

  private readonly MIN_STEPS_PER_DAY = 0;
  private readonly MAX_STEPS_PER_DAY = 100000; // Reasonable daily limit
  private readonly MIN_DISTANCE_PER_STEP = 0.5; // meters
  private readonly MAX_DISTANCE_PER_STEP = 2; // meters
  private readonly SUSPICIOUS_MULTIPLIER = 1.5; // Alert if 1.5x average

  constructor() {
    this.stepRepository = new StepRecordRepository();
    this.coinService = new CoinService();
  }

  /**
   * Record step count for today
   */
  async recordSteps(
    userId: string,
    steps: number,
    distance?: number,
    source: 'manual' | 'device' | 'wearable' | 'import' = 'manual'
  ): Promise<StepRecord> {
    // Validate input
    if (steps < this.MIN_STEPS_PER_DAY || steps > this.MAX_STEPS_PER_DAY) {
      throw new ValidationError(
        `Steps must be between ${this.MIN_STEPS_PER_DAY} and ${this.MAX_STEPS_PER_DAY}`
      );
    }

    // Validate distance if provided
    if (distance !== undefined) {
      const metersPerStep = distance / steps;
      if (
        metersPerStep < this.MIN_DISTANCE_PER_STEP ||
        metersPerStep > this.MAX_DISTANCE_PER_STEP
      ) {
        throw new ValidationError(
          `Distance per step must be between ${this.MIN_DISTANCE_PER_STEP}m and ${this.MAX_DISTANCE_PER_STEP}m`
        );
      }
    }

    // Check for suspicious activity
    const islandSuspicious = await this.isSuspiciousActivity(userId, steps, source);
    if (isSuspicious && source === 'manual') {
      throw new SuspiciousActivityError(
        'Extremely unusual step count. Please try again.'
      );
    }

    // Record steps
    const record = await this.stepRepository.create({
      id: EncryptionService.generateUUID(),
      user_id: userId,
      steps,
      distance,
      source,
      date: new Date(),
    });

    // Determine coin reward based on steps
    const coinReward = this.calculateCoinReward(steps);
    if (coinReward > 0) {
      await this.coinService.addCoins(userId, coinReward, 'earned', {
        type: 'step_reward',
        id: record.id,
        description: `${steps} steps recorded`,
      });
    }

    // Check for milestone achievements (handle in achievement service)
    // TODO: Check and unlock achievements

    return {
      id: record.id,
      date: record.date,
      steps: record.steps,
      distance: record.distance,
      source: record.source,
      created_at: record.created_at,
    };
  }

  /**
   * Get steps for a specific date
   */
  async getTodaySteps(userId: string): Promise<StepsForDate> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await this.stepRepository.getStepsForDateRange(
      userId,
      today,
      tomorrow
    );

    const totalSteps = records.reduce((sum, r) => sum + r.steps, 0);
    const totalDistance = records.reduce((sum, r) => sum + (r.distance || 0), 0);

    return {
      date: today,
      steps: totalSteps,
      distance: totalDistance || undefined,
    };
  }

  /**
   * Get weekly step statistics
   */
  async getWeeklySteps(userId: string): Promise<WeeklyStats> {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const records = await this.stepRepository.getWeeklySteps(userId);

    let totalSteps = 0;
    let totalCoins = 0;
    const dailyBreakdown: StepsForDate[] = [];

    // Group by date
    const grouped = new Map<string, any[]>();
    records.forEach((r) => {
      const dateStr = r.date.toISOString().split('T')[0];
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, []);
      }
      grouped.get(dateStr)!.push(r);
    });

    // Calculate daily totals
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];

      const dayRecords = grouped.get(dateStr) || [];
      const daySteps = dayRecords.reduce((sum, r) => sum + r.steps, 0);
      const dayDistance = dayRecords.reduce((sum, r) => sum + (r.distance || 0), 0);

      totalSteps += daySteps;
      totalCoins += this.calculateCoinReward(daySteps);

      dailyBreakdown.push({
        date,
        steps: daySteps,
        distance: dayDistance || undefined,
      });
    }

    return {
      week_start: weekStart,
      week_end: weekEnd,
      total_steps: totalSteps,
      daily_breakdown: dailyBreakdown,
      coin_earned: totalCoins,
    };
  }

  /**
   * Get monthly step statistics
   */
  async getMonthlySteps(userId: string): Promise<MonthlyStats> {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const records = await this.stepRepository.getMonthlySteps(userId);

    let totalSteps = 0;
    let totalCoins = 0;
    const dailyBreakdown: StepsForDate[] = [];

    // Group by date
    const grouped = new Map<string, any[]>();
    records.forEach((r) => {
      const dateStr = r.date.toISOString().split('T')[0];
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, []);
      }
      grouped.get(dateStr)!.push(r);
    });

    // Calculate daily totals for the month
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];

      const dayRecords = grouped.get(dateStr) || [];
      const daySteps = dayRecords.reduce((sum, r) => sum + r.steps, 0);
      const dayDistance = dayRecords.reduce((sum, r) => sum + (r.distance || 0), 0);

      totalSteps += daySteps;
      totalCoins += this.calculateCoinReward(daySteps);

      dailyBreakdown.push({
        date,
        steps: daySteps,
        distance: dayDistance || undefined,
      });
    }

    return {
      month: monthStart.toLocaleString('default', { month: 'long' }),
      year: monthStart.getFullYear(),
      total_steps: totalSteps,
      daily_breakdown: dailyBreakdown,
      coin_earned: totalCoins,
    };
  }

  /**
   * Get step history
   */
  async getHistory(
    userId: string,
    days: number = 30,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ records: StepRecord[]; total: number }> {
    if (days < 1 || days > 365) {
      throw new ValidationError('Days must be between 1 and 365');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const records = await this.stepRepository.getStepsForDateRange(
      userId,
      startDate,
      endDate
    );

    // Apply pagination
    const paginated = records.slice(offset, offset + limit);

    return {
      records: paginated.map((r) => ({
        id: r.id,
        date: r.date,
        steps: r.steps,
        distance: r.distance,
        source: r.source,
        created_at: r.created_at,
      })),
      total: records.length,
    };
  }

  /**
   * Get current streak
   */
  async getCurrentStreak(userId: string, dailyGoal: number = 3000): Promise<number> {
    return await this.stepRepository.getCurrentStreak(userId, dailyGoal);
  }

  /**
   * Get best day
   */
  async getBestDay(userId: string): Promise<StepsForDate | null> {
    const bestDay = await this.stepRepository.getBestDay(userId);

    if (!bestDay) {
      return null;
    }

    return {
      date: bestDay.date,
      steps: bestDay.steps,
      distance: bestDay.distance,
    };
  }

  /**
   * Calculate coin reward based on steps
   * Reward: 1 coin per 100 steps (minimum 0, maximum 100 coins per day)
   */
  private calculateCoinReward(steps: number): number {
    const reward = Math.floor(steps / 100);
    return Math.min(reward, 100); // Cap at 100 coins per activity
  }

  /**
   * Detect suspicious step recording activity
   */
  private async isSuspiciousActivity(
    userId: string,
    steps: number,
    source: string
  ): Promise<boolean> {
    try {
      // For device/wearable, trust the source
      if (source !== 'manual') {
        return false;
      }

      // Get user's average
      const avgSteps = await this.stepRepository.getAverageDailySteps(userId);

      if (avgSteps === 0) {
        // New user, allow anything up to MAX
        return false;
      }

      // Check if this single activity is much higher than average
      const ratio = steps / avgSteps;

      if (ratio > this.SUSPICIOUS_MULTIPLIER) {
        return true;
      }

      return false;
    } catch (error) {
      // If we can't get average, don't block
      return false;
    }
  }
}
