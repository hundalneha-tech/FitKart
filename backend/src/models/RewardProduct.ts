// backend/src/models/RewardProduct.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('reward_products')
@Index('idx_category', ['category'])
@Index('idx_is_active', ['is_active'])
@Index('idx_created_at', ['created_at'])
export class RewardProduct {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 100 })
  category: string;

  @Column('bigint')
  coin_price: number;

  @Column('varchar', { length: 500, nullable: true })
  image_url: string | null;

  @Column('integer', { default: 0 })
  stock_quantity: number;

  @Column('integer', { default: 0 })
  estimated_delivery_days: number;

  @Column('boolean', { default: true })
  is_active: boolean;

  @Column('uuid', { nullable: true })
  shopify_product_id: string | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
