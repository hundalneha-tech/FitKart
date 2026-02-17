// backend/src/services/AdminService.ts

import { UserRepository } from '../repositories/UserRepository';
import { StepRecordRepository } from '../repositories/StepRecordRepository';
import { EncryptionService } from '../utils/encryption';
import { AdminPermissionError, NotFoundError, ValidationError } from '../utils/errors';

export interface UserManagementData {
  total_users: number;
  active_users: number;
  blocked_users: number;
  moderators: number;
  registered_today: number;
  verified_percentage: number;
}

export interface PlatformAnalytics {
  total_steps: number;
  total_coins_earned: number;
  total_coins_spent: number;
  average_user_steps: number;
  most_active_country: string;
  top_spenders_count: number;
}

export interface SuspiciousActivity {
  user_id: string;
  full_name: string;
  email: string;
  steps_today: number;
  average_daily_steps: number;
  anomaly_score: number;
  flag_reason: string;
  created_at: Date;
}

export interface Setting {
  key: string;
  value: string;
  description: string;
  updated_by: string;
  updated_at: Date;
}

/**
 * Admin Service
 * Manages administrative operations and platform analytics
 */
export class AdminService {
  private userRepository: UserRepository;
  private stepRepository: StepRecordRepository;
  private settings: Map<string, Setting>;

  constructor() {
    this.userRepository = new UserRepository();
    this.stepRepository = new StepRecordRepository();
    this.settings = this.initializeSettings();
  }

