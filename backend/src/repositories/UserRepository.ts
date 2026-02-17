// backend/src/repositories/UserRepository.ts

import { User } from '../models';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return await this.exists({ email: email.toLowerCase() });
  }

  /**
   * Find active users
   */
  async findActive(limit: number = 50, offset: number = 0) {
    const [data, total] = await this.repository.findAndCount({
      where: { is_blocked: false, deleted_at: null },
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
    return { data, total };
  }

  /**
   * Find users by role
   */
  async findByRole(role: 'user' | 'moderator' | 'admin') {
    return await this.find({ role });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    // Query additional stats from related tables
    const query = this.repository.createQueryBuilder('users')
      .leftJoinAndSelect('wallets', 'w', 'w.user_id = users.id')
      .where('users.id = :userId', { userId });

    return query.getOne();
  }

  /**
   * Search users
   */
  async search(searchTerm: string, limit: number = 20) {
    const query = this.repository
      .createQueryBuilder('user')
      .where('user.email ILIKE :email', { email: `%${searchTerm}%` })
      .orWhere('user.full_name ILIKE :name', { name: `%${searchTerm}%` })
      .andWhere('user.deleted_at IS NULL')
      .limit(limit);

    return await query.getMany();
  }

  /**
   * Block user
   */
  async blockUser(userId: string, reason: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      { is_blocked: true } as any
    );
  }

  /**
   * Unblock user
   */
  async unblockUser(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      { is_blocked: false } as any
    );
  }
}
