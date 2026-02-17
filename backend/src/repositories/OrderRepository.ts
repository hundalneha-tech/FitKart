// backend/src/repositories/OrderRepository.ts

import { Order } from '../models';
import { BaseRepository } from './BaseRepository';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(Order);
  }

  /**
   * Get order by order code
   */
  async getByOrderCode(orderCode: string): Promise<Order | null> {
    return await this.findOne({ order_code: orderCode });
  }

  /**
   * Get user's orders with pagination
   */
  async getByUserId(userId: string, limit: number = 20, offset: number = 0, status?: string) {
    const query = this.repository.createQueryBuilder('o')
      .where('o.user_id = :userId', { userId })
      .orderBy('o.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    if (status) {
      query.andWhere('o.status = :status', { status });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  /**
   * Get pending orders (for processing)
   */
  async getPendingOrders(limit: number = 50): Promise<Order[]> {
    return await this.find(
      { status: 'pending' },
      { created_at: 'ASC' }
    );
  }

  /**
   * Get orders by status
   */
  async getByStatus(status: string, limit: number = 100): Promise<Order[]> {
    return await this.find({ status: status as any });
  }

  /**
   * Generate next order code
   */
  async generateNextOrderCode(): Promise<string> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    
    const result = await this.repository.query(
      `
      SELECT COUNT(*) as count
      FROM orders
      WHERE order_code LIKE $1
      `,
      [`FK-${dateStr}-%`]
    );

    const count = (result[0]?.count || 0) + 1;
    return `FK-${dateStr}-${String(count).padStart(5, '0')}`;
  }

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: string): Promise<Order | null> {
    let updates: any = { status };

    if (status === 'confirmed') {
      updates.confirmed_at = new Date();
    } else if (status === 'shipped') {
      updates.shipped_at = new Date();
    } else if (status === 'delivered') {
      updates.delivered_at = new Date();
    }

    await this.repository.update({ id: orderId }, updates);
    return await this.findById(orderId);
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<{
    total_orders: number;
    total_coins_spent: number;
    average_order_value: number;
    pending_orders: number;
  }> {
    const result = await this.repository.query(
      `
      SELECT
        COUNT(*) as total_orders,
        SUM(total_coins) as total_coins_spent,
        AVG(total_coins) as average_order_value,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders
      FROM orders
      WHERE deleted_at IS NULL
      `
    );

    return {
      total_orders: result[0]?.total_orders || 0,
      total_coins_spent: result[0]?.total_coins_spent || 0,
      average_order_value: Math.round(result[0]?.average_order_value || 0),
      pending_orders: result[0]?.pending_orders || 0,
    };
  }
}
