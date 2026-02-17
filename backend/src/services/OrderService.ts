// backend/src/services/OrderService.ts

import { OrderRepository } from '../repositories/OrderRepository';
import { CoinService } from './CoinService';
import { EncryptionService } from '../utils/encryption';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  InsufficientCoinsError,
} from '../utils/errors';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderCreate {
  product_id: string;
  quantity: number;
  shipping_address?: string;
  coupon_code?: string;
}

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  total_coins: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
}

export interface OrderDetail extends Order {
  shipping_address?: string;
  tracking_number?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_reason?: string;
}

/**
 * Order Service
 * Manages order creation, tracking, and fulfillment
 */
export class OrderService {
  private orderRepository: OrderRepository;
  private coinService: CoinService;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.coinService = new CoinService();
  }

  /**
   * Create new order
   */
  async createOrder(
    userId: string,
    items: Array<{
      product_id: string;
      quantity: number;
      price_per_unit: number;
    }>,
    shippingAddress?: string
  ): Promise<Order> {
    if (!items || items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    // Calculate total
    const totalCoins = items.reduce((sum, item) => sum + item.price_per_unit * item.quantity, 0);

    if (totalCoins <= 0) {
      throw new ValidationError('Order total must be greater than 0');
    }

    // Check user has enough coins
    const hasEnough = await this.coinService.hasEnoughCoins(userId, totalCoins);
    if (!hasEnough) {
      const balance = await this.coinService.getBalance(userId);
      throw new InsufficientCoinsError(totalCoins, balance.available_coins);
    }

    // Freeze coins
    await this.coinService.freezeCoins(userId, totalCoins, {
      type: 'order',
      id: `pending-${Date.now()}`,
      description: 'Order pending confirmation',
    });

    // Generate order code
    const orderCode = await this.orderRepository.generateNextOrderCode();

    // Create order (status: pending)
    const order = await this.orderRepository.create({
      id: EncryptionService.generateUUID(),
      order_code: orderCode,
      user_id: userId,
      total_coins: totalCoins,
      status: 'pending',
      items: items.map((item) => ({
        id: EncryptionService.generateUUID(),
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        subtotal: item.price_per_unit * item.quantity,
      })),
      shipping_address: shippingAddress,
    });

    return this.mapToOrderResponse(order);
  }

  /**
   * Confirm order (move to confirmed status)
   */
  async confirmOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.user_id !== userId) {
      throw new ConflictError('Order does not belong to user');
    }

    if (order.status !== 'pending') {
      throw new ConflictError(`Cannot confirm order in ${order.status} status`);
    }

    // Deduct coins
    await this.coinService.spendCoins(userId, order.total_coins, {
      type: 'order',
      id: orderId,
      description: `Order ${order.order_code}`,
    });

    // Update order status
    const updated = await this.orderRepository.updateStatus(orderId, 'confirmed');

    return this.mapToOrderResponse(updated);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.user_id !== userId) {
      throw new ConflictError('Order does not belong to user');
    }

    // Can only cancel pending or confirmed
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new ConflictError(
        `Cannot cancel order in ${order.status} status`
      );
    }

    // Unfreeze/refund coins
    await this.coinService.unfreezeCoins(userId, order.total_coins, {
      type: 'order',
      id: orderId,
      description: `Order ${order.order_code} cancelled${reason ? ': ' + reason : ''}`,
    });

    // Update order status
    const updated = await this.orderRepository.updateStatus(orderId, 'cancelled');

    return this.mapToOrderResponse(updated);
  }

  /**
   * Get user's orders
   */
  async getOrders(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    status?: OrderStatus
  ): Promise<{ orders: Order[]; total: number }> {
    const { data, total } = await this.orderRepository.getByUserId(
      userId,
      limit,
      offset,
      status
    );

    return {
      orders: data.map((o) => this.mapToOrderResponse(o)),
      total,
    };
  }

  /**
   * Get specific order
   */
  async getOrderDetail(orderId: string, userId?: string): Promise<OrderDetail> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check ownership if userId provided
    if (userId && order.user_id !== userId) {
      throw new ConflictError('Order does not belong to user');
    }

    return this.mapToOrderDetail(order);
  }

  /**
   * Get order by order code
   */
  async getOrderByCode(
    orderCode: string,
    userId?: string
  ): Promise<OrderDetail> {
    const order = await this.orderRepository.getByOrderCode(orderCode);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check ownership if userId provided
    if (userId && order.user_id !== userId) {
      throw new ConflictError('Order does not belong to user');
    }

    return this.mapToOrderDetail(order);
  }

  /**
   * Update order status (admin)
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    metadata?: {
      tracking_number?: string;
      shipped_at?: Date;
      delivered_at?: Date;
      cancelled_reason?: string;
    }
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, newStatus)) {
      throw new ConflictError(
        `Cannot transition from ${order.status} to ${newStatus}`
      );
    }

    // Handle refund if cancelling delivered order
    if (newStatus === 'refunded' && order.status === 'delivered') {
      await this.coinService.addCoins(order.user_id, order.total_coins, 'refund', {
        type: 'order',
        id: orderId,
        description: `Order ${order.order_code} refunded`,
      });
    }

    const updated = await this.orderRepository.updateStatus(orderId, newStatus);

    return this.mapToOrderResponse(updated);
  }

  /**
   * Get pending orders (for processing queue)
   */
  async getPendingOrders(limit: number = 50): Promise<Order[]> {
    const orders = await this.orderRepository.getPendingOrders(limit);
    return orders.map((o) => this.mapToOrderResponse(o));
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId?: string): Promise<{
    total_orders: number;
    total_coins_spent: number;
    average_order_value: number;
    pending_count: number;
    delivered_count: number;
  }> {
    const stats = await this.orderRepository.getOrderStats(userId);

    return {
      total_orders: stats.total_orders || 0,
      total_coins_spent: stats.total_coins_spent || 0,
      average_order_value:
        (stats.total_coins_spent || 0) / (stats.total_orders || 1),
      pending_count: stats.pending_count || 0,
      delivered_count: stats.delivered_count || 0,
    };
  }

  /**
   * Check if status transition is valid
   */
  private isValidStatusTransition(
    from: OrderStatus,
    to: OrderStatus
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['refunded'],
      cancelled: [],
      refunded: [],
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Map order to response format
   */
  private mapToOrderResponse(order: any): Order {
    return {
      id: order.id,
      order_code: order.order_code,
      user_id: order.user_id,
      total_coins: order.total_coins,
      status: order.status,
      items: order.items || [],
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  /**
   * Map order to detailed response
   */
  private mapToOrderDetail(order: any): OrderDetail {
    return {
      ...this.mapToOrderResponse(order),
      shipping_address: order.shipping_address,
      tracking_number: order.tracking_number,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      cancelled_reason: order.cancelled_reason,
    };
  }
}
