// backend/src/models/AdminLog.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('admin_logs')
@Index('idx_admin_id', ['admin_id'])
@Index('idx_action', ['action'])
@Index('idx_entity_type', ['entity_type'])
@Index('idx_created_at', ['created_at'])
export class AdminLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  admin_id: string;

  @Column('varchar', { length: 100 })
  action: string;

  @Column('varchar', { length: 100 })
  entity_type: string;

  @Column('uuid', { nullable: true })
  entity_id: string | null;

  @Column('jsonb', { nullable: true })
  before_state: Record<string, any> | null;

  @Column('jsonb', { nullable: true })
  after_state: Record<string, any> | null;

  @Column('varchar', { length: 45, nullable: true })
  ip_address: string | null;

  @Column('varchar', { length: 500, nullable: true })
  user_agent: string | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;
}
