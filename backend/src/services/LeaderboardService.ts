// backend/src/services/LeaderboardService.ts

import { StepRecordRepository } from '../repositories/StepRecordRepository';
import { EncryptionService } from '../utils/encryption';
import { NotFoundError } from '../utils/errors';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  profile_picture?: string;
  country_code?: string;
  value: number;
  unit: 'steps' | 'coins' | 'orders';
}

export interface UserLeaderboardContext {
  user_rank: number;
  user_value: number;
  total_participants: number;
  user_percentile: number;
}

/**
 * Leaderboard Service
 * Manages leaderboard rankings and competitive features
 *
 * NOTE: In production, leaderboards would be pre-computed and cached.
 * For MVP, we compute on-demand.
 */
export class LeaderboardService {
  private stepRepository: StepRecordRepository;

  // Mock leaderboard data for MVP
  private mockLeaderboardData: Map<string, any>;

  constructor() {
    this.stepRepository = new StepRecordRepository();
    this.mockLeaderboardData = new Map();
  }

  /**
   * Get weekly leaderboard
   */
  async getWeeklyLeaderboard(
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    period: string;
    entries: LeaderboardEntry[];
    total_participants: number;
  }> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // In production, get from pre-computed leaderboard cache
    const mockEntries = this.generateMockLeaderboard('weekly', limit);

    return {
      period: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`,
      entries: mockEntries,
      total_participants: 5000 + Math.floor(Math.random() * 10000), // Mock total
    };
  }

  /**
   * Get monthly leaderboard
   */
  async getMonthlyLeaderboard(
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    period: string;
    entries: LeaderboardEntry[];
    total_participants: number;
  }> {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // In production, get from pre-computed leaderboard cache
    const mockEntries = this.generateMockLeaderboard('monthly', limit);

    return {
      period: `${monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      entries: mockEntries,
      total_participants: 50000 + Math.floor(Math.random() * 100000), // Mock total
    };
  }

  /**
   * Get all-time leaderboard
   */
  async getAllTimeLeaderboard(
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    period: string;
    entries: LeaderboardEntry[];
    total_participants: number;
  }> {
    // In production, get from pre-computed leaderboard cache
    const mockEntries = this.generateMockLeaderboard('all-time', limit);

    return {
      period: 'All Time',
      entries: mockEntries,
      total_participants: 100000 + Math.floor(Math.random() * 500000), // Mock total
    };
  }

  /**
   * Get user's position in leaderboard
   */
  async getUserContext(
    userId: string,
    period: 'weekly' | 'monthly' | 'all-time'
  ): Promise<UserLeaderboardContext> {
    // In production, get actual rank from leaderboard cache
    const mockRank = Math.floor(Math.random() * 1000) + 1;
    const mockValue = Math.floor(Math.random() * 50000) + 5000;
    const totalParticipants =
      period === 'weekly'
        ? 5000
        : period === 'monthly'
          ? 50000
          : 100000;

    const percentile = Math.round(
      ((totalParticipants - mockRank) / totalParticipants) * 100
    );

    return {
      user_rank: mockRank,
      user_value: mockValue,
      total_participants: totalParticipants,
      user_percentile: percentile,
    };
  }

  /**
   * Get Country leaderboard
   */
  async getCountryLeaderboard(
    countryCode: string,
    limit: number = 10,
    period: 'weekly' | 'monthly' | 'all-time' = 'weekly'
  ): Promise<{
    country: string;
    period: string;
    entries: LeaderboardEntry[];
  }> {
    const mockEntries = this.generateMockLeaderboard(period, limit);

    return {
      country: this.getCountryName(countryCode),
      period: this.getPeriodLabel(period),
      entries: mockEntries,
    };
  }

  /**
   * Get friends leaderboard
   */
  async getFriendsLeaderboard(
    userId: string,
    userIds: string[],
    period: 'weekly' | 'monthly' | 'all-time' = 'weekly'
  ): Promise<{
    period: string;
    entries: LeaderboardEntry[];
  }> {
    // In production, get actual friend rankings
    const mockEntries = userIds
      .map((friendId, index) => ({
        rank: index + 1,
        user_id: friendId,
        full_name: `Friend ${index + 1}`,
        country_code: 'US',
        value: Math.floor(Math.random() * 50000) + 5000,
        unit: 'steps' as const,
      }))
      .sort((a, b) => b.value - a.value)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return {
      period: this.getPeriodLabel(period),
      entries: mockEntries,
    };
  }

  /**
   * Refresh leaderboard cache (admin)
   */
  async refreshLeaderboardCache(): Promise<{
    weekly_updated: number;
    monthly_updated: number;
    all_time_updated: number;
  }> {
    // In production, recompute leaderboards from raw data
    // This would be an async job, possibly with queue

    return {
      weekly_updated: Math.floor(Math.random() * 10000),
      monthly_updated: Math.floor(Math.random() * 50000),
      all_time_updated: Math.floor(Math.random() * 100000),
    };
  }

  /**
   * Generate mock leaderboard entry
   */
  private generateMockLeaderboard(
    period: string,
    limit: number
  ): LeaderboardEntry[] {
    const names = [
      'Alex Runner',
      'Jordan Walker',
      'Casey Jogger',
      'Morgan Swift',
      'Taylor Fast',
      'Riley Quick',
      'Blake Sprint',
      'Devon Run',
      'Avery Move',
      'Parker Go',
    ];

    const countries = ['US', 'GB', 'CA', 'AU', 'IN', 'BR', 'DE', 'JP', 'KR', 'SG'];

    const entries: LeaderboardEntry[] = [];

    for (let i = 0; i < limit && i < names.length; i++) {
      entries.push({
        rank: i + 1,
        user_id: `user-${i + 1}`,
        full_name: names[i],
        country_code: countries[i % countries.length],
        value: Math.max(100000 - i * 5000, 10000), // Decreasing values
        unit: 'steps',
      });
    }

    return entries;
  }

  /**
   * Get country name from code
   */
  private getCountryName(code: string): string {
    const countries: Record<string, string> = {
      US: 'United States',
      GB: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      IN: 'India',
      BR: 'Brazil',
      DE: 'Germany',
      JP: 'Japan',
      KR: 'South Korea',
      SG: 'Singapore',
    };

    return countries[code] || code;
  }

  /**
   * Get period label
   */
  private getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      weekly: 'This Week',
      monthly: 'This Month',
      'all-time': 'All Time',
    };

    return labels[period] || period;
  }
}
