// backend/src/models/StepRecord.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('step_records')
@Index('idx_user_id', ['user_id'])
@Index('idx_recorded_date', ['recorded_date'])
@Index('idx_source', ['source'])
@Index('idx_user_date_source', ['user_id', 'recorded_date', 'source'], {
  unique: true,
})
export class StepRecord {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('integer')
  steps: number;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  distance: number | null;

  @Column('integer', { nullable: true })
  calories: number | null;

  @Column('integer', { nullable: true })
  heart_points: number | null;

  @Column('varchar', { length: 50 })
  source: string;

  @Column('date')
  recorded_date: Date;

  @Column('boolean', { default: false })
  is_verified: boolean;

  @Column('bigint', { default: 0 })
  coins_awarded: number;

  @CreateDateColumn()
  created_at: Date;

  @Column('timestamp', { nullable: true })
  updated_at: Date | null;
}
