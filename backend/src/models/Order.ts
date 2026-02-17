// backend/src/models/Order.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('orders')
@Index('idx_user_id', ['user_id'])
@Index('idx_order_code', ['order_code'], { unique: true })
@Index('idx_status', ['status'])
@Index('idx_created_at', ['created_at'])
export class Order {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('varchar', { length: 50, unique: true })
  order_code: string;

  @Column('bigint')
  total_coins: number;

  @Column('varchar', { length: 20, default: 'pending' })
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  @Column('varchar', { length: 255, nullable: true })
  shipping_street: string | null;

  @Column('varchar', { length: 100, nullable: true })
  shipping_city: string | null;

  @Column('varchar', { length: 100, nullable: true })
  shipping_state: string | null;

  @Column('varchar', { length: 20, nullable: true })
  shipping_postal_code: string | null;

  @Column('varchar', { length: 100, nullable: true })
  shipping_country: string | null;

  @Column('timestamp', { nullable: true })
  confirmed_at: Date | null;

  @Column('timestamp', { nullable: true })
  shipped_at: Date | null;

  @Column('timestamp', { nullable: true })
  delivered_at: Date | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
