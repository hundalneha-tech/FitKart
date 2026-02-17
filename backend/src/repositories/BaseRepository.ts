// backend/src/repositories/BaseRepository.ts

import { Repository, FindOptionsWhere, FindOptionsOrder, FindOptions } from 'typeorm';
import { AppDataSource } from '../config/database';

/**
 * Base repository with common CRUD operations
 */
export abstract class BaseRepository<T> {
  protected repository: Repository<T>;

  constructor(entity: any) {
    this.repository = AppDataSource.getRepository(entity);
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  /**
   * Find all with pagination
   */
  async findAll(
    limit: number = 20,
    offset: number = 0,
    order?: FindOptionsOrder<T>
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      take: limit,
      skip: offset,
      order,
    });

    return { data, total };
  }

  /**
   * Find one by conditions
   */
  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return await this.repository.findOne({ where });
  }

  /**
   * Find multiple by conditions
   */
  async find(
    where: FindOptionsWhere<T>,
    order?: FindOptionsOrder<T>
  ): Promise<T[]> {
    return await this.repository.find({
      where,
      order,
    });
  }

  /**
   * Create new record
   */
  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  /**
   * Create multiple records
   */
  async createMultiple(data: Partial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);
    return await this.repository.save(entities);
  }

  /**
   * Update record
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repository.update({ id } as any, data as any);
    return await this.findById(id);
  }

  /**
   * Update multiple records
   */
  async updateMultiple(
    where: FindOptionsWhere<T>,
    data: Partial<T>
  ): Promise<number> {
    const result = await this.repository.update(where, data as any);
    return result.affected || 0;
  }

  /**
   * Delete record (hard delete)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id } as any);
    return (result.affected || 0) > 0;
  }

  /**
   * Soft delete (mark with deletedAt timestamp)
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(
      { id } as any,
      { deleted_at: new Date() } as any
    );
    return (result.affected || 0) > 0;
  }

  /**
   * Count records
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }

  /**
   * Check if exists
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * Execute raw query
   */
  protected async query(sql: string, parameters?: any[]): Promise<any[]> {
    return await this.repository.query(sql, parameters);
  }

  /**
   * Start transaction
   */
  protected getQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
