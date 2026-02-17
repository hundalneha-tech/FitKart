// backend/src/models/OrderItem.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('order_items')
@Index('idx_order_id', ['order_id'])
@Index('idx_product_id', ['product_id'])
export class OrderItem {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  product_id: string;

  @Column('varchar', { length: 255 })
  product_name: string;

  @Column('integer')
  quantity: number;

  @Column('bigint')
  coin_price_at_purchase: number;

  @Column('bigint')
  total_coins: number;

  @Column('varchar', { length: 500, nullable: true })
  product_image_url: string | null;

  @Column('jsonb', { nullable: true })
  product_metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;
}
