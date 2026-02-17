// backend/src/models/Wallet.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('wallets')
@Index('idx_user_id', ['user_id'])
@Index('idx_updated_at', ['updated_at'])
export class Wallet {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  user_id: string;

  @Column('bigint', { default: 0 })
  available_coins: number;

  @Column('bigint', { default: 0 })
  frozen_coins: number;

  @Column('bigint', { default: 0 })
  total_earned: number;

  @Column('bigint', { default: 0 })
  total_spent: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