  /**
   * List all users (with pagination and filtering)
   */
  async listUsers(
    limit: number = 50,
    offset: number = 0,
    role?: 'user' | 'moderator' | 'admin',
    status?: 'active' | 'blocked'
  ): Promise<{
    users: any[];
    total: number;
    limit: number;
    offset: number;
  }> {
    let { data, total } = role
      ? await this.userRepository.findByRole(role, limit, offset)
      : await this.userRepository.findActive(limit, offset);

    // Filter by status if needed
    if (status === 'blocked') {
      data = data.filter((u) => u.is_blocked);
      total = data.length; // Note: approximate count
    } else if (status === 'active') {
      data = data.filter((u) => !u.is_blocked);
      total = data.length;
    }

    return {
      users: data.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_verified: u.is_verified,
        is_blocked: u.is_blocked,
        created_at: u.created_at,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    newRole: 'user' | 'moderator' | 'admin',
    updatedBy: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (newRole === 'admin' || user.role === 'admin') {
      throw new AdminPermissionError('Cannot modify admin user roles');
    }

    await this.userRepository.update(userId, {
      role: newRole,
    });

    // Log this action
    // TODO: Implement admin logging
  }

  /**
   * Get platform analytics
   */
  async getAnalytics(): Promise<PlatformAnalytics> {
    // In production, these would be cached/pre-computed
    const totalUsers = await this.userRepository.count();
    const activeUsers = (await this.userRepository.findActive(1000, 0)).total;

    // Mock data for analytics
    return {
      total_steps: Math.floor(Math.random() * 1000000000),
      total_coins_earned: Math.floor(Math.random() * 10000000),
      total_coins_spent: Math.floor(Math.random() * 8000000),
      average_user_steps: Math.floor(Math.random() * 10000),
      most_active_country: 'US',
      top_spenders_count: Math.floor(Math.random() * 1000),
    };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    total_sent: number;
    success_rate: number;
    bounce_rate: number;
    last_sent: Date;
  }> {
    return {
      total_sent: Math.floor(Math.random() * 1000000),
      success_rate: 98.5,
      bounce_rate: 1.2,
      last_sent: new Date(),
    };
  }

  /**
   * Get all platform settings
   */
  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  /**
   * Get specific setting
   */
  async getSetting(key: string): Promise<Setting | null> {
    return this.settings.get(key) || null;
  }

  /**
   * Update setting
   */
  async updateSetting(
    key: string,
    value: string,
    updatedBy: string
  ): Promise<Setting> {
    const existing = this.settings.get(key);

    if (!existing) {
      throw new NotFoundError('Setting');
    }

    const updated: Setting = {
      ...existing,
      value,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    this.settings.set(key, updated);

    // Log this action
    // TODO: Implement admin logging

    return updated;
  }

  /**
   * Get list of suspicious step activities
   */
  async getSuspiciousSteps(
    threshold: number = 70,
    limit: number = 20
  ): Promise<SuspiciousActivity[]> {
    if (threshold < 0 || threshold > 100) {
      throw new ValidationError('Threshold must be between 0 and 100');
    }

    // In production, query StepValidation table for flagged submissions
    const mockActivities: SuspiciousActivity[] = [];

    for (let i = 0; i < Math.min(limit, 5); i++) {
      mockActivities.push({
        user_id: `user-${i + 1}`,
        full_name: `Suspicious User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        steps_today: Math.floor(Math.random() * 100000),
        average_daily_steps: Math.floor(Math.random() * 10000),
        anomaly_score: Math.floor(threshold + Math.random() * (100 - threshold)),
        flag_reason: 'Steps significantly higher than user average',
        created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      });
    }

    return mockActivities;
  }

  /**
   * Approve suspicious steps (admin)
   */
  async approveSuspiciousSteps(stepId: string, approvedBy: string): Promise<void> {
    // In production, update StepValidation record
    // TODO: Implement admin logging
  }

  /**
   * Reject suspicious steps (admin)
   */
  async rejectSuspiciousSteps(
    stepId: string,
    reason: string,
    rejectedBy: string
  ): Promise<void> {
    if (!reason || reason.length < 5) {
      throw new ValidationError('Rejection reason must be at least 5 characters');
    }

    // In production, update StepValidation record and potentially penalize user
    // TODO: Implement admin logging
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    database_status: string;
    redis_status: string;
    api_latency_ms: number;
    error_rate_percentage: number;
    uptime_hours: number;
  }> {
    return {
      database_status: 'healthy',
      redis_status: 'healthy',
      api_latency_ms: Math.floor(Math.random() * 100) + 20,
      error_rate_percentage: Math.random() * 0.5,
      uptime_hours: Math.floor(Math.random() * 720),
    };
  }

  /**
   * Generate admin report
   */
  async generateReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    report_type: string;
    period: string;
    generated_at: Date;
    data: Record<string, any>;
  }> {
    const period =
      reportType === 'daily'
        ? 'Last 24 hours'
        : reportType === 'weekly'
          ? 'Last 7 days'
          : 'Last 30 days';

    return {
      report_type: reportType,
      period,
      generated_at: new Date(),
      data: {
        new_users: Math.floor(Math.random() * 1000),
        active_users: Math.floor(Math.random() * 50000),
        total_steps: Math.floor(Math.random() * 100000000),
        total_coin_transactions: Math.floor(Math.random() * 10000),
        total_orders: Math.floor(Math.random() * 5000),
        user_feedback: Math.floor(Math.random() * 500),
      },
    };
  }

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(
    title: string,
    message: string,
    targetAudience: 'all' | 'active' | 'inactive' | 'new_users',
    sentBy: string
  ): Promise<{
    notification_id: string;
    recipients_count: number;
    sent_at: Date;
  }> {
    if (!title || title.length < 3) {
      throw new ValidationError('Title must be at least 3 characters');
    }

    if (!message || message.length < 10) {
      throw new ValidationError('Message must be at least 10 characters');
    }

    // In production, queue notification job
    const recipientCount =
      targetAudience === 'all'
        ? Math.floor(Math.random() * 100000)
        : targetAudience === 'active'
          ? Math.floor(Math.random() * 50000)
          : Math.floor(Math.random() * 30000);

    return {
      notification_id: EncryptionService.generateUUID(),
      recipients_count: recipientCount,
      sent_at: new Date(),
    };
  }

  /**
   * Export user data (GDPR)
   */
  async exportUserData(userId: string): Promise<{
    export_id: string;
    status: 'pending' | 'in_progress' | 'ready';
    download_url?: string;
    expires_at: Date;
  }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // In production, queue data export job
    return {
      export_id: EncryptionService.generateUUID(),
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  /**
   * Initialize default settings
   */
  private initializeSettings(): Map<string, Setting> {
    const settings = new Map<string, Setting>();

    const defaultSettings: Setting[] = [
      {
        key: 'daily_step_goal',
        value: '5000',
        description: 'Default daily step goal for new users',
        updated_by: 'system',
        updated_at: new Date(),
      },
      {
        key: 'coin_per_100_steps',
        value: '1',
        description: 'Number of coins earned per 100 steps',
        updated_by: 'system',
        updated_at: new Date(),
      },
      {
        key: 'max_daily_coin_reward',
        value: '100',
        description: 'Maximum coins that can be earned per day',
        updated_by: 'system',
        updated_at: new Date(),
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Enable or disable maintenance mode',
        updated_by: 'system',
        updated_at: new Date(),
      },
      {
        key: 'max_file_upload_size_mb',
        value: '10',
        description: 'Maximum file upload size in MB',
        updated_by: 'system',
        updated_at: new Date(),
      },
      {
        key: 'email_notifications_enabled',
        value: 'true',
        description: 'Enable or disable email notifications',
        updated_by: 'system',
        updated_at: new Date(),
      },
      {
        key: 'referral_bonus_coins',
        value: '500',
        description: 'Bonus coins for successful referral',
        updated_by: 'system',
        updated_at: new Date(),
      },
      {
        key: 'suspicious_activity_threshold',
        value: '70',
        description: 'Anomaly score threshold for suspicious activity',
        updated_by: 'system',
        updated_at: new Date(),
      },
    ];

    defaultSettings.forEach((setting) => {
      settings.set(setting.key, setting);
    });

    return settings;
  }
}
