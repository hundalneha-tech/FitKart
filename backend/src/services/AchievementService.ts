// backend/src/services/AchievementService.ts

import { EncryptionService } from '../utils/encryption';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  criteria_type: 'steps' | 'coins' | 'orders' | 'streak' | 'custom';
  criteria_value?: number;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  id: string;
  achievement_id: string;
  achievement: Achievement;
  user_id: string;
  unlocked_at: Date;
  progress?: number;
}

/**
 * Achievement Service
 * Manages user achievements and rewards system
 *
 * NOTE: This service manages business logic for achievements.
 * In production, achievement definitions would be stored in database.
 * For MVP, we use hardcoded definitions.
 */
export class AchievementService {
  private achievements: Map<string, Achievement>;
  private userAchievements: Map<string, Set<string>>; // userId -> Set<achievementId>

  constructor() {
    this.achievements = this.initializeAchievements();
    this.userAchievements = new Map();
  }

  /**
   * Get all achievements
   */
  async getAll(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  /**
   * Get specific achievement
   */
  async getAchievement(achievementId: string): Promise<Achievement | null> {
    return this.achievements.get(achievementId) || null;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const userAchievementIds = this.userAchievements.get(userId) || new Set();

    return Array.from(userAchievementIds).map((achId) => ({
      id: EncryptionService.generateUUID(),
      achievement_id: achId,
      achievement: this.achievements.get(achId)!,
      user_id: userId,
      unlocked_at: new Date(), // In production, get from DB
      progress: undefined,
    }));
  }

  /**
   * Unlock achievement for user
   */
  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<UserAchievement> {
    const achievement = this.achievements.get(achievementId);

    if (!achievement) {
      throw new NotFoundError('Achievement');
    }

    // Initialize user achievement set if needed
    if (!this.userAchievements.has(userId)) {
      this.userAchievements.set(userId, new Set());
    }

    const userAchs = this.userAchievements.get(userId)!;

    if (userAchs.has(achievementId)) {
      throw new ValidationError('Achievement already unlocked');
    }

    // Unlock achievement
    userAchs.add(achievementId);

    return {
      id: EncryptionService.generateUUID(),
      achievement_id: achievementId,
      achievement,
      user_id: userId,
      unlocked_at: new Date(),
    };
  }

  /**
   * Check and unlock achievements based on user stats
   */
  async checkAndUnlockAchievements(
    userId: string,
    stats: {
      total_steps?: number;
      total_coins?: number;
      total_orders?: number;
      current_streak?: number;
      consecutive_days?: number;
    }
  ): Promise<UserAchievement[]> {
    const unlockedNow: UserAchievement[] = [];
    const userAchs = this.userAchievements.get(userId) || new Set();

    // Check each achievement
    for (const [achId, achievement] of this.achievements) {
      // Skip if already unlocked
      if (userAchs.has(achId)) {
        continue;
      }

      // Check criteria
      let shouldUnlock = false;

      switch (achievement.criteria_type) {
        case 'steps':
          if (
            achievement.criteria_value &&
            stats.total_steps &&
            stats.total_steps >= achievement.criteria_value
          ) {
            shouldUnlock = true;
          }
          break;

        case 'coins':
          if (
            achievement.criteria_value &&
            stats.total_coins &&
            stats.total_coins >= achievement.criteria_value
          ) {
            shouldUnlock = true;
          }
          break;

        case 'orders':
          if (
            achievement.criteria_value &&
            stats.total_orders &&
            stats.total_orders >= achievement.criteria_value
          ) {
            shouldUnlock = true;
          }
          break;

        case 'streak':
          if (
            achievement.criteria_value &&
            stats.current_streak &&
            stats.current_streak >= achievement.criteria_value
          ) {
            shouldUnlock = true;
          }
          break;

        case 'custom':
          // Custom logic handled elsewhere
          break;
      }

      if (shouldUnlock) {
        try {
          const unocked = await this.unlockAchievement(userId, achId);
          unlockedNow.push(unocked);
        } catch (error) {
          // Silently skip if already unlocked or error
          continue;
        }
      }
    }

    return unlockedNow;
  }

  /**
   * Get achievement progress for user
   */
  async getAchievementProgress(
    userId: string,
    achievementId: string,
    currentValue: number
  ): Promise<{
    achievement: Achievement;
    current: number;
    target: number;
    percentage: number;
    unlocked: boolean;
  }> {
    const achievement = this.achievements.get(achievementId);

    if (!achievement) {
      throw new NotFoundError('Achievement');
    }

    const userAchs = this.userAchievements.get(userId) || new Set();
    const unlocked = userAchs.has(achievementId);
    const target = achievement.criteria_value || 0;
    const percentage = Math.min((currentValue / target) * 100, 100);

    return {
      achievement,
      current: currentValue,
      target,
      percentage: Math.round(percentage),
      unlocked,
    };
  }

  /**
   * Get leaderboard by achievement (who has this achievement)
   */
  async getAchievementLeaderboard(
    achievementId: string,
    limit: number = 10
  ): Promise<
    Array<{
      user_id: string;
      unlocked_at: Date;
    }>
  > {
    const achievement = this.achievements.get(achievementId);

    if (!achievement) {
      throw new NotFoundError('Achievement');
    }

    const holders: Array<{
      user_id: string;
      unlocked_at: Date;
    }> = [];

    for (const [userId, achIds] of this.userAchievements) {
      if (achIds.has(achievementId)) {
        holders.push({
          user_id: userId,
          unlocked_at: new Date(), // In production, get from DB
        });
      }
    }

    return holders.slice(0, limit);
  }

  /**
   * Initialize hardcoded achievements
   */
  private initializeAchievements(): Map<string, Achievement> {
    const achievements = new Map<string, Achievement>();

    // Step-based achievements
    achievements.set('first-1k-steps', {
      id: 'first-1k-steps',
      name: 'First Steps',
      description: 'Walk 1,000 steps',
      category: 'steps',
      criteria_type: 'steps',
      criteria_value: 1000,
      points: 10,
      rarity: 'common',
    });

    achievements.set('10k-steps', {
      id: '10k-steps',
      name: '10K Club',
      description: 'Walk 10,000 steps',
      category: 'steps',
      criteria_type: 'steps',
      criteria_value: 10000,
      points: 25,
      rarity: 'uncommon',
    });

    achievements.set('100k-steps', {
      id: '100k-steps',
      name: 'Century Walker',
      description: 'Walk 100,000 steps',
      category: 'steps',
      criteria_type: 'steps',
      criteria_value: 100000,
      points: 50,
      rarity: 'rare',
    });

    achievements.set('1m-steps', {
      id: '1m-steps',
      name: 'Million Steps',
      description: 'Walk 1,000,000 steps',
      category: 'steps',
      criteria_type: 'steps',
      criteria_value: 1000000,
      points: 100,
      rarity: 'legendary',
    });

    // Coin-based achievements
    achievements.set('first-coins', {
      id: 'first-coins',
      name: 'Coin Collector',
      description: 'Earn 100 coins',
      category: 'coins',
      criteria_type: 'coins',
      criteria_value: 100,
      points: 10,
      rarity: 'common',
    });

    achievements.set('1k-coins', {
      id: '1k-coins',
      name: 'Rich Collector',
      description: 'Earn 1,000 coins',
      category: 'coins',
      criteria_type: 'coins',
      criteria_value: 1000,
      points: 25,
      rarity: 'uncommon',
    });

    achievements.set('10k-coins', {
      id: '10k-coins',
      name: 'Wealthy Collector',
      description: 'Earn 10,000 coins',
      category: 'coins',
      criteria_type: 'coins',
      criteria_value: 10000,
      points: 50,
      rarity: 'rare',
    });

    // Order-based achievements
    achievements.set('first-order', {
      id: 'first-order',
      name: 'First Purchase',
      description: 'Complete your first order',
      category: 'orders',
      criteria_type: 'orders',
      criteria_value: 1,
      points: 10,
      rarity: 'common',
    });

    achievements.set('10-orders', {
      id: '10-orders',
      name: 'Shopper',
      description: 'Complete 10 orders',
      category: 'orders',
      criteria_type: 'orders',
      criteria_value: 10,
      points: 25,
      rarity: 'uncommon',
    });

    achievements.set('50-orders', {
      id: '50-orders',
      name: 'Super Shopper',
      description: 'Complete 50 orders',
      category: 'orders',
      criteria_type: 'orders',
      criteria_value: 50,
      points: 50,
      rarity: 'rare',
    });

    // Streak-based achievements
    achievements.set('7-day-streak', {
      id: '7-day-streak',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      category: 'streak',
      criteria_type: 'streak',
      criteria_value: 7,
      points: 20,
      rarity: 'uncommon',
    });

    achievements.set('30-day-streak', {
      id: '30-day-streak',
      name: 'Month Master',
      description: 'Maintain a 30-day streak',
      category: 'streak',
      criteria_type: 'streak',
      criteria_value: 30,
      points: 50,
      rarity: 'rare',
    });

    achievements.set('100-day-streak', {
      id: '100-day-streak',
      name: 'Century Streak',
      description: 'Maintain a 100-day streak',
      category: 'streak',
      criteria_type: 'streak',
      criteria_value: 100,
      points: 100,
      rarity: 'legendary',
    });

    return achievements;
  }
}
