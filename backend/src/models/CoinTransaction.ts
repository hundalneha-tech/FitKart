// backend/src/models/CoinTransaction.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('coin_transactions')
@Index('idx_user_id', ['user_id'])
@Index('idx_type', ['type'])
@Index('idx_created_at', ['created_at'])
@Index('idx_user_created', ['user_id', 'created_at'])
export class CoinTransaction {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('varchar', { length: 20 })
  type: 'earned' | 'spent' | 'refund' | 'bonus' | 'penalty';

  @Column('bigint')
  amount: number;

  @Column('varchar', { length: 100, nullable: true })
  reference_type: string | null;

  @Column('uuid', { nullable: true })
  reference_id: string | null;

  @Column('varchar', { length: 255, nullable: true })
  reference_description: string | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;
}
