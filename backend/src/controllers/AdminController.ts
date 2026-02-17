// backend/src/controllers/AdminController.ts

import { Response } from 'express';
import { AdminService } from '../services/AdminService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { AuthRequest } from './AuthController';

/**
 * Admin Controller
 * Handles all administrative operations and analytics
 */
export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * GET /admin/users
   * List all users (admin only)
   */
  async listUsers(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '50', offset = '0', role, status } = req.query;

    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;

    const result = await this.adminService.listUsers(
      limitNum,
      offsetNum,
      role as 'user' | 'moderator' | 'admin',
      status as 'active' | 'blocked'
    );

    res.json(successResponse(result, 'Users retrieved', 'admin/users'));
  }

  /**
   * PUT /admin/users/:id/role
   * Update user role (admin only)
   */
  async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user?.id;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'User ID is required' }));
      return;
    }

    if (!role) {
      res.status(400).json(validationErrorResponse({ role: 'Role is required' }));
      return;
    }

    if (!['user', 'moderator', 'admin'].includes(role)) {
      res.status(400).json(validationErrorResponse({ role: 'Invalid role' }));
      return;
    }

    await this.adminService.updateUserRole(id, role, adminId || '');
    res.json(successResponse({ message: 'Role updated' }, 'User role updated', 'admin/role'));
  }

  /**
   * GET /admin/analytics
   * Get platform analytics (admin only)
   */
  async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
    const analytics = await this.adminService.getAnalytics();
    res.json(successResponse(analytics, 'Analytics retrieved', 'admin/analytics'));
  }

  /**
   * GET /admin/notifications/stats
   * Get notification statistics (admin only)
   */
  async getNotificationStats(req: AuthRequest, res: Response): Promise<void> {
    const stats = await this.adminService.getNotificationStats();
    res.json(
      successResponse(stats, 'Notification stats retrieved', 'admin/notifications/stats')
    );
  }

  /**
   * GET /admin/settings
   * Get all platform settings (admin only)
   */
  async getSettings(req: AuthRequest, res: Response): Promise<void> {
    const settings = await this.adminService.getSettings();
    res.json(successResponse(settings, 'Settings retrieved', 'admin/settings'));
  }

  /**
   * GET /admin/settings/:key
   * Get specific setting (admin only)
   */
  async getSetting(req: AuthRequest, res: Response): Promise<void> {
    const { key } = req.params;

    if (!key) {
      res.status(400).json(validationErrorResponse({ key: 'Setting key is required' }));
      return;
    }

    const setting = await this.adminService.getSetting(key);
    if (!setting) {
      res.status(404).json(validationErrorResponse({ key: 'Setting not found' }));
      return;
    }

    res.json(successResponse(setting, 'Setting retrieved', 'admin/setting'));
  }

  /**
   * PUT /admin/settings/:key
   * Update setting (admin only)
   */
  async updateSetting(req: AuthRequest, res: Response): Promise<void> {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = req.user?.id;

    if (!key) {
      res.status(400).json(validationErrorResponse({ key: 'Setting key is required' }));
      return;
    }

    if (!value) {
      res.status(400).json(validationErrorResponse({ value: 'Value is required' }));
      return;
    }

    const setting = await this.adminService.updateSetting(key, value, adminId || '');
    res.json(successResponse(setting, 'Setting updated', 'admin/setting/update'));
  }

  /**
   * GET /admin/suspicious
   * Get suspicious step activities (admin only)
   */
  async getSuspiciousSteps(req: AuthRequest, res: Response): Promise<void> {
    const { threshold = '70', limit = '20' } = req.query;

    const thresholdNum = parseInt(threshold as string) || 70;
    const limitNum = parseInt(limit as string) || 20;

    const activities = await this.adminService.getSuspiciousSteps(
      thresholdNum,
      limitNum
    );

    res.json(
      successResponse(activities, 'Suspicious activities retrieved', 'admin/suspicious')
    );
  }

  /**
   * POST /admin/suspicious/:id/approve
   * Approve suspicious steps (admin only)
   */
  async approveSuspiciousSteps(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Step ID is required' }));
      return;
    }

    await this.adminService.approveSuspiciousSteps(id, adminId || '');
    res.json(
      successResponse({ message: 'Steps approved' }, 'Steps approved', 'admin/suspicious/approve')
    );
  }

  /**
   * POST /admin/suspicious/:id/reject
   * Reject suspicious steps (admin only)
   */
  async rejectSuspiciousSteps(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Step ID is required' }));
      return;
    }

    if (!reason) {
      res.status(400).json(validationErrorResponse({ reason: 'Rejection reason is required' }));
      return;
    }

    await this.adminService.rejectSuspiciousSteps(id, reason, adminId || '');
    res.json(
      successResponse({ message: 'Steps rejected' }, 'Steps rejected', 'admin/suspicious/reject')
    );
  }

  /**
   * GET /admin/health
   * Get system health status (admin only)
   */
  async getSystemHealth(req: AuthRequest, res: Response): Promise<void> {
    const health = await this.adminService.getSystemHealth();
    res.json(successResponse(health, 'System health retrieved', 'admin/health'));
  }

  /**
   * POST /admin/reports
   * Generate admin report (admin only)
   */
  async generateReport(req: AuthRequest, res: Response): Promise<void> {
    const {
      report_type = 'daily',
      start_date,
      end_date,
    } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(report_type)) {
      res.status(400).json(validationErrorResponse({ report_type: 'Invalid report type' }));
      return;
    }

    const report = await this.adminService.generateReport(
      report_type as 'daily' | 'weekly' | 'monthly',
      start_date,
      end_date
    );

    res.json(successResponse(report, 'Report generated', 'admin/report'));
  }

  /**
   * POST /admin/notifications/broadcast
   * Send broadcast notification (admin only)
   */
  async sendBroadcastNotification(req: AuthRequest, res: Response): Promise<void> {
    const { title, message, target_audience } = req.body;
    const adminId = req.user?.id;

    // Validate inputs
    const errors: Record<string, string> = {};

    if (!title) errors.title = 'Title is required';
    if (!message) errors.message = 'Message is required';
    if (!target_audience) errors.target_audience = 'Target audience is required';

    if (Object.keys(errors).length > 0) {
      res.status(400).json(validationErrorResponse(errors));
      return;
    }

    const result = await this.adminService.sendBroadcastNotification(
      title,
      message,
      target_audience as 'all' | 'active' | 'inactive' | 'new_users',
      adminId || ''
    );

    res.json(
      successResponse(result, 'Broadcast sent', 'admin/notification/broadcast')
    );
  }

  /**
   * POST /admin/users/:id/export-data
   * Export user data (GDPR) (admin only)
   */
  async exportUserData(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'User ID is required' }));
      return;
    }

    const result = await this.adminService.exportUserData(id);
    res.json(
      successResponse(result, 'Data export initiated', 'admin/user/export-data')
    );
  }
}
