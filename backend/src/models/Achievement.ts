// backend/src/models/Achievement.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  code: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 500, nullable: true })
  icon_url: string | null;

  @Column('varchar', { length: 20, default: 'badge' })
  type: 'badge' | 'milestone' | 'streak';

  @Column('jsonb')
  unlock_criteria: Record<string, any>;

  @Column('integer', { default: 0 })
  reward_coins: number;

  @Column('boolean', { default: true })
  is_active: boolean;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
