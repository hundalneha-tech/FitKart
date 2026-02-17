// backend/src/routes/admin.ts

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import Joi from 'joi';

const router = Router();
const controller = new AdminController();

// Schema definitions
const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'moderator', 'admin').required(),
});

const updateSettingSchema = Joi.object({
  value: Joi.string().required(),
});

const rejectSuspiciousSchema = Joi.object({
  reason: Joi.string().min(5).required(),
});

const sendNotificationSchema = Joi.object({
  title: Joi.string().min(3).required(),
  message: Joi.string().min(10).required(),
  target_audience: Joi.string()
    .valid('all', 'active', 'inactive', 'new_users')
    .required(),
});

const generateReportSchema = Joi.object({
  report_type: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
  start_date: Joi.date(),
  end_date: Joi.date(),
});

/**
 * Admin Routes
 * GET /admin/users - List all users
 * PUT /admin/users/:id/role - Update user role
 * GET /admin/analytics - Get platform analytics
 * GET /admin/notifications/stats - Get notification stats
 * GET /admin/settings - Get all settings
 * GET /admin/settings/:key - Get specific setting
 * PUT /admin/settings/:key - Update setting
 * GET /admin/suspicious - Get suspicious activities
 * POST /admin/suspicious/:id/approve - Approve suspicious steps
 * POST /admin/suspicious/:id/reject - Reject suspicious steps
 * GET /admin/health - Get system health
 * POST /admin/reports - Generate report
 * POST /admin/notifications/broadcast - Send broadcast
 * POST /admin/users/:id/export-data - Export user data
 */

// List users
router.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  (req, res) => controller.listUsers(req, res)
);

// Update user role
router.put(
  '/users/:id/role',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(updateUserRoleSchema),
  (req, res) => controller.updateUserRole(req, res)
);

// Get analytics
router.get(
  '/analytics',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getAnalytics(req, res)
);

// Get notification stats
router.get(
  '/notifications/stats',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getNotificationStats(req, res)
);

// Get settings
router.get(
  '/settings',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getSettings(req, res)
);

// Get setting
router.get(
  '/settings/:key',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getSetting(req, res)
);

// Update setting
router.put(
  '/settings/:key',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(updateSettingSchema),
  (req, res) => controller.updateSetting(req, res)
);

// Get suspicious steps
router.get(
  '/suspicious',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getSuspiciousSteps(req, res)
);

// Approve suspicious steps
router.post(
  '/suspicious/:id/approve',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  (req, res) => controller.approveSuspiciousSteps(req, res)
);

// Reject suspicious steps
router.post(
  '/suspicious/:id/reject',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(rejectSuspiciousSchema),
  (req, res) => controller.rejectSuspiciousSteps(req, res)
);

// Get system health
router.get(
  '/health',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.api,
  (req, res) => controller.getSystemHealth(req, res)
);

// Generate report
router.post(
  '/reports',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(generateReportSchema),
  (req, res) => controller.generateReport(req, res)
);

// Send broadcast notification
router.post(
  '/notifications/broadcast',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  validationMiddleware(sendNotificationSchema),
  (req, res) => controller.sendBroadcastNotification(req, res)
);

// Export user data
router.post(
  '/users/:id/export-data',
  authMiddleware,
  adminMiddleware,
  rateLimitMiddleware.sensitive,
  (req, res) => controller.exportUserData(req, res)
);

export default router;
