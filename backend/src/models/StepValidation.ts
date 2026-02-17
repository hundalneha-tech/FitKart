// backend/src/models/StepValidation.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('step_validations')
@Index('idx_step_record_id', ['step_record_id'])
@Index('idx_status', ['status'])
@Index('idx_anomaly_score', ['anomaly_score'])
@Index('idx_created_at', ['created_at'])
export class StepValidation {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  step_record_id: string;

  @Column('uuid')
  user_id: string;

  @Column('numeric', { precision: 5, scale: 2 })
  anomaly_score: number;

  @Column('text')
  validation_reason: string;

  @Column('varchar', { length: 20, default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column('uuid', { nullable: true })
  reviewed_by_admin_id: string | null;

  @Column('text', { nullable: true })
  admin_comment: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('timestamp', { nullable: true })
  reviewed_at: Date | null;
}
