// backend/src/controllers/OrderController.ts

import { Response } from 'express';
import { OrderService } from '../services/OrderService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { AuthRequest } from './AuthController';

/**
 * Order Controller
 * Handles all order management and fulfillment endpoints
 */
export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * POST /orders
   * Create new order (requires auth)
   */
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { items, shipping_address } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json(validationErrorResponse({ items: 'Valid items array is required' }));
      return;
    }

    const order = await this.orderService.createOrder(userId, items, shipping_address);
    res.status(201).json(
      successResponse(order, 'Order created successfully', 'order/create')
    );
  }

  /**
   * GET /orders
   * Get user's orders (requires auth)
   */
  async getOrders(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { limit = '20', offset = '0', status } = req.query;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const result = await this.orderService.getOrders(
      userId,
      limitNum,
      offsetNum,
      status as any
    );

    res.json(successResponse(result, 'Orders retrieved successfully', 'order/list'));
  }

  /**
   * GET /orders/:id
   * Get specific order (requires auth)
   */
  async getOrderDetail(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Order ID is required' }));
      return;
    }

    const order = await this.orderService.getOrderDetail(id, userId);
    res.json(successResponse(order, 'Order details retrieved', 'order/detail'));
  }

  /**
   * POST /orders/:id/confirm
   * Confirm order and deduct coins (requires auth)
   */
  async confirmOrder(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Order ID is required' }));
      return;
    }

    const order = await this.orderService.confirmOrder(id, userId);
    res.json(successResponse(order, 'Order confirmed successfully', 'order/confirm'));
  }

  /**
   * POST /orders/:id/cancel
   * Cancel order (requires auth)
   */
  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!userId) {
      res.status(401).json(validationErrorResponse({ auth: 'User must be authenticated' }));
      return;
    }

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Order ID is required' }));
      return;
    }

    const order = await this.orderService.cancelOrder(id, userId, reason);
    res.json(successResponse(order, 'Order cancelled successfully', 'order/cancel'));
  }

  /**
   * PUT /orders/:id/status
   * Update order status (admin only)
   */
  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, metadata } = req.body;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Order ID is required' }));
      return;
    }

    if (!status) {
      res.status(400).json(validationErrorResponse({ status: 'Status is required' }));
      return;
    }

    const order = await this.orderService.updateOrderStatus(id, status, metadata);
    res.json(successResponse(order, 'Order status updated', 'order/status/update'));
  }

  /**
   * GET /orders/code/:code
   * Get order by order code (requires auth)
   */
  async getByOrderCode(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { code } = req.params;

    if (!code) {
      res.status(400).json(validationErrorResponse({ code: 'Order code is required' }));
      return;
    }

    const order = await this.orderService.getOrderByCode(code, userId);
    res.json(successResponse(order, 'Order retrieved by code', 'order/code'));
  }

  /**
   * GET /orders/pending
   * Get pending orders (admin only)
   */
  async getPendingOrders(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '50' } = req.query;
    const limitNum = parseInt(limit as string) || 50;

    const orders = await this.orderService.getPendingOrders(limitNum);
    res.json(successResponse(orders, 'Pending orders retrieved', 'order/pending'));
  }

  /**
   * GET /orders/stats
   * Get order statistics (admin only)
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const { user_id } = req.query;

    const stats = await this.orderService.getOrderStats(user_id as string);
    res.json(successResponse(stats, 'Order stats retrieved', 'order/stats'));
  }
}
